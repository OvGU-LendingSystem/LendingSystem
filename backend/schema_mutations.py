import enum
import os
import time

import graphene
from sqlalchemy.orm import *
from graphene_file_upload.scalars import Upload
from config import db, picture_directory, pdf_directory
from flask import session

from models import User as UserModel, orderStatus, userRights
from schema import *
from argon2 import PasswordHasher
from argon2.exceptions import VerificationError, InvalidHashError


##################################
# Mutations for Physical Objects #
##################################
class create_physical_object(graphene.Mutation):
    """
    Creates a new physical object with the given parameters.
    For Connections to tags, orders, groups and organizations use array of their String uuid
    """
    class Arguments:
        inv_num_internal    = graphene.Int(required=True)
        inv_num_external    = graphene.Int(required=True)
        deposit             = graphene.Int(required=True)
        storage_location    = graphene.String(required=True)
        faults              = graphene.String()
        name                = graphene.String(required=True)
        description         = graphene.String()

        pictures            = graphene.String()
        tags                = graphene.List(graphene.String)
        orders              = graphene.List(graphene.String)
        groups              = graphene.List(graphene.String)
        organizations       = graphene.List(graphene.String)

    physical_object = graphene.Field(lambda: PhysicalObject)
    ok              = graphene.Boolean()
    info_text       = graphene.String()

    @staticmethod
    def mutate(self, info, inv_num_internal, inv_num_external, storage_location, name,
               tags, pictures=None, orders=None, groups=None, organizations=None, faults=None, description=None, deposit=None):
        try:
            db_tags = db.query(TagModel).filter(TagModel.tag_id.in_(tags)).all()

            # create Object
            physical_object = PhysicalObjectModel(
                inv_num_internal    = inv_num_internal,
                inv_num_external    = inv_num_external,
                storage_location    = storage_location,
                name                = name,
                tags                = db_tags,
            )

            if orders:
                db_orders = db.query(OrderModel).filter(OrderModel.order_id.in_(orders)).all()
                physical_object.orders = db_orders
            if groups:
                db_groups = db.query(GroupModel).filter(GroupModel.group_id.in_(groups)).all()
                physical_object.groups = db_groups
            if organizations:
                db_organizations = db.query(OrganizationModel).filter(OrganizationModel.organization_id.in_(organizations)).all()
                physical_object.organizations = db_organizations
            if faults:
                physical_object.faults = faults
            if description:
                physical_object.description = description
            if deposit:
                physical_object.deposit = deposit

            db.add(physical_object)
            db.commit()
            return create_physical_object(ok=True, info_text="Objekt erfolgreich erstellt.", physical_object=physical_object)

        except Exception as e:
            print(e)
            return create_physical_object(ok=False, info_text="Fehler beim Erstellen des Objekts. " + str(e))

class update_physical_object(graphene.Mutation):
    """
    Updates content of the physical object with the given phys_id.
    For Connections to tags, orders, groups and organizations use array of their String uuid
    """
    class Arguments:
        phys_id             = graphene.String(required=True)
        inv_num_internal    = graphene.Int()
        inv_num_external    = graphene.Int()
        deposit             = graphene.Int()
        storage_location    = graphene.String()
        faults              = graphene.String()
        name                = graphene.String()
        description         = graphene.String()

        pictures            = graphene.String()
        tags                = graphene.List(graphene.String)
        orders              = graphene.List(graphene.String)
        groups              = graphene.List(graphene.String)
        organizations       = graphene.List(graphene.String)

    physical_object = graphene.Field(lambda: PhysicalObject)
    ok              = graphene.Boolean()
    info_text       = graphene.String()

    @staticmethod
    def mutate(self, info, phys_id, inv_num_internal=None, inv_num_external=None, storage_location=None, name=None, pictures=None,
               tags=None, orders=None, groups=None, organizations=None, faults=None, description=None, deposit=None):

        try:
            physical_object = PhysicalObjectModel.query.filter(PhysicalObjectModel.phys_id == phys_id).first()

            # Abort if object does not exist
            if not physical_object:
                return update_physical_object(ok=False, info_text="Objekt nicht gefunden.")

            if inv_num_internal:
                physical_object.inv_num_internal = inv_num_internal
            if inv_num_external:
                physical_object.inv_num_external = inv_num_external
            if deposit:
                physical_object.deposit = deposit
            if storage_location:
                physical_object.storage_location = storage_location
            if faults:
                physical_object.faults = faults
            if name:
                physical_object.name = name
            if description:
                physical_object.description = description

            # pictures noch nicht implementiert
            if pictures:
                physical_object.pictures = pictures
            if tags:
                db_tags = db.query(TagModel).filter(TagModel.tag_id.in_(tags)).all()
                physical_object.tags = db_tags
            if orders:
                db_orders = db.query(OrderModel).filter(OrderModel.order_id.in_(orders)).all()
                physical_object.orders = db_orders
            if groups:
                db_groups = db.query(GroupModel).filter(GroupModel.group_id.in_(groups)).all()
                physical_object.groups = db_groups
            if organizations:
                db_organizations = db.query(OrganizationModel).filter(OrganizationModel.organization_id.in_(organizations)).all()
                physical_object.organizations = db_organizations

            db.commit()
            return update_physical_object(ok=True, info_text="Objekt erfolgreich aktualisiert.", physical_object=physical_object)

        except Exception as e:
            print(e)
            return update_physical_object(ok=False, info_text="Fehler beim Aktualisieren des Objekts. " + str(e))

