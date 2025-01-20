"""renormalizes normal moves table

Revision ID: 6332248066be
Revises: 13efefa67717
Create Date: 2024-03-19 12:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSON

# revision identifiers, used by Alembic.
revision: str = '6332248066be'
down_revision: Union[str, None] = '13efefa67717'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # Add new columns as nullable first
    op.add_column('normal_moves', sa.Column('move_name', sa.String(), nullable=True))
    op.add_column('normal_moves', sa.Column('damage', sa.String(), nullable=True))
    op.add_column('normal_moves', sa.Column('guard', sa.String(), nullable=True))
    op.add_column('normal_moves', sa.Column('startup', sa.String(), nullable=True))
    op.add_column('normal_moves', sa.Column('active', sa.String(), nullable=True))
    op.add_column('normal_moves', sa.Column('recovery', sa.String(), nullable=True))
    op.add_column('normal_moves', sa.Column('on_block', sa.String(), nullable=True))
    op.add_column('normal_moves', sa.Column('on_hit', sa.String(), nullable=True))
    op.add_column('normal_moves', sa.Column('level', sa.String(), nullable=True))
    op.add_column('normal_moves', sa.Column('counter_type', sa.String(), nullable=True))
    op.add_column('normal_moves', sa.Column('invuln', sa.String(), nullable=True))
    op.add_column('normal_moves', sa.Column('proration', sa.String(), nullable=True))
    op.add_column('normal_moves', sa.Column('risc_gain', sa.String(), nullable=True))
    op.add_column('normal_moves', sa.Column('risc_loss', sa.String(), nullable=True))

    # Drop old columns
    op.drop_column('normal_moves', 'p_moves')
    op.drop_column('normal_moves', 'k_moves')
    op.drop_column('normal_moves', 's_moves')
    op.drop_column('normal_moves', 'h_moves')
    op.drop_column('normal_moves', 'd_moves')
    op.drop_column('normal_moves', 'cancel_options')

def downgrade() -> None:
    # Add back old columns
    op.add_column('normal_moves', sa.Column('p_moves', JSON(), nullable=True))
    op.add_column('normal_moves', sa.Column('k_moves', JSON(), nullable=True))
    op.add_column('normal_moves', sa.Column('s_moves', JSON(), nullable=True))
    op.add_column('normal_moves', sa.Column('h_moves', JSON(), nullable=True))
    op.add_column('normal_moves', sa.Column('d_moves', JSON(), nullable=True))
    op.add_column('normal_moves', sa.Column('cancel_options', JSON(), nullable=True))

    # Drop new columns
    op.drop_column('normal_moves', 'move_name')
    op.drop_column('normal_moves', 'damage')
    op.drop_column('normal_moves', 'guard')
    op.drop_column('normal_moves', 'startup')
    op.drop_column('normal_moves', 'active')
    op.drop_column('normal_moves', 'recovery')
    op.drop_column('normal_moves', 'on_block')
    op.drop_column('normal_moves', 'on_hit')
    op.drop_column('normal_moves', 'level')
    op.drop_column('normal_moves', 'counter_type')
    op.drop_column('normal_moves', 'invuln')
    op.drop_column('normal_moves', 'proration')
    op.drop_column('normal_moves', 'risc_gain')
    op.drop_column('normal_moves', 'risc_loss') 