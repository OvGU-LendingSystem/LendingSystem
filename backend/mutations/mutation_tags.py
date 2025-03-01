from flask import session
import graphene
import traceback

from authorization_check import is_authorised, reject_message
from models import db, userRights
from schema import GroupModel, PhysicalObjectModel, Tag, TagModel

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
        groups          = graphene.List(graphene.String)

    tag         = graphene.Field(lambda: Tag)
    ok          = graphene.Boolean()
    info_text   = graphene.String()
    status_code = graphene.Int()

    @staticmethod
    def mutate(self, info, name, physicalobjects=None, groups=None):
        # Check if user is authorised
        try:
            session_user_id = session['user_id']
        except:
            return create_tag(ok=False, info_text="Keine valide session vorhanden", status_code=419)
        
        if not is_authorised(userRights.inventory_admin, session_user_id):
            return create_tag(ok=False, info_text=reject_message, status_code=403)



        try:
            tag = TagModel(name=name)

            if physicalobjects:
                db_physicalobjects = db.query(PhysicalObjectModel).filter(
                    PhysicalObjectModel.phys_id.in_(physicalobjects)).all()
                tag.physicalobjects = db_physicalobjects

            if groups:
                db_groups = db.query(GroupModel).filter(GroupModel.group_id.in_(groups)).all()
                tag.groups = db_groups

            db.add(tag)

            db.commit()
            return create_tag(ok=True, info_text="Tag erfolgreich erstellt.", tag=tag, status_code=200)

        except Exception as e:
            print(e)
            tb = traceback.format_exc()
            return create_tag(ok=False, info_text="Fehler beim Erstellen des Tags. " + str(e) + " traceback:  " + str(tb), status_code=500)


class update_tag(graphene.Mutation):
    """
    Updates content of the tag with the given tag_id.
    For Connections to physical objects use array of their String uuid
    """

    class Arguments:
        tag_id          = graphene.String(required=True)
        name            = graphene.String()

        physicalobjects = graphene.List(graphene.String)
        groups          = graphene.List(graphene.String)

    tag         = graphene.Field(lambda: Tag)
    ok          = graphene.Boolean()
    info_text   = graphene.String()
    status_code = graphene.Int()

    @staticmethod
    def mutate(self, info, tag_id, name=None, physicalobjects=None, groups=None):
        # Check if user is authorised
        try:
            session_user_id = session['user_id']
        except:
            return update_tag(ok=False, info_text="Keine valide session vorhanden", status_code=419)
        
        if not is_authorised(userRights.inventory_admin, session_user_id, tag_id=tag_id):
            return update_tag(ok=False, info_text=reject_message, status_code=403)



        try:
            tag = TagModel.query.filter(TagModel.tag_id == tag_id).first()

            if not tag:
                return update_tag(ok=False, info_text="Tag \"" + name + "\" nicht gefunden.", status_code=404)
            
            if physicalobjects:
                db_physicalobjects = db.query(PhysicalObjectModel).filter(
                    PhysicalObjectModel.phys_id.in_(physicalobjects)).all()
                tag.physicalobjects = db_physicalobjects

            if groups:
                db_groups = db.query(GroupModel).filter(GroupModel.group_id.in_(groups)).all()
                tag.groups = db_groups
            
            if name:
                tag.name = name

            db.commit()
            return update_tag(ok=True, info_text="Tag erfolgreich aktualisiert.", tag=tag, status_code=200)

        except Exception as e:
            print(e)
            tb = traceback.format_exc()
            return update_tag(ok=False, info_text="Fehler beim Aktualisieren des Tags. " + str(e) + " traceback:  " + str(tb), status_code=500)


class delete_tag(graphene.Mutation):
    """
    Deletes the tag with the given tag_id.
    """

    class Arguments:
        tag_id = graphene.String(required=True)

    ok          = graphene.Boolean()
    info_text   = graphene.String()
    status_code = graphene.Int()

    @staticmethod
    def mutate(self, info, tag_id):
        # Check if user is authorised
        try:
            session_user_id = session['user_id']
        except:
            return delete_tag(ok=False, info_text="Keine valide session vorhanden", status_code=419)
        
        if not is_authorised(userRights.inventory_admin, session_user_id, tag_id=tag_id):
            return delete_tag(ok=False, info_text=reject_message, status_code=403)



        tag = TagModel.query.filter(TagModel.tag_id == tag_id).first()

        if tag:
            db.delete(tag)
            db.commit()
            return delete_tag(ok=True, info_text="Tag erfolgreich entfernt.", status_code=200)
        else:
            return delete_tag(ok=False, info_text="Tag konnte nicht entfernt werden.", status_code=404)
