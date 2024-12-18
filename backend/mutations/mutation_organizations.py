from flask import session
import graphene
import traceback

from authorization_check import is_authorised, reject_message
from models import db, userRights
from schema import FileModel, Organization, OrganizationModel, Organization_User, Organization_UserModel, PhysicalObjectModel, UserModel

##################################
# Mutations for Organizations    #
##################################
class create_organization(graphene.Mutation):
    """
    Creates a new organization with the given parameters.
    For Connections to users and physical objects use array of their String uuid
    """

    class Arguments:
        # organization arguments
        name        = graphene.String(required=True)
        location    = graphene.String(required=True)

        # organization connections
        users           = graphene.List(graphene.String)
        physicalobjects = graphene.List(graphene.String)
        agb             = graphene.Int()

    organization    = graphene.Field(lambda: Organization)
    ok              = graphene.Boolean()
    info_text       = graphene.String()
    status_code     = graphene.Int()

    @staticmethod
    def mutate(self, info, name, location, users=None, physicalobjects=None, agb=None):
        # Check if user is authorised
        try:
            session_user_id = session['user_id']
        except:
            return create_organization(ok=False, info_text="Keine valide session vorhanden", status_code=419)
        
        if not is_authorised(userRights.system_admin, session_user_id):
            return create_organization(ok=False, info_text=reject_message, status_code=403)



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
            return create_organization(ok=True, info_text="Organisation erfolgreich erstellt.", organization=organization, status_code=200)

        except Exception as e:
            print(e)
            tb = traceback.format_exc()
            return create_organization(ok=False,
                                       info_text="Fehler beim Erstellen der Organisation. " + str(e) + "\n" + str(tb), status_code=500)


class update_organization(graphene.Mutation):
    """
    Updates content of the organization with the given organization_id.
    For Connections to users and physical objects use array of their String uuid
    """

    class Arguments:
        # organization arguments
        organization_id     = graphene.String()
        name                = graphene.String()
        location            = graphene.String()

        # organization connections
        physicalobjects = graphene.List(graphene.String)
        agb             = graphene.Int()

    organization    = graphene.Field(lambda: Organization)
    ok              = graphene.Boolean()
    info_text       = graphene.String()
    status_code     = graphene.Int()

    @staticmethod
    def mutate(self, info, organization_id, name=None, location=None, physicalobjects=None, agb=None):
        # Check if user is authorised
        try:
            session_user_id = session['user_id']
        except:
            return update_organization(ok=False, info_text="Keine valide session vorhanden", status_code=419)
        
        if not is_authorised(userRights.organization_admin, session_user_id, organization_id=organization_id):
            return update_organization(ok=False, info_text=reject_message, status_code=403)


        
        try:
            organization = OrganizationModel.query.filter(OrganizationModel.organization_id == organization_id).first()
            if agb:
                agb = FileModel.query.filter(FileModel.file_id == agb).first()

            if not organization:
                return update_organization(ok=False, info_text="Organisation nicht gefunden.", status_code=404)
            if name:
                organization.name = name
            if location:
                organization.location = location
            if physicalobjects:
                db_physicalobjects = db.query(PhysicalObjectModel).filter(
                    PhysicalObjectModel.phys_id.in_(physicalobjects)).all()
                organization.physicalobjects = db_physicalobjects
            if agb:
                organization.resetUserAgreement()
                organization.agb = agb

            db.commit()
            return update_organization(ok=True, info_text="Organisation erfolgreich aktualisiert.", organizations=organization, status_code=200)

        except Exception as e:
            print(e)
            tb = traceback.format_exc()
            return update_organization(ok=False, info_text="Fehler beim Aktualisieren der Organisation. " + str(e) + "\n" + str(tb), status_code=500)


class update_organization_user_status(graphene.Mutation):
    """
    Updates the user agreement for the given user in the organization.
    """

    class Arguments:
        organization_id     = graphene.String()
        user_id             = graphene.List(graphene.String)
        user_agreement      = graphene.Boolean()

    organization_user   = graphene.List(lambda: Organization_User)
    ok                  = graphene.Boolean()
    info_text           = graphene.String()
    status_code         = graphene.Int()

    @staticmethod
    def mutate(self, info, organization_id, user_id, user_agreement=None):
        # Check if user is authorised
        try:
            session_user_id = session['user_id']
        except:
            return update_organization_user_status(ok=False, info_text="Keine valide session vorhanden", status_code=419)
        
        if not is_authorised(userRights.customer, session_user_id, organization_id=organization_id):
            return update_organization_user_status(ok=False, info_text=reject_message, status_code=403)



        try:
            organization_user = Organization_UserModel.query.filter(
                Organization_UserModel.organization_id == organization_id,
                Organization_UserModel.user_id == user_id).all()
            if len(organization_user) == 0:
                return update_organization_user_status(ok=False, info_text="No corresponding User found in Organization.", status_code=404)

            for org_user in organization_user:
                if user_agreement:
                    org_user.user_agreement = user_agreement

            db.commit()
            return update_organization_user_status(ok=True, info_text="User updated.", organization_user=organization_user, status_code=200)

        except Exception as e:
            print(e)
            tb = traceback.format_exc()
            return update_organization_user_status(ok=False, info_text="Error updating user. " + str(e) + "\n" + str(tb), status_code=500)


