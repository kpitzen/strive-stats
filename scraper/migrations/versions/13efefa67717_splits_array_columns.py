"""splits array columns

Revision ID: 13efefa67717
Revises: 0ee5387f1f99
Create Date: 2024-03-19 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSON

# revision identifiers, used by Alembic.
revision: str = '13efefa67717'
down_revision: Union[str, None] = '0ee5387f1f99'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # Helper function to convert comma-separated string to JSON array
    op.execute("""
        CREATE OR REPLACE FUNCTION string_to_array_json(val text) 
        RETURNS json AS $$
        BEGIN
            IF val IS NULL OR val = '' OR val = '-' THEN
                RETURN '[]'::json;
            END IF;
            RETURN (
                SELECT json_agg(trim(elem))
                FROM regexp_split_to_table(val, ',') AS elem
                WHERE trim(elem) != ''
            );
        END;
        $$ LANGUAGE plpgsql;
    """)

    # Convert each column in gatling_tables
    for column in ['p_moves', 'k_moves', 's_moves', 'h_moves', 'd_moves', 'cancel_options']:
        op.execute(f"""
            ALTER TABLE gatling_tables 
            ALTER COLUMN {column} TYPE JSON 
            USING string_to_array_json({column})
        """)

    # Convert each column in normal_moves
    for column in ['p_moves', 'k_moves', 's_moves', 'h_moves', 'd_moves', 'cancel_options']:
        op.execute(f"""
            ALTER TABLE normal_moves 
            ALTER COLUMN {column} TYPE JSON 
            USING string_to_array_json({column})
        """)

    # Clean up the helper function
    op.execute("DROP FUNCTION string_to_array_json(text)")

def downgrade() -> None:
    # Convert JSON arrays back to comma-separated strings
    for table in ['gatling_tables', 'normal_moves']:
        for column in ['p_moves', 'k_moves', 's_moves', 'h_moves', 'd_moves', 'cancel_options']:
            op.execute(f"""
                ALTER TABLE {table}
                ALTER COLUMN {column} TYPE VARCHAR
                USING array_to_string(ARRAY(SELECT json_array_elements_text({column})), ', ')
            """) 