import datetime
from flask import session
import graphene
import traceback

from authorization_check import is_authorised, reject_message
from config import db
from models import userRights, orderStatus
from scheduler import AddJob, CancelJob
from schema import Order, OrderModel, PhysicalObjectModel, PhysicalObject_Order, PhysicalObject_OrderModel, UserModel

##################################
# Mutations for orders           #
##################################
class create_order(graphene.Mutation):
    """
    Creates a new order with the given parameters.
    For Connections to users and physical objects use array of their String uuid
    """

    class Arguments:
        # order arguments
        from_date       = graphene.DateTime()
        till_date       = graphene.DateTime()
        deposit         = graphene.Int()

        # order connections
        physicalobjects = graphene.List(graphene.String)
        users           = graphene.List(graphene.String)

    order       = graphene.Field(lambda: Order)
    ok          = graphene.Boolean()
    info_text   = graphene.String()
    status_code = graphene.Int()

    @staticmethod
    def mutate(self, info, from_date=None, till_date=None, users=None, physicalobjects=None, deposit=None):
        # Check if user is authorised
        try:
            session_user_id = session['user_id']
        except:
            return create_order(ok=False, info_text="Keine valide session vorhanden", status_code=419)
        
        if not is_authorised(userRights.customer, session_user_id):
            return create_order(ok=False, info_text=reject_message, status_code=403)
        
        try:
            order = OrderModel()

            if from_date:
                order.from_date = from_date
            if till_date:
                order.till_date = till_date

            if users:
                db_users = db.query(UserModel).filter(UserModel.user_id.in_(users)).all()
                order.users = db_users
            else:
                executive_user = db.query(UserModel).filter(UserModel.user_id == session_user_id).all()
                order.users = executive_user
            if physicalobjects:
                db_physicalobjects = db.query(PhysicalObjectModel).filter(
                    PhysicalObjectModel.phys_id.in_(physicalobjects)).all()
                for physObj in db_physicalobjects:
                    order.addPhysicalObject(physObj)

            if deposit:
                order.deposit = deposit
            else:
                # if no deposit is given the deposit is the sum of the deposits of the physical objects
                if physicalobjects:
                    order.deposit = sum([phys.deposit for phys in db_physicalobjects])
                else:
                    order.deposit = 0

            order.creation_date = datetime.datetime.now()

            db.add(order)

            db.commit()

            # Add jobs for email reminders for this order
            AddJob(order.order_id)
            return create_order(ok=True, info_text="Order erfolgreich erstellt.", order=order, status_code=200)

        except Exception as e:
            print(e)
            tb = traceback.format_exc()
            return create_order(ok=False, info_text="Order konnte nicht erstellt werden. " + str(e) + "\n" + str(tb), status_code=500)


class update_order(graphene.Mutation):
    """
    Updates content of the order with the given order_id.
    """

    class Arguments:
        # order arguments
        order_id    = graphene.String(required=True)
        from_date   = graphene.Date()
        till_date   = graphene.Date()
        deposit     = graphene.Int()

        # order connections
        users = graphene.List(graphene.String)

    order       = graphene.Field(lambda: Order)
    ok          = graphene.Boolean()
    info_text   = graphene.String()
    status_code = graphene.Int()

    @staticmethod
    def mutate(self, info, order_id, from_date=None, till_date=None, return_date=None, status=None, users=None, deposit=None):
        # Check if user is authorised
        try:
            session_user_id = session['user_id']
        except:
            return update_order(ok=False, info_text="Keine valide session vorhanden", status_code=419)
        
        if not is_authorised(userRights.customer, session_user_id):
                return update_order(ok=False, info_text=reject_message, status_code=403)
        
        # Remove all email reminders for this order
        CancelJob(order_id)

        try:            
            order = OrderModel.query.filter(OrderModel.order_id == order_id).first()
            # Abort if object does not exist
            if not order:
                return update_order(ok=False, info_text="Order nicht gefunden.", status_code=404)

            if from_date:
                order.from_date = from_date
            if till_date:
                order.till_date = till_date
            if users:
                db_users = db.query(UserModel).filter(UserModel.user_id.in_(users)).all()
                order.users = db_users

            if deposit:
                order.deposit = deposit

            db.commit()

            # add new email reminders for modified job
            AddJob(order_id)

            return update_order(ok=True, info_text="OrderStatus aktualisiert.", order=order, status_code=200)

        except Exception as e:
            AddJob(order_id)
            print(e)
            tb = traceback.format_exc()
            return update_order(ok=False, info_text="Fehler beim Aktualisieren der Orders. " + str(e) + " traceback: " + str(tb), status_code=500)


class update_order_status(graphene.Mutation):
    """
    Updates the status for the given physical objects in the order.
    """

    class Arguments:
        order_id = graphene.String(required=True)
        physicalObjects = graphene.List(graphene.String, required=True)

        return_date = graphene.Date()
        status = graphene.String()

    phys_order  = graphene.List(lambda: PhysicalObject_Order)
    ok          = graphene.Boolean()
    info_text   = graphene.String()
    status_code = graphene.Int()

    @staticmethod
    def mutate(self, info, order_id, physicalObjects, return_date=None, status=None):
        # Check if user is authorised
        try:
            session_user_id = session['user_id']
        except:
            return update_order_status(ok=False, info_text="Keine valide session vorhanden", status_code=419)
        
        if not is_authorised(userRights.member, session_user_id):
            return update_order_status(ok=False, info_text=reject_message, status_code=403)



        try:
            phys_order = PhysicalObject_OrderModel.query.filter(PhysicalObject_OrderModel.order_id == order_id, PhysicalObject_OrderModel.phys_id == physicalObjects).all()
            # Abort if object does not exist
            if len(phys_order) == 0:
                return update_order_status(ok=False, info_text="Order nicht gefunden.", status_code=404)

            for order in phys_order:
                print(order)
                if return_date:
                    order.return_date = return_date
                if status:
                    order.order_status = orderStatus[status]

            db.commit()
            return update_order_status(ok=True, info_text="OrderStatus aktualisiert.", phys_order=phys_order, status_code=200)

        except Exception as e:
            print(e)
            tb = traceback.format_exc()
            return update_order_status(ok=False, info_text="Fehler beim Aktualisieren der Order. " + str(e) + " traceback: " + str(tb), status_code=500)


