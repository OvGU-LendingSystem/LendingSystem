from flask import Flask
from sqlalchemy import *
from flask_cors import CORS
from flask_session import Session
from sqlalchemy.orm import (scoped_session, sessionmaker)

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
    db_database = config.get('DB', 'db_LendingSystem_Database')
    db_user     = config.get('DB', 'db_LendingSystem_User')
    db_pw       = config.get('DB', 'db_LendingSystem_Password')

    # Connect to database
    engine = create_engine('mysql+mysqlconnector://' + db_user + ':' + db_pw + '@localhost/' + db_database)
    db = scoped_session(sessionmaker(   autocommit=False,
                                        autoflush=False,
                                        bind=engine))

else:
    # Read database config from file
    config = configparser.ConfigParser()
    config.read('../config.ini') # Path to config file
    db_database = config.get('DB', 'db_LendingSystem_Database')
    db_user     = config.get('DB', 'db_LendingSystem_User')
    db_pw       = config.get('DB', 'db_LendingSystem_Password')

    if ((int)(config.get('TESTING', 'testing'))):
        engine = create_engine('sqlite:///:memory:')
        db = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=engine))
        print("Using Database for Testing") #TODO REMOVE
    else:
        # Connect to database
        engine = create_engine('mysql+pymysql://' + db_user + ':' + db_pw + '@hades.fritz.box:3306/' + db_database)
        db = scoped_session(sessionmaker(   autocommit=False,
                                            autoflush=False,
                                            bind=engine))
        print("Using Production Database")  #TODO REMOVE
    

root_directory          = config.get('PATHS', 'root_directory')
tmp_picture_directory   = config.get('PATHS', 'picture_directory')
tmp_pdf_directory       = config.get('PATHS', 'pdf_directory')
picture_directory       = os.path.join(root_directory, tmp_picture_directory)
pdf_directory           = os.path.join(root_directory, tmp_pdf_directory)

# Create Flask app
app = Flask(__name__)
app.debug = True
app.secret_key = config.get('SECRET_KEY', 'secret_key')
app.config['SESSION_TYPE'] = 'sqlalchemy'
app.config['SESSION_SQLALCHEMY'] = db
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://' + db_user + ':' + db_pw + '@hades.fritz.box:3306/' + db_database
CORS(app, resources={r"/*": {"origins": "*"}})
server_session = Session(app)