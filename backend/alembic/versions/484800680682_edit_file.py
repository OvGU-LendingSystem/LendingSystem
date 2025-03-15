"""Edit File

Revision ID: 484800680682
Revises: 8b34bdb647f2
Create Date: 2024-07-08 09:37:27.738178

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision: str = '484800680682'
down_revision: Union[str, None] = '8b34bdb647f2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index('session_id', table_name='sessions')
    op.drop_table('sessions')
    op.add_column('file', sa.Column('picture_id', sa.String(length=36), nullable=True))
    op.add_column('file', sa.Column('manual_id', sa.String(length=36), nullable=True))
    op.drop_constraint('file_ibfk_1', 'file', type_='foreignkey')
    op.create_foreign_key(None, 'file', 'physicalobject', ['picture_id'], ['phys_id'])
    op.create_foreign_key(None, 'file', 'physicalobject', ['manual_id'], ['phys_id'])
    op.drop_column('file', 'physicalobject_id')
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('file', sa.Column('physicalobject_id', mysql.VARCHAR(length=36), nullable=True))
    op.drop_constraint(None, 'file', type_='foreignkey')
    op.drop_constraint(None, 'file', type_='foreignkey')
    op.create_foreign_key('file_ibfk_1', 'file', 'physicalobject', ['physicalobject_id'], ['phys_id'])
    op.drop_column('file', 'manual_id')
    op.drop_column('file', 'picture_id')
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
