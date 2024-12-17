import datetime
import traceback
import uuid
from string import Template

import graphene
from sqlalchemy.orm import *
from sendMail import sendMail
from config import db, picture_directory, pdf_directory
from flask import session
from scheduler import AddJob, CancelJob

from models import User as UserModel, orderStatus, userRights
from schema import *
from argon2 import PasswordHasher
from argon2.exceptions import VerificationError, InvalidHashError

import sys
sys.path.append("./mutations")
from authorization_check import is_authorised, reject_message
from mutation_files import upload_file, update_file, delete_file
from mutation_group import create_group, update_group, delete_group
from mutation_orders import create_order, update_order, update_order_status, add_physical_object_to_order, remove_physical_object_from_order, delete_order
from mutation_organizations import create_organization, update_organization, delete_organization, add_user_to_organization, remove_user_from_organization, update_user_rights
from mutation_physical_objects import create_physical_object, update_physical_object, delete_physical_object
from mutation_tags import create_tag, update_tag, delete_tag

##################################
# Mutations for Users            #
##################################
class create_user(graphene.Mutation):
    """
    Creates a new user with the given parameters.
    """

    class Arguments:
        email = graphene.String(required=True)
        last_name = graphene.String(required=True)
        first_name = graphene.String(required=True)
        password = graphene.String(required=True)

        country = graphene.String(required=False)
        city = graphene.String(required=False)
        postcode = graphene.Int(required=False)
        street = graphene.String(required=False)
        house_number = graphene.Int(required=False)
        phone_number = graphene.Int(required=False)
        matricle_number = graphene.Int(required=False)

    user = graphene.Field(lambda: User)
    ok = graphene.Boolean()
    info_text = graphene.String()

    @staticmethod
    def mutate(self, info, email, last_name, first_name, password, country=None, city=None, postcode=None, street=None,
               house_number=None, phone_number=None, matricle_number=None):
        try:
            user_exists = UserModel.query.filter_by(email=email).first()
            if user_exists:
                return create_user(ok=False, info_text="Die angegebene E-Mail wird bereits verwendet.")
            else:
                ph = PasswordHasher()
                password_hashed = ph.hash(password)
                user = UserModel(first_name=first_name, last_name=last_name, email=email, password_hash=password_hashed)

                if country:
                    user.country = country
                if city:
                    user.city = city
                if postcode:
                    user.postcode = postcode
                if street:
                    user.street = street
                if house_number:
                    user.house_number = house_number

                if phone_number:
                    user.phone_number = phone_number
                if matricle_number:
                    user.matricle_number = matricle_number

                db.add(user)
                db.commit()
                return create_user(ok=True, info_text="Der Nutzer wurde erfolgreich angelegt.", user=user)
        except Exception as e:
            print(e)
            tb = traceback.format_exc()
            return create_user(ok=False,
                               info_text="Fehler beim Erstellen des Nutzers. " + str(e) + "\nTraceback: " + str(tb))


class update_user(graphene.Mutation):
    """
    Updates content of the user with the given user_id.
    """

    class Arguments:
        user_id = graphene.String(required=True)
        email = graphene.String(required=False)
        last_name = graphene.String(required=False)
        first_name = graphene.String(required=False)
        password = graphene.String(required=False)

        country = graphene.String(required=False)
        city = graphene.String(required=False)
        postcode = graphene.Int(required=False)
        street = graphene.String(required=False)
        house_number = graphene.Int(required=False)
        phone_number = graphene.Int(required=False)
        matricle_number = graphene.Int(required=False)

    user = graphene.Field(lambda: User)
    ok = graphene.Boolean()
    info_text = graphene.String()

    @staticmethod
    def mutate(self, info, user_id, email=None, last_name=None, first_name=None, password=None, country=None, city=None,
               postcode=None, street=None, house_number=None, phone_number=None, matricle_number=None):
        # Check if user is authorised
        try:
            session_user_id = session['user_id']
        except:
            return update_file(ok=False, info_text="Keine valide session vorhanden")
        
        if not (session_user_id == user_id):
            return update_user(ok=False, info_text=reject_message)
        
        try:
            user = UserModel.query.filter(UserModel.user_id == user_id).first()

            if not user:
                return update_user(ok=False, info_text="User not found. Can only query by user_id.")
            if email:
                user.email = email
            if last_name:
                user.last_name = last_name
            if first_name:
                user.first_name = first_name
            if password:
                ph = PasswordHasher()
                user.password_hash = ph.hash(password)

            if country:
                user.country = country
            if city:
                user.city = city
            if postcode:
                user.postcode = postcode
            if street:
                user.street = street
            if house_number:
                user.house_number = house_number

            if phone_number:
                user.phone_number = phone_number
            if matricle_number:
                user.matricle_number = matricle_number

            db.commit()
            return update_user(ok=True, info_text="User updated successfully", user=user)

        except Exception as e:
            print(e)
            tb = traceback.format_exc()
            return update_user(ok=False, info_text="Error updating user: " + str(e) + "\nTraceback: " + str(tb))


