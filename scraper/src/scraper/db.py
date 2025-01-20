import os
import json
from pathlib import Path
from typing import Optional, List, Type, Union, Set, Dict, Any, TypeVar
from sqlmodel import Session, create_engine, select
from scraper.models import (
    Character,
    SystemCoreData,
    SystemJumpData,
    NormalMoves,
    SpecialMoves,
    OverdriveMoves,
    SQLModel,
)

from scraper.models import (
    GatlingTable,
    CharacterSpecificTable,
    BaseTable,
)

# Type variable for our table models
TableType = TypeVar('TableType', bound=BaseTable)

def get_database_url() -> str:
    """Get the database URL from environment variables or use a default."""
    return os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:postgres@localhost:5432/frame_data"
    )

def init_db(database_url: Optional[str] = None) -> None:
    """Initialize the database and create tables."""
    if database_url is None:
        database_url = get_database_url()
    
    engine = create_engine(database_url)
    SQLModel.metadata.create_all(engine)

def convert_to_model(data: Dict[str, Any], model_class: Type[TableType]) -> TableType:
    """Convert a dictionary to a model instance, handling field name mapping."""
    # Map field names from JSON to model fields
    field_mapping = {
        'P': 'p_moves',
        'K': 'k_moves',
        'S': 's_moves',
        'H': 'h_moves',
        'D': 'd_moves',
        'Cancel': 'cancel_options',
        'R․I․S․C․ Gain Modifier': 'risc_gain_modifier',
    }
    
    # Create a new dict with mapped field names
    mapped_data: Dict[str, Any] = {}
    for key, value in data.items():
        mapped_key = field_mapping.get(key, key.lower().replace(' ', '_'))
        
        # For move fields in GatlingTable and NormalMoves, split into list
        if mapped_key in {'p_moves', 'k_moves', 's_moves', 'h_moves', 'd_moves', 'cancel_options'}:
            # Handle empty strings and None values
            if not value:
                mapped_data[mapped_key] = []
            else:
                # Split by comma and strip whitespace, filter out empty strings
                moves = [move.strip() for move in value.split(',') if move.strip()]
                mapped_data[mapped_key] = moves
        else:
            mapped_data[mapped_key] = value
    
    return model_class(**mapped_data)

def create_character_record(session: Session, character_slug: str) -> Character:
    """Create or update a character record."""
    # Convert slug to display name (e.g., 'Sol_Badguy' -> 'Sol Badguy')
    display_name = character_slug.replace('_', ' ')
    
    # Check if character already exists
    stmt = select(Character).where(Character.slug == character_slug)
    character = session.exec(stmt).first()
    
    if character is None:
        # Create new character record
        character = Character(
            name=character_slug,
            slug=character_slug,
            display_name=display_name
        )
        session.add(character)
        session.flush()  # Get the ID without committing
    
    return character