class delete_physical_object(graphene.Mutation):
    """
    Deletes the physical object with the given phys_id.
    """
    class Arguments:
        phys_id = graphene.String(required=True)

    ok          = graphene.Boolean()
    info_text   = graphene.String()

    @staticmethod
    def mutate(self, info, phys_id):
        physical_object = PhysicalObjectModel.query.filter(PhysicalObjectModel.phys_id == phys_id).first()
        if physical_object:
            db.delete(physical_object)
            db.commit()
            return delete_physical_object(ok=True, info_text="Objekt erfolgreich entfernt.")
        else:
            return delete_physical_object(ok=False, info_text="Objekt konnte nicht gefunden werden.")

##################################
# Upload for Files               #
##################################
class upload_file(graphene.Mutation):
    """
    Uploads a file to the server and creates a new File object in the database.
    """
    class Arguments:
        phys_id         = graphene.String()
        organization_id = graphene.String()
        group_id        = graphene.String()
        file            = Upload(required=True)

    file        = graphene.Field(lambda: File)
    ok          = graphene.Boolean()
    info_text   = graphene.String()

    def mutate(self, info, file, phys_id=None, organization_id=None, group_id=None):
        try:
            physical_object = None
            organization    = None
            group           = None

            physical_object = PhysicalObjectModel.query.filter(PhysicalObjectModel.phys_id == phys_id).first()
            organization    = OrganizationModel.query.filter(OrganizationModel.organization_id == organization_id).first()
            group           = GroupModel.query.filter(GroupModel.group_id == group_id).first()

            type = None
            pictureFileExtensions   = ['jpg', 'jpeg', 'png', 'svg']
            pdfFileExtensions       = ['pdf']
            if file.filename.split('.')[-1] in pictureFileExtensions:
                type = 'picture'
            elif file.filename.split('.')[-1] in pdfFileExtensions:
                type = 'pdf'

            if type == None:
                return upload_file(ok=False, info_text="File type not supported.")

            file_name   = file.filename
            file_name   = file_name.replace(" ", "_")
            time_stamp  = str(time.time())
            file_name   = time_stamp + "_" + file_name
            if type == 'picture':
                file.save(os.path.join(picture_directory, file_name))
            elif type == 'pdf':
                file.save(os.path.join(pdf_directory, file_name))

            file = FileModel(   path            = file_name,
                                physicalobject  = physical_object,
                                organization    = organization,
                                group           = group,
                                file_type       = type)

            db.add(file)
            db.commit()

            return upload_file(ok=True, info_text="File uploaded successfully.", file=file)
        except Exception as e:
            print(e)
            return upload_file(ok=False, info_text="Error uploading file. " + str(e))

class delete_file(graphene.Mutation):
    """
    Deletes the file with the given file_id from the server and the database.
    """
    class Arguments:
        file_id = graphene.String(required=True)

    ok          = graphene.Boolean()
    info_text   = graphene.String()

    @staticmethod
    def mutate(self, info, file_id):
        file = FileModel.query.filter(FileModel.file_id == file_id).first()
        if file:
            os.remove(os.path.join(picture_directory, file.path))

            db.delete(file)
            db.commit()
            return delete_file(ok=True, info_text="File successfully removed.")
        else:
            return delete_file(ok=False, info_text="File not found.")

