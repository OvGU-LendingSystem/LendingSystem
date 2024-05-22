import graphene
from flask_graphql import GraphQLView
from config import app, db
from schema_queries import Query

schema = graphene.Schema(query=Query)

app.add_url_rule(
    '/graphql',
    view_func=GraphQLView.as_view(
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