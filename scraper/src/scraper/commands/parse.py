import os
from pathlib import Path
import json
from typing import Dict, List, Optional, Any, TypedDict
import typer
from rich import print
from rich.progress import Progress, SpinnerColumn, TextColumn, TimeElapsedColumn
from bs4 import BeautifulSoup
from openai import OpenAI
from scraper.models import (
    Character,
    MoveData,
    NormalMoves,
    SpecialMoves,
    OverdriveMoves,
    SystemCoreData,
    SystemJumpData,
)

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
    openai_api_key: Optional[str] = None
) -> None:
    """Parse downloaded HTML files into structured data."""
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
    
    # Process each HTML file
    html_files = list(input_dir.glob('*_frame_data.html'))
    
    # Create progress display
    progress = Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        TimeElapsedColumn(),
    )
    
    with progress:
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
            
            # Use OpenAI to clean up and validate data if available
            if client:
                last_error = None
                max_retries = 2
                
                # Create a task for this character's cleaning process
                task_id = progress.add_task(f"Cleaning data for {char_name}...", total=None)
                
                for attempt in range(max_retries + 1):
                    try:
                        if attempt > 0:
                            progress.update(task_id, description=f"Retrying {char_name} (attempt {attempt + 1})...")
                        
                        # Create a prompt for data validation and cleanup
                        prompt = f"""Please validate and clean up this frame data for {char_name}.
                        Original data: {json.dumps(char_data, indent=2)}
                        
                        Please:
                        1. Standardize move names
                        2. Convert frame data to integers where appropriate
                        3. Fix any obvious errors or inconsistencies
                        4. Ensure all required fields are present
                        5. Return ONLY valid JSON data that matches the original structure
                        
                        The response MUST be valid JSON and maintain the exact same structure as the input."""
                        
                        # If this is a retry, add error context
                        if last_error:
                            prompt += f"\n\nThe previous attempt failed with error: {last_error}\nPlease ensure the response is valid JSON and fix any syntax errors."
                        
                        response = client.chat.completions.create(
                            model="gpt-4",
                            messages=[
                                {"role": "system", "content": "You are a helpful assistant that cleans and validates fighting game frame data. You MUST return only valid JSON data."},
                                {"role": "user", "content": prompt}
                            ],
                            response_format={"type": "json_object"}
                        )
                        
                        # Parse the cleaned data
                        content = response.choices[0].message.content
                        if content:  # Check if content is not None
                            cleaned_data = json.loads(content)
                            char_data.update(cleaned_data)
                            
                            # Save cleaned data
                            cleaned_file = intermediate_dir / f"{char_name.lower().replace(' ', '_')}_cleaned.json"
                            with open(cleaned_file, 'w', encoding='utf-8') as f:
                                json.dump(char_data, f, indent=2)
                            
                            progress.update(task_id, description=f"[green]Successfully cleaned {char_name}[/green]")
                            print(f"[blue]Saved cleaned data to {cleaned_file}[/blue]")
                            break  # Success, exit retry loop
                    
                    except json.JSONDecodeError as e:
                        last_error = str(e)
                        if attempt < max_retries:
                            print(f"[yellow]Attempt {attempt + 1} failed for {char_name}, retrying...[/yellow]")
                        else:
                            progress.update(task_id, description=f"[red]Failed to clean {char_name}[/red]")
                            print(f"[red]Failed to clean data for {char_name} after {max_retries + 1} attempts[/red]")
                    except Exception as e:
                        progress.update(task_id, description=f"[red]Error cleaning {char_name}[/red]")
                        print(f"[yellow]Warning: OpenAI processing failed for {char_name}: {str(e)}[/yellow]")
                        break  # Don't retry on non-JSON errors
                
                # Remove the task when done
                progress.remove_task(task_id)
            
            all_data['characters'].append(char_data)
    
    # Save the final parsed data
    output_file.parent.mkdir(parents=True, exist_ok=True)
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_data, f, indent=2)
    
    print(f"[green]Successfully parsed {len(html_files)} characters![/green]")
    print(f"[blue]Data saved to {output_file}[/blue]")
    print(f"[blue]Individual character data saved in {intermediate_dir}[/blue]") 