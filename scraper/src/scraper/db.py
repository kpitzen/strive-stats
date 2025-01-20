import json
import os
from pathlib import Path
from typing import List, Optional, Dict, Any, Type, Union, TypeVar, Set

from sqlalchemy.exc import SQLAlchemyError
from sqlmodel import Session, SQLModel, create_engine, select

from scraper.models import (
    MoveData,
    SystemCoreData,
    SystemJumpData,
    GatlingTable,
    NormalMoves,
    SpecialMoves,
    OverdriveMoves,
    CharacterSpecificTable,
    BaseTable,
    Character
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

def import_json_to_db(json_path: Path, database_url: Optional[str] = None) -> None:
    """Import JSON data into the database using batch processing."""
    if database_url is None:
        database_url = get_database_url()
    
    engine = create_engine(database_url)
    
    try:
        with open(json_path) as f:
            data = json.load(f)
        
        with Session(engine) as session:
            try:
                # Clear existing data from all tables
                model_types: List[Type[Union[MoveData, BaseTable, Character]]] = [
                    MoveData, SystemCoreData, SystemJumpData, 
                    GatlingTable, NormalMoves, SpecialMoves, OverdriveMoves,
                    CharacterSpecificTable, Character
                ]
                for model in model_types:
                    session.query(model).delete()
                
                # Track unique characters
                characters_seen: Set[str] = set()
                
                # Process each table entry
                for table_data in data:
                    character_slug = table_data['character']
                    
                    # Create character record if we haven't seen this character
                    if character_slug not in characters_seen:
                        create_character_record(session, character_slug)
                        characters_seen.add(character_slug)
                    
                    table_type = table_data.get('table_type', 'unknown')
                    
                    if table_type == 'system_core':
                        # Handle system core data
                        if len(table_data.get('rows', [])) > 0:
                            row_data = table_data['rows'][0]  # System data usually has one row
                            row_data.update({
                                'character': character_slug,
                                'table_name': table_data['table_name'],
                                'table_type': table_data['table_type']
                            })
                            session.add(convert_to_model(row_data, SystemCoreData))
                    
                    elif table_type == 'system_jump':
                        # Handle jump data
                        if len(table_data.get('rows', [])) > 0:
                            row_data = table_data['rows'][0]
                            row_data.update({
                                'character': character_slug,
                                'table_name': table_data['table_name'],
                                'table_type': table_data['table_type']
                            })
                            session.add(convert_to_model(row_data, SystemJumpData))
                    
                    elif table_type == 'normal_moves':
                        # Handle normal moves
                        for row in table_data.get('rows', []):
                            row.update({
                                'character': character_slug,
                                'table_name': table_data['table_name'],
                                'table_type': table_data['table_type']
                            })
                            session.add(convert_to_model(row, NormalMoves))
                    
                    elif table_type == 'special_moves':
                        # Handle special moves
                        for row in table_data.get('rows', []):
                            row.update({
                                'character': character_slug,
                                'table_name': table_data['table_name'],
                                'table_type': table_data['table_type']
                            })
                            session.add(convert_to_model(row, SpecialMoves))
                    
                    elif table_type == 'overdrive_moves':
                        # Handle overdrive moves
                        for row in table_data.get('rows', []):
                            row.update({
                                'character': character_slug,
                                'table_name': table_data['table_name'],
                                'table_type': table_data['table_type']
                            })
                            session.add(convert_to_model(row, OverdriveMoves))
                    
                    elif 'gatling' in table_data['table_name'].lower():
                        # Handle gatling tables
                        for row in table_data.get('rows', []):
                            row.update({
                                'character': character_slug,
                                'table_name': table_data['table_name'],
                                'table_type': 'gatling'
                            })
                            session.add(convert_to_model(row, GatlingTable))
                    
                    else:
                        # Handle character-specific tables
                        session.add(CharacterSpecificTable(
                            character=character_slug,
                            table_name=table_data['table_name'],
                            table_type=table_data['table_type'],
                            headers=table_data.get('headers', []),
                            rows=table_data.get('rows', [])
                        ))
                
                session.commit()
            
            except SQLAlchemyError as e:
                session.rollback()
                raise SQLAlchemyError(f"Database error during import: {str(e)}")
    
    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to parse JSON file {json_path}: {str(e)}")
    except Exception as e:
        raise Exception(f"Unexpected error during import: {str(e)}") 