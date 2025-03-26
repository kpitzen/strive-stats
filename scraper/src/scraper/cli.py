import typer
from pathlib import Path
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn
from scrapy.crawler import CrawlerProcess
from scrapy.utils.project import get_project_settings
import subprocess
from sqlalchemy import text
from sqlmodel import Session, create_engine
from rich import print
from typing import Optional, List
import requests
import json

from scraper.db import init_db, import_json_to_db, get_database_url
from scraper.spiders.dustloop_spider import DustloopSpider
from .commands.download import download_frame_data
from .commands.parse import parse_frame_data
from scraper.models import (
    Character,
    NormalMoves,
    SpecialMoves,
    OverdriveMoves,
    SystemCoreData,
    SystemJumpData,
    CharacterSpecificTable
)

app = typer.Typer()
console = Console()

@app.command()
def scrape(output: str = "output/dustloop_tables.json"):
    """Run the Dustloop spider to scrape frame data."""
    settings = get_project_settings()
    settings.set("FEEDS", {
        output: {
            "format": "json",
            "overwrite": True
        }
    })
    
    process = CrawlerProcess(settings)
    process.crawl(DustloopSpider)
    process.start()

@app.command()
def import_data(
    json_path: Path = typer.Option(
        Path("output/parsed_frame_data.json"),
        help="Path to the cleaned frame data JSON file",
    ),
    database_url: str | None = typer.Option(
        None,
        help="Database URL (uses environment variable if not specified)",
    ),
    truncate: bool = typer.Option(
        True,
        help="Whether to truncate existing data before importing",
    ),
) -> None:
    """Import cleaned frame data from JSON into the database."""
    try:
        if not json_path.exists():
            typer.echo(f"Error: File {json_path} does not exist", err=True)
            raise typer.Exit(1)
        
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console,
        ) as progress:
            # Initialize database
            task = progress.add_task(description="Initializing database...", total=None)
            init_db(database_url)
            progress.update(task, description="Database initialized")
            
            # Import data
            task = progress.add_task(description="Importing frame data...", total=None)
            
            # Get database URL
            if database_url is None:
                database_url = get_database_url()
            
            engine = create_engine(database_url)
            
            # Truncate all tables if requested
            if truncate:
                with Session(engine) as session:
                    try:
                        # Disable foreign key checks temporarily if using PostgreSQL
                        session.execute(text("SET CONSTRAINTS ALL DEFERRED"))
                        
                        # Truncate all tables in the correct order
                        session.execute(text("TRUNCATE TABLE normal_moves CASCADE"))
                        session.execute(text("TRUNCATE TABLE special_moves CASCADE"))
                        session.execute(text("TRUNCATE TABLE overdrive_moves CASCADE"))
                        session.execute(text("TRUNCATE TABLE system_core_data CASCADE"))
                        session.execute(text("TRUNCATE TABLE system_jump_data CASCADE"))
                        session.execute(text("TRUNCATE TABLE gatling_tables CASCADE"))
                        session.execute(text("TRUNCATE TABLE character_specific_tables CASCADE"))
                        session.execute(text("TRUNCATE TABLE characters CASCADE"))
                        
                        session.commit()
                        progress.update(task, description="Tables truncated")
                    except Exception as e:
                        session.rollback()
                        console.print(f"[red]Error:[/] Failed to truncate tables: {str(e)}")
                        raise typer.Exit(1)
            
            # Now import the new data
            import_json_to_db(json_path, database_url)
            progress.update(task, description="Data import complete")
        
        console.print(f"[green]✓[/] Successfully imported frame data from {json_path}")
    
    except Exception as e:
        console.print(f"[red]Error:[/] Failed to import data: {str(e)}")
        raise typer.Exit(1)

@app.command()
def db_init():
    """Initialize the Alembic environment."""
    subprocess.run(["alembic", "init", "migrations"], check=True)
    typer.echo("Initialized Alembic environment")

@app.command()
def db_revision(message: str):
    """Create a new database migration revision."""
    subprocess.run(["alembic", "revision", "--autogenerate", "-m", message], check=True)
    typer.echo("Created new migration revision")

@app.command()
def db_upgrade(revision: str = "head"):
    """Upgrade database to a specific revision."""
    subprocess.run(["alembic", "upgrade", revision], check=True)
    typer.echo(f"Upgraded database to revision: {revision}")

@app.command()
def db_downgrade(revision: str = "-1"):
    """Downgrade database to a specific revision."""
    subprocess.run(["alembic", "downgrade", revision], check=True)
    typer.echo(f"Downgraded database to revision: {revision}")

