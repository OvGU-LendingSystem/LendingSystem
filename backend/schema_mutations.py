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
from mutation_physical_objects import create_physical_object, update_physical_object, delete_physical_object
from mutation_orders import create_order, update_order, update_order_status, add_physical_object_to_order, remove_physical_object_from_order, delete_order
from mutation_tags import create_tag, update_tag, delete_tag

##################################
# Mutations for Groups           #
##################################
class create_group(graphene.Mutation):
    """
    Creates a new group with the given parameters.
    For Connections to physical objects use array of their String uuid
    """

    class Arguments:
        name = graphene.String(required=True)
        physicalobjects = graphene.List(graphene.String)

    group = graphene.Field(lambda: Group)
    ok = graphene.Boolean()
    info_text = graphene.String()

    @staticmethod
    def mutate(self, info, name, physicalobjects=None):
        # Check if user is authorised
        try:
            session_user_id = session['user_id']
        except:
            return create_group(ok=False, info_text="Keine valide session vorhanden")
        
        if not is_authorised(userRights.inventory_admin, session_user_id):
            return create_group(ok=False, info_text=reject_message)



        try:
            group = GroupModel(name=name)

            if physicalobjects:
                db_physicalobjects = db.query(PhysicalObjectModel).filter(
                    PhysicalObjectModel.phys_id.in_(physicalobjects)).all()
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
        group_id = graphene.String(required=True)
        name = graphene.String()
        physicalobjects = graphene.List(graphene.String)

    group = graphene.Field(lambda: Group)
    ok = graphene.Boolean()
    info_text = graphene.String()

    @staticmethod
    def mutate(self, info, group_id, name=None, physicalobjects=None):
        # Check if user is authorised
        try:
            session_user_id = session['user_id']
        except:
            return update_group(ok=False, info_text="Keine valide session vorhanden")
        
        if not is_authorised(userRights.inventory_admin, session_user_id, group_id=group_id):
            return update_group(ok=False, info_text=reject_message)
        

        
        try:
            group = GroupModel.query.filter(GroupModel.group_id == group_id).first()

            if not group:
                return update_group(ok=False, info_text="Gruppe \"" + name + "\" nicht gefunden.")
            if physicalobjects:
                db_physicalobjects = db.query(PhysicalObjectModel).filter(
                    PhysicalObjectModel.phys_id.in_(physicalobjects)).all()
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

    ok = graphene.Boolean()
    info_text = graphene.String()

    @staticmethod
    def mutate(self, info, group_id):
        # Check if user is authorised
        try:
            session_user_id = session['user_id']
        except:
            return delete_group(ok=False, info_text="Keine valide session vorhanden")
        
        if not is_authorised(userRights.inventory_admin, session_user_id, group_id=group_id):
            return delete_group(ok=False, info_text=reject_message)
        


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
        name = graphene.String(required=True)
        location = graphene.String(required=True)

        users = graphene.List(graphene.String)
        physicalobjects = graphene.List(graphene.String)
        agb = graphene.Int()

    organization = graphene.Field(lambda: Organization)
    ok = graphene.Boolean()
    info_text = graphene.String()

    @staticmethod
    def mutate(self, info, name, location, users=None, physicalobjects=None, agb=None):
        # Check if user is authorised
        try:
            session_user_id = session['user_id']
        except:
            return create_organization(ok=False, info_text="Keine valide session vorhanden")
        
        if not is_authorised(userRights.system_admin, session_user_id):
            return create_organization(ok=False, info_text=reject_message)



        try:
            organization = OrganizationModel(
                name=name,
                location=location,
            )
            
            if agb:
                db_agb = FileModel.query.filter(FileModel.file_id == agb).first()
                organization.agb = db_agb

            if users:
                db_users = db.query(UserModel).filter(UserModel.user_id.in_(users)).all()
                organization.users = db_users
            if physicalobjects:
                db_physicalobjects = db.query(PhysicalObjectModel).filter(
                    PhysicalObjectModel.phys_id.in_(physicalobjects)).all()
                organization.physicalobjects = db_physicalobjects
            if agb:
                organization.agb = agb

            db.add(organization)
            db.commit()

            # add executive User to Organization with highest rights
            organization_user = Organization_UserModel(
                user_id = session_user_id,
                organization_id = organization.organization_id,
                rights = userRights.organization_admin
            )

            db.add(organization_user)
            db.commit()
            return create_organization(ok=True, info_text="Organisation erfolgreich erstellt.",
                                       organization=organization)

        except Exception as e:
            print(e)
            tb = traceback.format_exc()
            return create_organization(ok=False,
                                       info_text="Fehler beim Erstellen der Organisation. " + str(e) + "\n" + str(tb))


