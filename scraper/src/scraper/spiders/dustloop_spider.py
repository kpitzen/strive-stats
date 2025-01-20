from typing import Any, Generator, Optional
import scrapy
from scrapy.http import Response
import logging

class DustloopSpider(scrapy.Spider):
    name = 'dustloop'
    allowed_domains: list[str] = ['dustloop.com']
    start_urls: list[str] = ['https://www.dustloop.com/w/GGST']

    # Map common header variations to standardized names
    HEADER_MAPPING = {
        # Basic move properties
        'r.i.s.c. gain': 'risc_gain',
        'r.i.s.c. loss': 'risc_loss',
        'r.i.s.c gain': 'risc_gain',
        'r.i.s.c loss': 'risc_loss',
        'r․i․s․c․ gain': 'risc_gain',
        'r․i․s․c․ loss': 'risc_loss',
        'risc gain': 'risc_gain',
        'risc loss': 'risc_loss',
        'on-block': 'on_block',
        'on block': 'on_block',
        'on-hit': 'on_hit',
        'on hit': 'on_hit',
        'counter type': 'counter_type',
        'counter hit type': 'counter_type',
        'ch type': 'counter_type',
        'move name': 'name',
        'name': 'name',
        'input': 'input',
        'command': 'input',
        
        # Frame data
        'startup': 'startup',
        'start up': 'startup',
        'active': 'active',
        'active frames': 'active',
        'recovery': 'recovery',
        'rec': 'recovery',
        'recovery frames': 'recovery',
        'total': 'total_frames',
        'total frames': 'total_frames',
        
        # Hit properties
        'damage': 'damage',
        'dmg': 'damage',
        'guard': 'guard',
        'guard type': 'guard',
        'block type': 'guard',
        'level': 'level',
        'attack level': 'level',
        'invuln': 'invuln',
        'invulnerability': 'invuln',
        'inv': 'invuln',
        'proration': 'proration',
        'tension': 'tension',
        'tension gain': 'tension',
        'chip': 'chip_damage',
        'chip damage': 'chip_damage',
        'chip ratio': 'chip_ratio',
        'wall damage': 'wall_damage',
        'wall dmg': 'wall_damage',
        'wall break': 'wall_break',
        'otg ratio': 'otg_ratio',
        'otg': 'otg_ratio',
        
        # System data - Core stats
        'defense': 'defense',
        'def': 'defense',
        'guts': 'guts',
        'weight': 'weight',
        'prejump': 'prejump',
        'pre-jump': 'prejump',
        'backdash duration': 'backdash_duration',
        'backdash invuln': 'backdash_invuln',
        'backdash airborne': 'backdash_airborne',
        'forward dash': 'forward_dash',
        'unique movement options': 'unique_movement',
        
        # System data - Jump properties
        'jump duration': 'jump_duration',
        'high jump duration': 'high_jump_duration',
        'jump height': 'jump_height',
        'high jump height': 'high_jump_height',
        'pre-instant air dash': 'pre_instant_air_dash',
        'air dash duration': 'air_dash_duration',
        'air backdash duration': 'air_backdash_duration',
        'air dash distance': 'air_dash_distance',
        'air backdash distance': 'air_backdash_distance',
        
        # System data - Movement & Tension
        'movement tension gain': 'movement_tension_gain',
        'jumping tension gain': 'jumping_tension_gain',
        'air dash tension gain': 'air_dash_tension_gain',
        'walk speed': 'walk_speed',
        'run speed': 'run_speed',
        'backwalk speed': 'backwalk_speed',
        'dash speed': 'dash_speed',
        'initial dash speed': 'initial_dash_speed',
        'dash acceleration': 'dash_acceleration',
        'friction': 'friction',
        
        # Additional properties
        'notes': 'notes',
        'properties': 'properties',
        'attribute': 'attribute',
        'attributes': 'attributes',
        'cancels': 'cancels',
        'special cancel': 'special_cancel',
        'super cancel': 'super_cancel',
        'chain cancel': 'chain_cancel',
        'gatling': 'gatling',
        'gatling options': 'gatling',
    }

    def __init__(self, character: Optional[str] = None, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, **kwargs)
        self.character = character
        
        # If character is specified, modify the start URL to go directly to frame data
        if character:
            self.start_urls = [f'https://www.dustloop.com/w/GGST/{character}/Frame_Data']

    def parse(self, response: Response) -> Generator[Any, None, None]:
        """Parse the main GGST page to get character links."""
        if self.character:
            # If character is specified, go directly to frame data
            yield response.follow(
                f'/w/GGST/{self.character}/Frame_Data',
                callback=self.parse_frame_data,
                meta={'character': self.character}
            )
        else:
            # Find character links in the main grid
            character_patterns = [
                '//div[contains(@class, "add-hover-effect")]//a[contains(@href, "/w/GGST/")]/@href',
                '//div[contains(@class, "home-card")]//a[contains(@href, "/w/GGST/")]/@href'
            ]
            
            character_links = []
            for pattern in character_patterns:
                links = response.xpath(pattern).getall()
                if links:
                    character_links.extend(links)
            
            # Process each character link
            seen_characters = set()
            for link in character_links:
                if '/GGST/' in link and not any(x in link for x in ['/Patch_Notes', '/Frame_Data', '/Mechanics', '/HUD', '/FAQ']):
                    character = link.split('/GGST/')[-1].split('/')[0]
                    if character not in seen_characters:
                        seen_characters.add(character)
                        frame_data_url = f'/w/GGST/{character}/Frame_Data'
                        logging.info(f"Found character: {character}, following to {frame_data_url}")
                        yield response.follow(
                            frame_data_url,
                            callback=self.parse_frame_data,
                            meta={'character': character}
                        )

    def clean_header(self, header: str) -> str:
        """Standardize header names."""
        # Convert to lowercase and remove extra whitespace
        clean = header.lower().strip()
        
        # Check if we have a direct mapping
        if clean in self.HEADER_MAPPING:
            return self.HEADER_MAPPING[clean]
        
        # Otherwise, clean up the header
        clean = clean.replace('.', '')  # Remove periods
        clean = clean.replace('-', '_')  # Convert dashes to underscores
        clean = clean.replace(' ', '_')  # Convert spaces to underscores
        clean = ''.join(c for c in clean if c.isalnum() or c == '_')  # Remove special characters
        
        return clean

    def clean_cell_value(self, value: str) -> str:
        """Clean a cell value, converting empty cells and dashes to empty string."""
        if not value or value.strip() in ['-', '']:
            return ''
        return value.strip()

    def parse_frame_data(self, response):
        """Parse frame data tables from character pages."""
        character = response.meta.get('character') if 'character' in response.meta else self.character
        logging.info(f"Parsing frame data for character: {character}")
        
        # Get all tables that could contain frame data
        tables = response.xpath('//table[contains(@class, "wikitable") or contains(@class, "cargoTable") or contains(@class, "cargoDynamicTable")]')
        logging.info(f"Found {len(tables)} tables")
        
        for table in tables:
            # Try multiple methods to determine the table type
            table_type = "unknown"
            table_name = None
            
            # Method 1: Check preceding h2 headers
            header = table.xpath('preceding::h2[1]//span[@class="mw-headline"]/text()').get()
            if header:
                header_lower = header.strip().lower()
                # Set table name based on header
                table_name = header.strip().replace(' ', '_').lower()
                logging.info(f"Found header: {header_lower}")
                
                if "system" in header_lower:
                    if "core" in header_lower or table.xpath('.//th[contains(text(), "Defense") or contains(text(), "Guts")]'):
                        table_type = "system_core"
                    elif "jump" in header_lower or table.xpath('.//th[contains(text(), "Jump Duration")]'):
                        table_type = "system_jump"
                    else:
                        table_type = "system_other"
                elif "normal" in header_lower or "normals" in header_lower:
                    table_type = "normal_moves"
                    logging.info("Found normal moves table by header")
                elif "special" in header_lower:
                    table_type = "special_moves"
                elif "overdrive" in header_lower:
                    table_type = "overdrive_moves"
            
            # Method 2: Check table content if type is still unknown
            if table_type == "unknown":
                # Get all header text for debugging
                header_texts = table.xpath('.//th//text()').getall()
                logging.info(f"Table headers: {header_texts}")
                
                # Check for section headers first
                section_id = table.xpath('ancestor::section/preceding-sibling::h2[1]//span[@class="mw-headline"]/@id').get()
                logging.info(f"Found section ID: {section_id}")
                
                if section_id == "Special_Moves":
                    table_type = "special_moves"
                    table_name = "special_moves"
                    logging.info("Found special moves table by section")
                elif section_id == "Normal_Moves":
                    table_type = "normal_moves"
                    table_name = "normal_moves"
                    logging.info("Found normal moves table by section")
                elif section_id == "Overdrives":
                    table_type = "overdrive_moves"
                    table_name = "overdrive_moves"
                    logging.info("Found overdrive moves table by section")
                elif section_id == "Other":
                    table_type = "character_specific"
                    table_name = "other"
                    logging.info("Found character-specific table in Other section")
                # Fallback to content checks if section not found
                elif table.xpath('.//th[contains(text(), "Defense") or contains(text(), "Guts")]'):
                    table_type = "system_core"
                    table_name = "system_core"
                elif table.xpath('.//th[contains(text(), "Jump Duration")]'):
                    table_type = "system_jump"
                    table_name = "system_jump"
                # Check for normal moves table by looking for typical move input headers and content
                elif any('input' in h.lower() or 'command' in h.lower() or 'move' in h.lower() for h in header_texts) or \
                     any('damage' in h.lower() and 'startup' in h.lower() for h in header_texts):
                    table_type = "normal_moves"
                    table_name = "normal_moves"
                    logging.info("Found normal moves table by headers")
                # Skip glossary and other non-frame data tables
                elif any(x in table.xpath('string(.)').get().lower() for x in ['glossary', 'what is frame data']):
                    continue
                
                logging.info(f"Table type determined: {table_type}")
            
            # Get table headers
            headers = []
            header_row = table.xpath('.//tr[1]')
            if header_row:
                # Get all header cells, not just text nodes
                header_cells = header_row.xpath('.//th')
                headers = []
                for cell in header_cells:
                    # Get all text from the cell, joining with spaces if multiple nodes
                    header_text = ' '.join(text.strip() for text in cell.xpath('.//text()').getall())
                    if header_text.strip():
                        cleaned_header = self.clean_header(header_text.strip())
                        if cleaned_header not in headers:  # Prevent duplicate headers
                            headers.append(cleaned_header)
                            logging.info(f"Header '{header_text}' cleaned to '{cleaned_header}'")
                logging.info(f"Found {len(headers)} headers: {headers}")
            
            if not headers:
                logging.warning(f"No headers found in table, skipping")
                continue
            
            # Process data rows
            rows = []
            for row_idx, row in enumerate(table.xpath('.//tr[td]')):
                cells = row.xpath('.//td')
                row_data = {}
                
                # Log the raw cells for debugging
                raw_cells = [' '.join(cell.xpath('.//text()').getall()).strip() for cell in cells]
                logging.info(f"Row {row_idx} raw cells ({len(raw_cells)}): {raw_cells}")
                
                # Extract cell data - iterate over headers to ensure alignment
                for i, header in enumerate(headers):
                    if i >= len(cells):
                        logging.warning(f"Row {row_idx}: Missing cell for header '{header}' at index {i}")
                        row_data[header] = None
                        continue
                        
                    cell = cells[i]
                    # Get all text from the cell, joining with spaces if multiple nodes
                    cell_text = ' '.join(text.strip() for text in cell.xpath('.//text()').getall())
                    row_data[header] = self.clean_cell_value(cell_text)
                    logging.info(f"Row {row_idx}: Mapped header '{header}' to value '{cell_text.strip()}'")
                
                # Only include if we have meaningful data
                if row_data and any(v is not None for v in row_data.values()):
                    # For normal moves, just use the raw data as is
                    if table_type == "normal_moves":
                        # Log the raw data for debugging
                        logging.info(f"Processing normal move row: {row_data}")
                        rows.append(row_data)
                    elif table_type in ["special_moves", "overdrive_moves"]:
                        # For special moves, name is in its own column
                        move_name = row_data.get('name')
                        if not move_name:
                            # If no name column, try input or command
                            move_name = row_data.get('input') or row_data.get('command')
                        
                        if move_name:
                            logging.info(f"Found special move: {move_name}")
                            # Create a new row data dict with only the fields we want
                            new_row_data = {
                                "name": move_name,
                                'input': row_data.get('input') or '',  # Store in input field for consistency
                                'damage': row_data.get('damage'),
                                'guard': row_data.get('guard'),
                                'startup': row_data.get('startup'),
                                'active': row_data.get('active'),
                                'recovery': row_data.get('recovery'),
                                'on_block': row_data.get('on-block') or row_data.get('on_block'),
                                'on_hit': row_data.get('on-hit') or row_data.get('on_hit'),
                                'level': row_data.get('level'),
                                'counter_type': row_data.get('counter type') or row_data.get('counter_type'),
                                'invuln': row_data.get('invuln'),
                                'proration': row_data.get('proration'),
                                'risc_gain': row_data.get('r.i.s.c. gain') or row_data.get('risc_gain'),
                                'risc_loss': row_data.get('r.i.s.c. loss') or row_data.get('risc_loss')
                            }
                            rows.append(new_row_data)
                    else:
                        rows.append(row_data)
            
            if rows:
                # Generate a unique table name if none was found
                if not table_name:
                    table_name = f"{table_type}_{len(rows)}"
                
                # Create the table data structure
                table_data = {
                    'character': character,
                    'table_name': f"{character}.{table_name}",
                    'table_type': table_type,
                    'headers': headers,
                    'rows': rows
                }
                
                logging.info(f"Yielding {table_type} table with {len(rows)} rows")
                yield table_data 