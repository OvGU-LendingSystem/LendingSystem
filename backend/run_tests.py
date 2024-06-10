import unittest
import graphene
from graphene.test import Client

from models import *
from schema_queries import Query
from schema_mutations import Mutations
import Tests.filter_tests as filter

from config import engine as test_engine, db as test_db

class Test(unittest.TestCase):
    def setUp(self):
        schema = graphene.Schema(query=Query, mutation=Mutations)
        
        Base.metadata.create_all(bind = test_engine)

        self.client = Client(schema)

    def test_tag_filter(self):
        filter.test_tag_filter(self.client, test_db)

    def tearDown(self):
        # Drop all tables in the database
        Base.metadata.drop_all(test_engine)

if __name__ == '__main__':
    unittest.main()