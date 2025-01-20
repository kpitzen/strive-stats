from pathlib import Path
import json
from typing import Dict, List, Optional, Any, TypedDict
from rich import print
from rich.progress import Progress, SpinnerColumn, TextColumn, TimeElapsedColumn
from bs4 import BeautifulSoup
from openai import OpenAI


# Define JSON schemas for each table type
NORMAL_MOVE_SCHEMA = {
    "type": "object",
    "properties": {
        "input": {"type": "string"},
        "damage": {"type": ["string", "integer", "null"]},
        "guard": {"type": ["string", "null"]},
        "startup": {"type": ["string", "integer", "null"]},
        "active": {"type": ["string", "integer", "null"]},
        "recovery": {"type": ["string", "integer", "null"]},
        "on_block": {"type": ["string", "integer", "null"]},
        "on_hit": {"type": ["string", "integer", "null"]},
        "level": {"type": ["string", "null"]},
        "counter_type": {"type": ["string", "null"]},
        "invuln": {"type": ["string", "null"]},
        "proration": {"type": ["string", "null"]},
        "risc_gain": {"type": ["string", "integer", "null"]},
        "risc_loss": {"type": ["string", "integer", "null"]},
    },
    "required": ["input"]
}

SPECIAL_MOVE_SCHEMA = {
    "type": "object",
    "properties": {
        "name": {"type": "string"},
        "input": {"type": "string"},
        "damage": {"type": ["string", "integer", "null"]},
        "guard": {"type": ["string", "null"]},
        "startup": {"type": ["string", "integer", "null"]},
        "active": {"type": ["string", "integer", "null"]},
        "recovery": {"type": ["string", "integer", "null"]},
        "on_block": {"type": ["string", "integer", "null"]},
        "on_hit": {"type": ["string", "integer", "null"]},
        "level": {"type": ["string", "null"]},
        "counter_type": {"type": ["string", "null"]},
        "invuln": {"type": ["string", "null"]},
        "proration": {"type": ["string", "null"]},
        "risc_gain": {"type": ["string", "integer", "null"]},
        "risc_loss": {"type": ["string", "integer", "null"]},
    },
    "required": ["name", "input"]
}

OVERDRIVE_MOVE_SCHEMA = {
    "type": "object",
    "properties": {
        "name": {"type": "string"},
        "input": {"type": "string"},
        "damage": {"type": ["string", "integer", "null"]},
        "guard": {"type": ["string", "null"]},
        "startup": {"type": ["string", "integer", "null"]},
        "active": {"type": ["string", "integer", "null"]},
        "recovery": {"type": ["string", "integer", "null"]},
        "on_block": {"type": ["string", "integer", "null"]},
        "on_hit": {"type": ["string", "integer", "null"]},
        "level": {"type": ["string", "null"]},
        "counter_type": {"type": ["string", "null"]},
        "invuln": {"type": ["string", "null"]},
        "proration": {"type": ["string", "null"]},
        "risc_gain": {"type": ["string", "integer", "null"]},
        "risc_loss": {"type": ["string", "integer", "null"]},
        "tension_gain": {"type": ["string", "integer", "null"]},  # Specific to overdrives
    },
    "required": ["name", "input"]
}

SYSTEM_CORE_SCHEMA = {
    "type": "object",
    "properties": {
        "defense": {"type": ["string", "number", "null"]},
        "guts": {"type": ["string", "number", "null"]},
        "risc_gain_modifier": {"type": ["string", "number", "null"]},
        "prejump": {"type": ["string", "integer", "null"]},
        "backdash_duration": {"type": ["string", "integer", "null"]},
        "backdash_invuln": {"type": ["string", "integer", "null"]},
        "backdash_airborne": {"type": ["string", "integer", "null"]},
        "forward_dash": {"type": ["string", "integer", "null"]},
        "unique_movement_options": {"type": ["string", "null"]},
        "movement_tension_gain": {"type": ["string", "number", "null"]},
    }
}

SYSTEM_JUMP_SCHEMA = {
    "type": "object",
    "properties": {
        "jump_duration": {"type": ["string", "integer", "null"]},
        "high_jump_duration": {"type": ["string", "integer", "null"]},
        "jump_height": {"type": ["string", "number", "null"]},
        "high_jump_height": {"type": ["string", "number", "null"]},
        "pre_instant_air_dash": {"type": ["string", "integer", "null"]},
        "air_dash_duration": {"type": ["string", "integer", "null"]},
        "air_backdash_duration": {"type": ["string", "integer", "null"]},
        "air_dash_distance": {"type": ["string", "number", "null"]},
        "air_backdash_distance": {"type": ["string", "number", "null"]},
        "jumping_tension_gain": {"type": ["string", "number", "null"]},
        "air_dash_tension_gain": {"type": ["string", "number", "null"]},
    }
}

