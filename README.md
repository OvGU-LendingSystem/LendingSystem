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

### For local developing
- With connected VPN you can connect your current session to the server DB:
  - you need to place a config.ini file in the root directory of the project
    ```ini
    [DB]
    db_LendingSystem_password = <db password for administrator>
    ```
  - Create all Tables from models:
    ```python
    from config import engine, db
    from models import *

    Base.metadata.create_all(bind=engine)
   ``` 