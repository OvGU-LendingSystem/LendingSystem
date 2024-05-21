import graphene
from backend.config import bcrypt
from backend.models import User

def password_hash(password):
    return bcrypt.generate_password_hash(
        password.encode('utf-8')
    )

class sign_up(graphene.Mutation):
    class Arguments:
        email = graphene.String(required=True)
        last_name = graphene.String(required=True)
        first_name = graphene.String(required=True)
        password = graphene.String(required=True)

    ok = graphene.Boolean()
    user = graphene.Field(lambda: User)

    def mutate(self, info, email, last_name, first_name, password):
        password_hashed = password_hash(password).decode('utf-8')
        user = User(first_name=first_name, last_name=last_name, email=email, password_hash=password_hashed)
        if user:
            ok = True
        else:
            ok = False
        return sign_up(ok=ok)


# class login(graphene.Mutation):
#     class Arguments:
#         email = graphene.String(required=True)
#     def authenticate(self, password):
#         return bcrypt.check_password_hash(
#             self.password_hash, password.encode('utf-8')
#         )


class MyMutations(graphene.ObjectType):
    signup = sign_up.Field()