class add_physical_object_to_order(graphene.Mutation):
    """
    Adds the given list of physical objects to the order with the given order_id.
    Use List of string uuids for physical objects.
    """

    class Arguments:
        order_id        = graphene.String(required=True)
        physicalObjects = graphene.List(graphene.String, required=True)

    phys_order  = graphene.List(lambda: PhysicalObject_Order)
    ok          = graphene.Boolean()
    info_text   = graphene.String()
    status_code = graphene.Int()

    @staticmethod
    def mutate(self, info, order_id, physicalObjects):
        # Check if user is authorised
        try:
            session_user_id = session['user_id']
        except:
            return add_physical_object_to_order(ok=False, info_text="Keine valide session vorhanden", status_code=419)
    
        if not is_authorised(userRights.customer, session_user_id):
            return add_physical_object_to_order(ok=False, info_text=reject_message, status_code=403)
        
        
        
        try:
            order = OrderModel.query.filter(OrderModel.order_id == order_id).first()
            if not order:
                return add_physical_object_to_order(ok=False, info_text="Order nicht gefunden.", status_code=404)

            db_physicalobjects = db.query(PhysicalObjectModel).filter(
                PhysicalObjectModel.phys_id.in_(physicalObjects)).all()
            for physObj in db_physicalobjects:
                order.addPhysicalObject(physObj)

            db.commit()
            return add_physical_object_to_order(ok=True, info_text="Physical Objects added to Order.", phys_order=order.physicalobjects, status_code=200)

        except Exception as e:
            print(e)
            tb = traceback.format_exc()
            return add_physical_object_to_order(ok=False, info_text="Error adding Physical Objects to Order. " + str(e) + "traceback: " + str(tb), status_code=500)


class remove_physical_object_from_order(graphene.Mutation):
    """
    Removes the given list of physical objects from the order with the given order_id.
    Use List of string uuids for physical objects.
    """

    class Arguments:
        order_id        = graphene.String(required=True)
        physicalObjects = graphene.List(graphene.String, required=True)

    phys_order  = graphene.List(lambda: PhysicalObject_Order)
    ok          = graphene.Boolean()
    info_text   = graphene.String()
    status_code = graphene.Int()

    @staticmethod
    def mutate(self, info, order_id, physicalObjects):
        # Check if user is authorised
        try:
            session_user_id = session['user_id']
        except:
            return remove_physical_object_from_order(ok=False, info_text="Keine valide session vorhanden", status_code=419)
        
        if not is_authorised(userRights.customer, session_user_id):
            return remove_physical_object_from_order(ok=False, info_text=reject_message, status_code=403)



        try:
            order = OrderModel.query.filter(OrderModel.order_id == order_id).first()
            if not order:
                return remove_physical_object_from_order(ok=False, info_text="Order nicht gefunden.", status_code=404)

            db_physicalobjects = db.query(PhysicalObjectModel).filter(
                PhysicalObjectModel.phys_id.in_(physicalObjects)).all()
            for physObj in db_physicalobjects:
                order.removePhysicalObject(physObj)

            db.commit()
            return remove_physical_object_from_order(ok=True, info_text="Physical Objects removed from Order.",
                                                     phys_order=order.physicalobjects, status_code=200)

        except Exception as e:
            print(e)
            tb = traceback.format_exc()
            return remove_physical_object_from_order(ok=False, info_text="Error removing Physical Objects from Order. " + str(e) + "traceback: " + str(tb), status_code=500)


class delete_order(graphene.Mutation):
    """
    Deletes the order with the given order_id.
    """

    class Arguments:
        order_id = graphene.String(required=True)

    ok          = graphene.Boolean()
    info_text   = graphene.String()
    status_code = graphene.Int()

    @staticmethod
    def mutate(self, info, order_id):
        # Check if user is authorised
        try:
            session_user_id = session['user_id']
        except:
            return delete_order(ok=False, info_text="Keine valide session vorhanden", status_code=419)
        
        if not is_authorised(userRights.customer, session_user_id):
            return delete_order(ok=False, info_text=reject_message, status_code=403)



        order = OrderModel.query.filter(OrderModel.order_id == order_id).first()
        if order:
            try:
                # remove email reminders for deleted order
                CancelJob(order_id)

                order.removeAllPhysicalObjects()
                db.delete(order)
                db.commit()
                return delete_order(ok=True, info_text="Order erfolgreich entfernt.", status_code=200)
            except Exception as e:
                AddJob(order_id)
                print(e)
                tb = traceback.format_exc()
                return delete_order(ok=False, info_text="Fehler beim Entfernen der Order. " + str(e) + "\n" + str(tb), status_code=500)
        else:
            return delete_order(ok=False, info_text="Order konnte nicht entfernt werden. Order ID not found.", status_code=404)