class update_organization(graphene.Mutation):
    """
    Updates content of the organization with the given organization_id.
    For Connections to users and physical objects use array of their String uuid
    """

    class Arguments:
        organization_id = graphene.String()
        name = graphene.String()
        location = graphene.String()
        executive_user_id = graphene.String(required=True)

        users = graphene.List(graphene.String)
        physicalobjects = graphene.List(graphene.String)
        agb = graphene.Int()

    organization = graphene.Field(lambda: Organization)
    ok = graphene.Boolean()
    info_text = graphene.String()

    @staticmethod
    def mutate(self, info, executive_user_id, organization_id, name=None, location=None, users=None,
               physicalobjects=None, agb=None):
        # Check if user is authorised
        try:
            session_user_id = session['user_id']
        except:
            return update_organization(ok=False, info_text="Keine valide session vorhanden")
        
        if not is_authorised(userRights.organization_admin, session_user_id, organization_id=organization_id):
            return update_organization(ok=False, info_text=reject_message)


        
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
                db_physicalobjects = db.query(PhysicalObjectModel).filter(
                    PhysicalObjectModel.phys_id.in_(physicalobjects)).all()
                organization.physicalobjects = db_physicalobjects
            if agb:
                organization.resetUserAgreement()
                organization.agb = agb

            db.commit()
            return update_organization(ok=True, info_text="Organisation erfolgreich aktualisiert.",
                                       organizations=organization)

        except Exception as e:
            print(e)
            return update_organization(ok=False, info_text="Fehler beim Aktualisieren der Organisation. " + str(e))


class update_organization_user_status(graphene.Mutation):
    """
    Updates the user agreement for the given user in the organization.
    """

    class Arguments:
        organization_id = graphene.String()
        user_id = graphene.List(graphene.String)
        user_agreement = graphene.Boolean()

    organization_user = graphene.List(lambda: Organization_User)
    ok = graphene.Boolean()
    info_text = graphene.String()

    @staticmethod
    def mutate(self, info, organization_id, user_id, user_agreement=None):
        # Check if user is authorised
        try:
            session_user_id = session['user_id']
        except:
            return update_organization_user_status(ok=False, info_text="Keine valide session vorhanden")
        
        if not is_authorised(userRights.customer, session_user_id, organization_id=organization_id):
            return update_organization_user_status(ok=False, info_text=reject_message)



        try:
            organization_user = Organization_UserModel.query.filter(
                Organization_UserModel.organization_id == organization_id,
                Organization_UserModel.user_id == user_id).all()
            if len(organization_user) == 0:
                return update_organization_user_status(ok=False,
                                                       info_text="No corresponding User found in Organization.")

            for org_user in organization_user:
                if user_agreement:
                    org_user.user_agreement = user_agreement

            db.commit()
            return update_organization_user_status(ok=True, info_text="User updated.",
                                                   organization_user=organization_user)

        except Exception as e:
            print(e)
            return update_organization_user_status(ok=False, info_text="Error updating user. " + str(e))


class add_user_to_organization(graphene.Mutation):
    """
    Adds the user with the given user_id to the organization with the given organization_id.
    """

    class Arguments:
        user_id = graphene.String(required=True)
        organization_id = graphene.String(required=True)
        user_right = graphene.String()

    organization_user = graphene.List(lambda: Organization_User)
    ok = graphene.Boolean()
    info_text = graphene.String()

    @staticmethod
    def mutate(self, info, user_id, organization_id, user_right="customer"):
        # Check if user is authorised
        try:
            session_user_id = session['user_id']
        except:
            return add_user_to_organization(ok=False, info_text="Keine valide session vorhanden")
        
        if not is_authorised(userRights.organization_admin, session_user_id, organization_id=organization_id):
            return add_user_to_organization(ok=False, info_text=reject_message)



        try:
            user = UserModel.query.filter(UserModel.user_id == user_id).first()
            organization = OrganizationModel.query.filter(OrganizationModel.organization_id == organization_id).first()

            if not user or not organization:
                return add_user_to_organization(ok=False, info_text="User oder Organisation existieren nicht.")

            # falls die Rechte die eines organization_admin überschreiten sollten
            if user_right is userRights.system_admin:
                return add_user_to_organization(ok=False, info_text="diese Rechte können nicht vergeben werden")

            # create organization_user
            organization_user = Organization_UserModel(
                user_id=user_id,
                organization_id=organization_id,
                rights=userRights[user_right]
            )

            db.add(organization_user)
            db.commit()
            return add_user_to_organization(ok=True, info_text="User erfolgreich zur Organisation hinzugefügt.")
        except Exception as e:
            print(e)
            tb = traceback.format_exc()
            return add_user_to_organization(ok=False, info_text="Etwas hat nicht funktioniert. " + str(e) + "\n" + tb)


