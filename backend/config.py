from dotenv import load_dotenv
from datetime import timedelta

from flask import Flask
from flask_cors import CORS
from flask_session import Session
import os
import socket
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
import redis
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.jobstores.sqlalchemy import SQLAlchemyJobStore
from apscheduler.executors.pool import ThreadPoolExecutor
import pytz

hostname = socket.gethostname()
print("Hostname: ", hostname)

# Read config file on host
if not (hostname == "container"):
    load_dotenv("../backend.env")

# Read env variables
# Database
db_host     = os.getenv("database_host")
db_database = os.getenv('database_name')
db_port     = os.getenv('database_port')
db_user     = os.getenv('database_user')

# Read database password from file or env variable
db_pw = os.getenv('database_password')
if db_pw is None or db_pw == "":
    with open(os.getenv('database_password_location'), 'r') as f:
        db_pw = f.read().strip()

# Paths
root_directory          = os.getenv('root_directory')
tmp_picture_directory   = os.getenv('picture_directory')
tmp_pdf_directory       = os.getenv('pdf_directory')
tmp_template_directory  = os.getenv('template_directory')
picture_directory       = os.path.join(root_directory, tmp_picture_directory)
pdf_directory           = os.path.join(root_directory, tmp_pdf_directory)
template_directory      = os.path.join(root_directory, tmp_template_directory)

# Mail
mail_server_address     = os.getenv('mail_server_address')
mail_server_port        = os.getenv('mail_server_port')
use_ssl                 = os.getenv('use_ssl')
sender_email_address    = os.getenv('sender_email_address')
sender_email_password   = os.getenv('sender_email_password')

# Secret key
secret_key = os.getenv("secret_key")

# Testing
testing_on = 0

# Root user
application_root_user_name      = os.getenv('root_user_name')
application_root_user_password  = os.getenv('root_user_password')

# Create engine depending on test mode
if not (int)(testing_on):
    print("mysql://" + db_user + ":" + db_pw + "@" + db_host + ":" + db_port + "/" + db_database)
    engine = create_engine('mysql://' + db_user + ':' + db_pw + '@' + db_host + ":" + db_port + '/' + db_database)
else:
    engine = create_engine('sqlite:///:memory:')

db = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=engine))

# Create Flask app
app = Flask(__name__)
app.debug = True
app.secret_key = secret_key
app.config['SESSION_TYPE'] = 'redis'
app.config['SESSION_PERMANENT'] = True
app.permanent_session_lifetime = timedelta(hours=2)
if (hostname == "container"):
    app.config['SESSION_REDIS'] = redis.from_url('redis://redis:6379')
else:
    app.config['SESSION_REDIS'] = redis.from_url('redis://hades.fritz.box:6379')

if not (int)(testing_on):
    app.config[
        'SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://' + db_user + ':' + db_pw + '@' + db_host + '/' + db_database
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'

CORS(app, resources={r"/*": {"origins": "*"}})
server_session = Session(app)

# Create scheduler for automated mail sending
jobstores = {
    'default': SQLAlchemyJobStore(engine=engine)
}
scheduler = BackgroundScheduler(jobstores=jobstores, timezone=pytz.timezone('Europe/Berlin'))
scheduler.start()