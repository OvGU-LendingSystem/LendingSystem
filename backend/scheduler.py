from config import scheduler
from sendMail import sendMail
from schema import *
from datetime import datetime, timedelta
from string import Template

def AddJob(order_id):
    order = OrderModel.query.filter(OrderModel.order_id == order_id).first()
    reminder_pickup(order, order_id)
    reminder_return(order, order_id)

def CancelJob(order_id):
    for job in scheduler.get_jobs():
        if job.name == order_id:
            scheduler.remove_job(job)

###################
# Reminder pickup #
###################
def reminder_pickup(order, order_id):
    schedule_date = order.from_date - timedelta(days=1)

    # Reminder pickup
    if (datetime.now() < schedule_date):
        organization_name = order.physicalobjects[0].physicalobject.organization.name
        receiver_mail = order.users[0].email
        scheduler.add_job(
                        name=order_id,
                        func=sendMail, 
                        args=(receiver_mail, "Ovgu Ausleihsystem Reminder", 
                                template_pickup.substitute(time=str(schedule_date.time())[:5], organization_name=organization_name)), 
                        trigger='date', 
                        run_date=schedule_date)

template_pickup=Template("""
<html lang="en"><head>
<H1>Your loan is ready</H1>
<p>Please come tomorrow at $time to pick up your borrowed items from $organization_name.</p>
</html>
<html lang="de"><head>
<H1>Ihre Ausleihe ist bereit</H1>
<p>Kommen Sie bitte morgen um $time um Ihre ausgeliehenen Gegenstände beim $organization_name abzuholen.</p>
</html>
""")

###################
# Reminder return #
###################
def reminder_return(order, order_id):
    schedule_date = order.till_date - timedelta(days=1)

    # Reminder pickup
    if (datetime.now() < schedule_date):
        organization_name = order.physicalobjects[0].physicalobject.organization.name
        receiver_mail = order.users[0].email
        scheduler.add_job(
                        name=order_id,
                        func=sendMail, 
                        args=(receiver_mail, "Ovgu Ausleihsystem Reminder", 
                                template_return.substitute(time=str(schedule_date.time())[:5], organization_name=organization_name)), 
                        trigger='date', 
                        run_date=schedule_date)
        
template_return = Template("""
    <html lang="de"><head>
    <H1>Gib unser Zeug zurück!</H1>
    <p>Kommen Sie bitte morgen um $time um Ihre ausgeliehenen Gegenstände an $organization_name zurückzugeben.</p>
    </html>
""")