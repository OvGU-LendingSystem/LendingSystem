from sqlalchemy import inspect
import graphene
from flask_graphql import GraphQLView
from flask import Flask, jsonify
from graphene_file_upload.flask import FileUploadGraphQLView as UploadView

from config import app, db, engine
from schema_queries import Query
from schema_mutations import Mutations
from models import Base

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

def check_for_return_dates():
    pass

@app.route("/")
def hello():
    return "<h1>Hello World</h1>"

@app.route('/health')
def health():
    return jsonify(status="healthy"), 200

# for local testing
if __name__ == '__main__':
    inspector = inspect(engine)

    if not inspector.has_table('users'):
        Base.metadata.create_all(engine)

    app.run(host="0.0.0.0", port=5000, debug=True)
