# LendingSystem
## Config file
- Create a config.ini file in the root directory of the project
  ```ini
  [DB]
  db_LendingSystem_password = <db password for administrator>

  [PATHS]
  root_directory = <directory to project location inclusive LendingSystem directory>
  picture_directory = pictures
  ```

## For Backend
### SQLAlchemy and Graphene with SQLAlchemy support
```shell
pip install SQLAlchemy
pip install graphene_sqlalchemy
```
### Install Flask and GraphQL Flask
```shell
pip install Flask
pip install Flask-GraphQL
pip install flask_cors
pip install graphene-file-upload
```  
### Install other packages
```shell
pip install pymysql 
pip install alembic
pip install bcrypt
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
