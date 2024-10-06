from config import mail_server, sender_email_address
import smtplib, ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def sendMail(receiver, subject, body):
    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = sender_email_address
    message["To"] = receiver

    # HTML hier möglich
    body_text = MIMEText(body, "HTML")
    message.attach(body_text)

    mail_server.sendmail(sender_email_address, receiver, message.as_string())