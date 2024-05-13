from config import db
from sqlalchemy import *
from sqlalchemy.orm import *
from sqlalchemy.ext.declarative import declarative_base

# standard, something for querying
Base = declarative_base()
Base.query = db.query_property()

# Classes go here ...
# Like this ...
# class Contact(Base):
#     __tablename__   = "contacts"
#     id              = Column(Integer, primary_key=True)
#     first_name      = Column(String(80), unique = False, nullable = False)
#     last_name       = Column(String(80), unique = False, nullable = False)
#     email           = Column(String(120), unique = True, nullable = False)


class Tag(Base):
    """
    physical objects get tags attached to them for better filtering options
    """
    __tablename__       = "tag"
    tag_id              = Column(Integer, primary_key = True)
    phys_id             = Column(Integer, ForeignKey('physicalobject.phys_id'))
    name                = Column(String(60), nullable = False)

class PhysicalObject(Base):
    """
    Physical Objects are the real objects which get grouped later on for borrowing
    """
    __tablename__       = "physicalobject"
    phys_id             = Column(Integer, unique = True, primary_key = True)
    inv_num_internal    = Column(Integer, unique = False, nullable = False) # unique?
    inv_num_external    = Column(Integer, unique = False, nullable = False)
    pic_path            = Column(String(600), unique = False, nullable = True)
    organization_id     = Column(Integer, ForeignKey('member.member_id'), unique = True, nullable = False)
    deposit             = Column(Integer, unique = False, nullable = False)
    storage_location    = Column(String(600), unique = False, nullable = False)
    faults              = Column(String(600), unique = False, nullable = True)
    name                = Column(String(60), unique = False, nullable = False)
    description         = Column(String(600), unique = False, nullable = True)

class Order(Base):
    """
    Orders are the actual borrowings of physical objects for a specific time
    """
    __tablename__       = "order"
    order_id            = Column(Integer, primary_key = True)
    from_date           = Column(DateTime, unique = False, nullable = False)
    till_date           = Column(DateTime, unique = False, nullable = False)
    phys_id             = Column(Integer, ForeignKey('physicalobject.phys_id'))
    borrow_id           = Column(Integer, ForeignKey('borrower.borrow_id'))

class Person(Base):
    """
    Person is the base class for Borrower and Member
    """
    __tablename__       = "person"
    __mapper_args__     = {"polymorphic_on": "type",}
    type                = Column(String(60))

    person_id           = Column(Integer, primary_key = True)
    first_name          = Column(String(30), unique = False, nullable = False)
    last_name           = Column(String(30), unique = False, nullable = False)

    email               = Column(String(60), unique = True, nullable = False)
    password            = Column(String(60), unique = False, nullable = False) # hashed

class Borrower(Person):
    """
    Borrower is a person who can borrow objects
    """
    __tablename__       = "borrower"
    __mapper_args__     = {"polymorphic_identity" : "borrower",}
    borrow_id           = Column(Integer, ForeignKey("person.person_id"), primary_key = True)

class Member(Person):
    """
    Member is a person who can lend objects and is member of an organization
    """
    __tablename__       = "member"
    __mapper_args__     = {"polymorphic_identity" : "member",}
    member_id           = Column(Integer, ForeignKey("person.person_id"), primary_key = True)
    # Rights to edit objects, borrow objects, edit organization, etc.

class Group(Base):
    """
    Group contains physical objects or groups
    Groups have to be borrowed as a whole
    """
    __tablename__       = "group"
    group_id            = Column(Integer, primary_key = True)
    name                = Column(String(60), nullable = False)

class Organization(Base):
    """
    Organization is a group of members
    equivalent to FARAS
    """
    __tablename__       = "organization"
    organization_id     = Column(Integer, primary_key = True)
    name                = Column(String(60), nullable = False)
    location            = Column(String(60), nullable = False)