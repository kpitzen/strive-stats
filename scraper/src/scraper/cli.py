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
from typing import Optional

from scraper.db import init_db, import_json_to_db, get_database_url
from scraper.spiders.dustloop_spider import DustloopSpider
from .commands.download import download_frame_data
from .commands.parse import parse_frame_data

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
    json_path: Path = Path("output/dustloop_tables.json"),
    database_url: str | None = None
):
    """Import frame data from JSON into the database."""
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
            
            # Truncate all tables before importing
            with Session(engine) as session:
                try:
                    # Disable foreign key checks temporarily if using PostgreSQL
                    session.execute(text("SET CONSTRAINTS ALL DEFERRED"))
                    
                    # Truncate all tables
                    session.execute(text("TRUNCATE TABLE characters CASCADE"))
                    session.execute(text("TRUNCATE TABLE move_data CASCADE"))
                    session.execute(text("TRUNCATE TABLE system_core_data CASCADE"))
                    session.execute(text("TRUNCATE TABLE system_jump_data CASCADE"))
                    session.execute(text("TRUNCATE TABLE gatling_tables CASCADE"))
                    session.execute(text("TRUNCATE TABLE normal_moves CASCADE"))
                    session.execute(text("TRUNCATE TABLE special_moves CASCADE"))
                    session.execute(text("TRUNCATE TABLE overdrive_moves CASCADE"))
                    session.execute(text("TRUNCATE TABLE character_specific_tables CASCADE"))
                    
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
) -> None:
    """Parse downloaded frame data HTML files into structured JSON."""
    parse_frame_data(
        input_dir=Path(input_dir),
        output_file=Path(output_file),
        openai_api_key=openai_api_key,
    )

if __name__ == "__main__":
    app()