class add_user_to_organization(graphene.Mutation):
    """
    Adds the user with the given user_id to the organization with the given organization_id.
    """

    class Arguments:
        organization_id = graphene.String(required=True)
        user_id         = graphene.String(required=True)
        user_right      = graphene.String()

    organization_user   = graphene.List(lambda: Organization_User)
    ok                  = graphene.Boolean()
    info_text           = graphene.String()
    status_code         = graphene.Int()

    @staticmethod
    def mutate(self, info, user_id, organization_id, user_right="customer"):
        # Check if user is authorised
        try:
            session_user_id = session['user_id']
        except:
            return add_user_to_organization(ok=False, info_text="Keine valide session vorhanden", status_code=419)
        
        if not is_authorised(userRights.organization_admin, session_user_id, organization_id=organization_id):
            return add_user_to_organization(ok=False, info_text=reject_message, status_code=403)



        try:
            user = UserModel.query.filter(UserModel.user_id == user_id).first()
            organization = OrganizationModel.query.filter(OrganizationModel.organization_id == organization_id).first()

            if not user or not organization:
                return add_user_to_organization(ok=False, info_text="User oder Organisation existieren nicht.", status_code=404)

            # falls die Rechte die eines organization_admin überschreiten sollten
            if user_right is userRights.system_admin:
                return add_user_to_organization(ok=False, info_text="diese Rechte können nicht vergeben werden", status_code=403)

            # create organization_user
            organization_user = Organization_UserModel(
                user_id=user_id,
                organization_id=organization_id,
                rights=userRights[user_right]
            )

            db.add(organization_user)
            db.commit()
            return add_user_to_organization(ok=True, info_text="User erfolgreich zur Organisation hinzugefügt.", organization_user=organization_user, status_code=200)
        except Exception as e:
            print(e)
            tb = traceback.format_exc()
            return add_user_to_organization(ok=False, info_text="Etwas hat nicht funktioniert. " + str(e) + "\n" + tb, status_code=500)


class remove_user_from_organization(graphene.Mutation):
    """
    Removes the user with the given user_id from the organization with the given organization_id.
    """

    class Arguments:
        user_id         = graphene.String(required=True)
        organization_id = graphene.String(required=True)

    organization    = graphene.Field(lambda: Organization)
    ok              = graphene.Boolean()
    info_text       = graphene.String()
    status_code     = graphene.Int()

    @staticmethod
    def mutate(self, info, user_id, organization_id):
        # Check if user is authorised
        try:
            session_user_id = session['user_id']
        except:
            return remove_user_from_organization(ok=False, info_text="Keine valide session vorhanden", status_code=419)
        
        if not is_authorised(userRights.organization_admin, session_user_id, organization_id=organization_id):
            return remove_user_from_organization(ok=False, info_text=reject_message, status_code=403)
        


        try:
            user = UserModel.query.filter(UserModel.user_id == user_id).first()
            organization = OrganizationModel.query.filter(OrganizationModel.organization_id == organization_id).first()

            if not user or not organization:
                return remove_user_from_organization(ok=False, info_text="User oder Organisation existieren nicht.", status_code=404)

            # falls der User orga_admin oder höher, ist kann er nicht entfernt werden
            for organization in user.organizations:
                if organization.organization_id == organization_id:
                    if organization.rights.value <= userRights.organization_admin:
                        return remove_user_from_organization(ok=False, info_text="User hat zu hohe Rechte um entfernt zu werden", status_code=403)

            organization.remove_user(user)
            db.commit()
            return remove_user_from_organization(ok=True, info_text="User erfolgreich aus der Organisation entfernt.", organization=organization, status_code=200)
        except Exception as e:
            print(e)
            tb = traceback.format_exc()
            return remove_user_from_organization(ok=False, info_text="Etwas hat nicht funktioniert. " + str(e) + "\n" + tb, status_code=500)


