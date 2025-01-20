"""new parsed data models

Revision ID: d76d3331a787
Revises: 0749ede18770
Create Date: 2025-01-20 14:14:15.001439

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = 'd76d3331a787'
down_revision: Union[str, None] = '0749ede18770'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index('ix_move_data_character', table_name='move_data')
    op.drop_index('ix_move_data_move_type', table_name='move_data')
    op.drop_table('move_data')
    op.add_column('normal_moves', sa.Column('notes', sqlmodel.sql.sqltypes.AutoString(), nullable=True))
    op.add_column('normal_moves', sa.Column('properties', sa.JSON(), nullable=True))
    op.add_column('overdrive_moves', sa.Column('notes', sqlmodel.sql.sqltypes.AutoString(), nullable=True))
    op.add_column('overdrive_moves', sa.Column('properties', sa.JSON(), nullable=True))
    op.add_column('overdrive_moves', sa.Column('tension_cost', sqlmodel.sql.sqltypes.AutoString(), nullable=True))
    op.add_column('overdrive_moves', sa.Column('tension_gain', sqlmodel.sql.sqltypes.AutoString(), nullable=True))
    op.add_column('special_moves', sa.Column('notes', sqlmodel.sql.sqltypes.AutoString(), nullable=True))
    op.add_column('special_moves', sa.Column('properties', sa.JSON(), nullable=True))
    op.add_column('special_moves', sa.Column('tension_cost', sqlmodel.sql.sqltypes.AutoString(), nullable=True))
    op.add_column('system_core_data', sa.Column('weight', sqlmodel.sql.sqltypes.AutoString(), nullable=True))
    op.add_column('system_core_data', sa.Column('ground_throw_range', sqlmodel.sql.sqltypes.AutoString(), nullable=True))
    op.add_column('system_core_data', sa.Column('air_throw_range', sqlmodel.sql.sqltypes.AutoString(), nullable=True))
    op.add_column('system_core_data', sa.Column('throw_hurt_box', sqlmodel.sql.sqltypes.AutoString(), nullable=True))
    op.add_column('system_jump_data', sa.Column('double_jump_height', sqlmodel.sql.sqltypes.AutoString(), nullable=True))
    op.add_column('system_jump_data', sa.Column('double_jump_duration', sqlmodel.sql.sqltypes.AutoString(), nullable=True))
    op.add_column('system_jump_data', sa.Column('air_movement_options', sa.JSON(), nullable=True))
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('system_jump_data', 'air_movement_options')
    op.drop_column('system_jump_data', 'double_jump_duration')
    op.drop_column('system_jump_data', 'double_jump_height')
    op.drop_column('system_core_data', 'throw_hurt_box')
    op.drop_column('system_core_data', 'air_throw_range')
    op.drop_column('system_core_data', 'ground_throw_range')
    op.drop_column('system_core_data', 'weight')
    op.drop_column('special_moves', 'tension_cost')
    op.drop_column('special_moves', 'properties')
    op.drop_column('special_moves', 'notes')
    op.drop_column('overdrive_moves', 'tension_gain')
    op.drop_column('overdrive_moves', 'tension_cost')
    op.drop_column('overdrive_moves', 'properties')
    op.drop_column('overdrive_moves', 'notes')
    op.drop_column('normal_moves', 'properties')
    op.drop_column('normal_moves', 'notes')
    op.create_table('move_data',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('character', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('move_type', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('section', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('input', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('name', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('damage', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('guard', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('startup', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('active', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('recovery', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('on_block', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('on_hit', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('level', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('counter_type', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('invuln', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('proration', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('risc_gain', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('risc_loss', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('url', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.PrimaryKeyConstraint('id', name='move_data_pkey')
    )
    op.create_index('ix_move_data_move_type', 'move_data', ['move_type'], unique=False)
    op.create_index('ix_move_data_character', 'move_data', ['character'], unique=False)
    # ### end Alembic commands ### 