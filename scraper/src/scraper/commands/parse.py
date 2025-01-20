from pathlib import Path
import json
from typing import Dict, List, Optional, Any, TypedDict
from rich import print
from rich.progress import Progress, SpinnerColumn, TextColumn, TimeElapsedColumn
from bs4 import BeautifulSoup
from openai import OpenAI
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

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

def extract_table_data(soup: BeautifulSoup, table_type: str, char_name: str = "", client: Optional[OpenAI] = None) -> List[Dict[str, Any]]:
    """Extract data from a specific table type."""
    # Find the section containing our table type
    section = None
    logging.info(f"Looking for table type: {table_type}")
    
    # For overdrive moves, also check for "Supers" section
    search_terms = [table_type.lower().replace('_', ' ')]
    if table_type.lower() == "overdrives":
        search_terms.append("supers")
    
    # First try finding by h2 text content
    for h2 in soup.find_all('h2'):
        h2_text = h2.get_text().lower()
        if any(term in h2_text for term in search_terms):
            logging.info(f"Found h2 with matching text: {h2_text}")
            section = h2.find_next('table')
            if section:
                logging.info("Found table after h2")
            else:
                logging.warning("No table found after matching h2")
            break
    
    # If not found, try finding by h2 with specific ID
    if not section:
        for term in search_terms:
            h2 = soup.find('h2', id=term)
            if h2:
                logging.info(f"Found h2 with id={term}")
                section = h2.find_next('table')
                if section:
                    logging.info("Found table after h2 with id")
                else:
                    logging.warning("No table found after h2 with id")
                break
    
    # If still not found, try finding by span with mw-headline class and specific ID
    if not section:
        for term in search_terms:
            headline = soup.find('span', {'class': 'mw-headline', 'id': term})
            if headline:
                logging.info(f"Found span with class=mw-headline and id={term}")
                section = headline.find_parent('h2').find_next('table')
                if section:
                    logging.info("Found table after headline span")
                else:
                    logging.warning("No table found after headline span")
                break
    
    if not section:
        # Log all h2s and their IDs to help debug
        logging.warning(f"Failed to find table for {table_type}. Available h2s:")
        for h2 in soup.find_all('h2'):
            h2_id = h2.get('id', '')
            h2_text = h2.get_text().strip()
            headline = h2.find('span', {'class': 'mw-headline'})
            headline_id = headline.get('id', '') if headline else ''
            logging.warning(f"  - h2 id='{h2_id}' headline_id='{headline_id}' text='{h2_text}'")
        
        # If this is an overdrive moves table and we have OpenAI available, try using it
        if table_type == "Overdrives" and client and char_name:
            logging.info("Attempting to extract overdrive moves using OpenAI...")
            
            prompt = f"""Please extract the overdrive moves from this HTML for {char_name}.
            HTML content: {str(soup)}
            
            The data should be returned as a JSON array where each move has these fields:
            - name (string, required): Name of the overdrive move
            - input (string, required): Input command for the move
            - damage (string or number, optional): Damage dealt
            - guard (string, optional): Guard type
            - startup (string or number, optional): Startup frames
            - active (string or number, optional): Active frames
            - recovery (string or number, optional): Recovery frames
            - on_block (string or number, optional): Frame advantage on block
            - on_hit (string or number, optional): Frame advantage on hit
            - level (string, optional): Attack level
            - counter_type (string, optional): Counter hit type
            - invuln (string, optional): Invulnerability frames
            - proration (string, optional): Damage proration
            - risc_gain (string or number, optional): RISC gauge gain
            - risc_loss (string or number, optional): RISC gauge loss
            - tension_gain (string or number, optional): Tension gauge gain
            
            Return ONLY a direct JSON array of moves, not wrapped in any object. Every character should have at least 2 overdrive moves.
            If you can't find the exact values, use empty strings or null for optional fields, but always include name and input.
            
            Look for a section with a header containing 'Overdrive', 'Overdrives', or 'Super' text, and extract the move data from the table that follows it.
            Note that these powerful moves might be called either 'Overdrives' or 'Supers' in the documentation.
            
            Example response format:
            [
                {{
                    "name": "Move 1",
                    "input": "236236H",
                    "damage": null,
                    "guard": null
                }},
                {{
                    "name": "Move 2",
                    "input": "632146H",
                    "damage": null,
                    "guard": null
                }}
            ]"""
            
            try:
                response = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {
                            "role": "system",
                            "content": "You are a fighting game frame data parser. Extract move data from HTML and return it in a consistent JSON format."
                        },
                        {"role": "user", "content": prompt}
                    ],
                    response_format={"type": "json_object"}
                )
                
                if response.choices[0].message.content:
                    result = json.loads(response.choices[0].message.content)
                    # Handle both array and nested object formats
                    if isinstance(result, dict):
                        # If it's a dict, look for moves array in any field
                        for value in result.values():
                            if isinstance(value, list):
                                return value
                        # If no array found, return empty list
                        return []
                    # If it's already an array, return it directly
                    elif isinstance(result, list):
                        return result
                    return []
            except Exception as e:
                logging.error(f"Failed to extract overdrive moves using OpenAI: {str(e)}")
        
        return []
    
    # Extract headers
    headers = []
    for th in section.find_all('th'):
        header = th.get_text().strip().lower()
        # Clean up header names (similar to the spider's HEADER_MAPPING)
        header = header.replace('.', '').replace('-', '_').replace(' ', '_')
        headers.append(header)
    
    logging.info(f"Found headers: {headers}")
    
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
    
    logging.info(f"Extracted {len(rows)} rows")
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
                'normal_moves': extract_table_data(soup, 'Normal_Moves', char_name, client),
                'special_moves': extract_table_data(soup, 'Special_Moves', char_name, client),
                'overdrive_moves': extract_table_data(soup, 'Overdrives', char_name, client),
                'system_core': extract_table_data(soup, 'System_Core', char_name, client),
                'system_jump': extract_table_data(soup, 'System_Jump', char_name, client),
            }
            
            # Save raw extracted data
            raw_file = intermediate_dir / f"{char_name.lower().replace(' ', '_')}_raw.json"
            with open(raw_file, 'w', encoding='utf-8') as f:
                json.dump(char_data, f, indent=2)
            print(f"[blue]Saved raw data to {raw_file}[/blue]")
            
            if client:
                char_data = clean_character_data(client, char_data, progress, intermediate_dir)
            
            all_data['characters'].append(char_data)
        
        # Process raw files for reparsing
        for char_name, raw_file in raw_files:
            print(f"[green]Reparsing {char_name} from raw data...[/green]")
            
            with open(raw_file, 'r', encoding='utf-8') as f:
                char_data = json.load(f)
            
            if client:
                char_data = clean_character_data(client, char_data, progress, intermediate_dir)
            
            all_data['characters'].append(char_data)
    
    # Save the final parsed data
    output_file.parent.mkdir(parents=True, exist_ok=True)
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_data, f, indent=2)
    
    print(f"[green]Successfully processed {len(html_files) + len(raw_files)} characters![/green]")
    print(f"[blue]Data saved to {output_file}[/blue]")
    print(f"[blue]Individual character data saved in {intermediate_dir}[/blue]")

def clean_character_data(client: OpenAI, char_data: CharacterData, progress: Progress, intermediate_dir: Path) -> CharacterData:
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
            5. Ensure RISC-related fields are correctly named:
               - Use "risc_gain" (not "risec_gain" or "risk_gain")
               - Use "risc_loss" (not "risec_loss" or "risk_loss")
            6. Return ONLY valid JSON data that matches the schema provided in response_format
            
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
                cleaned_file = intermediate_dir / f"{char_data['name'].lower().replace(' ', '_')}_cleaned.json"
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