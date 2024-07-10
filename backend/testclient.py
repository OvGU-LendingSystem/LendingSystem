from gql import gql, Client
from gql.transport.aiohttp import AIOHTTPTransport
import aiohttp

# _transport = AIOHTTPTransport(url='http://localhost:5000/graphql')
_transport = AIOHTTPTransport(url='http://hades.fritz.box/api/graphql')

client = Client(
    transport=_transport,
    fetch_schema_from_transport=True,
)

query_tag = gql('''
    query {
        filterTags {
            tagId
            name
        }
    }
''')

login = gql(
"""
mutation {
    login (
        email: "tony.stark@gmail.com"
        password: "ironman"
    ) {
        ok
        infoText
    }
}
""")

create_organization = gql(
'''
    mutation {
        createOrganization (
            name: "fara"
            location: "Uni"
        ) {
            ok
            infoText
        }
    }
''')

upload_file = gql(
    """
    mutation ($file: Upload!) {
        uploadFile(
            file: $file
            organizationId: "00000000-0000-0000-0000-000000000003"
        ) {
            ok
            infoText
        }
    }
    """
)

file = open("C:\\Users\\User\\Downloads\\Lorem_ipsum.pdf", "rb")
params = {"file": file}

upload_res = client.execute(upload_file, variable_values=params, upload_files = True)
print(upload_res)