##################################
# Mutations for orders           #
##################################
class create_order(graphene.Mutation):
    """
    Creates a new order with the given parameters.
    For Connections to users and physical objects use array of their String uuid
    """
    class Arguments:
        from_date       = graphene.Date()
        till_date       = graphene.Date()
        physicalobjects = graphene.List(graphene.String)
        users           = graphene.List(graphene.String)

    order       = graphene.Field(lambda: Order)
    ok          = graphene.Boolean()
    info_text   = graphene.String()

    @staticmethod
    def mutate(self, info, from_date=None, till_date=None, users=None, physicalobjects=None):
        try:
            order = OrderModel()

            if from_date:
                order.from_date = from_date
            if till_date:
                order.till_date = till_date

            if users:
                db_users = db.query(UserModel).filter(UserModel.user_id.in_(users)).all()
                order.users = db_users
            if physicalobjects:
                db_physicalobjects = db.query(PhysicalObjectModel).filter(PhysicalObjectModel.phys_id.in_(physicalobjects)).all()
                order.physicalobjects = db_physicalobjects

            db.add(order)

            db.commit()
            return create_order(ok=True, info_text="Order erfolgreich erstellt.", order=order)

        except Exception as e:
            print(e)
            return create_order(ok=False, info_text="Order konnte nicht erstellt werden. " + str(e))

class update_order(graphene.Mutation):
    """
    Updates content of the order with the given order_id.
    """
    class Arguments:
        order_id    = graphene.String(required=True)
        from_date   = graphene.Date()
        till_date   = graphene.Date()

        physicalobjects = graphene.List(graphene.String)
        users           = graphene.List(graphene.String)

    order       = graphene.Field(lambda: Order)
    ok          = graphene.Boolean()
    info_text   = graphene.String()

    @staticmethod
    def mutate(self, info, order_id, from_date=None, till_date=None, return_date=None, status=None, physicalobjects=None, users=None):
        try:
            order = OrderModel.query.filter(OrderModel.order_id == order_id).first()
            # Abort if object does not exist
            if not order:
                return update_order(ok=False, info_text="Order nicht gefunden.")

            if from_date:
                order.from_date = from_date
            if till_date:
                order.till_date = till_date
            if physicalobjects:
                db_physicalobjects = db.query(PhysicalObjectModel).filter(PhysicalObjectModel.phys_id.in_(physicalobjects)).all()
                # Remove all physical objects from order to add the new ones
                order.removePhysicalObjects()
                for physObj in db_physicalobjects:
                    order.addPhysicalObject(physObj)
            if users:
                db_users = db.query(UserModel).filter(UserModel.user_id.in_(users)).all()
                order.users = db_users

            db.commit()
            return update_order(ok=True, info_text="OrderStatus aktualisiert.", order=order)

        except Exception as e:
            print(e)
            return update_order(ok=False, info_text="Fehler beim Aktualisieren der Orders. " + str(e))

class update_order_status(graphene.Mutation):
    """
    Updates the status for the given physical objects in the order.
    """
    class Arguments:
        order_id        = graphene.String(required=True)
        physicalObjects = graphene.List(graphene.String, required=True)

        return_date     = graphene.Date()
        status          = graphene.String()

    phys_order  = graphene.List(lambda: PhysicalObject_Order)
    ok          = graphene.Boolean()
    info_text   = graphene.String()

    @staticmethod
    def mutate(self, info, order_id, physicalObjects, return_date=None, status=None):
        try:
            phys_order = PhysicalObject_OrderModel.query.filter(PhysicalObject_OrderModel.order_id == order_id, PhysicalObject_OrderModel.phys_id == physicalObjects).all()
            # Abort if object does not exist
            if len(phys_order) == 0:
                return update_order_status(ok=False, info_text="Order nicht gefunden.")

            for order in phys_order:
                print(order)
                if return_date:
                    order.return_date = return_date
                if status:
                    order.order_status = orderStatus[status]

            db.commit()
            return update_order_status(ok=True, info_text="OrderStatus aktualisiert.", phys_order=phys_order)
        
        except Exception as e:
            print(e)
            return update_order_status(ok=False, info_text="Fehler beim Aktualisieren der Order. " + str(e))

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

    @staticmethod
    def mutate(self, info, order_id, physicalObjects):
        try:
            order = OrderModel.query.filter(OrderModel.order_id == order_id).first()
            if not order:
                return add_physical_object_to_order(ok=False, info_text="Order nicht gefunden.")
            
            db_physicalobjects = db.query(PhysicalObjectModel).filter(PhysicalObjectModel.phys_id.in_(physicalObjects)).all()
            for physObj in db_physicalobjects:
                order.addPhysicalObject(physObj)

            db.commit()
            return add_physical_object_to_order(ok=True, info_text="Physical Objects added to Order.", phys_order=order.physicalobjects)
        
        except Exception as e:
            print(e)
            return add_physical_object_to_order(ok=False, info_text="Error adding Physical Objects to Order. " + str(e))

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

    @staticmethod
    def mutate(self, info, order_id, physicalObjects):
        try:
            order = OrderModel.query.filter(OrderModel.order_id == order_id).first()
            if not order:
                return remove_physical_object_from_order(ok=False, info_text="Order nicht gefunden.")
            
            db_physicalobjects = db.query(PhysicalObjectModel).filter(PhysicalObjectModel.phys_id.in_(physicalObjects)).all()
            for physObj in db_physicalobjects:
                order.removePhysicalObject(physObj)

            db.commit()
            return remove_physical_object_from_order(ok=True, info_text="Physical Objects removed from Order.", phys_order=order.physicalobjects)
        
        except Exception as e:
            print(e)
            return remove_physical_object_from_order(ok=False, info_text="Error removing Physical Objects from Order. " + str(e))