@app.command()
def scrape_data(
    output_dir: str = typer.Option(
        "output/frame_data_html",
        help="Directory to store downloaded HTML files",
    ),
    character: Optional[str] = typer.Option(
        None,
        help="Specific character to download (downloads all if not specified)",
    ),
) -> None:
    """Download frame data HTML pages from Dustloop."""
    download_frame_data(output_dir=output_dir, character=character)

@app.command()
def parse_downloaded_data(
    input_dir: str = typer.Option(
        "output/frame_data_html",
        help="Directory containing downloaded HTML files",
    ),
    output_file: str = typer.Option(
        "output/parsed_frame_data.json",
        help="Output JSON file for parsed data",
    ),
    openai_api_key: Optional[str] = typer.Option(
        None,
        help="OpenAI API key for data cleaning (optional)",
        envvar="OPENAI_API_KEY",
    ),
    reparse: Optional[List[str]] = typer.Option(
        None,
        help="List of character names to reparse from their raw data files",
    ),
) -> None:
    """Parse downloaded frame data HTML files into structured JSON."""
    parse_frame_data(
        input_dir=Path(input_dir),
        output_file=Path(output_file),
        openai_api_key=openai_api_key,
        reparse_characters=reparse,
    )

@app.command()
def download_api_data(
    output_dir: str = typer.Option(
        "output/api/intermediate",
        help="Directory to store downloaded API data",
    ),
    batch_size: int = typer.Option(
        500,
        help="Number of records to fetch per request",
    ),
) -> None:
    """Download frame data from Dustloop's API."""
    try:
        # Create output directory if it doesn't exist
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)

        # First API call - Get field definitions
        fields_url = "https://www.dustloop.com/wiki/api.php?action=cargofields&table=MoveData_GGST&format=json"
        print(f"[green]Downloading API field definitions from {fields_url}...[/green]")
        
        fields_response = requests.get(fields_url)
        if fields_response.status_code != 200:
            print(f"[red]Failed to download API field definitions: {fields_response.status_code}[/red]")
            raise typer.Exit(1)
        
        try:
            # Parse field definitions
            fields_data = fields_response.json()
            
            # Save field definitions
            fields_file = output_path / "move_data_fields.json"
            with open(fields_file, 'w', encoding='utf-8') as f:
                json.dump(fields_data, f, indent=2)
            
            print(f"[blue]Saved field definitions to {fields_file}[/blue]")
            
            # Extract field names for the second API call
            field_names = ','.join(fields_data['cargofields'].keys())
            
            # Initialize variables for pagination
            offset = 0
            all_moves = []
            has_more = True
            
            with Progress(
                SpinnerColumn(),
                TextColumn("[progress.description]{task.description}"),
                console=console,
            ) as progress:
                task = progress.add_task(description="Downloading move data...", total=None)
                
                while has_more:
                    # Second API call - Get actual move data with pagination
                    data_url = (
                        f"https://www.dustloop.com/wiki/api.php?action=cargoquery"
                        f"&tables=MoveData_GGST&fields={field_names}&format=json"
                        f"&limit={batch_size}&offset={offset}"
                    )
                    
                    progress.update(task, description=f"Downloading moves (offset: {offset})...")
                    data_response = requests.get(data_url)
                    
                    if data_response.status_code != 200:
                        print(f"[red]Failed to download move data: {data_response.status_code}[/red]")
                        raise typer.Exit(1)
                    
                    # Parse move data
                    move_data = data_response.json()
                    current_batch = move_data.get('cargoquery', [])
                    all_moves.extend(current_batch)
                    
                    # Update progress
                    progress.update(task, description=f"Downloaded {len(all_moves)} moves so far...")
                    
                    # Check if we have more data to fetch
                    has_more = len(current_batch) == batch_size
                    offset += batch_size
            
            # Save all move data
            final_data = {'cargoquery': all_moves}
            move_data_file = output_path / "move_data.json"
            with open(move_data_file, 'w', encoding='utf-8') as f:
                json.dump(final_data, f, indent=2)
            
            print(f"[blue]Saved {len(all_moves)} moves to {move_data_file}[/blue]")
            
        except json.JSONDecodeError as e:
            print(f"[red]Failed to parse JSON response: {str(e)}[/red]")
            
            # Save raw responses for inspection
            raw_fields_file = output_path / "move_data_fields_raw.txt"
            with open(raw_fields_file, 'w', encoding='utf-8') as f:
                f.write(fields_response.text)
            
            raw_data_file = output_path / "move_data_raw.txt"
            with open(raw_data_file, 'w', encoding='utf-8') as f:
                f.write(data_response.text)
            
            print(f"[yellow]Saved raw responses to {raw_fields_file} and {raw_data_file} for inspection[/yellow]")
            raise typer.Exit(1)
    
    except Exception as e:
        print(f"[red]Error downloading API data: {str(e)}[/red]")
        raise typer.Exit(1)

