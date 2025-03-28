"""Add creation time to Order; Add additional user information

Revision ID: ce3bfd3a6216
Revises: 3edfbffd46d0
Create Date: 2024-08-30 10:49:40.728375

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import models


# revision identifiers, used by Alembic.
revision: str = 'ce3bfd3a6216'
down_revision: Union[str, None] = '3edfbffd46d0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('order', sa.Column('creation_time', sa.DateTime(), nullable=True))
    op.add_column('user', sa.Column('address', models.Address(), nullable=False))
    op.add_column('user', sa.Column('phone_number', sa.Integer(), nullable=True))
    op.add_column('user', sa.Column('matricle_number', sa.Integer(), nullable=True))
    op.create_unique_constraint(None, 'user', ['matricle_number'])
    op.create_unique_constraint(None, 'user', ['phone_number'])
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, 'user', type_='unique')
    op.drop_constraint(None, 'user', type_='unique')
    op.drop_column('user', 'matricle_number')
    op.drop_column('user', 'phone_number')
    op.drop_column('user', 'address')
    op.drop_column('order', 'creation_time')
    # ### end Alembic commands ###
