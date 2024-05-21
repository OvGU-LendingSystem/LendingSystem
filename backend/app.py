from flask_graphql import GraphQLView
from config import app, db
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

# allows user to stay logged in even after refresh
# user_id will not be removed from session until a request is made to /logout
# @app.route("/check_session", methods=['GET'])
# def check_session():
#     user = User.query.filter(User.id == session.get('user_id')).first()
#     if not user:
#         return make_response({'error': "Unautorisiert: Du musst eingeloggt sein, um diese Anfrage zu machen"}, 401)
#     else:
#         return make_response(user.to_dict(), 200)
#
# @app.route("/signUp", methods=['POST'])
# def sign_up():
#     json = request.get_json()
#     try:
#         user = User(
#             email = json['email'],
#             first_name = json['first_name'],
#             last_name = json['last_name'],
#         )
#         user.password_hash(json['password'])
#         db.session.add(user)
#         db.session.commit()
#         session['user_id'] = user.id
#
#         return make_response(user.to_dict(), 201)
#     except Exception as e:
#         return make_response({'errors': str(e)}, 422)
#
# @app.route("/login", methods=['POST'])
# def login():
#     email = request.get_json()['email']
#     user = User.query.filter(User.email == email).first()
#     password = request.get_json()['password']
#
#     if not user:
#         response_body = {'error': "Nutzer nicht gefunden"}
#         status_code = 400
#     else:
#         if user.authenticate(password):
#             session['user_id'] = user.id
#             response_body = user.to_dict()
#             status_code = 200
#         else:
#             response_body = {'error': "Ungültige Email oder ungültiges Passwort!"}
#             status_code = 401
#     return make_response(response_body, status_code)
#
# @app.route("/logout", methods=['DELETE'])
# def delete():
#     session['user_id'] = None
#     return {}, 204

# for local testing
if __name__ == '__main__':
    app.run()
