from flask import session
import graphene
import traceback

from authorization_check import is_authorised, reject_message
from config import db
from models import userRights
from schema import Group, GroupModel, OrganizationModel, PhysicalObjectModel, FileModel, TagModel

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
        organization_id = graphene.String(required=True)
        description     = graphene.String()

        pictures        = graphene.List(graphene.String)
        physicalobjects = graphene.List(graphene.String)
        tags            = graphene.List(graphene.String)


    group       = graphene.Field(lambda: Group)
    ok          = graphene.Boolean()
    info_text   = graphene.String()
    status_code = graphene.Int()

    @staticmethod
    def mutate(self, info, name, organization_id, description=None, pictures=None, physicalobjects=None, tags=None):
        # Check if user is authorised
        try:
            session_user_id = session['user_id']
        except:
            return create_group(ok=False, info_text="Keine valide session vorhanden", status_code=419)
        
        if not is_authorised(userRights.inventory_admin, session_user_id, organization_id=organization_id):
            return create_group(ok=False, info_text=reject_message, status_code=403)



        try:
            organization = db.query(OrganizationModel).filter(OrganizationModel.organization_id == organization_id).first()
            group = GroupModel(
                name = name,
                organization=organization
            )

            if description:
                group.description = description

            if pictures:
                db_pictures = db.query(FileModel).filter(FileModel.file_id.in_(pictures)).all()
                group.pictures = db_pictures

            if physicalobjects:
                db_physicalobjects = db.query(PhysicalObjectModel).filter(
                    PhysicalObjectModel.phys_id.in_(physicalobjects)).all()
                
                # Check if all physical objects are from the organization
                for phys_obj in db_physicalobjects:
                    if phys_obj.organization_id != organization_id:
                        return create_group(ok=False, info_text="Nicht alle Physical Objects sind in der Organisation.", status_code=403)
                
                group.physicalobjects = db_physicalobjects

            if tags:
                db_tags = db.query(TagModel).filter(TagModel.tag_id.in_(tags)).all()
                group.tags = db_tags

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
        description     = graphene.String()

        physicalobjects = graphene.List(graphene.String)
        pictures        = graphene.List(graphene.String)
        tags            = graphene.List(graphene.String)

    group       = graphene.Field(lambda: Group)
    ok          = graphene.Boolean()
    info_text   = graphene.String()
    status_code = graphene.Int()

    @staticmethod
    def mutate(self, info, group_id, name=None, description=None, physicalobjects=None, pictures=None, tags=None):
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
                organization = group.organization
                db_physicalobjects = db.query(PhysicalObjectModel).filter(PhysicalObjectModel.phys_id.in_(physicalobjects)).all()
                
                # Check if all physical objects are from the organization
                for phys_obj in db_physicalobjects:
                    if phys_obj.organization_id != organization.organization_id:
                        return update_group(ok=False, info_text="Nicht alle Physical Objects sind in der Organisation.", status_code=403)

                group.physicalobjects = db_physicalobjects

            if name:
                group.name = name
            
            if description:
                group.description = description
            
            if pictures:
                db_pictures = db.query(FileModel).filter(FileModel.file_id.in_(pictures)).all()
                group.pictures = db_pictures

            if tags:
                print(tags)
                db_tags = db.query(TagModel).filter(TagModel.tag_id.in_(tags)).all()
                print(db_tags)
                group.tags = db_tags

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