class remove_user_from_organization(graphene.Mutation):
    """
    Removes the user with the given user_id from the organization with the given organization_id.
    """

    class Arguments:
        user_id = graphene.String(required=True)
        organization_id = graphene.String(required=True)

    organization = graphene.Field(lambda: Organization)
    ok = graphene.Boolean()
    info_text = graphene.String()

    @staticmethod
    def mutate(self, info, user_id, organization_id):
        # Check if user is authorised
        try:
            session_user_id = session['user_id']
        except:
            return update_file(ok=False, info_text="Keine valide session vorhanden")
        
        if not is_authorised(userRights.organization_admin, session_user_id, organization_id=organization_id):
            return remove_user_from_organization(ok=False, info_text=reject_message)
        


        try:
            user = UserModel.query.filter(UserModel.user_id == user_id).first()
            organization = OrganizationModel.query.filter(OrganizationModel.organization_id == organization_id).first()

            if not user or not organization:
                return remove_user_from_organization(ok=False, info_text="User oder Organisation existieren nicht.")

            # falls der User orga_admin oder höher, ist kann er nicht entfernt werden
            for organization in user.organizations:
                if organization.organization_id == organization_id:
                    if organization.rights.value <= userRights.organization_admin:
                        return remove_user_from_organization(ok=False,
                                                             info_text="User hat zu hohe Rechte um entfernt zu werden")

            organization.removeUser(user)
            db.commit()
            return remove_user_from_organization(ok=True,
                                                 info_text="User erfolgreich aus der Organisation entfernt.",
                                                 organization=organization)
        except Exception as e:
            print(e)
            return remove_user_from_organization(ok=False, info_text="Etwas hat nicht funktioniert.")


class update_user_rights(graphene.Mutation):
    """
    Updates the rights for the given user in the organization.
    """

    class Arguments:
        user_id = graphene.String(required=True)
        new_rights = graphene.Int(required=True) or graphene.String(required=True)
        organization_id = graphene.String(required=True)

    organization = graphene.Field(lambda: Organization)
    ok = graphene.Boolean()
    info_text = graphene.String()

    @staticmethod
    def mutate(self, info, user_id, organization_id, new_rights):
        # Check if user is authorised
        try:
            session_user_id = session['user_id']
        except:
            return update_user_rights(ok=False, info_text="Keine valide session vorhanden")

        if not is_authorised(userRights.organization_admin, session_user_id, organization_id=organization_id):
            return update_user_rights(ok=False, info_text=reject_message)
            


        try:
            user = UserModel.query.filter(UserModel.user_id == user_id).first()
            organization = OrganizationModel.query.filter(OrganizationModel.organization_id == organization_id).first()

            if not user or not organization:
                return update_user_rights(ok=False, info_text="Benutzer oder Organisation existieren nicht.")

            # Prüfen, ob Benutzer der Organisation zugeordnet ist
            if organization not in user.organizations:
                return update_user_rights(ok=False, info_text="Benutzer gehört nicht zur Organisation")

            # solange die neuen Rechte nicht die eines organization_admin überliegen
            if new_rights != userRights.system_admin:
                for organization in user.organizations:
                    if organization.organization_id == organization_id:
                        organization.rights = new_rights
                        break
                db.commit()
                return update_user_rights(ok=True, info_text="Benutzerrechte erfolgreich angepasst.",
                                          organization=organization)
            else:
                return update_user_rights(ok=False, info_text="Nicht genügend Rechte.")
        except Exception as e:
            print(e)
            return update_user_rights(ok=False, info_text="Etwas ist schiefgelaufen. " + str(e))


class delete_organization(graphene.Mutation):
    """
    Deletes the organization with the given organization_id.
    """

    class Arguments:
        organization_id = graphene.String(required=True)

    ok = graphene.Boolean()
    info_text = graphene.String()

    @staticmethod
    def mutate(self, info, organization_id):
        # Check if user is authorised
        try:
            session_user_id = session['user_id']
        except:
            return delete_organization(ok=False, info_text="Keine valide session vorhanden")
        
        if not is_authorised(userRights.system_admin, session_user_id, organization_id=organization_id):
            return delete_organization(ok=False, info_text=reject_message)
        
        organization = OrganizationModel.query.filter(
            OrganizationModel.organization_id == organization_id).first()

        if organization:
            db.delete(organization)
            db.commit()
            return delete_organization(ok=True, info_text="Organisation erfolgreich entfernt.")
        else:
            return delete_organization(ok=False, info_text="Organisation konnte nicht entfernt werden.")


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