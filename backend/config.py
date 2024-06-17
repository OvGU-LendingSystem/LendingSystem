from flask import Flask
from sqlalchemy import *
from flask_cors import CORS
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

    # Connect to database
    engine = create_engine('mysql+pymysql://' + db_user + ':' + db_pw + '@hades.fritz.box:3306/' + db_database, convert_unicode=True)
    db = scoped_session(sessionmaker(   autocommit=False,
                                        autoflush=False,
                                        bind=engine))

    

root_directory          = config.get('PATHS', 'root_directory')
tmp_picture_directory   = config.get('PATHS', 'picture_directory')
tmp_pdf_directory       = config.get('PATHS', 'pdf_directory')
picture_directory       = os.path.join(root_directory, tmp_picture_directory)
pdf_directory           = os.path.join(root_directory, tmp_pdf_directory)

# Create Flask app
app = Flask(__name__)
app.debug = True
app.secret_key = config.get('SECRET_KEY', 'secret_key')
CORS(app, resources={r"/*": {"origins": "*"}})