# LendingSystem
## Config file
- Create a backend-config.ini file in the backend directory of the project
  ```ini
  [DB]
  db_LendingSystem_Database = <Database for the application (LendingSystem)>
  db_LendingSystem_User     = <User for Database application>
  db_LendingSystem_Password = <Password for given User>

  [PATHS]
  root_directory    = <directory to project location inclusive LendingSystem directory>
  picture_directory = pictures
  pdf_directory     = pdfs

  [SECRET_KEY]
  secret_key = <secret key for session management>

  [TESTING]
  testing = <0 for production / 1 for testing>

  [MAIL]
  mail_server_address = mail.prhn.dynpc.net
  mail_server_port = 465
  use_ssl = 0
  sender_email_address = noreply@prhn.dynpc.net
  sender_email_password = <Password for noreply>
  ```

- For docker create a backend.env file in the LendingSystem directory
```env
db_LendingSystem_Database=
db_LendingSystem_Port=
db_LendingSystem_User=
db_LendingSystem_Password=
root_directory=
picture_directory=
pdf_directory=
secret_key=
mail_server_address=
mail_server_port=
use_ssl=
sender_email_address=
sender_email_password=
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
