import graphene
from graphene import relay
from graphene_sqlalchemy import SQLAlchemyObjectType, SQLAlchemyConnectionField

from backend.mutations import MyMutations
from config import db

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

class Tag(SQLAlchemyObjectType):
    class Meta:
        model = TagModel
        interfaces = (relay.Node, )

class Organization(SQLAlchemyObjectType):
    class Meta:
        model = OrganizationModel
        interfaces = (relay.Node, )

class Order(SQLAlchemyObjectType):
    class Meta:
        model = OrderModel
        interfaces = (relay.Node, )


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


class User(SQLAlchemyObjectType):
    class Meta:
        model = UserModel
        interfaces = (relay.Node,)


# Api Queries go here
class Query(graphene.ObjectType):
    node = relay.Node.Field()
    # Model Query:
    # all_contacts = SQLAlchemyConnectionField(Contact.connection)

    # Queries for all
    all_physical_objects = SQLAlchemyConnectionField(PhysicalObject.connection)
    all_tags = SQLAlchemyConnectionField(Tag.connection)
    all_organizations = SQLAlchemyConnectionField(Organization.connection)
    all_orders = SQLAlchemyConnectionField(Order.connection)
    # all_borrowers = SQLAlchemyConnectionField( Borrower.connection )
    # all_members = SQLAlchemyConnectionField( Member.connection )
    all_groups = SQLAlchemyConnectionField(Group.connection)
    all_user = SQLAlchemyConnectionField(User.connection)


schema = graphene.Schema(query=Query, mutation=MyMutations)