class delete_order(graphene.Mutation):
    """
    Deletes the order with the given order_id.
    """    
    class Arguments:
        order_id = graphene.String(required=True)

    ok          = graphene.Boolean()
    info_text   = graphene.String()

    @staticmethod
    def mutate(self, info, order_id):
        order = OrderModel.query.filter(OrderModel.order_id == order_id).first()
        if order:
            db.delete(order)
            db.commit()
            return delete_order(ok=True, info_text="Order erfolgreich entfernt.")
        else:
            return delete_order(ok=False, info_text="Order konnte nicht entfernt werden. Order ID not found.")

##################################
# Mutations for Tags             #
##################################
class create_tag(graphene.Mutation):
    """
    Creates a new tag with the given parameters.
    For Connections to physical objects use array of their String uuid
    """
    class Arguments:
        name            = graphene.String(required=True)
        physicalobjects = graphene.List(graphene.String)

    tag         = graphene.Field(lambda: Tag)
    ok          = graphene.Boolean()
    info_text   = graphene.String()

    @staticmethod
    def mutate(self, info, name, physicalobjects=None):
        try:
            tag = TagModel(
                name=name)

            if physicalobjects:
                db_physicalobjects = db.query(PhysicalObjectModel).filter(PhysicalObjectModel.phys_id.in_(physicalobjects)).all()
                tag.physicalobjects = db_physicalobjects

            db.add(tag)

            db.commit()
            return create_tag(ok=True, info_text="Tag erfolgreich erstellt.", tag=tag)

        except Exception as e:
            print(e)
            return create_tag(ok=False, info_text="Fehler beim Erstellen des Tags. " + str(e))

class update_tag(graphene.Mutation):
    """
    Updates content of the tag with the given tag_id.
    For Connections to physical objects use array of their String uuid
    """
    class Arguments:
        tag_id          = graphene.String(required=True)
        name            = graphene.String()
        physicalobjects = graphene.List(graphene.String)

    tag         = graphene.Field(lambda: Tag)
    ok          = graphene.Boolean()
    info_text   = graphene.String()

    @staticmethod
    def mutate(self, info, tag_id, name=None, physicalobjects=None):
        try:
            tag = TagModel.query.filter(TagModel.tag_id == tag_id).first()

            if not tag:
                return update_tag(ok=False, info_text="Tag \"" + name + "\" nicht gefunden.")
            if physicalobjects:
                db_physicalobjects = db.query(PhysicalObjectModel).filter(PhysicalObjectModel.phys_id.in_(physicalobjects)).all()
                tag.physicalobjects = db_physicalobjects
            if name:
                tag.name = name

            db.commit()
            return update_tag(ok=True, info_text="Tag erfolgreich aktualisiert.", tag=tag)

        except Exception as e:
            print(e)
            return update_tag(ok=False, info_text="Fehler beim Aktualisieren des Tags. " + str(e))

class delete_tag(graphene.Mutation):
    """
    Deletes the tag with the given tag_id.
    """
    class Arguments:
        tag_id = graphene.String(required=True)

    ok          = graphene.Boolean()
    info_text   = graphene.String()

    @staticmethod
    def mutate(self, info, tag_id):
        tag = TagModel.query.filter(TagModel.tag_id == tag_id).first()
        if tag:
            db.delete(tag)
            db.commit()
            return delete_tag(ok=True, info_text="Tag erfolgreich entfernt.")
        else:
            return delete_tag(ok=False, info_text="Tag konnte nicht entfernt werden.")

