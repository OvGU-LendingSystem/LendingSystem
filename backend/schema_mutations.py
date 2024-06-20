import os
import time

import graphene
from flask import session
from sqlalchemy.orm import *
from graphene_file_upload.scalars import Upload
from config import db, picture_directory, pdf_directory

from models import User as UserModel, orderStatus
from schema import *
from argon2 import PasswordHasher
from argon2.exceptions import VerificationError

##################################
# Mutations for Physical Objects #
##################################
class create_physical_object(graphene.Mutation):
    class Arguments:
        inv_num_internal    = graphene.Int(required=True)
        inv_num_external    = graphene.Int(required=True)
        deposit             = graphene.Int(required=True)
        storage_location    = graphene.String(required=True)
        faults              = graphene.String()
        name                = graphene.String(required=True)
        description         = graphene.String()

        pictures            = graphene.String()
        tags                = graphene.List(graphene.Int)
        orders              = graphene.List(graphene.Int)
        groups              = graphene.List(graphene.Int)
        organizations       = graphene.List(graphene.Int)

    physical_object = graphene.Field(lambda: PhysicalObject)
    ok = graphene.Boolean()
    info_text = graphene.String()

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
    class Arguments:
        phys_id             = graphene.Int(required=True)
        inv_num_internal    = graphene.Int()
        inv_num_external    = graphene.Int()
        deposit             = graphene.Int()
        storage_location    = graphene.String()
        faults              = graphene.String()
        name                = graphene.String()
        description         = graphene.String()

        pictures            = graphene.String()
        tags                = graphene.List(graphene.Int)
        orders              = graphene.List(graphene.Int)
        groups              = graphene.List(graphene.Int)
        organizations       = graphene.List(graphene.Int)

    physical_object = graphene.Field(lambda: PhysicalObject)
    ok = graphene.Boolean()
    info_text = graphene.String()

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
    class Arguments:
        phys_id = graphene.Int(required=True)

    ok = graphene.Boolean()
    info_text = graphene.String()

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
    class Arguments:
        phys_id         = graphene.Int()
        organization_id = graphene.Int()
        group_id        = graphene.Int()
        file            = Upload(required=True)

    file = graphene.Field(lambda: File)
    ok = graphene.Boolean()
    info_text = graphene.String()

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
                                physicalobject = physical_object,
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
    class Arguments:
        file_id = graphene.Int(required=True)

    ok = graphene.Boolean()
    info_text = graphene.String()

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
    class Arguments:
        from_date       = graphene.Date()
        till_date       = graphene.Date()
        physicalobjects = graphene.List(graphene.Int)
        users           = graphene.List(graphene.Int)

    order = graphene.Field(lambda: Order)
    ok = graphene.Boolean()
    info_text = graphene.String()

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
        order_id    = graphene.Int(required=True)
        from_date   = graphene.Date()
        till_date   = graphene.Date()

        physicalobjects = graphene.List(graphene.Int)
        users = graphene.List(graphene.Int)

    order = graphene.Field(lambda: Order)
    ok = graphene.Boolean()
    info_text = graphene.String()

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
        order_id        = graphene.Int(required=True)
        physicalObjects = graphene.List(graphene.Int, required=True)

        return_date     = graphene.Date()
        status          = graphene.String()

    order = graphene.Field(lambda: Order)
    ok = graphene.Boolean()
    info_text = graphene.String()

    @staticmethod
    def mutate(self, info, order_id, physicalObjects, return_date=None, status=None):
        try:
            phys_order = PhysicalObject_OrderModel.query.filter(PhysicalObject_OrderModel.order_id == order_id, PhysicalObject_OrderModel.phys_id == physicalObjects).all()
            # Abort if object does not exist
            if len(phys_order) == 0:
                return update_order_status(ok=False, info_text="Order nicht gefunden.")
            
            for order in phys_order:
                if return_date:
                    order.return_date = return_date
                if status:
                    order.status = orderStatus[status]

            db.commit()
            return update_order_status(ok=True, info_text="OrderStatus aktualisiert.", order=order)
        
        except Exception as e:
            print(e)
            return update_order_status(ok=False, info_text="Fehler beim Aktualisieren der Orders. " + str(e))

