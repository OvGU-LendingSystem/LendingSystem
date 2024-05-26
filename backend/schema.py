from graphene import relay
from graphene_sqlalchemy import SQLAlchemyObjectType

# Import all models here
# Like this ...
# from models import    Contact as ContactModel,
#                       nextStuff as nextStuffModel,
#                       ...

from models import (PhysicalObject as PhysicalObjectModel,
                    Tag as TagModel,
                    Organization as OrganizationModel,
                    Order as OrderModel,
                    Group as GroupModel,
                    User as UserModel,
                    Organization_User as Organization_UserModel,
                    Picture as PictureModel,
                    )

# class Contact(SQLAlchemyObjectType):
#     class Meta:
#         model = ContactModel
#         interfaces = (relay.Node, )

class PhysicalObject(SQLAlchemyObjectType):
    class Meta:
        model = PhysicalObjectModel
        interfaces = (relay.Node, )
        description = PhysicalObjectModel.__doc__

class Tag(SQLAlchemyObjectType):
    class Meta:
        model = TagModel
        interfaces = (relay.Node, )
        description = TagModel.__doc__

class Organization(SQLAlchemyObjectType):
    class Meta:
        model = OrganizationModel
        interfaces = (relay.Node, )
        description = OrganizationModel.__doc__

class Order(SQLAlchemyObjectType):
    class Meta:
        model = OrderModel
        interfaces = (relay.Node, )
        description = OrderModel.__doc__

class User(SQLAlchemyObjectType):
    class Meta:
        model = UserModel
        exclude_fields = ('password_hash', )
        interfaces = (relay.Node, )
        description = UserModel.__doc__

class Group(SQLAlchemyObjectType):
    class Meta:
        model = GroupModel
        interfaces = (relay.Node,)
        description = GroupModel.__doc__

class Organization_User(SQLAlchemyObjectType):
    class Meta:
        model = Organization_UserModel
        interfaces = (relay.Node,)
        description = Organization_UserModel.__doc__

class Picture(SQLAlchemyObjectType):
    class Meta:
        model = PictureModel
        interfaces = (relay.Node,)
        description = PictureModel.__doc__