import os
import time

import graphene
from flask import session
from sqlalchemy.orm import *
from graphene_file_upload.scalars import Upload
from config import db, picture_directory

from models import User as UserModel
from schema import *
from argon2 import PasswordHasher
from argon2.exceptions import VerificationError

class create_physical_object(graphene.Mutation):
    class Arguments:
        inv_num_internal    = graphene.Int(required=True)
        inv_num_external    = graphene.Int(required=True)
        deposit             = graphene.Int(required=True)
        storage_location    = graphene.String(required=True)
        faults              = graphene.String()
        name                = graphene.String(required=True)
        description         = graphene.String()

        # TODO: Picture Upload
        pictures        = graphene.String()
        tags            = graphene.List(graphene.Int)
        orders          = graphene.List(graphene.Int)
        groups          = graphene.List(graphene.Int)
        organizations   = graphene.List(graphene.Int)

    physical_object = graphene.Field(lambda: PhysicalObject)
    ok = graphene.Boolean()
    info_text = graphene.String()

    @staticmethod
    def mutate(self, info, inv_num_internal, inv_num_external, storage_location, name, 
               tags, pictures=None, orders=None, groups=None, organizations=None, faults=None, description=None, deposit=None):
        try:
            db_tags             = db.query(TagModel).filter(TagModel.tag_id.in_(tags)).all()

            # create Object
            physical_object = PhysicalObjectModel(
                inv_num_internal    = inv_num_internal,
                inv_num_external    = inv_num_external,
                storage_location    = storage_location,
                name                = name,
                tags                = db_tags,
            )

            if pictures:
                pass
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

        except Exception as e:
            print(e)
            return create_physical_object(ok=False, info_text="Fehler beim Erstellen des Objekts. " + str(e))

        db.commit()
        return create_physical_object(ok=True, info_text="Objekt erfolgreich erstellt.")

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

        except Exception as e:
            print(e)
            return update_physical_object(ok=False, info_text="Fehler beim Aktualisieren des Objekts. " + str(e))

        db.commit()
        return update_physical_object(ok=True, info_text="Objekt erfolgreich aktualisiert.",
                                      physical_object=physical_object)

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
            return delete_physical_object(ok=False, info_text="Objekt konnte nicht entfernt werden.")

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

        
class upload_mutation(graphene.Mutation):
    class Arguments:
        file = Upload(required=True)

    success = graphene.Boolean()

    def mutate(self, info, file, **kwargs):
        # do something with your file
        file_name = file.filename
        file_name = file_name.replace(" ", "_")
        time_stamp = str(time.time())
        file_name = time_stamp + "_" + file_name
        file.save(os.path.join(picture_directory, file_name))
        # file.save('./test.png')

        return upload_mutation(success=True)

class Mutations(graphene.ObjectType):
    signup          = sign_up.Field()
    login           = login.Field()
    logout          = logout.Field()
    checkSession    = check_session.Field()
    upload          = upload_mutation.Field()

    create_physical_object = create_physical_object.Field()
    update_physical_object = update_physical_object.Field()
    delete_physical_object = delete_physical_object.Field()