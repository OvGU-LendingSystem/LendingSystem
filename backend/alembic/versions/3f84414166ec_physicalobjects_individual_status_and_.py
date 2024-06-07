"""PhysicalObjects individual status and time in order

Revision ID: 3f84414166ec
Revises: 194d251bf0f2
Create Date: 2024-06-07 15:13:29.131339

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3f84414166ec'
down_revision: Union[str, None] = '194d251bf0f2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('physicalobject_order', sa.Column('from_date', sa.DateTime(), nullable=True))
    op.add_column('physicalobject_order', sa.Column('till_date', sa.DateTime(), nullable=True))
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('physicalobject_order', 'till_date')
    op.drop_column('physicalobject_order', 'from_date')
    # ### end Alembic commands ###