@app.command()
def import_api_data(
    json_path: Path = typer.Option(
        Path("output/api/intermediate/move_data.json"),
        help="Path to the API move data JSON file",
    ),
    database_url: str | None = typer.Option(
        None,
        help="Database URL (uses environment variable if not specified)",
    ),
    truncate: bool = typer.Option(
        True,
        help="Whether to truncate existing data before importing",
    ),
) -> None:
    """Import move data from the Dustloop API into the database."""
    try:
        if not json_path.exists():
            typer.echo(f"Error: File {json_path} does not exist", err=True)
            raise typer.Exit(1)
        
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console,
        ) as progress:
            # Initialize database
            task = progress.add_task(description="Initializing database...", total=None)
            init_db(database_url)
            progress.update(task, description="Database initialized")
            
            # Import data
            task = progress.add_task(description="Importing move data...", total=None)
            
            # Get database URL
            if database_url is None:
                database_url = get_database_url()
            
            engine = create_engine(database_url)
            
            # Truncate all tables if requested
            if truncate:
                with Session(engine) as session:
                    try:
                        # Disable foreign key checks temporarily if using PostgreSQL
                        session.execute(text("SET CONSTRAINTS ALL DEFERRED"))
                        
                        # Truncate all tables in the correct order
                        session.execute(text("TRUNCATE TABLE normal_moves CASCADE"))
                        session.execute(text("TRUNCATE TABLE special_moves CASCADE"))
                        session.execute(text("TRUNCATE TABLE overdrive_moves CASCADE"))
                        session.execute(text("TRUNCATE TABLE system_core_data CASCADE"))
                        session.execute(text("TRUNCATE TABLE system_jump_data CASCADE"))
                        session.execute(text("TRUNCATE TABLE gatling_tables CASCADE"))
                        session.execute(text("TRUNCATE TABLE character_specific_tables CASCADE"))
                        session.execute(text("TRUNCATE TABLE characters CASCADE"))
                        
                        session.commit()
                        progress.update(task, description="Tables truncated")
                    except Exception as e:
                        session.rollback()
                        console.print(f"[red]Error:[/] Failed to truncate tables: {str(e)}")
                        raise typer.Exit(1)
            
            # Read and process the move data
            with open(json_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Group moves by character and type
            moves_by_char: dict[str, dict[str, list[dict]]] = {}
            for entry in data['cargoquery']:
                move = entry['title']
                char = move['chara']
                move_type = move.get('type', '').lower()
                
                if char not in moves_by_char:
                    moves_by_char[char] = {
                        'normal_moves': [],
                        'special_moves': [],
                        'overdrive_moves': [],
                        'system_core': [],
                        'system_jump': [],
                        'gatling_tables': [],
                        'character_specific': []
                    }
                
                # Route the move to the appropriate list based on type
                if move_type == 'normal':
                    moves_by_char[char]['normal_moves'].append(move)
                elif move_type == 'special':
                    moves_by_char[char]['special_moves'].append(move)
                elif move_type in ('overdrive', 'super', 'Super'):  # Handle both overdrive and super types (case-insensitive)
                    moves_by_char[char]['overdrive_moves'].append(move)
                elif move_type == 'system_core':
                    moves_by_char[char]['system_core'].append(move)
                elif move_type == 'system_jump':
                    moves_by_char[char]['system_jump'].append(move)
                elif move_type == 'gatling':
                    moves_by_char[char]['gatling_tables'].append(move)
                else:
                    # Log unknown types for debugging
                    print(f"[yellow]Unknown move type '{move_type}' for {char}'s move: {move.get('name', move.get('input'))}[/yellow]")
                    moves_by_char[char]['character_specific'].append(move)
            
            # Import data for each character
            with Session(engine) as session:
                for char_name, char_data in moves_by_char.items():
                    progress.update(task, description=f"Importing data for {char_name}...")
                    
                    # Create character record if it doesn't exist
                    char_slug = char_name.lower().replace(' ', '_')
                    char = Character(
                        name=char_name,
                        slug=char_slug,
                        display_name=char_name
                    )
                    session.add(char)
                    session.flush()  # Get the character ID
                    
                    # Import normal moves
                    for move in char_data['normal_moves']:
                        normal_move = NormalMoves(
                            character=char_name,
                            table_name=f"{char_name} Normal Moves",
                            table_type="normal",
                            input=move['input'],
                            damage=move['damage'],
                            guard=move['guard'],
                            startup=move['startup'],
                            active=move['active'],
                            recovery=move['recovery'],
                            on_block=move['onBlock'],
                            on_hit=move['onHit'],
                            level=move['level'],
                            counter_type=move['counter'],
                            risc_gain=move['riscGain'],
                            risc_loss=move['riscLoss'],
                            proration=move['prorate'],
                            notes=move.get('notes')
                        )
                        session.add(normal_move)
                    
                    # Import special moves
                    for move in char_data['special_moves']:
                        # If name is null, use the input as the name
                        move_name = move['name'] if move['name'] else f"Special Move {move['input']}"
                        special_move = SpecialMoves(
                            character=char_name,
                            table_name=f"{char_name} Special Moves",
                            table_type="special",
                            name=move_name,  # Use the fallback name if needed
                            input=move['input'],
                            damage=move['damage'],
                            guard=move['guard'],
                            startup=move['startup'],
                            active=move['active'],
                            recovery=move['recovery'],
                            on_block=move['onBlock'],
                            on_hit=move['onHit'],
                            level=move['level'],
                            counter_type=move['counter'],
                            risc_gain=move['riscGain'],
                            risc_loss=move['riscLoss'],
                            proration=move['prorate'],
                            notes=move.get('notes')
                        )
                        session.add(special_move)
                    
                    # Import overdrive moves
                    for move in char_data['overdrive_moves']:
                        # If name is null, use the input as the name
                        move_name = move['name'] if move['name'] else f"Overdrive {move['input']}"
                        overdrive_move = OverdriveMoves(
                            character=char_name,
                            table_name=f"{char_name} Overdrive Moves",
                            table_type="overdrive",
                            name=move_name,
                            input=move['input'],
                            damage=move['damage'],
                            guard=move['guard'],
                            startup=move['startup'],
                            active=move['active'],
                            recovery=move['recovery'],
                            on_block=move['onBlock'],
                            on_hit=move['onHit'],
                            level=move['level'],
                            counter_type=move['counter'],
                            risc_gain=move['riscGain'],
                            risc_loss=move['riscLoss'],
                            proration=move['prorate'],
                            tension_gain=move['inputTension'],
                            notes=move.get('notes')
                        )
                        session.add(overdrive_move)
                    
                    # Import system core data
                    for data in char_data['system_core']:
                        system_core = SystemCoreData(
                            character=char_name,
                            table_name=f"{char_name} System Core",
                            table_type="system_core",
                            defense=data.get('defense'),
                            guts=data.get('guts'),
                            risc_gain_modifier=data.get('riscGain'),
                            prejump=data.get('prejump'),
                            backdash_duration=data.get('backdash_duration'),
                            backdash_invuln=data.get('invuln'),
                            backdash_airborne=data.get('backdash_airborne'),
                            forward_dash=data.get('forward_dash'),
                            unique_movement_options=data.get('notes'),
                            movement_tension_gain=data.get('inputTension')
                        )
                        session.add(system_core)
                    
                    # Import system jump data
                    for data in char_data['system_jump']:
                        system_jump = SystemJumpData(
                            character=char_name,
                            table_name=f"{char_name} System Jump",
                            table_type="system_jump",
                            jump_duration=data.get('jump_duration'),
                            high_jump_duration=data.get('high_jump_duration'),
                            jump_height=data.get('jump_height'),
                            high_jump_height=data.get('high_jump_height'),
                            pre_instant_air_dash=data.get('pre_instant_air_dash'),
                            air_dash_duration=data.get('air_dash_duration'),
                            air_backdash_duration=data.get('air_backdash_duration'),
                            air_dash_distance=data.get('air_dash_distance'),
                            air_backdash_distance=data.get('air_backdash_distance'),
                            jumping_tension_gain=data.get('jumping_tension_gain'),
                            air_dash_tension_gain=data.get('air_dash_tension_gain'),
                            notes=data.get('notes')
                        )
                        session.add(system_jump)
                    
                    # Import character-specific tables
                    for data in char_data['character_specific']:
                        char_specific = CharacterSpecificTable(
                            character=char_name,
                            table_name=f"{char_name} {data.get('name', 'Special Data')}",
                            table_type="character_specific",
                            headers=[],  # You'll need to determine how to extract headers
                            rows=[data],  # Store the raw data for now
                            notes=data.get('notes')
                        )
                        session.add(char_specific)
                
                session.commit()
                progress.update(task, description="Data import complete")
        
        console.print(f"[green]✓[/] Successfully imported move data from {json_path}")
    
    except Exception as e:
        console.print(f"[red]Error:[/] Failed to import data: {str(e)}")
        raise typer.Exit(1)

if __name__ == "__main__":
    app()
