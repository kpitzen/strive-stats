from typing import Optional
from sqlmodel import SQLModel, Field
from datetime import datetime

class BaseTable(SQLModel):
    id: Optional[int] = Field(default=None, primary_key=True)
    character: str = Field(index=True)
    table_name: str = Field(index=True)
    table_type: str = Field(index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class SystemCoreData(BaseTable, table=True):
    """Core system data for a character like defense, guts, etc."""
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
    p_moves: Optional[str] = Field(default=None, description="P button moves")
    k_moves: Optional[str] = Field(default=None, description="K button moves")
    s_moves: Optional[str] = Field(default=None, description="S button moves")
    h_moves: Optional[str] = Field(default=None, description="H button moves")
    d_moves: Optional[str] = Field(default=None, description="D button moves")
    cancel_options: Optional[str] = Field(default=None, description="Available cancel options")

class NormalMoves(BaseTable, table=True):
    """Normal move chains and cancels."""
    p_moves: Optional[str] = Field(default=None, description="P button moves")
    k_moves: Optional[str] = Field(default=None, description="K button moves")
    s_moves: Optional[str] = Field(default=None, description="S button moves")
    h_moves: Optional[str] = Field(default=None, description="H button moves")
    d_moves: Optional[str] = Field(default=None, description="D button moves")
    cancel_options: Optional[str] = Field(default=None, description="Available cancel options")

class CharacterSpecificTable(BaseTable, table=True):
    """For character-specific tables like Jack-O's servant gauge or Testament's stain data."""
    headers: list[str] = Field(default_factory=list)
    rows: list[dict] = Field(default_factory=list)

# For reference, here are the table types we've seen:
# - system_core: Core character stats
# - system_jump: Jump-related data
# - normal_moves: Normal attack data
# - unknown: Character-specific tables
#   - servant_gauge (Jack-O)
#   - on-block_cancel_data (Jack-O)
#   - hitstop_cancel_data (Jack-O)
#   - stain_frame_data (Testament)
#   - gatling_table (various characters) 