class delete_user(graphene.Mutation):
    """
    Deletes the user with the given user_id.
    """

    class Arguments:
        user_id = graphene.String(required=True)

    ok = graphene.Boolean()
    info_text = graphene.String()

    @staticmethod
    def mutate(self, info, user_id):
        # Check if user is authorised
        try:
            session_user_id = session['user_id']
        except:
            return delete_user(ok=False, info_text="Keine valide session vorhanden")
        
        if not (session_user_id == user_id):
            return delete_user(ok=False, info_text=reject_message)
        


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
class login(graphene.Mutation):
    class Arguments:
        email       = graphene.String(required=True)
        password    = graphene.String(required=True)

    ok          = graphene.Boolean()
    info_text   = graphene.String()

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
    ok          = graphene.Boolean()
    info_text   = graphene.String()
    user_id = graphene.String()

    @staticmethod
    def mutate(self, info):
        user_id = session.get('user_id')
        if user_id:
            return check_session(ok=True, info_text='Es liegt eine gültige Session vor.', user_id=user_id)
        else:
            return check_session(ok=False, info_text='Unautorisierter Zugriff.', user_id=None)

class logout(graphene.Mutation):
    ok          = graphene.Boolean()
    info_text   = graphene.String()

    @staticmethod
    def mutate(self, info):
        if session.get('user_id'):
            session.pop('user_id')
            return logout(ok=True, info_text='Logout erfolgreich!')
        else:
            return logout(ok=False, info_text='User nicht angemeldet.')

class reset_password(graphene.Mutation):
    class Arguments:
        email = graphene.String(required=True)

    ok          = graphene.Boolean()
    info_text   = graphene.String()

    @staticmethod
    def mutate(self, info, email):
        user = db.query(UserModel).filter(UserModel.email == email).first()
        if not user:
            return reset_password(ok=False, info_text="User not found")
        
        # generate random password
        new_password = str(uuid.uuid4())
        ph = PasswordHasher()
        user.password_hash = ph.hash(new_password)
        db.commit()

        # read template text
        with open("../email_templates/password_reset_template.html", encoding="utf-8") as file:
            template_password = Template(file.read())

        # send mail
        sendMail(receiver=email, subject="Ihr Password wurde zurückgesetzt", body=template_password.substitute(password=new_password))

        return reset_password(ok=True, info_text="New password was send by mail")

class Mutations(graphene.ObjectType):
    login = login.Field()
    logout = logout.Field()
    checkSession = check_session.Field()

    create_physical_object = create_physical_object.Field()
    update_physical_object = update_physical_object.Field()
    delete_physical_object = delete_physical_object.Field()

    upload_file = upload_file.Field()
    update_file = update_file.Field()
    delete_file = delete_file.Field()

    create_order = create_order.Field()
    update_order = update_order.Field()
    update_order_status = update_order_status.Field()
    add_physical_object_to_order = add_physical_object_to_order.Field()
    remove_physical_object_from_order = remove_physical_object_from_order.Field()
    delete_order = delete_order.Field()

    create_tag = create_tag.Field()
    update_tag = update_tag.Field()
    delete_tag = delete_tag.Field()

    create_group = create_group.Field()
    update_group = update_group.Field()
    delete_group = delete_group.Field()

    create_organization = create_organization.Field()
    update_organization = update_organization.Field()
    delete_organization = delete_organization.Field()
    add_user_to_organization = add_user_to_organization.Field()
    remove_user_from_organization = remove_user_from_organization.Field()
    update_user_rights = update_user_rights.Field()

    create_user     = create_user.Field()
    update_user     = update_user.Field()
    delete_user     = delete_user.Field()
    reset_password  = reset_password.Field()