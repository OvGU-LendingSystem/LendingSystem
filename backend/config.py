from flask import Flask
from flask_bcrypt import Bcrypt
from sqlalchemy import *
from flask_cors import CORS
from sqlalchemy.orm import (scoped_session, sessionmaker)
from sqlalchemy.ext.declarative import declarative_base

import configparser
import socket
import os

hostname = socket.gethostname()
print("Hostname: ", hostname)

# Create connection depending on Host
if hostname == "hades":
    # Read database config from file
    config = configparser.ConfigParser()
    config.read('/var/www/LendingSystem/config.ini') # Path to config file
    db_pw = config.get('DB', 'db_LendingSystem_password')

    # Connect to database
    engine = create_engine('mysql+mysqlconnector://administrator:' + db_pw + '@localhost/LendingSystem')
    db = scoped_session(sessionmaker(   autocommit=False,
                                        autoflush=False,
                                        bind=engine))

else:
    # Read database config from file
    config = configparser.ConfigParser()
    config.read('../config.ini') # Path to config file
    db_pw = config.get('DB', 'db_LendingSystem_password')

    # Connect to database
    engine = create_engine('mysql+pymysql://administrator:' + db_pw + '@hades.fritz.box:3306/LendingSystem', convert_unicode=True)
    db = scoped_session(sessionmaker(   autocommit=False,
                                        autoflush=False,
                                        bind=engine))

    

root_directory          = config.get('PATHS', 'root_directory')
tmp_picture_directory   = config.get('PATHS', 'picture_directory')
picture_directory       = os.path.join(root_directory, tmp_picture_directory)

# Create Flask app
app = Flask(__name__)
app.debug = True
app.secret_key = "b\xe5\x90\xa3C7HC\xd2~\xff\x98\x0cJo_c"
CORS(app, resources={r"/*": {"origins": "*"}})

# Add Bcrypt for hashing passwords
bcrypt = Bcrypt(app)
