import configparser
import socket

from flask import Flask
from flask_bcrypt import Bcrypt
from sqlalchemy import *
from flask_cors import CORS
from sqlalchemy.orm import (scoped_session, sessionmaker)
from sqlalchemy.ext.declarative import declarative_base

import configparser
import socket

hostname = socket.gethostname()
print("Hostname: ", hostname)

# Create connection depending on Host
if hostname == "hades":
# Read config from file
    config = configparser.ConfigParser()
    config.read('/var/www/LendingSystem/config.ini') # Path to config file
    db_pw = config.get('DB', 'db_LendingSystem_password')

    # Create Flask app
    app = Flask(__name__)
    app.debug = True
    CORS(app, resources={r"/*": {"origins": "*"}})

    # Connect to database
    engine = create_engine('mysql+mysqlconnector://administrator:' + db_pw + '@localhost/LendingSystem')
    db = scoped_session(sessionmaker(   autocommit=False,
                                        autoflush=False,
                                        bind=engine))

    bcrypt = Bcrypt(app)
else:
    # Read config from file
    config = configparser.ConfigParser()
    config.read('../config.ini') # Path to config file
    db_pw = config.get('DB', 'db_LendingSystem_password')

    # Create Flask app
    app = Flask(__name__)
    app.debug = True
    CORS(app, resources={r"/*": {"origins": "*"}})

    # Connect to database
    engine = create_engine('mysql+pymysql://administrator:' + db_pw + '@hades.fritz.box:3306/LendingSystem', convert_unicode=True)
    db = scoped_session(sessionmaker(   autocommit=False,
                                        autoflush=False,
                                        bind=engine))

    bcrypt = Bcrypt(app)