from flask import Flask
from sqlalchemy  import *
from sqlalchemy.orm import (scoped_session, sessionmaker, relationship, backref)
from sqlalchemy.ext.declarative import declarative_base

import configparser

# Read config from file
config = configparser.ConfigParser()
config.read('/var/www/LendingSystem/config.ini') # Path to config file
db_pw = config.get('DB', 'db_LendingSystem_password')

# Create Flask app
app = Flask(__name__)
app.debug = True

# Connect to database
engine = create_engine('mysql+mysqlconnector://administrator:' + db_pw + '@localhost/LendingSystem', convert_unicode=True)
db = scoped_session(sessionmaker(   autocommit=False,
                                    autoflush=False,
                                    bind=engine))