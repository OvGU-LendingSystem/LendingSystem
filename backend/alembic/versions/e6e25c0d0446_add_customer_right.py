"""Add customer right

Revision ID: e6e25c0d0446
Revises: 601404ac5fd1
Create Date: 2024-07-11 15:11:25.798005

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision: str = 'e6e25c0d0446'
down_revision: Union[str, None] = '601404ac5fd1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index('session_id', table_name='sessions')
    op.drop_table('sessions')
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
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
