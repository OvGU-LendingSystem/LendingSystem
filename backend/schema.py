import graphene
from graphene import relay
from graphene_sqlalchemy import SQLAlchemyObjectType, SQLAlchemyConnectionField

# Import all models here
# Like this ...
# from models import    Contact as ContactModel,
#                       nextStuff as nextStuffModel,
#                       ...

# class Contact(SQLAlchemyObjectType):
#     class Meta:
#         model = ContactModel
#         interfaces = (relay.Node, )

# Api Queries go here
class Query(graphene.ObjectType):
    node = relay.Node.Field()

    # Model Query:
    # all_contacts = SQLAlchemyConnectionField(Contact.connection)

schema = graphene.Schema(query=Query)