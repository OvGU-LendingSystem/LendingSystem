from flask import session
import graphene
import traceback

from authorization_check import is_authorised, reject_message
from config import db
from models import userRights
from schema import Group, GroupModel, PhysicalObjectModel

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
    status_code = graphene.Int()

    @staticmethod
    def mutate(self, info, name, physicalobjects=None):
        # Check if user is authorised
        try:
            session_user_id = session['user_id']
        except:
            return create_group(ok=False, info_text="Keine valide session vorhanden", status_code=419)
        
        if not is_authorised(userRights.inventory_admin, session_user_id):
            return create_group(ok=False, info_text=reject_message, status_code=403)



        try:
            group = GroupModel(name=name)

            if physicalobjects:
                db_physicalobjects = db.query(PhysicalObjectModel).filter(
                    PhysicalObjectModel.phys_id.in_(physicalobjects)).all()
                group.physicalobjects = db_physicalobjects

            db.add(group)

            db.commit()
            return create_group(ok=True, info_text="Gruppe erfolgreich erstellt.", group=group, status_code=200)

        except Exception as e:
            print(e)
            tb = traceback.format_exc()
            return create_group(ok=False, info_text="Fehler beim Erstellen der Gruppe. " + str(e) + " traceback: " + str(tb), status_code=500)


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
    status_code = graphene.Int()

    @staticmethod
    def mutate(self, info, group_id, name=None, physicalobjects=None):
        # Check if user is authorised
        try:
            session_user_id = session['user_id']
        except:
            return update_group(ok=False, info_text="Keine valide session vorhanden", status_code=419)
        
        if not is_authorised(userRights.inventory_admin, session_user_id, group_id=group_id):
            return update_group(ok=False, info_text=reject_message, status_code=403)
        

        
        try:
            group = GroupModel.query.filter(GroupModel.group_id == group_id).first()

            if not group:
                return update_group(ok=False, info_text="Gruppe \"" + name + "\" nicht gefunden.", status_code=404)
            if physicalobjects:
                db_physicalobjects = db.query(PhysicalObjectModel).filter(
                    PhysicalObjectModel.phys_id.in_(physicalobjects)).all()
                group.physicalobjects = db_physicalobjects
            if name:
                group.name = name

            db.commit()
            return create_group(ok=True, info_text="Gruppe erfolgreich aktualisiert.", group=group, status_code=200)

        except Exception as e:
            print(e)
            tb = traceback.format_exc()
            return create_group(ok=False, info_text="Fehler beim Aktualisieren der Gruppe. " + str(e) + " traceback: " + str(tb), status_code=500)


class delete_group(graphene.Mutation):
    """
    Deletes the group with the given group_id.
    """

    class Arguments:
        group_id = graphene.String(required=True)

    ok          = graphene.Boolean()
    info_text   = graphene.String()
    status_code = graphene.Int()

    @staticmethod
    def mutate(self, info, group_id):
        # Check if user is authorised
        try:
            session_user_id = session['user_id']
        except:
            return delete_group(ok=False, info_text="Keine valide session vorhanden", status_code=419)
        
        if not is_authorised(userRights.inventory_admin, session_user_id, group_id=group_id):
            return delete_group(ok=False, info_text=reject_message, status_code=403)
        


        group = GroupModel.query.filter(GroupModel.group_id == group_id).first()

        if group:
            db.delete(group)
            db.commit()
            return delete_group(ok=True, info_text="Gruppe erfolgreich entfernt.", status_code=200)
        else:
            return delete_group(ok=False, info_text="Gruppe konnte nicht entfernt werden. Group ID not found.", status_code=404)
