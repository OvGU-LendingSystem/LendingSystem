from flask import session
import graphene
import traceback

from authorization_check import is_authorised, reject_message
from config import db
from models import userRights
from schema import FileModel, GroupModel, OrderModel, PhysicalObject, PhysicalObjectModel, TagModel
from sqlalchemy import func

##################################
# Mutations for Physical Objects #
##################################

class create_physical_object(graphene.Mutation):
    """
    Creates a new physical object with the given parameters.
    For Connections to tags, orders, groups and organizations use array of their String uuid
    """

    class Arguments:
        # physical objects arguments
        inv_num_internal    = graphene.Int(required=True)
        inv_num_external    = graphene.Int(required=True)
        deposit             = graphene.Int(required=True)
        storage_location    = graphene.String(required=True)
        storage_location2   = graphene.String(required=True)
        faults              = graphene.String()
        name                = graphene.String(required=True)
        description         = graphene.String()
        borrowable          = graphene.Boolean(required=True)
        lending_comment     = graphene.String()
        return_comment      = graphene.String()
        organization_id     = graphene.String(required=True)  # ein Objekt ist immer genau einer Organisation zugeordnet

        # physical objects connections
        pictures    = graphene.List(graphene.String)
        manual      = graphene.List(graphene.String)
        tags        = graphene.List(graphene.String)
        orders      = graphene.List(graphene.String)
        groups      = graphene.List(graphene.String)

    physical_object     = graphene.Field(lambda: PhysicalObject)
    ok                  = graphene.Boolean()
    info_text           = graphene.String()
    status_code         = graphene.Int()

    @staticmethod
    def mutate(self, info, inv_num_internal, inv_num_external, borrowable, storage_location, deposit, storage_location2, name, organization_id,
               tags=None, pictures=None, manual=None, orders=None, groups=None, faults=None, description=None):
        
        # Check if user is authorised
        try:
            session_user_id = session['user_id']
        except:
            return create_physical_object(ok=False, info_text="Keine valide session vorhanden", status_code=419)

        if not is_authorised(userRights.inventory_admin, session_user_id, organization_id=organization_id):
            return create_physical_object(ok=False, info_text=reject_message, status_code=403)



        try:
            physical_object = PhysicalObjectModel(
                inv_num_internal=inv_num_internal,
                inv_num_external=inv_num_external,
                borrowable=borrowable,
                storage_location=storage_location,
                storage_location2=storage_location2,
                name=name,
                organization_id=organization_id,
                deposit = deposit
            )
            
            if pictures:
                db_pictures = db.query(FileModel).filter(FileModel.file_id.in_(pictures)).all()
                physical_object.pictures = db_pictures
            if manual:
                db_manual = db.query(FileModel).filter(FileModel.file_id.in_(manual)).all()
                physical_object.manual = db_manual
            if orders:
                db_orders = db.query(OrderModel).filter(OrderModel.order_id.in_(orders)).all()
                physical_object.orders = db_orders
            if groups:
                db_groups = db.query(GroupModel).filter(GroupModel.group_id.in_(groups)).all()
                physical_object.groups = db_groups
            if faults:
                physical_object.faults = faults
            if description:
                physical_object.description = description
            if tags:
                db_tags = db.query(TagModel).filter(TagModel.tag_id.in_(tags)).all()
                physical_object.tags = db_tags

            db.add(physical_object)
            db.commit()
            return create_physical_object(ok=True, info_text="Objekt erfolgreich erstellt.", physical_object=physical_object, status_code=200)

        except Exception as e:
            print(e)
            tb = traceback.format_exc()
            return create_physical_object(ok=False, info_text="Fehler beim Erstellen des Objekts. " + str(e) + "\n" + tb, status_code=500)


