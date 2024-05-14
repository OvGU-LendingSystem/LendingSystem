from config import db
from sqlalchemy import *
from sqlalchemy.orm import *
from sqlalchemy.ext.declarative import declarative_base

# standard, something for querying
Base = declarative_base()
Base.query = db.query_property()

# m:n Relations go here ...
# Like this ... 
# book_author = Table(
#     'book_authors',
#     Base.metadata,
#     Column('author_id', ForeignKey('authors.id'), primary_key=True),
#     Column('book_id', ForeignKey('books.id'), primary_key=True),
#     extend_existing=True,
# )

physicalobject_tag = Table (
    'physicalobject_tag',
    Base.metadata,
    Column('phys_id',           ForeignKey('physicalobject.phys_id'),       primary_key=True),
    Column('tag_id',            ForeignKey('tag.tag_id'),                   primary_key=True),
    extend_existing = True,
)

physicalobject_order = Table (
    'physicalobject_order',
    Base.metadata,
    Column('phys_id',           ForeignKey('physicalobject.phys_id'),       primary_key=True),
    Column('order_id',          ForeignKey('order.order_id'),               primary_key=True),
    extend_existing = True,
)

borrower_order = Table (
    'borrower_order',
    Base.metadata,
    Column('borrow_id',         ForeignKey('borrower.borrow_id'),           primary_key=True),
    Column('order_id',          ForeignKey('order.order_id'),               primary_key=True),
    extend_existing = True,
)

organization_member = Table (
    'organization_member',
    Base.metadata,
    Column('organization_id',   ForeignKey('organization.organization_id'), primary_key=True),
    Column('member_id',         ForeignKey('member.member_id'),             primary_key=True),
    extend_existing = True,
)

group_physicalobject = Table (
    'group_physicalobject',
    Base.metadata,
    Column('group_id',      ForeignKey('group.group_id'),                   primary_key=True),
    Column('phys_id',       ForeignKey('physicalobject.phys_id'),           primary_key=True),
    extend_existing = True,
)

physicalobject_organization = Table (
    'physicalobject_organization',
    Base.metadata,
    Column('phys_id',           ForeignKey('physicalobject.phys_id'),       primary_key=True),
    Column('organization_id',   ForeignKey('organization.organization_id'), primary_key=True),
    extend_existing = True,
)



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
    tag_id              = Column(Integer,       primary_key = True)
    name                = Column(String(60),    unique = True, nullable = False)

    physicalobjects     = relationship("PhysicalObject", secondary = physicalobject_tag, back_populates = "tags")

class PhysicalObject(Base):
    """
    Physical Objects are the real objects which get grouped later on for borrowing
    """
    __tablename__       = "physicalobject"
    phys_id             = Column(Integer,       unique = True,  primary_key = True)
    # organization_id     = Column(Integer, ForeignKey('organization.organization_id'), unique = True, nullable = False)
    inv_num_internal    = Column(Integer,       unique = False, nullable = False) # unique?
    inv_num_external    = Column(Integer,       unique = False, nullable = False)
    pic_path            = Column(String(600),   unique = False, nullable = True)
    deposit             = Column(Integer,       unique = False, nullable = False)
    storage_location    = Column(String(600),   unique = False, nullable = False)
    faults              = Column(String(600),   unique = False, nullable = True)
    name                = Column(String(60),    unique = False, nullable = False)
    description         = Column(String(600),   unique = False, nullable = True)

    tags                = relationship("Tag",           secondary = physicalobject_tag,             back_populates = "physicalobjects")
    orders              = relationship("Order",         secondary = physicalobject_order,           back_populates = "physicalobjects")
    groups              = relationship("Group",         secondary = group_physicalobject,           back_populates = "physicalobjects")
    organizations       = relationship("Organization",  secondary = physicalobject_organization,    back_populates = "physicalobjects")

class Order(Base):
    """
    Orders are the actual borrowings of physical objects for a specific time
    """
    __tablename__       = "order"
    order_id            = Column(Integer,       primary_key = True)
    from_date           = Column(DateTime,      unique = False, nullable = False)
    till_date           = Column(DateTime,      unique = False, nullable = False)

    physicalobjects     = relationship("PhysicalObject",    secondary = physicalobject_order,   back_populates = "orders")
    borrowers           = relationship("Borrower",          secondary = borrower_order,         back_populates = "orders")

class Person(Base):
    """
    Person is the base class for Borrower and Member
    """
    __tablename__       = "person"
    __mapper_args__     = {"polymorphic_on": "type",}
    type                = Column(String(60))

    person_id           = Column(Integer,       primary_key = True)
    first_name          = Column(String(30),    unique = False, nullable = False)
    last_name           = Column(String(30),    unique = False, nullable = False)

    email               = Column(String(60),    unique = True,  nullable = False)
    password            = Column(String(60),    unique = False, nullable = False) # hashed

class Borrower(Person):
    """
    Borrower is a person who can borrow objects
    """
    __tablename__       = "borrower"
    __mapper_args__     = {"polymorphic_identity" : "borrower",}
    borrow_id           = Column(Integer, ForeignKey("person.person_id"), primary_key = True)

    orders              = relationship("Order", secondary = borrower_order, back_populates = "borrowers")

class Member(Person):
    """
    Member is a person who can lend objects and is member of an organization
    """
    __tablename__       = "member"
    __mapper_args__     = {"polymorphic_identity" : "member",}
    member_id           = Column(Integer, ForeignKey("person.person_id"), primary_key = True)
    # Rights to edit objects, borrow objects, edit organization, etc.

    organizations       = relationship("Organization", secondary = organization_member, back_populates = "members")

class Group(Base):
    """
    Group contains physical objects or groups
    Groups have to be borrowed as a whole
    """
    __tablename__       = "group"
    group_id            = Column(Integer,       primary_key = True)
    name                = Column(String(60),    unique = True, nullable = False)

    physicalobjects     = relationship("PhysicalObject", secondary = group_physicalobject, back_populates = "groups")

class Organization(Base):
    """
    Organization is a group of members
    equivalent to FARAS
    """
    __tablename__       = "organization"
    organization_id     = Column(Integer,       primary_key = True)
    name                = Column(String(60),    unique = True,  nullable = False)
    location            = Column(String(60),    unique = False, nullable = False)

    members             = relationship("Member",            secondary = organization_member,            back_populates = "organizations")
    physicalobjects     = relationship("PhysicalObject",    secondary = physicalobject_organization,    back_populates = "organizations")