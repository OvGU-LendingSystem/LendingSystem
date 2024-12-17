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
from mutation_users import create_user, update_user, delete_user

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