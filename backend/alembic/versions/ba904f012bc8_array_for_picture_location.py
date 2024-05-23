"""Array for picture location

Revision ID: ba904f012bc8
Revises: 51c772d10b15
Create Date: 2024-05-23 20:44:53.868328

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision: str = 'ba904f012bc8'
down_revision: Union[str, None] = '51c772d10b15'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('picture',
    sa.Column('picture_id', sa.Integer(), nullable=False),
    sa.Column('path', sa.String(length=600), nullable=False),
    sa.PrimaryKeyConstraint('picture_id'),
    sa.UniqueConstraint('path')
    )
    op.drop_column('physicalobject', 'pic_path')
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('physicalobject', sa.Column('pic_path', mysql.VARCHAR(length=600), nullable=True))
    op.drop_table('picture')
    # ### end Alembic commands ###