##################################
# Mutations for Groups           #
##################################
class create_group(graphene.Mutation):
    """
    Creates a new group with the given parameters.
    For Connections to physical objects use array of their String uuid
    """
    class Arguments:
        name            = graphene.String(required=True)
        physicalobjects = graphene.List(graphene.String)

    group       = graphene.Field(lambda: Group)
    ok          = graphene.Boolean()
    info_text   = graphene.String()

    @staticmethod
    def mutate(self, info, name, physicalobjects=None):
        try:
            group = GroupModel(name=name)

            if physicalobjects:
                db_physicalobjects = db.query(PhysicalObjectModel).filter(PhysicalObjectModel.phys_id.in_(physicalobjects)).all()
                group.physicalobjects = db_physicalobjects

            db.add(group)

            db.commit()
            return create_group(ok=True, info_text="Gruppe erfolgreich erstellt.", group=group)

        except Exception as e:
            print(e)
            return create_group(ok=False, info_text="Fehler beim Erstellen der Gruppe. " + str(e))

class update_group(graphene.Mutation):
    """
    Updates content of the group with the given group_id.
    For Connections to physical objects use array of their String uuid
    """
    class Arguments:
        group_id        = graphene.String(required=True)
        name            = graphene.String()
        physicalobjects = graphene.List(graphene.String)

    group       = graphene.Field(lambda: Group)
    ok          = graphene.Boolean()
    info_text   = graphene.String()

    @staticmethod
    def mutate(self, info, group_id, name=None, physicalobjects=None):
        try:
            group = GroupModel.query.filter(GroupModel.group_id == group_id).first()

            if not group:
                return update_group(ok=False, info_text="Gruppe \"" + name + "\" nicht gefunden.")
            if physicalobjects:
                db_physicalobjects = db.query(PhysicalObjectModel).filter(PhysicalObjectModel.phys_id.in_(physicalobjects)).all()
                group.physicalobjects = db_physicalobjects
            if name:
                group.name = name

            db.commit()
            return create_group(ok=True, info_text="Gruppe erfolgreich aktualisiert.", group=group)

        except Exception as e:
            print(e)
            return create_group(ok=False, info_text="Fehler beim Aktualisieren der Gruppe. " + str(e))

class delete_group(graphene.Mutation):
    """
    Deletes the group with the given group_id.
    """
    class Arguments:
        group_id = graphene.String(required=True)

    ok          = graphene.Boolean()
    info_text   = graphene.String()

    @staticmethod
    def mutate(self, info, group_id):
        group = GroupModel.query.filter(GroupModel.group_id == group_id).first()
        if group:
            db.delete(group)
            db.commit()
            return delete_tag(ok=True, info_text="Gruppe erfolgreich entfernt.")
        else:
            return delete_tag(ok=False, info_text="Gruppe konnte nicht entfernt werden. Group ID not found.")

##################################
# Mutations for Organizations    #
##################################
class create_organization(graphene.Mutation):
    """
    Creates a new organization with the given parameters.
    For Connections to users and physical objects use array of their String uuid
    """
    class Arguments:
        name            = graphene.String(required=True)
        location        = graphene.String()

        users           = graphene.List(graphene.String)
        physicalobjects = graphene.List(graphene.String)
        agb             = graphene.Int()

    organization    = graphene.Field(lambda: Organization)
    ok              = graphene.Boolean()
    info_text       = graphene.String()

    @staticmethod
    def mutate(self, info, name, location=None, users=None, physicalobjects=None, agb=None):
        try:
            organization = OrganizationModel(name=name)
            if agb:
                agb = FileModel.query.filter(FileModel.file_id == agb).first()

            if location:
                organization.location = location
            if users:
                db_users = db.query(UserModel).filter(UserModel.user_id.in_(users)).all()
                organization.users = db_users
            if physicalobjects:
                db_physicalobjects = db.query(PhysicalObjectModel).filter(PhysicalObjectModel.phys_id.in_(physicalobjects)).all()
                organization.physicalobjects = db_physicalobjects
            if agb:
                organization.agb = agb

            db.add(organization)

            db.commit()
            return create_organization(ok=True, info_text="Organisation erfolgreich erstellt.", organizations=organization)

        except Exception as e:
            print(e)
            return create_organization(ok=False, info_text="Fehler beim Erstellen der Organisation. " + str(e))

