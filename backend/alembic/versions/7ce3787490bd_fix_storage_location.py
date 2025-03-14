"""Fix Storage location

Revision ID: 7ce3787490bd
Revises: 484800680682
Create Date: 2024-07-08 09:42:40.568757

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision: str = '7ce3787490bd'
down_revision: Union[str, None] = '484800680682'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index('session_id', table_name='sessions')
    op.drop_table('sessions')
    op.add_column('physicalobject', sa.Column('storage_location', sa.String(length=60), nullable=False))
    op.add_column('physicalobject', sa.Column('storage_location2', sa.String(length=60), nullable=True))
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('physicalobject', 'storage_location2')
    op.drop_column('physicalobject', 'storage_location')
    op.create_table('sessions',
    sa.Column('id', mysql.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('session_id', mysql.VARCHAR(length=255), nullable=True),
    sa.Column('data', sa.BLOB(), nullable=True),
    sa.Column('expiry', mysql.DATETIME(), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    mysql_collate='utf8mb4_0900_ai_ci',
    mysql_default_charset='utf8mb4',
    mysql_engine='InnoDB'
    )
    op.create_index('session_id', 'sessions', ['session_id'], unique=True)
    # ### end Alembic commands ###
