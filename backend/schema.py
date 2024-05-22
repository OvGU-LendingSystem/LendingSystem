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
    # Borrower as BorrowerModel,
    # Member as MemberModel,
                    Group as GroupModel,
                    User as UserModel)

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

# class Person(SQLAlchemyObjectType):
#     class Meta:
#         model = PersonModel
#         interfaces = (relay.Node, )
#         description = "Person is the base class for Borrower and Member"


# class Borrower(SQLAlchemyObjectType):
#     class Meta:
#         model = BorrowerModel
#         interfaces = (relay.Node, )

# class Member(SQLAlchemyObjectType):
#     class Meta:
#         model = MemberModel
#         interfaces = (relay.Node, )

class Group(SQLAlchemyObjectType):
    class Meta:
        model = GroupModel
        interfaces = (relay.Node,)
        description = GroupModel.__doc__

class User(SQLAlchemyObjectType):
    class Meta:
        model = UserModel
        interfaces = (relay.Node,)      

