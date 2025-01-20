import os
from pathlib import Path
import typer
import requests
from rich import print
from typing import Optional, Union
from bs4 import BeautifulSoup

def download_frame_data(
    output_dir: str = "output/frame_data_html",
    character: Optional[str] = None,
) -> None:
    """Download frame data HTML pages from Dustloop for GGST characters."""
    # Create output directory
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    # Base URL for GGST on Dustloop
    base_url = "https://www.dustloop.com/w/GGST"
    
    if character:
        characters = [character]
    else:
        # Get the main page to find all characters
        print("[yellow]Fetching main page...[/yellow]")
        response = requests.get(base_url)
        if response.status_code != 200:
            print(f"[red]Failed to fetch main page: {response.status_code}[/red]")
            raise typer.Exit(1)
            
        # Parse the HTML properly using BeautifulSoup
        soup = BeautifulSoup(response.text, 'html.parser')
        characters = []
        
        # Try multiple selectors to find character links
        selectors = [
            'div.char-grid a',  # Try original selector
            'div.add-hover-effect a',  # Try selector from spider
            'div.home-card a',  # Try alternate selector from spider
            'a[href*="/GGST/"]'  # Fallback: any link containing /GGST/
        ]
        
        for selector in selectors:
            print(f"[yellow]Trying selector: {selector}[/yellow]")
            char_links = soup.select(selector)
            print(f"Found {len(char_links)} links")
            
            for link in char_links:
                href = link.get('href', '')
                # Handle both string and list href values
                if isinstance(href, list):
                    href = href[0] if href else ''
                
                if '/GGST/' in href and not any(x in href for x in ['Patch_Notes', 'Frame_Data', 'Mechanics', 'HUD', 'FAQ']):
                    char_name = href.split('/GGST/')[-1].split('/')[0]
                    if char_name and char_name not in characters:
                        print(f"[blue]Found character: {char_name}[/blue]")
                        characters.append(char_name)
        
        if not characters:
            print("[red]No characters found! Something might be wrong with the page structure.[/red]")
            # Save the HTML for debugging
            debug_file = output_path / "main_page_debug.html"
            debug_file.write_text(response.text)
            print(f"[yellow]Saved main page HTML to {debug_file} for debugging[/yellow]")
            raise typer.Exit(1)
    
    # Download frame data for each character
    for char in characters:
        print(f"[green]Downloading frame data for {char}...[/green]")
        frame_data_url = f"{base_url}/{char}/Frame_Data"
        
        response = requests.get(frame_data_url)
        if response.status_code != 200:
            print(f"[red]Failed to download {char}: {response.status_code}[/red]")
            continue
            
        # Save to file
        output_file = output_path / f"{char.lower()}_frame_data.html"
        output_file.write_text(response.text)
        print(f"[blue]Saved {char} frame data to {output_file}[/blue]") 