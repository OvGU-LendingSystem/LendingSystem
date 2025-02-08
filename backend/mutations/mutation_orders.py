import datetime
from flask import session
import graphene
import traceback

from authorization_check import is_authorised, reject_message
from config import db
from models import userRights, orderStatus
from scheduler import AddJob, CancelJob, status_change
from schema import Order, OrderModel, OrganizationModel, Organization_UserModel, PhysicalObjectModel, PhysicalObject_Order, PhysicalObject_OrderModel, UserModel

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
        from_date       = graphene.DateTime(required=True)
        till_date       = graphene.DateTime(required=True)
        deposit         = graphene.Int()

        # order connections
        physicalobjects = graphene.List(graphene.String, required=True)

    order       = graphene.Field(lambda: Order)
    ok          = graphene.Boolean()
    info_text   = graphene.String()
    status_code = graphene.Int()

    @staticmethod
    def mutate(self, info, from_date, till_date, physicalobjects, deposit=None):
        # Check if user is authorised
        try:
            session_user_id = session['user_id']
        except:
            return create_order(ok=False, info_text="Keine valide session vorhanden", status_code=419)
        
        try:
            physicalobjects = db.query(PhysicalObjectModel).filter(PhysicalObjectModel.phys_id.in_(physicalobjects)).all()
            if not physicalobjects:
                return create_order(ok=False, info_text="Physical Objects not found.", status_code=404)
            
            # Check if all physical objects are from the same organization
            organization_id = physicalobjects[0].organization_id
            organization = db.query(OrganizationModel).filter(OrganizationModel.organization_id == organization_id).first()
            if len(set([phys_obj.organization_id for phys_obj in physicalobjects])) > 1:
                return create_order(ok=False, info_text="Alle Objekte müssen der selben Organisation angehören.", status_code=400)
            
            # Check if User is part of the organization
            executive_user = db.query(UserModel).filter(UserModel.user_id == session_user_id).first()
            is_in_organization = False
            for organization_user in executive_user.organizations:
                if organization_user.organization_id == organization_id:
                    is_in_organization = True
                    break
            

            # add User to organization if not present
            if not is_in_organization:
                organization.add_user(executive_user)
                db.commit()

            # Create order
            order = OrderModel(
                creation_date=datetime.datetime.now(),
                from_date=from_date,
                till_date=till_date,
                users=[executive_user],
                organization=organization
            )

            for physicalobject in physicalobjects:
                order.addPhysicalObject(physicalobject)

            if deposit:
                order.deposit = deposit
            else:
                # if no deposit is given the deposit is the sum of the deposits of the physical objects, clamped by the max deposit for the user
                if physicalobjects:
                    phys_deposit = sum([phys.deposit for phys in physicalobjects])
                    max_deposit = organization.get_max_deposit(organization.get_user_right(session_user_id))

                    order.deposit = min(phys_deposit, max_deposit)
                else:
                    order.deposit = 0

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
        
        if not is_authorised(userRights.customer, session_user_id, order_id=order_id):
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
            status_change(order)

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
        
        if not is_authorised(userRights.member, session_user_id, order_id=order_id):
            return update_order_status(ok=False, info_text=reject_message, status_code=403)



        try:
            phys_order = PhysicalObject_OrderModel.query.filter(PhysicalObject_OrderModel.order_id == order_id, PhysicalObject_OrderModel.phys_id.in_(physicalObjects)).all()
            # Abort if object does not exist
            if len(phys_order) == 0:
                return update_order_status(ok=False, info_text="Order nicht gefunden.", status_code=404)

            for order in phys_order:
                print(order)
                if return_date:
                    order.return_date = return_date
                if status:
                    order.order_status = orderStatus[status]
                else:
                    return update_order_status(ok=False, info_text="Invalid status provided.", status_code=400)

            db.commit()
            status_change(phys_order[0].order)
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
    
        if not is_authorised(userRights.customer, session_user_id, order_id=order_id):
            return add_physical_object_to_order(ok=False, info_text=reject_message, status_code=403)
        
        
        
        try:
            order = OrderModel.query.filter(OrderModel.order_id == order_id).first()
            if not order:
                return add_physical_object_to_order(ok=False, info_text="Order nicht gefunden.", status_code=404)
            
            db_physicalobjects = db.query(PhysicalObjectModel).filter(PhysicalObjectModel.phys_id.in_(physicalObjects)).all()

            # check if all physical objects are in the same organization
            organization = order.organization
            for phys_obj in db_physicalobjects:
                if phys_obj.organization_id != organization.organization_id:
                    return add_physical_object_to_order(ok=False, info_text="Physical Objects not in the same organization as the order.", status_code=400)


            for physObj in db_physicalobjects:
                order.addPhysicalObject(physObj)

            organization_id = db_physicalobjects[0].organization_id
            organization = OrganizationModel.query.filter(OrganizationModel.organization_id == organization_id).first()
            
            # update the deposit of the order
            phys_deposit = sum([phys_order.physicalobject.deposit for phys_order in order.physicalobjects])
            max_deposit = organization.get_max_deposit(organization.get_user_right(session_user_id))

            order.deposit = min(phys_deposit, max_deposit)

            db.commit()
            status_change(order)
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
        
        if not is_authorised(userRights.customer, session_user_id, order_id=order_id):
            return remove_physical_object_from_order(ok=False, info_text=reject_message, status_code=403)



        try:
            order = OrderModel.query.filter(OrderModel.order_id == order_id).first()
            if not order:
                return remove_physical_object_from_order(ok=False, info_text="Order nicht gefunden.", status_code=404)

            db_physicalobjects = db.query(PhysicalObjectModel).filter(
                PhysicalObjectModel.phys_id.in_(physicalObjects)).all()
            for physObj in db_physicalobjects:
                order.removePhysicalObject(physObj)

            executive_user = UserModel.query.filter(UserModel.user_id == session_user_id).first()
            organization_id = db_physicalobjects[0].organization_id
            organization = OrganizationModel.query.filter(OrganizationModel.organization_id == organization_id).first()
            
            # update the deposit of the order
            phys_deposit = sum([phys_order.physicalobject.deposit for phys_order in order.physicalobjects])
            max_deposit = organization.get_max_deposit(organization.get_user_right(session_user_id))

            order.deposit = min(phys_deposit, max_deposit)

            db.commit()
            status_change(order)
            return remove_physical_object_from_order(ok=True, info_text="Physical Objects removed from Order.",
                                                     phys_order=order.physicalobjects, status_code=200)

        except Exception as e:
            print(e)
            tb = traceback.format_exc()
            print(tb)
            return remove_physical_object_from_order(ok=False, info_text="Error removing Physical Objects from Order. " + str(e) + " traceback: " + str(tb), status_code=500)


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
        
        if not is_authorised(userRights.customer, session_user_id, order_id=order_id):
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
                # Re-add the job for email reminders because the deletion failed
                AddJob(order_id)
                print(e)
                tb = traceback.format_exc()
                return delete_order(ok=False, info_text="Fehler beim Entfernen der Order. " + str(e) + "\n" + str(tb), status_code=500)
        else:
            return delete_order(ok=False, info_text="Order konnte nicht entfernt werden. Order ID not found.", status_code=404)
