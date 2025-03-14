from flask import session
import graphene
from graphene_file_upload.scalars import Upload
import os
import time
import traceback

from authorization_check import is_authorised, reject_message
from config import db, pdf_directory, picture_directory
from models import userRights
from schema import File, FileModel, GroupModel, OrganizationModel, PhysicalObjectModel

##################################
# Upload for Files               #
##################################
class upload_file(graphene.Mutation):
    """
    Uploads a file to the server and creates a new File object in the database.
    """

    class Arguments:
        phys_picture_id     = graphene.String()
        phys_manual_id      = graphene.String()
        organization_id     = graphene.String()
        group_id            = graphene.String()
        show_index          = graphene.Int()
        file                = Upload(required=True)

    file        = graphene.Field(lambda: File)
    ok          = graphene.Boolean()
    info_text   = graphene.String()
    status_code = graphene.Int()

    @staticmethod
    def mutate(self, info, file, phys_picture_id=None, phys_manual_id=None, organization_id=None, group_id=None, show_index=None):
        # Check if user is authorised
        try:
            session_user_id = session['user_id']
        except:
            return upload_file(ok=False, info_text="Keine valide session vorhanden", status_code=419)

        if not is_authorised(userRights.inventory_admin, session_user_id):
            return upload_file(ok=False, info_text=reject_message, status_code=403)



        try:
            physical_object = None
            organization = None
            group = None

            if (phys_picture_id):   physical_object = PhysicalObjectModel.query.filter(
                PhysicalObjectModel.phys_id == phys_picture_id).first()
            if (phys_manual_id):    physical_object = PhysicalObjectModel.query.filter(
                PhysicalObjectModel.phys_id == phys_manual_id).first()
            organization = OrganizationModel.query.filter(OrganizationModel.organization_id == organization_id).first()
            group = GroupModel.query.filter(GroupModel.group_id == group_id).first()

            type = None
            pictureFileExtensions = ['jpg', 'jpeg', 'png', 'svg']
            pdfFileExtensions = ['pdf']
            if file.filename.split('.')[-1] in pictureFileExtensions:
                type = 'picture'
            elif file.filename.split('.')[-1] in pdfFileExtensions:
                type = 'pdf'

            if type == None:
                return upload_file(ok=False, info_text="File type not supported.")

            file_name = file.filename
            file_name = file_name.replace(" ", "_")
            time_stamp = str(time.time())
            file_name = time_stamp + "_" + file_name
            if type == 'picture':
                # Prüfe Dateigröße
                file.seek(0, os.SEEK_END)
                file_size = file.tell()
                file.seek(0)

                if file_size > (100 * 1024 * 1024): #100MB
                    return upload_file(ok=False, info_text="Die Datei ist zu groß. Maximal erlaubt sind 100 MB.")
                
                file.save(os.path.join(picture_directory, file_name))
            elif type == 'pdf':
                file.save(os.path.join(pdf_directory, file_name))

            file = FileModel(path=file_name,
                             organization=organization,
                             group=group,
                             file_type=type)

            if physical_object and phys_picture_id:
                physical_object.pictures.append(file)
            if physical_object and phys_manual_id:
                physical_object.manual.append(file)
            if organization:
                organization.agb = file
            if group:
                group.pictures.append(file)
            if show_index:
                file.show_index = show_index

            db.add(file)
            db.commit()

            return upload_file(ok=True, info_text="File uploaded successfully.", file=file, status_code=200)
        except Exception as e:
            print(e)
            tb = traceback.format_exc()
            return upload_file(ok=False, info_text="Error uploading file. " + str(e) + "\n" + tb, status_code=500)


class update_file(graphene.Mutation):
    """
    Updates the file with the given file_id.
    """

    class Arguments:
        file_id     = graphene.String(required=True)

        show_index  = graphene.Int()

    file        = graphene.Field(lambda: File)
    ok          = graphene.Boolean()
    info_text   = graphene.String()
    upload_file = graphene.Int()

    @staticmethod
    def mutate(self, info, file_id, show_index=None):
        # Check if user is authorised
        try:
            session_user_id = session['user_id']
        except:
            return update_file(ok=False, info_text="Keine valide session vorhanden", upload_file=419)

        if not is_authorised(userRights.inventory_admin, session_user_id):
            return update_file(ok=False, info_text=reject_message, upload_file=403)



        try:
            file = FileModel.query.filter(FileModel.file_id == file_id).first()

            if not file:
                return update_file(ok=False, info_text="File not found.", status_code=404)

            if show_index:
                file.show_index = show_index

            db.commit()
            return update_file(ok=True, info_text="File updated successfully.", file=file, status_code=200)

        except Exception as e:
            print(e)
            return update_file(ok=False, info_text="Error updating file. " + str(e), status_code=500)


class delete_file(graphene.Mutation):
    """
    Deletes the file with the given file_id from the server and the database.
    """

    class Arguments:
        file_id = graphene.String(required=True)

    ok          = graphene.Boolean()
    info_text   = graphene.String()
    status_code = graphene.Int()

    @staticmethod
    def mutate(self, info, file_id):
        # Check if user is authorised
        try:
            session_user_id = session['user_id']
        except:
            return delete_file(ok=False, info_text="Keine valide session vorhanden", status_code=419)
        
        if not is_authorised(userRights.inventory_admin, session_user_id):
            return delete_file(ok=False, info_text=reject_message, status_code=403)



        file = FileModel.query.filter(FileModel.file_id == file_id).first()
        if file:
            if file.file_type == File.FileType.picture:
                path = os.path.join(picture_directory, file.path)
            else:
                path = os.path.join(pdf_directory, file.path)

            if os.path.isfile(path):
                os.remove(path)

            db.delete(file)
            db.commit()
            return delete_file(ok=True, info_text="File successfully removed.", status_code=200)
        else:
            return delete_file(ok=False, info_text="File not found.", status_code=500)