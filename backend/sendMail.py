from config import use_ssl, mail_server_address, mail_server_port, sender_email_address, sender_email_password, scheduler
import smtplib, ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta

def sendMail(receiver, subject, body):
    try:
        # create Mail Server
        if (int)(use_ssl):
            context = ssl.create_default_context()
            mail_server = smtplib.SMTP_SSL(mail_server_address, mail_server_port, context=context)
        else:
            mail_server = smtplib.SMTP_SSL(mail_server_address, mail_server_port)

        mail_server.login(sender_email_address, sender_email_password)

        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = sender_email_address
        message["To"] = receiver

        # HTML hier möglich
        body_text = MIMEText(body, "HTML")
        message.attach(body_text)

        mail_server.sendmail(sender_email_address, receiver, message.as_string())
    except Exception as e:
        print("Was not able to send mail: " + str(e))

        # Resend the mail again in 5 Minutes
        # Attention: this schedule will not be cancelled using the CancelJob function from the scheduler file
        scheduler.add_job(
            name="sendMail retry",
            func=sendMail,
            args=(receiver, subject + " RETRY", body),
            trigger='date',
            run_date=datetime.now() + timedelta(minutes=5)
        )