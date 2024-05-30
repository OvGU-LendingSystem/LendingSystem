import enum
from config import db
from sqlalchemy import *
from sqlalchemy.orm import *
from sqlalchemy.ext.declarative import declarative_base

# standard, something for querying
Base = declarative_base()
Base.query = db.query_property()

class userRights(enum.Enum):
    """
    Enum for different rights a user can have inside his organization
    rights are organized in a hierarchy
    """
    organization_admin  = 1
    inventory_admin     = 2
    watcher             = 3
    member              = 4

class orderStatus(enum.Enum):
    """
    Enum for the status of an order
    """
    pending  = 1
    accepted = 2
    picked   = 3
    rejected = 4
    returned = 5



# m:n Relations go here ...

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

user_order = Table (
    'user_order',
    Base.metadata,
    Column('user_id',           ForeignKey('user.user_id'),                 primary_key=True),
    Column('order_id',          ForeignKey('order.order_id'),               primary_key=True),
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

class Organization_User(Base):
    """
    m:n relation between organization and user
    additionally holds the rights a user has in an organization
    """
    __tablename__       = "organization_user"
    organization_id     = Column(Integer,       ForeignKey('organization.organization_id'), primary_key=True)
    user_id             = Column(Integer,       ForeignKey('user.user_id'),                 primary_key=True)
    rights              = Column(Enum(userRights), nullable = False, default = 'member')

    organization        = relationship("Organization", back_populates = "users")
    user                = relationship("User", back_populates = "organizations")



# Classes go here ...

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
    phys_id             = Column(Integer,               unique = True,  primary_key = True)
    inv_num_internal    = Column(Integer,               unique = False, nullable = False) # unique?
    inv_num_external    = Column(Integer,               unique = False, nullable = False)
    deposit             = Column(Integer,               unique = False, nullable = False)
    storage_location    = Column(String(600),           unique = False, nullable = False)
    faults              = Column(String(600),           unique = False, nullable = True)
    name                = Column(String(60),            unique = False, nullable = False)
    description         = Column(String(600),           unique = False, nullable = True)

    pictures            = relationship("Picture",                                                   back_populates = "physicalobject")
    tags                = relationship("Tag",           secondary = physicalobject_tag,             back_populates = "physicalobjects")
    orders              = relationship("Order",         secondary = physicalobject_order,           back_populates = "physicalobjects")
    groups              = relationship("Group",         secondary = group_physicalobject,           back_populates = "physicalobjects")
    organizations       = relationship("Organization",  secondary = physicalobject_organization,    back_populates = "physicalobjects")

class Picture(Base):
    """
    Pictures are stored in the database and linked to physical objects
    """
    __tablename__       = "picture"
    picture_id          = Column(Integer,      primary_key = True)
    physicalobject_id   = Column(Integer,      ForeignKey('physicalobject.phys_id'), nullable = False)
    path                = Column(String(600),  unique = True, nullable = False)

    physicalobject      = relationship("PhysicalObject", back_populates = "pictures")

class Order(Base):
    """
    Orders are the actual borrowings of physical objects for a specific time
    """
    __tablename__       = "order"
    order_id            = Column(Integer,           primary_key = True)
    status              = Column(Enum(orderStatus), nullable = False, default = 'pending')
    from_date           = Column(DateTime,          unique = False, nullable = False)
    till_date           = Column(DateTime,          unique = False, nullable = False)

    physicalobjects     = relationship("PhysicalObject",    secondary = physicalobject_order,   back_populates = "orders")
    users               = relationship("User",              secondary = user_order,             back_populates = "orders")

class User(Base):
    """
    Users can be in organizations but don't have to
    """
    __tablename__       = "user"

    user_id             = Column(Integer,       primary_key = True)
    first_name          = Column(String(30),    unique = False, nullable = False)
    last_name           = Column(String(30),    unique = False, nullable = False)

    email               = Column(String(60),    unique = True,  nullable = False)
    password_hash       = Column(String(120),   unique = False, nullable = False) # hashed

    organizations       = relationship("Organization_User",                                back_populates = "user")
    orders              = relationship("Order",             secondary = user_order,        back_populates = "users")

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

    users               = relationship("Organization_User",                                             back_populates = "organization")
    physicalobjects     = relationship("PhysicalObject",    secondary = physicalobject_organization,    back_populates = "organizations")

    def addUser(self, user, rights = userRights.member):
        """
        adds a user to the organization
        """
        tmp = Organization_User(organization = self, user = user, rights = rights)
        self.users.append(tmp)
        user.organizations.append(tmp)