CHARACTER_DATA_SCHEMA = {
    "type": "object",
    "properties": {
        "name": {"type": "string"},
        "normal_moves": {
            "type": "array",
            "items": NORMAL_MOVE_SCHEMA
        },
        "special_moves": {
            "type": "array",
            "items": SPECIAL_MOVE_SCHEMA
        },
        "overdrive_moves": {
            "type": "array",
            "items": OVERDRIVE_MOVE_SCHEMA
        },
        "system_core": {
            "type": "array",
            "items": SYSTEM_CORE_SCHEMA
        },
        "system_jump": {
            "type": "array",
            "items": SYSTEM_JUMP_SCHEMA
        }
    },
    "required": ["name", "normal_moves", "special_moves", "overdrive_moves", "system_core", "system_jump"],
    "additionalProperties": "false"
}

class CharacterData(TypedDict):
    name: str
    normal_moves: List[Dict[str, Any]]
    special_moves: List[Dict[str, Any]]
    overdrive_moves: List[Dict[str, Any]]
    system_core: List[Dict[str, Any]]
    system_jump: List[Dict[str, Any]]

class AllData(TypedDict):
    characters: List[CharacterData]

def extract_table_data(soup: BeautifulSoup, table_type: str) -> List[Dict[str, Any]]:
    """Extract data from a specific table type."""
    # Find the section containing our table type
    section = None
    for h2 in soup.find_all('h2'):
        if table_type.lower().replace('_', ' ') in h2.get_text().lower():
            section = h2.find_next('table')
            break
    
    if not section:
        return []
    
    # Extract headers
    headers = []
    for th in section.find_all('th'):
        header = th.get_text().strip().lower()
        # Clean up header names (similar to the spider's HEADER_MAPPING)
        header = header.replace('.', '').replace('-', '_').replace(' ', '_')
        headers.append(header)
    
    # Extract rows
    rows = []
    for tr in section.find_all('tr')[1:]:  # Skip header row
        row_data = {}
        for i, td in enumerate(tr.find_all('td')):
            if i < len(headers):
                value = td.get_text().strip()
                row_data[headers[i]] = value
        if row_data:
            rows.append(row_data)
    
    return rows

def parse_frame_data(
    input_dir: Path,
    output_file: Path,
    openai_api_key: Optional[str] = None,
    reparse_characters: Optional[List[str]] = None,
) -> None:
    """Parse downloaded HTML files into structured data.
    
    Args:
        input_dir: Directory containing HTML files
        output_file: Where to save the final JSON
        openai_api_key: Optional API key for OpenAI cleaning
        reparse_characters: Optional list of character names to reparse from raw data
    """
    # Initialize OpenAI client if API key is provided
    client = None
    if openai_api_key:
        client = OpenAI(api_key=openai_api_key)
    
    # Create intermediate output directory
    intermediate_dir = output_file.parent / "intermediate"
    intermediate_dir.mkdir(parents=True, exist_ok=True)
    
    all_data: AllData = {
        'characters': []
    }
    
    # Load existing data if we're reparsing
    if reparse_characters and output_file.exists():
        with open(output_file, 'r', encoding='utf-8') as f:
            existing_data = json.load(f)
            # Keep data for characters we're not reparsing
            all_data['characters'].extend(
                char for char in existing_data['characters']
                if char['name'].lower() not in [name.lower() for name in reparse_characters]
            )
    
    # Determine which files to process
    if reparse_characters:
        # Look for raw data files for specified characters
        html_files = []
        raw_files = []
        for char_name in reparse_characters:
            raw_file = intermediate_dir / f"{char_name.lower().replace(' ', '_')}_raw.json"
            if raw_file.exists():
                raw_files.append((char_name, raw_file))
            else:
                # Try to find matching HTML file
                html_file = next(input_dir.glob(f"{char_name.lower().replace(' ', '_')}_frame_data.html"), None)
                if html_file:
                    html_files.append(html_file)
                else:
                    print(f"[red]Warning: No data found for character {char_name}[/red]")
    else:
        # Process all HTML files
        html_files = list(input_dir.glob('*_frame_data.html'))
        raw_files = []
    
    # Create progress display
    progress = Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        TimeElapsedColumn(),
    )
    
    with progress:
        # Process HTML files first
        for html_file in html_files:
            print(f"[green]Processing {html_file.name}...[/green]")
            
            # Extract character name from filename
            char_name = html_file.stem.replace('_frame_data', '').replace('_', ' ').title()
            
            with open(html_file, 'r', encoding='utf-8') as f:
                soup = BeautifulSoup(f.read(), 'html.parser')
            
            # Initialize character data
            char_data: CharacterData = {
                'name': char_name,
                'normal_moves': extract_table_data(soup, 'Normal_Moves'),
                'special_moves': extract_table_data(soup, 'Special_Moves'),
                'overdrive_moves': extract_table_data(soup, 'Overdrive'),
                'system_core': extract_table_data(soup, 'System_Core'),
                'system_jump': extract_table_data(soup, 'System_Jump'),
            }
            
            # Save raw extracted data
            raw_file = intermediate_dir / f"{char_name.lower().replace(' ', '_')}_raw.json"
            with open(raw_file, 'w', encoding='utf-8') as f:
                json.dump(char_data, f, indent=2)
            print(f"[blue]Saved raw data to {raw_file}[/blue]")
            
            if client:
                char_data = clean_character_data(client, char_data, progress)
            
            all_data['characters'].append(char_data)
        
        # Process raw files for reparsing
        for char_name, raw_file in raw_files:
            print(f"[green]Reparsing {char_name} from raw data...[/green]")
            
            with open(raw_file, 'r', encoding='utf-8') as f:
                char_data = json.load(f)
            
            if client:
                char_data = clean_character_data(client, char_data, progress)
            
            all_data['characters'].append(char_data)
    
    # Save the final parsed data
    output_file.parent.mkdir(parents=True, exist_ok=True)
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_data, f, indent=2)
    
    print(f"[green]Successfully processed {len(html_files) + len(raw_files)} characters![/green]")
    print(f"[blue]Data saved to {output_file}[/blue]")
    print(f"[blue]Individual character data saved in {intermediate_dir}[/blue]")

