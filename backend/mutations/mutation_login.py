from argon2 import PasswordHasher
from argon2.exceptions import VerificationError, InvalidHashError
from flask import session
import graphene

from config import db
from schema import UserModel

##################################
# Mutations for Users login      #
##################################
class login(graphene.Mutation):
    class Arguments:
        email       = graphene.String(required=True)
        password    = graphene.String(required=True)

    ok          = graphene.Boolean()
    info_text   = graphene.String()
    status_code = graphene.Int()

    @staticmethod
    def mutate(self, info, email, password):
        user = UserModel.query.filter(UserModel.email == email).first()

        if not user:
            return login(ok=False, info_text="Der Nutzer mit der angegeben E-Mail existiert nicht.", status_code=404)
        else:
            try:
                ph = PasswordHasher()
                ph.verify(user.password_hash, password)
            except VerificationError:
                return login(ok=False, info_text="Die Anmeldung ist fehlgeschlagen!", status_code=401)
            except InvalidHashError:
                return login(ok=False, info_text="Die Anmeldung ist fehlgeschlagen!", status_code=401)

            if ph.check_needs_rehash(user.password_hash):
                user.password_hash = ph.hash(password)
                db.add(user)
                db.commit()

            session['user_id'] = user.user_id
            return login(ok=True, info_text="Die Anmeldung war erfolgreich!", status_code=200)

class check_session(graphene.Mutation):
    ok          = graphene.Boolean()
    info_text   = graphene.String()
    status_code = graphene.Int()
    user_id     = graphene.String()

    @staticmethod
    def mutate(self, info):
        user_id = session.get('user_id')
        if user_id:
            return check_session(ok=True, info_text='Es liegt eine gültige Session vor.', user_id=user_id, status_code=200)
        else:
            return check_session(ok=False, info_text='Unautorisierter Zugriff.', user_id=None, status_code=404)

class logout(graphene.Mutation):
    ok          = graphene.Boolean()
    info_text   = graphene.String()
    status_code = graphene.Int()

    @staticmethod
    def mutate(self, info):
        if session.get('user_id'):
            session.pop('user_id')
            return logout(ok=True, info_text='Logout erfolgreich!', status_code=200)
        else:
            return logout(ok=False, info_text='User nicht angemeldet.', status_code=404)
