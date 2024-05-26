import email
import os
import time

import graphene
from graphene_file_upload.scalars import Upload
from config import bcrypt, db, picture_directory
from models import User as UserModel


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
        password_hashed = bcrypt.generate_password_hash(password.encode('utf-8')).decode('utf-8')
        user = UserModel(first_name=first_name, last_name=last_name, email=email, password_hash=password_hashed)

        try:
            db.add(user)
            db.commit()
        except Exception as e:
            print(e)
            return sign_up(ok=False, info_text="Die angegebene E-Mail wird bereits verwendet.")
        
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
            ok = False
            info_text = "Der Nutzer mit der angegeben E-Mail existiert nicht."
            return login(ok=ok, info_text=info_text)
        else:
            authentication = bcrypt.check_password_hash(user.password_hash, password.encode('utf-8'))
            if authentication:
                ok = True
                info_text = "Die Anmeldung war erfolgreich."
            else:
                ok = False
                info_text = "Die Anmeldung ist fehlgeschlagen."
            return login(ok=ok, info_text=info_text)
        
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
    signup  = sign_up.Field()
    login   = login.Field()
    upload  = upload_mutation.Field()