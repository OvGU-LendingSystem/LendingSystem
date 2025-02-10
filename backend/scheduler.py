import os

from config import scheduler, template_directory, timezone
from datetime import datetime, timedelta
from schema import *
from sendMail import sendMail
from string import Template

def AddJob(order_id):
    order = OrderModel.query.filter(OrderModel.order_id == order_id).first()
    reminder_pickup(order, order_id)
    reminder_return(order, order_id)

def CancelJob(order_id):
    for job in scheduler.get_jobs():
        if job.name == order_id:
            scheduler.remove_job(job.id)

###################
# Reminder pickup #
###################
def reminder_pickup(order, order_id):
    schedule_date = order.from_date - timedelta(days=1)

    # Reminder pickup
    if (datetime.now() < schedule_date):
        organization_name = order.physicalobjects[0].physicalobject.organization.name
        receiver_mail = order.users[0].email

        # read template text
        with open(os.path.join(template_directory, "reminder_pickup_template.html"), encoding="utf-8") as file:
            template_pickup = Template(file.read())

        scheduler.add_job(
                        name=order_id,
                        func=sendMail, 
                        args=(receiver_mail, "Ovgu Ausleihsystem Reminder", 
                                template_pickup.substitute(time=str(schedule_date.time())[:5], organization_name=organization_name)), 
                        trigger='date', 
                        run_date=schedule_date)

###################
# Reminder return #
###################
def reminder_return(order, order_id):
    schedule_date = order.till_date - timedelta(days=1)

    # Reminder pickup
    if (datetime.now() < schedule_date):
        organization_name = order.physicalobjects[0].physicalobject.organization.name
        receiver_mail = order.users[0].email

        # read template text
        with open(os.path.join(template_directory, "reminder_return_template.html"), encoding="utf-8") as file:
            template_return = Template(file.read())

        scheduler.add_job(
                        name=order_id,
                        func=sendMail, 
                        args=(receiver_mail, "Ovgu Ausleihsystem Reminder", 
                                template_return.substitute(time=str(schedule_date.time())[:5], organization_name=organization_name)), 
                        trigger='date', 
                        run_date=schedule_date)
        

##################
# Status change  #
##################
def status_change(order):
    receiver_mail = order.users[0].email

    # read template text
    with open(os.path.join(template_directory, "order_status_change_template.html"), encoding="utf-8") as file:
        template_status = Template(file.read())

    scheduler.add_job(
                    name=order.order_id,
                    func=sendMail, 
                    args=(receiver_mail, "Ovgu Ausleihsystem Statusänderung", template_status.substitute()), 
                    trigger='date', 
                    run_date=datetime.now(timezone) + timedelta(minutes=1))