class update_physical_object(graphene.Mutation):
    """
    Updates content of the physical object with the given phys_id.
    For Connections to tags, orders, groups and organizations use array of their String uuid
    """

    class Arguments:
        # physical object arguments
        phys_id             = graphene.String(required=True)
        inv_num_internal    = graphene.Int()
        inv_num_external    = graphene.Int()
        deposit             = graphene.Int()
        borrowable          = graphene.Boolean()
        storage_location    = graphene.String()
        storage_location2   = graphene.String()
        faults              = graphene.String()
        name                = graphene.String()
        description         = graphene.String()
        organization_id     = graphene.String()

        # physical object connections
        pictures    = graphene.List(graphene.String, description="List of picture file ids; Override existing pictures")
        manual      = graphene.List(graphene.String, description="List of manual file ids; Override existing manual")
        tags        = graphene.List(graphene.String, description="List of tag ids; Override existing tags")
        orders      = graphene.List(graphene.String, description="List of order ids; Override existing orders")
        groups      = graphene.List(graphene.String, description="List of group ids; Override existing groups")

    physical_object = graphene.Field(lambda: PhysicalObject)
    ok              = graphene.Boolean()
    info_text       = graphene.String()
    status_code     = graphene.Int()

    @staticmethod
    def mutate(self, info, phys_id, inv_num_internal=None, inv_num_external=None, borrowable=None,
               storage_location=None, storage_location2=None, name=None,
               pictures=None, manual=None,
               tags=None, orders=None, groups=None, faults=None, description=None, deposit=None):
        
        # Check if user is authorised
        try:
            session_user_id = session['user_id']
        except:
            return update_physical_object(ok=False, info_text="Keine valide session vorhanden", status_code=419)

        if not is_authorised(userRights.inventory_admin, session_user_id, phys_id=phys_id):
            return update_physical_object(ok=False, info_text=reject_message, status_code=403)
        


        try:
            physical_object = PhysicalObjectModel.query.filter(PhysicalObjectModel.phys_id == phys_id).first()

            # Abort if object does not exist
            if not physical_object:
                return update_physical_object(ok=False, info_text="Objekt nicht gefunden.", status_code=404)

            if inv_num_internal:
                physical_object.inv_num_internal = inv_num_internal
            if inv_num_external:
                physical_object.inv_num_external = inv_num_external
            if deposit:
                physical_object.deposit = deposit
            if borrowable != None:
                physical_object.borrowable = borrowable
            if storage_location:
                physical_object.storage_location = storage_location
            if storage_location2:
                physical_object.storage_location2 = storage_location2
            if faults:
                physical_object.faults = faults
            if name:
                physical_object.name = name
            if description:
                physical_object.description = description

            if pictures:
                db_pictures = db.query(FileModel).filter(FileModel.file_id.in_(pictures)).all()
                physical_object.pictures = db_pictures
            if manual:
                db_manual = db.query(FileModel).filter(FileModel.file_id.in_(manual)).all()
                physical_object.manual = db_manual
            if tags:
                db_tags = db.query(TagModel).filter(TagModel.tag_id.in_(tags)).all()
                physical_object.tags = db_tags
            if orders:
                db_orders = db.query(OrderModel).filter(OrderModel.order_id.in_(orders)).all()
                physical_object.orders = db_orders
            if groups:
                db_groups = db.query(GroupModel).filter(GroupModel.group_id.in_(groups)).all()
                physical_object.groups = db_groups

            db.commit()
            return update_physical_object(ok=True, info_text="Objekt erfolgreich aktualisiert.",
                                          physical_object=physical_object, status_code=200)

        except Exception as e:
            print(e)
            tb = traceback.format_exc()
            return update_physical_object(ok=False,
                                          info_text="Fehler beim Aktualisieren des Objekts. " + str(e) + "\n" + tb, status_code=500)


class delete_physical_object(graphene.Mutation):
    """
    Deletes the physical object with the given phys_id.
    """

    class Arguments:
        phys_id = graphene.String(required=True)

    ok          = graphene.Boolean()
    info_text   = graphene.String()
    status_code = graphene.Int()

    @staticmethod
    def mutate(self, info, phys_id):
        # Check if user is authorised
        try:
            session_user_id = session['user_id']
        except:
            return delete_physical_object(ok=False, info_text="Keine valide session vorhanden", status_code=419)

        if not is_authorised(userRights.inventory_admin, session_user_id, phys_id=phys_id):
            return delete_physical_object(ok=False, info_text=reject_message, status_code=403)




        physical_object = PhysicalObjectModel.query.filter(PhysicalObjectModel.phys_id == phys_id).first()

        if physical_object:
            db.delete(physical_object)
            db.commit()
            return delete_physical_object(ok=True, info_text="Objekt erfolgreich entfernt.", status_code=200)
        else:
            return delete_physical_object(ok=False, info_text="Objekt konnte nicht gefunden werden.", status_code=500)
        


class is_physical_object_available(graphene.Mutation):
    """
    Checks if the physical object with the given phys_id is available.
    """

    class Arguments:
        phys_id     = graphene.String(required=True)

        start_date  = graphene.Date(required=True)
        end_date    = graphene.Date(required=True)

    ok          = graphene.Boolean()
    info_text   = graphene.String()
    status_code = graphene.Int()
    is_available = graphene.Boolean()

    @staticmethod
    def mutate(self, info, phys_id, start_date, end_date):

        physical_object = PhysicalObjectModel.query.filter(PhysicalObjectModel.phys_id == phys_id).first()

        if not physical_object:
            return is_physical_object_available(ok=False, info_text="Objekt nicht gefunden.", status_code=404)

        # Check if user is authorised
        try:
            session_user_id = session['user_id']
        except:
            return is_physical_object_available(ok=False, info_text="Keine valide session vorhanden", status_code=419)
        
        if not is_authorised(userRights.customer, session_user_id, phys_id=phys_id):
            return is_physical_object_available(ok=False, info_text=reject_message, status_code=403)
    

        # Check if object is available
        phys_orders = physical_object.orders

        for phys_order in phys_orders:
            order = phys_order.order
            from_date = order.from_date.date()
            till_date = order.till_date.date()
            print("From Date: ", from_date)
            print("Till Date: ", till_date)
            if from_date <= end_date and till_date >= start_date:
                return is_physical_object_available(ok=True, info_text="Objekt nicht verfügbar.", is_available=False, status_code=200)
        
        return is_physical_object_available(ok=True, info_text="Objekt verfügbar.", is_available=True, status_code=200)
