# LendingSystem

## For Backend
### Create a virtualenv to isolate our package dependencies locally (optional)
virtualenv env
source env/bin/activate  # On Windows use `env\Scripts\activate`

### SQLAlchemy and Graphene with SQLAlchemy support
- pip install SQLAlchemy
- pip install graphene_sqlalchemy

### Install Flask and GraphQL Flask for exposing the schema through HTTP
- pip install Flask
- pip install Flask-GraphQL