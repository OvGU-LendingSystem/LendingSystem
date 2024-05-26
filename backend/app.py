import graphene
from flask_graphql import GraphQLView
from graphene_file_upload.flask import FileUploadGraphQLView as UploadView
from config import app, db
from schema_queries import Query
from schema_mutations import Mutations

schema = graphene.Schema(query=Query, mutation=Mutations)

app.add_url_rule(
    '/graphql',
    view_func=UploadView.as_view(
        'graphql',
        schema=schema,
        graphiql=True
    )
)

@app.teardown_appcontext
def shutdown_session(exception=None):
    db.remove()

# for local testing
if __name__ == '__main__':
    app.run()
