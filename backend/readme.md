# models.py
```python
from config import db
from sqlalchemy import *
from sqlalchemy.orm import *
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()
Base.query = db.query_property()

book_author = Table(
    'book_authors',
    Base.metadata,
    Column('author_id', ForeignKey('authors.id'), primary_key=True),
    Column('book_id', ForeignKey('books.id'), primary_key=True),
    extend_existing=True,
)

class Book(Base):
    __tablename__ = 'books'

    id = Column(Integer(), primary_key=True)
    title = Column(String(20))

    authors = relationship('Author', secondary=book_author, back_populates='books')

class Author(Base):
    __tablename__ = 'authors'

    id = Column(Integer(), primary_key=True)
    first_name = Column(String(20))
    last_name = Column(String(20))

    books = relationship('Book', secondary=book_author, back_populates='authors')
```
# schema.py
```python
import graphene
from graphene import relay
from graphene_sqlalchemy import SQLAlchemyObjectType, SQLAlchemyConnectionField
from models import  Book as BooksModel, Author as AuthorModel
from config import db

class Book(SQLAlchemyObjectType):
    class Meta:
        model = BooksModel
        interfaces = (relay.Node, )

class Author(SQLAlchemyObjectType):
    class Meta:
        model = AuthorModel
        interfaces = (relay.Node, )

# Api Queries go here
class Query(graphene.ObjectType):
    node = relay.Node.Field()

    hello = graphene.String(description = "Function call")

    def resolve_hello(self, info):
        return "Hello World!"

    all_authors = SQLAlchemyConnectionField(Author.connection, sort=None)
    all_books = SQLAlchemyConnectionField(Book.connection)

schema = graphene.Schema(query=Query)
```

# Create tables and insert data
```python
from config import engine, db
from models import *

Base.metadata.create_all(bind=engine)

der_austronaut = Book(title = "Der Astronaut")
der_marsianer = Book(title = "Der Marsianer")
Hyperoion = Book(title = "Die Hyperion Gesänge")
db.add(der_austronaut)
db.add(der_marsianer)
db.add(Hyperoion)
andy = Author(first_name = "Andy", last_name = "Weir", books = [der_austronaut, der_marsianer])
dan = Author(first_name = "Dan", last_name = "Simons", books = [Hyperoion, der_marsianer])
db.add(andy)
db.add(dan)

db.commit()
```
# API Query Example

```graphql
query filterPhysObjects{
    filterPhysicalObjects(tags:["Game", "Hardware"], faults:"none", maxDeposit:5){
        ...phyobj
    }
}


fragment phyobj on PhysicalObject{
    physId
    invNumInternal
    invNumExternal
    deposit
    picPath
    storageLocation
    faults
    name
    description
    tags {
        edges {
            node {
                name
            }
        }
    }
    orders{
        edges{
            node{
                orderId
            }
        }
    }
    groups{
        edges{
            node{
                name
            }
        }
    }
    organizations{
        edges{
            node{
                name
            }
        }
    }
}
```