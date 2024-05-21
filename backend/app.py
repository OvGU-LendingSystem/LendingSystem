from urllib import request

from flask import session
from flask_graphql import GraphQLView
from sqlalchemy.event import api

from config import app, db
from schema import schema
from models import *

app.add_url_rule(
    '/graphql',
    view_func=GraphQLView.as_view(
        'graphql',
        schema=schema,
        graphiql=True
    )
)


@app.teardown_appcontext
def shutdown_session(exception=None):
    db.remove()


class check_session(resource):
    # allows user to stay logged in even after refresh
    # user_id will not be removed from session until a request is made to /logout

    def get(self):
        user = User.query.filter(User.user_id == session.get('user_id')).first()
        if not user:
            return make_response({'error': "Unautorisiert: Du musst eingeloggt sein, um diese Anfrage zu machen"}, 401)
        else:
            return make_response(user.to_dict(), 200)


api.add_resource(check_session, '/check_session', endpoint = 'check_session')

class sign_up(resource):

    def post(self):
        json = request.get_json()
        try:
            user = Person(
                email = json['email'],
                first_name = json['first_name'],
                last_name = json['last_name'],
            )
            user.password_hash = json['password']
            db.session.add(user)
            db.session.commit()
            session['user_id'] = user.user_id

            return make_response(user.to_dict(), 201)
        except Exception as e:
            return make_response({'errors': str(e)}, 422)


api.add_resource(sign_up, '/sign_up', endpoint = 'sign_up')

class login(resource):
    def post(self):
        email = request.get_json()['email']
        user = User.query.filter(User.email == email).first()
        password = request.get_json()['password']

        if not user:
            response_body = {'error': "Nutzer nicht gefunden"}
            status_code = 400
        else:
            if user.authenticate(password):
                session['user_id'] = user.user_id
                response_body = user.to_dict()
                status_code = 200
            else:
                response_body = {'error': "Ungültige Email oder ungültiges Passwort!"}
                status_code = 401
        return make_response(response_body, status_code)


api.add_resource(login, '/login', endpoint = 'login')

class logout(resource):
    def delete(self):
        session['user_id'] = None
        return {}, 204


api.add_resource(logout, '/logout', endpoint = 'logout')

# for local testing
if __name__ == '__main__':
    app.run()
