"""Add agb to db

Revision ID: 0740b884fc26
Revises: ea64c8c07bbb
Create Date: 2024-06-11 18:04:11.132544

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0740b884fc26'
down_revision: Union[str, None] = 'ea64c8c07bbb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('organization', sa.Column('agb', sa.String(length=600), nullable=True))
    op.create_unique_constraint(None, 'organization', ['agb'])
    op.add_column('organization_user', sa.Column('agb_dont_show', sa.Boolean(), nullable=False))
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('organization_user', 'agb_dont_show')
    op.drop_constraint(None, 'organization', type_='unique')
    op.drop_column('organization', 'agb')
    # ### end Alembic commands ###
