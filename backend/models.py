from config import db
from sqlalchemy import *
from sqlalchemy.ext.declarative import declarative_base

# standard, something for querying
Base = declarative_base()
Base.query = db.query_property()

# Classes go here ...
# Like this ...
# class Contact(Base):
#     __tablename__   = "contacts"
#     id              = Column(Integer, primary_key=True)
#     first_name      = Column(String(80), unique = False, nullable = False)
#     last_name       = Column(String(80), unique = False, nullable = False)
#     email           = Column(String(120), unique = True, nullable = False)