class update_user_rights(graphene.Mutation):
    """
    Updates the rights for the given user in the organization.
    """

    class Arguments:
        organization_id = graphene.String(required=True)
        user_id         = graphene.String(required=True)
        new_rights      = graphene.Int(required=True) or graphene.String(required=True)

    organization    = graphene.Field(lambda: Organization)
    ok              = graphene.Boolean()
    info_text       = graphene.String()
    status_code     = graphene.Int()

    @staticmethod
    def mutate(self, info, user_id, organization_id, new_rights):
        # Check if user is authorised
        try:
            session_user_id = session['user_id']
        except:
            return update_user_rights(ok=False, info_text="Keine valide session vorhanden", status_code=419)

        if not is_authorised(userRights.organization_admin, session_user_id, organization_id=organization_id):
            return update_user_rights(ok=False, info_text=reject_message, status_code=403)
            


        try:
            user = UserModel.query.filter(UserModel.user_id == user_id).first()
            organization = OrganizationModel.query.filter(OrganizationModel.organization_id == organization_id).first()

            if not user or not organization:
                return update_user_rights(ok=False, info_text="Benutzer oder Organisation existieren nicht.", status_code=404)

            # solange die neuen Rechte nicht die eines organization_admin überschreiten
            if new_rights != userRights.system_admin:
                for organization in user.organizations:
                    if organization.organization_id == organization_id:
                        organization.rights = new_rights
                        break

                db.commit()
                return update_user_rights(ok=True, info_text="Benutzerrechte erfolgreich angepasst.", organization=organization, status_code=200)
            else:
                return update_user_rights(ok=False, info_text="Nicht genügend Rechte.", status_code=403)
        except Exception as e:
            print(e)
            tb = traceback.format_exc()
            return update_user_rights(ok=False, info_text="Etwas ist schiefgelaufen. " + str(e), status_code=500)


class get_max_deposit(graphene.Mutation):
    """
    gets the max deposit for the given organization and user right
    """

    class Arguments:
        organization_id = graphene.String(required=True)
        user_right      = graphene.String(required=True)

    max_deposit = graphene.Int()
    ok          = graphene.Boolean()
    info_text   = graphene.String()
    status_code = graphene.Int()

    @staticmethod
    def mutate(self, info, organization_id, user_right):
        # Check if user is authorised
        try:
            session_user_id = session['user_id']
        except:
            return get_max_deposit(ok=False, info_text="Keine valide session vorhanden", status_code=419)
        
        if not is_authorised(userRights.organization_admin, session_user_id, organization_id=organization_id):
            return get_max_deposit(ok=False, info_text=reject_message, status_code=403)
        
        try:
            max_deposit = OrganizationModel.query.filter(OrganizationModel.organization_id == organization_id).first().get_max_deposit(user_right)
            return get_max_deposit(ok=True, info_text="Max Deposit erfolgreich abgefragt.", max_deposit=max_deposit, status_code=200)
        except Exception as e:
            print(e)
            tb = traceback.format_exc()
            return get_max_deposit(ok=False, info_text="Etwas ist schiefgelaufen. " + str(e), status_code=500)
        

class set_max_deposit(graphene.Mutation):
    """
    sets the max deposit for the given organization and user right
    """

    class Arguments:
        organization_id = graphene.String(required=True)
        user_right      = graphene.String(required=True)
        max_deposit     = graphene.Int(required=True)

    ok          = graphene.Boolean()
    info_text   = graphene.String()
    status_code = graphene.Int()

    @staticmethod
    def mutate(self, info, organization_id, user_right, max_deposit):
        # Check if user is authorised
        try:
            session_user_id = session['user_id']
        except:
            return set_max_deposit(ok=False, info_text="Keine valide session vorhanden", status_code=419)
        
        if not is_authorised(userRights.organization_admin, session_user_id, organization_id=organization_id):
            return set_max_deposit(ok=False, info_text=reject_message, status_code=403)
        
        try:
            organization = OrganizationModel.query.filter(OrganizationModel.organization_id == organization_id).first()
            organization.set_max_deposit(user_right, max_deposit)
            
            db.commit()
            return set_max_deposit(ok=True, info_text="Max Deposit erfolgreich gesetzt.", status_code=200)
        except Exception as e:
            print(e)
            tb = traceback.format_exc()
            return set_max_deposit(ok=False, info_text="Etwas ist schiefgelaufen. " + str(e), status_code=500)


class delete_organization(graphene.Mutation):
    """
    Deletes the organization with the given organization_id.
    """

    class Arguments:
        organization_id = graphene.String(required=True)

    ok          = graphene.Boolean()
    info_text   = graphene.String()
    status_code = graphene.Int()

    @staticmethod
    def mutate(self, info, organization_id):
        # Check if user is authorised
        try:
            session_user_id = session['user_id']
        except:
            return delete_organization(ok=False, info_text="Keine valide session vorhanden", status_code=419)
        
        if not is_authorised(userRights.system_admin, session_user_id, organization_id=organization_id):
            return delete_organization(ok=False, info_text=reject_message, status_code=403)
        
        organization = OrganizationModel.query.filter(
            OrganizationModel.organization_id == organization_id).first()

        if organization:
            db.delete(organization)
            db.commit()
            return delete_organization(ok=True, info_text="Organisation erfolgreich entfernt.", status_code=200)
        else:
            return delete_organization(ok=False, info_text="Organisation konnte nicht entfernt werden.", status_code=404)
