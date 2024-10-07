from config import scheduler
from sendMail import sendMail
from schema import *
from datetime import datetime, timedelta
from string import Template

def AddJob(order_id):
    order = OrderModel.query.filter(OrderModel.order_id == order_id).first()
    schedule_date = order.from_date - timedelta(days=1)
    schedule_date = datetime.strptime('Fri Sep 13 14:49:00 +0001 2024', '%a %b %d %H:%M:%S +0001 %Y')

    # Reminder pickup
    if (datetime.now() < schedule_date):
        organization_name = order.physicalobjects[0].physicalobject.organizations[0].name
        receiver_mail = order.users[0].email
        scheduler.add_job(func=sendMail, 
                          args=(receiver_mail, "Ovgu Ausleihsystem Reminder", 
                                send_text.substitute(time=str(schedule_date.time())[:5], organization_name=organization_name)), 
                          trigger='date', 
                          run_date=schedule_date)

    #Reminder return

def CancelJob():
    pass


send_text=Template("""
<html lang="en"><head>
<H1>Your loan is ready</H1>
<p>Please come tomorrow at $time to pick up your borrowed items from $organization_name.</p>
</html>
<html lang="de"><head>
<H1>Ihre Ausleihe ist bereit</H1>
<p>Kommen Sie bitte morgen um $time um Ihre ausgeliehenen Gegenstände beim $organization_name abzuholen.</p>
</html>
""")

# sendMail("rainer.zufall@prhn.dynpc.net", "HTML Test", send_text.substitute(time="17 Uhr", organization_name="StuRa"))
# t1 = datetime.now()
# print(str(t1.time())[:5])
AddJob("00000000-0000-0000-0000-000000000022")
# schedule_date = datetime.strptime('Sat Sep 14 14:38:00 +0000 2024', '%a %b %d %H:%M:%S +0000 %Y')
# schedule_date = schedule_date - timedelta(days=1)
# print(schedule_date)
# print(datetime.now())
# print((datetime.now() < schedule_date))