def clean_character_data(client: OpenAI, char_data: CharacterData, progress: Progress) -> CharacterData:
    """Clean character data using OpenAI."""
    last_error = None
    max_retries = 2
    
    # Create a task for this character's cleaning process
    task_id = progress.add_task(f"Cleaning data for {char_data['name']}...", total=None)
    
    for attempt in range(max_retries + 1):
        try:
            if attempt > 0:
                progress.update(task_id, description=f"Retrying {char_data['name']} (attempt {attempt + 1})...")
            
            # Create a prompt for data validation and cleanup
            prompt = f"""Please validate and clean up this frame data for {char_data['name']}.
            Original data: {json.dumps(char_data, indent=2)}
            
            Please:
            1. Standardize move names (for special and overdrive moves)
            2. Convert frame data to integers where appropriate:
               - Convert clear numbers (e.g. "12" -> 12)
               - Leave ranges as strings (e.g. "12-14")
               - Leave special values as strings (e.g. "±0", "+2~3")
            3. Fix any obvious errors or inconsistencies
            4. Ensure all required fields are present
            5. Return ONLY valid JSON data that matches the schema provided in response_format
            
            The response MUST be valid JSON and maintain the exact same structure as the input."""
            
            # If this is a retry, add error context
            if last_error:
                prompt += f"\n\nThe previous attempt failed with error: {last_error}\nPlease ensure the response is valid JSON and fix any syntax errors."
            
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system", 
                        "content": """You are a helpful assistant that cleans and validates fighting game frame data.
                        You MUST return only valid JSON data that matches the schema provided in response_format.
                        Pay special attention to:
                        - Different requirements for normal vs special/overdrive moves
                        - Converting numeric values appropriately
                        - Maintaining the exact structure specified
                        """
                    },
                    {"role": "user", "content": prompt}
                ],
                response_format={
                    "type": "json_object",
                }
            )
            
            # Parse the cleaned data
            content = response.choices[0].message.content
            if content:  # Check if content is not None
                cleaned_data = json.loads(content)
                char_data.update(cleaned_data)
                
                # Save cleaned data
                cleaned_file = Path(progress.console.file.name).parent / "intermediate" / f"{char_data['name'].lower().replace(' ', '_')}_cleaned.json"
                with open(cleaned_file, 'w', encoding='utf-8') as f:
                    json.dump(char_data, f, indent=2)
                
                progress.update(task_id, description=f"[green]Successfully cleaned {char_data['name']}[/green]")
                print(f"[blue]Saved cleaned data to {cleaned_file}[/blue]")
                break  # Success, exit retry loop
        
        except json.JSONDecodeError as e:
            last_error = str(e)
            if attempt < max_retries:
                print(f"[yellow]Attempt {attempt + 1} failed for {char_data['name']}, retrying...[/yellow]")
            else:
                progress.update(task_id, description=f"[red]Failed to clean {char_data['name']}[/red]")
                print(f"[red]Failed to clean data for {char_data['name']} after {max_retries + 1} attempts[/red]")
        except Exception as e:
            progress.update(task_id, description=f"[red]Error cleaning {char_data['name']}[/red]")
            print(f"[yellow]Warning: OpenAI processing failed for {char_data['name']}: {str(e)}[/yellow]")
            break  # Don't retry on non-JSON errors
    
    # Remove the task when done
    progress.remove_task(task_id)
    
    return char_data 