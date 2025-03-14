# LendingSystem
## Config file
- create a backend.env file in the LendingSystem directory
```env
# Config file for the LendingSystem 

################################
# Config of the mysql database #
################################
database_host=
database_name=
database_port=

# mysql user needs rights to create tables and add, edit and deletes entries
database_user=

# define either the location for a database password file (for docker usage)
# or directly the password, leave the unused option empty

# location of the db password file -> simple text file with only the password in it
# database_password_location=/run/secrets/db-password # for the docker container 
database_password_location=../db-password.txt

# database password
database_password=

################################
# define paths for the storage #
# of files                     #
################################
# root_directory=/backend/ # for container usage
root_directory=../

picture_directory=pictures
pdf_directory=pdfs
template_directory=templates

################################
# flask session secret key     #
################################
secret_key=

################################
# config for the mail to send  #
# reminder and password reset  #
# mails                        #
################################
mail_server_address=
mail_server_port=
use_ssl= # 0 for no; 1 for yes
sender_email_address=
sender_email_password=

################################
# application settings         #
################################
root_user_name=root
root_user_password=Passw0rd!

timezone=Europe/Berlin
```
## For Backend
### Install requirements
```shell
pip install -r requirements.txt
```
### For local developing
- With connected VPN you can connect your current session to the server DB:

#### Database evolution
- Database migration with Alembic
  - Initialize Alembic; folder already in git, but ini file is not
    ```shell
    python - m alembic.config init alembic
    ```
  - Edit the alembic.ini file in the alembic directory to point to the database
    ```ini
    sqlalchemy.url = mysql+pymysql://administrator:<DB Password>@hades.fritz.box:3306/LendingSystem
    ```
  - Create a migration
    ```shell
    python - m alembic.config revision --autogenerate -m "Comment for the migration"
    ```
  - Run the migration
    ```shell
    python - m alembic.config upgrade head
    ```
  - Downgrade the migration
    ```shell
    python - m alembic.config downgrade <relative position / version code (first four characters)>
    ```

## For Frontend
### Successfully query request with apollo client
App.tsx
```typescript
import './App.css';
import React from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider, useQuery, gql } from '@apollo/client';

const client = new ApolloClient({
  uri: 'http://hades.fritz.box/api/graphql',
  cache: new InMemoryCache(),
});

const GET_LOCATIONS = gql`
  query {
    filterTags {
      tagId
      name
    }
  }
`;

function DisplayLocations() {
  const { loading, error, data } = useQuery(GET_LOCATIONS, { client });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message}</p>;

  return data.filterTags.map(({ tagId, name }: { tagId: number, name: string }) => (
    <div key={tagId}>
      <p>
        {tagId}: {name}
      </p>
    </div>
  ));
}

export default function App() {

  return (
    <div>
      <h2>My first Apollo app 🚀</h2>
      <br/>
      <DisplayLocations />
    </div>
  );
}	
