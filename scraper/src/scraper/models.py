from typing import Optional, Dict, List
from sqlmodel import Field, SQLModel
from datetime import datetime
from sqlalchemy import JSON

class Character(SQLModel, table=True):
    """Character metadata and identifiers."""
    __tablename__ = "characters"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    slug: str = Field(index=True, description="URL-friendly name (e.g. 'Sol_Badguy')")
    display_name: str = Field(description="Display name (e.g. 'Sol Badguy')")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class MoveData(SQLModel, table=True):
    __tablename__ = "move_data"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    character: str = Field(index=True)
    move_type: str = Field(index=True)
    section: str
    name: str
    url: str
    
    # Optional fields that might be null for system data
    input: Optional[str] = None
    damage: Optional[str] = None
    guard: Optional[str] = None
    startup: Optional[str] = None
    active: Optional[str] = None
    recovery: Optional[str] = None
    on_block: Optional[str] = None
    on_hit: Optional[str] = None
    level: Optional[str] = None
    counter_type: Optional[str] = None
    invuln: Optional[str] = None
    proration: Optional[str] = None
    risc_gain: Optional[str] = None
    risc_loss: Optional[str] = None

class BaseTable(SQLModel):
    id: Optional[int] = Field(default=None, primary_key=True)
    character: str = Field(index=True)
    table_name: str = Field(index=True)
    table_type: str = Field(index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class SystemCoreData(BaseTable, table=True):
    """Core system data for a character like defense, guts, etc."""
    __tablename__ = "system_core_data"
    
    defense: Optional[str]
    guts: Optional[str]
    risc_gain_modifier: Optional[str] = Field(default=None, description="R.I.S.C. Gain Modifier")
    prejump: Optional[str]
    backdash_duration: Optional[str]
    backdash_invuln: Optional[str]
    backdash_airborne: Optional[str]
    forward_dash: Optional[str]
    unique_movement_options: Optional[str]
    movement_tension_gain: Optional[str]

class SystemJumpData(BaseTable, table=True):
    """Jump-related system data for a character."""
    __tablename__ = "system_jump_data"
    
    jump_duration: Optional[str]
    high_jump_duration: Optional[str]
    jump_height: Optional[str]
    high_jump_height: Optional[str]
    pre_instant_air_dash: Optional[str]
    air_dash_duration: Optional[str]
    air_backdash_duration: Optional[str]
    air_dash_distance: Optional[str]
    air_backdash_distance: Optional[str]
    jumping_tension_gain: Optional[str]
    air_dash_tension_gain: Optional[str]

class GatlingTable(BaseTable, table=True):
    """Gatling combo possibilities."""
    __tablename__ = "gatling_tables"
    
    p_moves: List[str] = Field(sa_type=JSON, default_factory=list, description="P button moves")
    k_moves: List[str] = Field(sa_type=JSON, default_factory=list, description="K button moves")
    s_moves: List[str] = Field(sa_type=JSON, default_factory=list, description="S button moves")
    h_moves: List[str] = Field(sa_type=JSON, default_factory=list, description="H button moves")
    d_moves: List[str] = Field(sa_type=JSON, default_factory=list, description="D button moves")
    cancel_options: List[str] = Field(sa_type=JSON, default_factory=list, description="Available cancel options")

class NormalMoves(BaseTable, table=True):
    """Normal move frame data."""
    __tablename__ = "normal_moves"
    
    input: str = Field(description="Input command for the move")
    damage: Optional[str] = Field(default=None, description="Base damage of the move")
    guard: Optional[str] = Field(default=None, description="Guard type (All, High, Low)")
    startup: Optional[str] = Field(default=None, description="Startup frames")
    active: Optional[str] = Field(default=None, description="Active frames")
    recovery: Optional[str] = Field(default=None, description="Recovery frames")
    on_block: Optional[str] = Field(default=None, description="Frame advantage on block")
    on_hit: Optional[str] = Field(default=None, description="Frame advantage on hit")
    level: Optional[str] = Field(default=None, description="Attack level")
    counter_type: Optional[str] = Field(default=None, description="Counter hit type")
    invuln: Optional[str] = Field(default=None, description="Invulnerability frames")
    proration: Optional[str] = Field(default=None, description="Damage proration")
    risc_gain: Optional[str] = Field(default=None, description="RISC gain on block")
    risc_loss: Optional[str] = Field(default=None, description="RISC loss on hit")

class CharacterSpecificTable(BaseTable, table=True):
    """For character-specific tables like Jack-O's servant gauge or Testament's stain data."""
    __tablename__ = "character_specific_tables"
    
    headers: List[str] = Field(sa_type=JSON, default_factory=list)
    rows: List[Dict] = Field(sa_type=JSON, default_factory=list)

class SpecialMoves(BaseTable, table=True):
    """Special move frame data."""
    __tablename__ = "special_moves"
    
    name: str = Field(description="Name of the special move")
    input: str = Field(description="Input command for the move")
    damage: Optional[str] = Field(default=None, description="Base damage of the move")
    guard: Optional[str] = Field(default=None, description="Guard type (All, High, Low)")
    startup: Optional[str] = Field(default=None, description="Startup frames")
    active: Optional[str] = Field(default=None, description="Active frames")
    recovery: Optional[str] = Field(default=None, description="Recovery frames")
    on_block: Optional[str] = Field(default=None, description="Frame advantage on block")
    on_hit: Optional[str] = Field(default=None, description="Frame advantage on hit")
    level: Optional[str] = Field(default=None, description="Attack level")
    counter_type: Optional[str] = Field(default=None, description="Counter hit type")
    invuln: Optional[str] = Field(default=None, description="Invulnerability frames")
    proration: Optional[str] = Field(default=None, description="Damage proration")
    risc_gain: Optional[str] = Field(default=None, description="RISC gain on block")
    risc_loss: Optional[str] = Field(default=None, description="RISC loss on hit")

class OverdriveMoves(BaseTable, table=True):
    """Overdrive move frame data."""
    __tablename__ = "overdrive_moves"
    
    name: str = Field(description="Name of the overdrive move")
    input: str = Field(description="Input command for the move")
    damage: Optional[str] = Field(default=None, description="Base damage of the move")
    guard: Optional[str] = Field(default=None, description="Guard type (All, High, Low)")
    startup: Optional[str] = Field(default=None, description="Startup frames")
    active: Optional[str] = Field(default=None, description="Active frames")
    recovery: Optional[str] = Field(default=None, description="Recovery frames")
    on_block: Optional[str] = Field(default=None, description="Frame advantage on block")
    on_hit: Optional[str] = Field(default=None, description="Frame advantage on hit")
    level: Optional[str] = Field(default=None, description="Attack level")
    counter_type: Optional[str] = Field(default=None, description="Counter hit type")
    invuln: Optional[str] = Field(default=None, description="Invulnerability frames")
    proration: Optional[str] = Field(default=None, description="Damage proration")
    risc_gain: Optional[str] = Field(default=None, description="RISC gain on block")
    risc_loss: Optional[str] = Field(default=None, description="RISC loss on hit") 