class update_organization(graphene.Mutation):
    """
    Updates content of the organization with the given organization_id.
    For Connections to users and physical objects use array of their String uuid
    """
    class Arguments:
        organization_id     = graphene.String()
        name                = graphene.String()
        location            = graphene.String()

        users               = graphene.List(graphene.String)
        physicalobjects     = graphene.List(graphene.String)
        agb                 = graphene.Int()

    ok          = graphene.Boolean()
    info_text   = graphene.String()

    @staticmethod
    def mutate(self, info, organization_id, name=None, location=None, users=None, physicalobjects=None, agb=None):
        try:
            organization = OrganizationModel.query.filter(OrganizationModel.organization_id == organization_id).first()
            if agb:
                agb = FileModel.query.filter(FileModel.file_id == agb).first()

            if not organization:
                return update_organization(ok=False, info_text="Organisation nicht gefunden.")
            if name:
                organization.name = name
            if location:
                organization.location = location
            if users:
                db_users = db.query(UserModel).filter(UserModel.user_id.in_(users)).all()
                organization.users = db_users
            if physicalobjects:
                db_physicalobjects = db.query(PhysicalObjectModel).filter(PhysicalObjectModel.phys_id.in_(physicalobjects)).all()
                organization.physicalobjects = db_physicalobjects
            if agb:
                organization.resetUserAgreement()
                organization.agb = agb

            db.commit()
            return create_organization(ok=True, info_text="Organisation erfolgreich aktualisiert.")

        except Exception as e:
            print(e)
            return create_organization(ok=False, info_text="Fehler beim Aktualisieren der Organisation. " + str(e))

class update_organization_user_status(graphene.Mutation):
    """
    Updates the user agreement for the given user in the organization.
    """
    class Arguments:
        organization_id     = graphene.Int()
        user_id             = graphene.List(graphene.Int)
        user_agreement      = graphene.Boolean()

    organization_user   = graphene.List(lambda: Organization_User)
    ok                  = graphene.Boolean()
    info_text           = graphene.String()

    @staticmethod
    def mutate(self, info, organization_id, user_id, user_agreement=None):
        try:
            organization_user = Organization_UserModel.query.filter(Organization_UserModel.organization_id == organization_id, Organization_UserModel.user_id == user_id).all()
            if len(organization_user) == 0:
                return update_organization_user_status(ok=False, info_text="No corresponding User found in Organization.")
            
            for org_user in organization_user:
                if user_agreement:
                    org_user.user_agreement = user_agreement
            
            db.commit()
            return update_organization_user_status(ok=True, info_text="User updated.", organization_user=organization_user)
        
        except Exception as e:
            print(e)
            return update_organization_user_status(ok=False, info_text="Error updating user. " + str(e))

class add_user_to_organization(graphene.Mutation):
    """
    Adds the user with the given user_id to the organization with the given organization_id.
    """
    class Arguments:
        user_id         = graphene.String(required=True)
        organization_id = graphene.String(required=True)

    ok          = graphene.Boolean()
    info_text   = graphene.String()

    @staticmethod
    def mutate(self, info, user_id, organization_id):
        try:
            executive_user  = info.context.user
            user            = UserModel.query.filter(UserModel.user_id == user_id).first()
            organization    = OrganizationModel.query.filter(OrganizationModel.organization_id == organization_id).first()

            if not user or not organization:
                return add_user_to_organization(ok=False, info_text="User oder Organisation existieren nicht.")

            # wenn executive_User OrgaAdmin dieser Organisation ist und user nicht bereits Member ist
            # darf er den User zur Organisation hinzufügen
            if executive_user.organizations[organization_id].rights == 1 and organization not in user.organizations:
                organization.addUser(user)
                db.commit()
                return add_user_to_organization(ok=True, info_text="User erfolgreich zur Organisation hinzugefügt.")
        except Exception as e:
            print(e)
            return add_user_to_organization(ok=False, info_text="Etwas hat nicht funktioniert.")

class remove_user_from_organization(graphene.Mutation):
    """
    Removes the user with the given user_id from the organization with the given organization_id.
    """
    class Arguments:
        user_id         = graphene.String(required=True)
        organization_id = graphene.String(required=True)

    ok          = graphene.Boolean()
    info_text   = graphene.String()

    @staticmethod
    def mutate(self, info, user_id, organization_id):
        try:
            executive_user  = info.context.user
            user            = UserModel.query.filter(UserModel.user_id == user_id).first()
            organization    = OrganizationModel.query.filter(OrganizationModel.organization_id == organization_id).first()

            if not user or not organization:
                return remove_user_from_organization(ok=False, info_text="User oder Organisation existieren nicht.")

            # wenn executive_User OrgaAdmin dieser Organisation ist und user bereits Member ist
            # darf er den User aus der Organisation entfernen
            if executive_user.organizations[organization_id].rights == 1 and organization in user.organizations:
                organization.removeUser(user)
                db.commit()
                return remove_user_from_organization(ok=True, info_text="User erfolgreich aus der Organisation entfernt.")
        except Exception as e:
            print(e)
            return remove_user_from_organization(ok=False, info_text="Etwas hat nicht funktioniert.")