class delete_order(graphene.Mutation):
    class Arguments:
        order_id = graphene.Int(required=True)

    ok = graphene.Boolean()
    info_text = graphene.String()

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
    class Arguments:
        name = graphene.String(required=True)
        physicalobjects = graphene.List(graphene.Int)

    tag = graphene.Field(lambda: Tag)
    ok = graphene.Boolean()
    info_text = graphene.String()

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
    class Arguments:
        tag_id = graphene.Int(required=True)
        name = graphene.String()
        physicalobjects = graphene.List(graphene.Int)

    tag = graphene.Field(lambda: Tag)
    ok = graphene.Boolean()
    info_text = graphene.String()

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
    class Arguments:
        tag_id = graphene.Int(required=True)

    ok = graphene.Boolean()
    info_text = graphene.String()

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
    class Arguments:
        name            = graphene.String(required=True)
        physicalobjects = graphene.List(graphene.Int)

    group = graphene.Field(lambda: Group)
    ok = graphene.Boolean()
    info_text = graphene.String()

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
    class Arguments:
        group_id = graphene.Int(required=True)
        name = graphene.String()
        physicalobjects = graphene.List(graphene.Int)

    group = graphene.Field(lambda: Group)
    ok = graphene.Boolean()
    info_text = graphene.String()

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
    class Arguments:
        group_id = graphene.Int(required=True)

    ok = graphene.Boolean()
    info_text = graphene.String()

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
    class Arguments:
        name            = graphene.String(required=True)
        location        = graphene.String()

        users           = graphene.List(graphene.Int)
        physicalobjects = graphene.List(graphene.Int)

    organization = graphene.Field(lambda: Organization)
    ok = graphene.Boolean()
    info_text = graphene.String()

    @staticmethod
    def mutate(self, info, name, location=None, users=None, physicalobjects=None):
        try:
            organization = OrganizationModel(name=name)

            if location:
                organization.location = location
            if users:
                db_users = db.query(UserModel).filter(UserModel.user_id.in_(users)).all()
                organization.users = db_users
            if physicalobjects:
                db_physicalobjects = db.query(PhysicalObjectModel).filter(PhysicalObjectModel.phys_id.in_(physicalobjects)).all()
                organization.physicalobjects = db_physicalobjects

            db.add(organization)

            db.commit()
            return create_organization(ok=True, info_text="Organisation erfolgreich erstellt.", organizations=organization)

        except Exception as e:
            print(e)
            return create_organization(ok=False, info_text="Fehler beim Erstellen der Organisation. " + str(e))     

class update_organization(graphene.Mutation):
    class Arguments:
        organization_id     = graphene.Int()
        name                = graphene.String()
        location            = graphene.String()

        users               = graphene.List(graphene.Int)
        physicalobjects     = graphene.List(graphene.Int)

    ok = graphene.Boolean()
    info_text = graphene.String()

    @staticmethod
    def mutate(self, info, organization_id, name=None, location=None, users=None, physicalobjects=None):
        try:
            organization = OrganizationModel.query.filter(OrganizationModel.organization_id == organization_id).first()

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

            db.commit()
            return create_organization(ok=True, info_text="Organisation erfolgreich aktualisiert.")

        except Exception as e:
            print(e)
            return create_organization(ok=False, info_text="Fehler beim Aktualisieren der Organisation. " + str(e))

class delete_organization(graphene.Mutation):
    class Arguments:
        organization_id = graphene.Int(required=True)

    ok = graphene.Boolean()
    info_text = graphene.String()

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

            if ph.check_needs_rehash(user.password_hash):
                user.password_hash = ph.hash(password)
                db.add(user)
                db.commit()

            return login(ok=True, info_text="Die Anmeldung war erfolgreich!")


class check_session(graphene.Mutation):
    ok = graphene.Boolean()
    info_text = graphene.String()

    @staticmethod
    def mutate(self, info):
        if not session.get('user_id'):
            return check_session(ok=False, info_text="Es liegt keine Session vor.")
        else:
            user = UserModel.query.filter(UserModel.user_id == session['user_id']).first()
            if not user:
                ok = False
                info_text = "Nutzer hat keine aktuelle Session."
            else:
                ok = True
                info_text = "Nutzer hat eine aktuelle Session."
            return check_session(ok=ok, info_text=info_text)

class logout(graphene.Mutation):
    ok = graphene.Boolean()
    info_text = graphene.String()

    @staticmethod
    def mutate(self, info):
        session['user_id'] = None
        ok = True
        info_text = "Logout erfolgreich!"
        return logout(ok=ok, info_text=info_text)

        

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

    create_order        = create_order.Field()
    update_order        = update_order.Field()
    update_order_status = update_order_status.Field()
    delete_order        = delete_order.Field()

    create_tag = create_tag.Field()
    update_tag = update_tag.Field()
    delete_tag = delete_tag.Field()

    create_group = create_group.Field()
    update_group = update_group.Field()
    delete_group = delete_group.Field()

    create_organization = create_organization.Field()
    update_organization = update_organization.Field()
    delete_organization = delete_organization.Field()