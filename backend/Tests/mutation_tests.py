from Tests.utils import to_std_dicts
import graphene


#
#  Test Create User Mutation
#
def test_create_user(client, test_db):
    # Test Create User Mutation WITHOUT optional params
    query = '''
    mutation createUser($email: String!, $lastName: String!, $firstName: String!, $password: String!) {
      createUser(email: $email, lastName: $lastName, firstName: $firstName, password: $password) {
        ok
        infoText
        user {
          id
          email
          firstName
          lastName
        }
      }
    }
    '''
    variables = {
        'email': 'test@prhn.dynpc.net',
        'lastName': 'Doe',
        'firstName': 'John',
        'password': 'sicheresPasswort123'
    }

    executed = execute_mutation(client, query, variables)
    result = to_std_dicts(executed)
    expected = {
        'data': {
            'createUser': {
                'ok': True,
                'infoText': 'Der Nutzer wurde erfolgreich angelegt.',
                'user': {
                    'email': 'test@prhn.dynpc.net',
                    'firstName': 'John',
                    'lastName': 'Doe'
                }
            }
        }
    }

    msg = "Create User Mutation with NO optional params failed"
    assert (result == expected), msg

    # Test Create User Mutation with ALL params
    variables = {
        'email': 'test2@prhn.dynpc.net',
        'lastName': 'Harry',
        'firstName': 'Potter',
        'password': 'sicheresPasswort123',
        'country': 'England',
        'city': 'London',
        'postcode': 12345,
        'street': 'Main Street',
        'house_number': 10,
        'phone_number': 123456789,
        'matricle_number': 987654321
    }

    executed = execute_mutation(client, query, variables)
    result = to_std_dicts(executed)
    expected = {
        'data': {
            'createUser': {
                'ok': True,
                'infoText': 'Der Nutzer wurde erfolgreich angelegt.',
                'user': {
                    'email': 'test2@prhn.dynpc.net',
                    'firstName': 'Harry',
                    'lastName': 'Potter'
                }
            }
        }
    }

    msg = "Create User Mutation with ALL params failed"
    assert (result == expected), msg

    # Test Create User Mutation with duplicate email
    variables = {
        'email': 'test@prhn.dynpc.net',  # Same email as the first user
        'lastName': 'Doe',
        'firstName': 'John',
        'password': 'sicheresPasswort123'
    }

    executed = execute_mutation(client, query, variables)
    result = to_std_dicts(executed)
    expected = {
        'data': {
            'createUser': {
                'ok': False,
                'infoText': 'Die angegebene E-Mail wird bereits verwendet.',
                'user': None
            }
        }
    }

    msg = "Create User Mutation with duplicate email failed"
    assert (result == expected), msg

    # Test Create User Mutation with missing required fields
    variables = {
        'email': 'test3@prhn.dynpc.net',
        'lastName': 'Doe',
        # Missing firstName and password
    }

    executed = execute_mutation(client, query, variables)
    errors = executed.get('errors')

    assert errors is not None
    assert 'firstName' in errors[0]['message']
    assert 'password' in errors[0]['message']
