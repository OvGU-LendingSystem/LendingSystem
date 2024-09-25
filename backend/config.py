import configparser
from datetime import timedelta

from flask import Flask
from flask_cors import CORS
from flask_session import Session
import os
import socket
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
import redis

hostname = socket.gethostname()
print("Hostname: ", hostname)
redis_url = '127.0.0.1'

config = configparser.ConfigParser()
# Read config file on host
if hostname == "hades":
    config.read("/var/www/LendingSystem/config.ini")
    db_host = "localhost"
elif hostname == "container":
    config.read("./config.ini")
    db_host = "db:3306"
    redis_url = 'redis'
else:
    config.read("../config.ini")
    db_host = "hades.fritz.box:3306"

# Read config from File
db_database = config.get('DB', 'db_LendingSystem_Database')
db_user = config.get('DB', 'db_LendingSystem_User')
db_pw = config.get('DB', 'db_LendingSystem_Password')
root_directory = config.get('PATHS', 'root_directory')
tmp_picture_directory = config.get('PATHS', 'picture_directory')
tmp_pdf_directory = config.get('PATHS', 'pdf_directory')
picture_directory = os.path.join(root_directory, tmp_picture_directory)
pdf_directory = os.path.join(root_directory, tmp_pdf_directory)

testing_on = config.get('TESTING', 'testing')

# Create engine depending on test mode
if not (int)(testing_on):
    engine = create_engine('mysql+pymysql://' + db_user + ':' + db_pw + '@' + db_host + '/' + db_database)
else:
    engine = create_engine('sqlite:///:memory:')

db = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=engine))

# Create Flask app
app = Flask(__name__)
app.debug = True
app.secret_key = config.get('SECRET_KEY', 'secret_key')
app.config['SESSION_TYPE'] = 'redis'
app.config['SESSION_PERMANENT'] = True
app.permanent_session_lifetime = timedelta(hours=2)
app.config['SESSION_REDIS'] = redis.from_url('redis://' + redis_url + ':6379')

if not (int)(testing_on):
    app.config[
        'SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://' + db_user + ':' + db_pw + '@' + db_host + '/' + db_database
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'

CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
server_session = Session(app)
