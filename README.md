# LendingSystem

## For Backend
### Create a virtualenv to isolate our package dependencies locally (optional)
virtualenv env
source env/bin/activate  # On Windows use `env\Scripts\activate`

### SQLAlchemy and Graphene with SQLAlchemy support
- pip install SQLAlchemy
- pip install graphene_sqlalchemy

### Install Flask and GraphQL Flask for exposing the schema through HTTP
- pip install Flask
- pip install Flask-GraphQL
- pip install flask_cors

### For local developing
- With connected VPN you can connect your current session to the server DB:
- install pymysql:
- ```shell
  pip install pymysql
  ```
- you need to place a config.ini file in the root directory of the project
  ```ini
  [DB]
  db_LendingSystem_password = <db password for administrator>
  ```
- Create all Tables from models:
  ```python
  from config import engine, db
  from models import *

  Base.metadata.create_all(bind=engine)

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