def import_json_to_db(json_path: Path, database_url: str | None = None) -> None:
    """Import frame data from cleaned JSON into the database."""
    if database_url is None:
        database_url = get_database_url()
    
    engine = create_engine(database_url)
    
    try:
        # Read the JSON data
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        with Session(engine) as session:
            # Process each character
            for char_data in data['characters']:
                # Create character record
                char_name = char_data['name']
                char = Character(
                    name=char_name,
                    slug=char_name.lower().replace(' ', '_'),
                    display_name=char_name,
                )
                session.add(char)
                session.flush()  # Get the character ID
                
                # Import normal moves
                for move in char_data['normal_moves']:
                    normal = NormalMoves(
                        character=char_name,
                        table_name=f"{char_name} Normal Moves",
                        table_type="normal_moves",
                        input=move['input'],
                        damage=str(move.get('damage', '')),
                        guard=move.get('guard'),
                        startup=str(move.get('startup', '')),
                        active=str(move.get('active', '')),
                        recovery=str(move.get('recovery', '')),
                        on_block=str(move.get('on_block', '')),
                        on_hit=str(move.get('on_hit', '')),
                        level=str(move.get('level', '')),
                        counter_type=move.get('counter_type'),
                        invuln=move.get('invuln'),
                        proration=str(move.get('proration', '')),
                        risc_gain=str(move.get('risc_gain', '')),
                        risc_loss=str(move.get('risc_loss', '')),
                    )
                    session.add(normal)
                
                # Import special moves
                for move in char_data['special_moves']:
                    special = SpecialMoves(
                        character=char_name,
                        table_name=f"{char_name} Special Moves",
                        table_type="special_moves",
                        name=move['name'],
                        input=move['input'],
                        damage=str(move.get('damage', '')),
                        guard=move.get('guard'),
                        startup=str(move.get('startup', '')),
                        active=str(move.get('active', '')),
                        recovery=str(move.get('recovery', '')),
                        on_block=str(move.get('on_block', '')),
                        on_hit=str(move.get('on_hit', '')),
                        level=str(move.get('level', '')),
                        counter_type=move.get('counter_type'),
                        invuln=move.get('invuln'),
                        proration=str(move.get('proration', '')),
                        risc_gain=str(move.get('risc_gain', '')),
                        risc_loss=str(move.get('risc_loss', '')),
                        tension_cost=str(move.get('tension_cost', '')),
                    )
                    session.add(special)
                
                # Import overdrive moves
                for move in char_data['overdrive_moves']:
                    overdrive = OverdriveMoves(
                        character=char_name,
                        table_name=f"{char_name} Overdrive Moves",
                        table_type="overdrive_moves",
                        name=move['name'],
                        input=move['input'],
                        damage=str(move.get('damage', '')),
                        guard=move.get('guard'),
                        startup=str(move.get('startup', '')),
                        active=str(move.get('active', '')),
                        recovery=str(move.get('recovery', '')),
                        on_block=str(move.get('on_block', '')),
                        on_hit=str(move.get('on_hit', '')),
                        level=str(move.get('level', '')),
                        counter_type=move.get('counter_type'),
                        invuln=move.get('invuln'),
                        proration=str(move.get('proration', '')),
                        risc_gain=str(move.get('risc_gain', '')),
                        risc_loss=str(move.get('risc_loss', '')),
                        tension_cost=str(move.get('tension_cost', '')),
                        tension_gain=str(move.get('tension_gain', '')),
                    )
                    session.add(overdrive)
                
                # Import system core data
                for core_data in char_data['system_core']:
                    core = SystemCoreData(
                        character=char_name,
                        table_name=f"{char_name} System Core",
                        table_type="system_core",
                        defense=str(core_data.get('defense', '')),
                        guts=str(core_data.get('guts', '')),
                        risc_gain_modifier=str(core_data.get('risc_gain_modifier', '')),
                        prejump=str(core_data.get('prejump', '')),
                        backdash_duration=str(core_data.get('backdash_duration', '')),
                        backdash_invuln=str(core_data.get('backdash_invuln', '')),
                        backdash_airborne=str(core_data.get('backdash_airborne', '')),
                        forward_dash=str(core_data.get('forward_dash', '')),
                        unique_movement_options=core_data.get('unique_movement_options'),
                        movement_tension_gain=str(core_data.get('movement_tension_gain', '')),
                        weight=str(core_data.get('weight', '')),
                        ground_throw_range=str(core_data.get('ground_throw_range', '')),
                        air_throw_range=str(core_data.get('air_throw_range', '')),
                        throw_hurt_box=str(core_data.get('throw_hurt_box', '')),
                    )
                    session.add(core)
                
                # Import system jump data
                for jump_data in char_data['system_jump']:
                    jump = SystemJumpData(
                        character=char_name,
                        table_name=f"{char_name} System Jump",
                        table_type="system_jump",
                        jump_duration=str(jump_data.get('jump_duration', '')),
                        high_jump_duration=str(jump_data.get('high_jump_duration', '')),
                        jump_height=str(jump_data.get('jump_height', '')),
                        high_jump_height=str(jump_data.get('high_jump_height', '')),
                        pre_instant_air_dash=str(jump_data.get('pre_instant_air_dash', '')),
                        air_dash_duration=str(jump_data.get('air_dash_duration', '')),
                        air_backdash_duration=str(jump_data.get('air_backdash_duration', '')),
                        air_dash_distance=str(jump_data.get('air_dash_distance', '')),
                        air_backdash_distance=str(jump_data.get('air_backdash_distance', '')),
                        jumping_tension_gain=str(jump_data.get('jumping_tension_gain', '')),
                        air_dash_tension_gain=str(jump_data.get('air_dash_tension_gain', '')),
                        double_jump_height=str(jump_data.get('double_jump_height', '')),
                        double_jump_duration=str(jump_data.get('double_jump_duration', '')),
                        air_movement_options=jump_data.get('air_movement_options'),
                    )
                    session.add(jump)
            
            # Commit all changes
            session.commit()
    
    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to parse JSON file {json_path}: {str(e)}")
    except Exception as e:
        raise ValueError(f"Failed to import data: {str(e)}") 