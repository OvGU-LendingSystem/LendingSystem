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
import smtplib, ssl
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.jobstores.sqlalchemy import SQLAlchemyJobStore
from apscheduler.executors.pool import ThreadPoolExecutor
import pytz

hostname = socket.gethostname()
print("Hostname: ", hostname)

config = configparser.ConfigParser()
# Read config file on host
if hostname == "hades":
    config.read("/var/www/LendingSystem/config.ini")
    db_host = "localhost"
elif (hostname == "container"):
    config.read("./backend/backend-config.ini")
    db_host = "database"
else:
    config.read("backend-config.ini")
    db_host = "hades.fritz.box"

if not hostname == "container":
    # Read config from File
    db_database = config.get('DB', 'db_LendingSystem_Database')
    db_port="3306"
    db_user = config.get('DB', 'db_LendingSystem_User')
    db_pw = config.get('DB', 'db_LendingSystem_Password')
    root_directory = config.get('PATHS', 'root_directory')
    tmp_picture_directory = config.get('PATHS', 'picture_directory')
    tmp_pdf_directory = config.get('PATHS', 'pdf_directory')
    picture_directory = os.path.join(root_directory, tmp_picture_directory)
    pdf_directory = os.path.join(root_directory, tmp_pdf_directory)

    mail_server_address = config.get('MAIL', 'mail_server_address')
    mail_server_port = config.get('MAIL', 'mail_server_port')
    use_ssl = config.get('MAIL', 'use_ssl')
    sender_email_address = config.get('MAIL', 'sender_email_address')
    sender_email_password = config.get('MAIL', 'sender_email_password')

    secret_key = config.get('SECRET_KEY', 'secret_key')
    testing_on = config.get('TESTING', 'testing')
else:
    # Read docker env variables
    db_database = os.getenv('db_LendingSystem_Database')
    db_port = os.getenv('db_LendingSystem_Port')
    db_user = os.getenv('db_LendingSystem_User')
    with open(os.getenv('db_LendingSystem_Password'), 'r') as f:
        db_pw = f.read().strip()
    root_directory = os.getenv('root_directory')
    tmp_picture_directory = os.getenv('picture_directory')
    tmp_pdf_directory = os.getenv('pdf_directory')
    picture_directory = os.path.join(root_directory, tmp_picture_directory)
    pdf_directory = os.path.join(root_directory, tmp_pdf_directory)

    mail_server_address = os.getenv('mail_server_address')
    mail_server_port = os.getenv('mail_server_port')
    use_ssl = os.getenv('use_ssl')
    sender_email_address = os.getenv('sender_email_address')
    sender_email_password = os.getenv('sender_email_password')

    secret_key = os.getenv("secret_key")
    testing_on = 0

# Create engine depending on test mode
if not (int)(testing_on):
    print("Connection String: " + 'mysql://' + db_user + ':' + db_pw + '@' + db_host + ":" + db_port + '/' + db_database)
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
app.config['SESSION_REDIS'] = redis.from_url('redis://redis:6379')

if not (int)(testing_on):
    app.config[
        'SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://' + db_user + ':' + db_pw + '@' + db_host + '/' + db_database
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'

CORS(app, resources={r"/*": {"origins": "*"}})
server_session = Session(app)

# create Mail Server
if (int)(use_ssl):
    context = ssl.create_default_context()
    mail_server = smtplib.SMTP_SSL(mail_server_address, mail_server_port, context=context)
else:
    mail_server = smtplib.SMTP_SSL(mail_server_address, mail_server_port)

mail_server.login(sender_email_address, sender_email_password)

# Create scheduler for automated mail sending
jobstores = {
    'default': SQLAlchemyJobStore(engine=engine)
}
scheduler = BackgroundScheduler(jobstores=jobstores, timezone=pytz.timezone('Europe/Berlin'))
scheduler.start()