class update_user_rights(graphene.Mutation):
    """
    Updates the rights for the given user in the organization.
    """
    class Arguments:
        user_id         = graphene.String(required=True)
        new_rights      = graphene.Int(required=True) or graphene.String(required=True)
        organization_id = graphene.String(required=True)

    ok          = graphene.Boolean()
    info_text   = graphene.String()

    @staticmethod
    def mutate(self, info, user_id, organization_id, new_rights):
        try:
            executive_user  = info.context.user
            user            = UserModel.query.filter(UserModel.user_id == user_id).first()
            organization    = OrganizationModel.query.filter(OrganizationModel.organization_id == organization_id).first()

            if not user or not organization:
                return update_user_rights(ok=False, info_text="User oder Organisation existieren nicht.")

            # executive User muss mehr Rechte als User haben
            # die neuen Rechte dürfen nur mindestens genauso gut sein wie die des executive User
            if new_rights >= executive_user.organizations[organization_id].rights < user.organizations[organization_id].rights:
                user.organizations[organization_id].rights = new_rights

                db.commit()
                return update_user_rights(ok=True, info_text="Benutzerrechte erfolgreich angepasst.")
        except Exception as e:
            print(e)
            return update_user_rights(ok=False, info_text="Etwas ist schiefgelaufen.")

class delete_organization(graphene.Mutation):
    """
    Deletes the organization with the given organization_id.
    """
    class Arguments:
        organization_id = graphene.String(required=True)

    ok          = graphene.Boolean()
    info_text   = graphene.String()

    @staticmethod
    def mutate(self, info, organization_id):
        organization = OrganizationModel.query.filter(OrganizationModel.organization_id.order_id == organization_id).first()
        if organization:
            db.delete(organization)
            db.commit()
            return delete_tag(ok=True, info_text="Organisation erfolgreich entfernt.")
        else:
            return delete_tag(ok=False, info_text="Organisation konnte nicht entfernt werden.")

##################################
# Mutations for Users            #
##################################
class create_user(graphene.Mutation):
    """
    Creates a new user with the given parameters.
    """
    class Arguments:
        email       = graphene.String(required=True)
        last_name   = graphene.String(required=True)
        first_name  = graphene.String(required=True)
        password    = graphene.String(required=True)

    user        = graphene.Field(lambda: User)
    ok          = graphene.Boolean()
    info_text   = graphene.String()

    @staticmethod
    def mutate(self, info, email, last_name, first_name, password):
        try:
            user_exists = UserModel.query.filter_by(email=email).first()
            if user_exists:
                return create_user(ok=False, info_text="Die angegebene E-Mail wird bereits verwendet.")
            else:
                ph = PasswordHasher()
                password_hashed = ph.hash(password)
                user = UserModel(first_name=first_name, last_name=last_name, email=email, password_hash=password_hashed)
                db.add(user)
                db.commit()
                return create_user(ok=True, info_text="Der Nutzer wurde erfolgreich angelegt.", user=user)
        except Exception as e:
            print(e)
            return create_user(ok=False, info_text="Fehler beim Erstellen des Nutzers. " + str(e))
        
class update_user(graphene.Mutation):
    """
    Updates content of the user with the given user_id.
    """
    class Arguments:
        user_id     = graphene.Int(required=True)
        email       = graphene.String()
        last_name   = graphene.String()
        first_name  = graphene.String()
        password    = graphene.String()

    user        = graphene.Field(lambda: User)
    ok          = graphene.Boolean()
    info_text   = graphene.String()

    @staticmethod
    def mutate(self, info, user_id, email=None, last_name=None, first_name=None, password=None):
        try:
            user = UserModel.query.filter(UserModel.user_id == user_id).first()

            if not user:
                return update_user(ok=False, info_text="Nutzer nicht gefunden.")
            if email:
                user.email = email
            if last_name:
                user.last_name = last_name
            if first_name:
                user.first_name = first_name
            if password:
                ph = PasswordHasher()
                user.password_hash = ph.hash(password)

            db.commit()
            return update_user(ok=True, info_text="Nutzer erfolgreich aktualisiert.", user=user)

        except Exception as e:
            print(e)
            return update_user(ok=False, info_text="Fehler beim Aktualisieren des Nutzers. " + str(e))
        
