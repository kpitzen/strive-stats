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

class BaseTable(SQLModel):
    """Base class for all frame data tables."""
    id: Optional[int] = Field(default=None, primary_key=True)
    character: str = Field(index=True)
    table_name: str = Field(index=True)
    table_type: str = Field(index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class BaseMoveData(BaseTable):
    """Base class for all move data tables."""
    input: str = Field(description="Input command for the move")
    damage: Optional[str] = Field(default=None, description="Base damage of the move (can be a range or formula)")
    guard: Optional[str] = Field(default=None, description="Guard type (All, High, Low, etc)")
    startup: Optional[str] = Field(default=None, description="Startup frames (can be a range)")
    active: Optional[str] = Field(default=None, description="Active frames (can be a range or list)")
    recovery: Optional[str] = Field(default=None, description="Recovery frames (can be a range)")
    on_block: Optional[str] = Field(default=None, description="Frame advantage on block (can be +/- or special values)")
    on_hit: Optional[str] = Field(default=None, description="Frame advantage on hit (can be +/- or special values)")
    level: Optional[str] = Field(default=None, description="Attack level (can include special properties)")
    counter_type: Optional[str] = Field(default=None, description="Counter hit type")
    invuln: Optional[str] = Field(default=None, description="Invulnerability frames or properties")
    proration: Optional[str] = Field(default=None, description="Damage proration (can be % or formula)")
    risc_gain: Optional[str] = Field(default=None, description="RISC gain on block (can be formula)")
    risc_loss: Optional[str] = Field(default=None, description="RISC loss on hit (can be formula)")
    notes: Optional[str] = Field(default=None, description="Additional notes about the move")
    properties: Optional[List[str]] = Field(default=None, sa_type=JSON, description="Special properties of the move")

class NormalMoves(BaseMoveData, table=True):
    """Normal move frame data."""
    __tablename__ = "normal_moves"

class SpecialMoves(BaseMoveData, table=True):
    """Special move frame data."""
    __tablename__ = "special_moves"
    name: str = Field(description="Name of the special move")
    tension_cost: Optional[str] = Field(default=None, description="Tension cost to perform the move")

class OverdriveMoves(BaseMoveData, table=True):
    """Overdrive move frame data."""
    __tablename__ = "overdrive_moves"
    name: str = Field(description="Name of the overdrive move")
    tension_cost: Optional[str] = Field(default=None, description="Tension cost to perform the move")
    tension_gain: Optional[str] = Field(default=None, description="Tension gained from the move")

class SystemCoreData(BaseTable, table=True):
    """Core system data for a character like defense, guts, etc."""
    __tablename__ = "system_core_data"
    
    defense: Optional[str] = Field(default=None, description="Defense modifier")
    guts: Optional[str] = Field(default=None, description="Guts rating")
    risc_gain_modifier: Optional[str] = Field(default=None, description="R.I.S.C. Gain Modifier")
    prejump: Optional[str] = Field(default=None, description="Pre-jump frames")
    backdash_duration: Optional[str] = Field(default=None, description="Backdash duration in frames")
    backdash_invuln: Optional[str] = Field(default=None, description="Backdash invulnerability frames")
    backdash_airborne: Optional[str] = Field(default=None, description="Frame when backdash becomes airborne")
    forward_dash: Optional[str] = Field(default=None, description="Forward dash properties")
    unique_movement_options: Optional[str] = Field(default=None, description="Character-specific movement options")
    movement_tension_gain: Optional[str] = Field(default=None, description="Tension gain from movement")
    weight: Optional[str] = Field(default=None, description="Character weight class")
    ground_throw_range: Optional[str] = Field(default=None, description="Ground throw range")
    air_throw_range: Optional[str] = Field(default=None, description="Air throw range")
    throw_hurt_box: Optional[str] = Field(default=None, description="Throw hurt box properties")

class SystemJumpData(BaseTable, table=True):
    """Jump-related system data for a character."""
    __tablename__ = "system_jump_data"
    
    jump_duration: Optional[str] = Field(default=None, description="Normal jump duration")
    high_jump_duration: Optional[str] = Field(default=None, description="High jump duration")
    jump_height: Optional[str] = Field(default=None, description="Normal jump height")
    high_jump_height: Optional[str] = Field(default=None, description="High jump height")
    pre_instant_air_dash: Optional[str] = Field(default=None, description="Pre-IAD frames")
    air_dash_duration: Optional[str] = Field(default=None, description="Air dash duration")
    air_backdash_duration: Optional[str] = Field(default=None, description="Air backdash duration")
    air_dash_distance: Optional[str] = Field(default=None, description="Air dash distance")
    air_backdash_distance: Optional[str] = Field(default=None, description="Air backdash distance")
    jumping_tension_gain: Optional[str] = Field(default=None, description="Tension gain from jumping")
    air_dash_tension_gain: Optional[str] = Field(default=None, description="Tension gain from air dashing")
    double_jump_height: Optional[str] = Field(default=None, description="Double jump height")
    double_jump_duration: Optional[str] = Field(default=None, description="Double jump duration")
    air_movement_options: Optional[List[str]] = Field(default=None, sa_type=JSON, description="Special air movement options")

class GatlingTable(BaseTable, table=True):
    """Gatling combo possibilities."""
    __tablename__ = "gatling_tables"
    
    p_moves: List[str] = Field(sa_type=JSON, default_factory=list, description="P button moves")
    k_moves: List[str] = Field(sa_type=JSON, default_factory=list, description="K button moves")
    s_moves: List[str] = Field(sa_type=JSON, default_factory=list, description="S button moves")
    h_moves: List[str] = Field(sa_type=JSON, default_factory=list, description="H button moves")
    d_moves: List[str] = Field(sa_type=JSON, default_factory=list, description="D button moves")
    cancel_options: List[str] = Field(sa_type=JSON, default_factory=list, description="Available cancel options")

class CharacterSpecificTable(BaseTable, table=True):
    """For character-specific tables like Jack-O's servant gauge or Testament's stain data."""
    __tablename__ = "character_specific_tables"
    
    headers: List[str] = Field(sa_type=JSON, default_factory=list)
    rows: List[Dict] = Field(sa_type=JSON, default_factory=list) 