class delete_user(graphene.Mutation):
    """
    Deletes the user with the given user_id.
    """
    class Arguments:
        user_id = graphene.Int(required=True)

    ok = graphene.Boolean()
    info_text = graphene.String()

    @staticmethod
    def mutate(self, info, user_id):
        user = UserModel.query.filter(UserModel.user_id == user_id).first()
        if user:
            db.delete(user)
            db.commit()
            return delete_user(ok=True, info_text="Nutzer erfolgreich entfernt.")
        else:
            return delete_user(ok=False, info_text="Nutzer konnte nicht entfernt werden.")
        
##################################
# Mutations for Users login      #
##################################
class sign_up(graphene.Mutation):
    class Arguments:
        email = graphene.String(required=True)
        last_name = graphene.String(required=True)
        first_name = graphene.String(required=True)
        password = graphene.String(required=True)

    ok = graphene.Boolean()
    info_text = graphene.String()

    @staticmethod
    def mutate(self, info, email, last_name, first_name, password):
        user_exists = UserModel.query.filter_by(email=email).first()
        if user_exists:
            return sign_up(ok=False, info_text="Die angegebene E-Mail wird bereits verwendet.")
        else:
            ph = PasswordHasher()
            password_hashed = ph.hash(password)
            user = UserModel(first_name=first_name, last_name=last_name, email=email, password_hash=password_hashed)
            db.add(user)
            db.commit()
            session['user_id'] = user.user_id
            return sign_up(ok=True, info_text="Der Nutzer wurde erfolgreich angelegt.")

class login(graphene.Mutation):
    class Arguments:
        email = graphene.String(required=True)
        password = graphene.String(required=True)

    ok = graphene.Boolean()
    info_text = graphene.String()

    @staticmethod
    def mutate(self, info, email, password):
        user = UserModel.query.filter(UserModel.email == email).first()

        if not user:
            return login(ok=False, info_text="Der Nutzer mit der angegeben E-Mail existiert nicht.")
        else:
            try:
                ph = PasswordHasher()
                ph.verify(user.password_hash, password)
            except VerificationError:
                return login(ok=False, info_text="Die Anmeldung ist fehlgeschlagen!")
            except InvalidHashError:
                return login(ok=False, info_text="Die Anmeldung ist fehlgeschlagen!")

            if ph.check_needs_rehash(user.password_hash):
                user.password_hash = ph.hash(password)
                db.add(user)
                db.commit()

            session['user_id'] = user.user_id
            return login(ok=True, info_text="Die Anmeldung war erfolgreich!")


class check_session(graphene.Mutation):
    ok = graphene.Boolean()
    info_text = graphene.String()

    @staticmethod
    def mutate(self, info):
        user_id = session.get('user_id')
        if user_id:
            return check_session(ok=True, info_text='Es liegt eine gültige Session vor.')
        else:
            return check_session(ok=False, info_text='Unautorisierter Zugriff.')

class logout(graphene.Mutation):
    ok = graphene.Boolean()
    info_text = graphene.String()

    @staticmethod
    def mutate(self, info):
        if session.get('user_id'):
            session.pop("user_id")
            return logout(ok=True, info_text='Logout erfolgreich!')
        else:
            return logout(ok=False, info_text='User nicht angemeldet.')

class Mutations(graphene.ObjectType):
    signup          = sign_up.Field()
    login           = login.Field()
    logout          = logout.Field()
    checkSession    = check_session.Field()

    create_physical_object = create_physical_object.Field()
    update_physical_object = update_physical_object.Field()
    delete_physical_object = delete_physical_object.Field()

    upload_file = upload_file.Field()
    delete_file = delete_file.Field()

    create_order                        = create_order.Field()
    update_order                        = update_order.Field()
    update_order_status                 = update_order_status.Field()
    add_physical_object_to_order        = add_physical_object_to_order.Field()
    remove_physical_object_from_order   = remove_physical_object_from_order.Field()
    delete_order                        = delete_order.Field()

    create_tag = create_tag.Field()
    update_tag = update_tag.Field()
    delete_tag = delete_tag.Field()

    create_group = create_group.Field()
    update_group = update_group.Field()
    delete_group = delete_group.Field()

    create_organization         = create_organization.Field()
    update_organization         = update_organization.Field()
    add_user_to_organization    = add_user_to_organization.Field()
    update_user_rights          = update_user_rights.Field()
    delete_organization         = delete_organization.Field()

    create_user = create_user.Field()
    update_user = update_user.Field()
    delete_user = delete_user.Field()