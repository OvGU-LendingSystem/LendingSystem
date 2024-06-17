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
    # User want to see agb only after a change
    # Should be automatically false if agb changes (irgendwo in Mutations)
    agb_dont_show       = Column(Boolean,       nullable = False, default = False)

    organization        = relationship("Organization", back_populates = "users")
    user                = relationship("User", back_populates = "organizations")

class PhysicalObject_Order(Base):
    """
    m:n relation between physicalObject and order
    additionally holds the orderStatus a physicalobject has in an order
    """
    __tablename__       = "physicalobject_order"
    phys_id             = Column(Integer,           ForeignKey('physicalobject.phys_id'),   primary_key=True)
    order_id            = Column(Integer,           ForeignKey('order.order_id'),           primary_key=True)
    order_status        = Column(Enum(orderStatus), nullable = False, default = 'pending')
    return_date         = Column(DateTime,          nullable = True)

    physicalobject      = relationship("PhysicalObject",    back_populates = "orders")
    order               = relationship("Order",             back_populates = "physicalobjects")

    def __repr__(self):
        return "Physical Object ID: " + str(self.phys_id) + "; Order ID: " + str(self.order_id) + "; Status: " + str(self.order_status)



# Classes go here ...

class Tag(Base):
    """
    physical objects get tags attached to them for better filtering options
    """
    __tablename__       = "tag"
    tag_id              = Column(Integer,       primary_key = True)
    name                = Column(String(60),    unique = True, nullable = False)

    physicalobjects     = relationship("PhysicalObject", secondary = physicalobject_tag, back_populates = "tags")

    def __repr__(self):
        return "Tag ID: " + str(self.tag_id) + "; Name: " + self.name

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

    pictures            = relationship("File",                                                      back_populates = "physicalobject", cascade="all, delete-orphan")
    tags                = relationship("Tag",           secondary = physicalobject_tag,             back_populates = "physicalobjects")
    orders              = relationship("PhysicalObject_Order",                                      back_populates = "physicalobject")
    groups              = relationship("Group",         secondary = group_physicalobject,           back_populates = "physicalobjects")
    organizations       = relationship("Organization",  secondary = physicalobject_organization,    back_populates = "physicalobjects")

    def __repr__(self):
        return "Physical Object ID: " + str(self.phys_id) + "; Name: " + self.name

class File(Base):
    """
    Stores the location of a file for pictures an pdf's to use in PhysicalObjects, groups and Organizations
    """
    class FileType(enum.Enum):
        """
        Enum for the type of the file
        """
        picture = 0
        agb     = 1
        other   = 2

    __tablename__       = "file"
    file_id             = Column(Integer,      primary_key = True)
    physicalobject_id   = Column(Integer,      ForeignKey('physicalobject.phys_id'),        nullable = True)
    organization_id     = Column(Integer,      ForeignKey('organization.organization_id'),  nullable = True)
    group_id            = Column(Integer,      ForeignKey('group.group_id'),                nullable = True)
    # String name for the file location
    path                = Column(String(600),  unique = True, nullable = False)
    file_type           = Column(Enum(FileType), nullable = False, default = 'other')

    physicalobject      = relationship("PhysicalObject",    back_populates = "pictures")
    group               = relationship("Group",             back_populates = "pictures")
    organization        = relationship("Organization",      back_populates = "agb")

class Order(Base):
    """
    Orders are the actual borrowings of physical objects for a specific time
    """
    __tablename__       = "order"
    order_id            = Column(Integer,           primary_key = True)
    from_date           = Column(DateTime,          unique = False, nullable = False)
    till_date           = Column(DateTime,          unique = False, nullable = False)

    physicalobjects     = relationship("PhysicalObject_Order",                                  back_populates = "order")
    users               = relationship("User",              secondary = user_order,             back_populates = "orders")

    def addPhysicalObject(self, physicalobject, order_status = orderStatus.pending):
        """
        adds a physicalObject to the order
        """
        tmp = PhysicalObject_Order(order = self, physicalobject = physicalobject, order_status = order_status)
        self.physicalobjects.append(tmp)
        physicalobject.orders.append(tmp)

    def removePhysicalObject(self, physicalobject):
        """
        removes a physicalObject from the order
        """
        self.physicalobjects.remove(physicalobject)
        physicalobject.orders.remove(physicalobject)

    def removeAllPhysicalObjects(self):
        """
        removes all physicalObjects from the order
        """
        for physicalobject in self.physicalobjects:
            self.physicalobjects.remove(physicalobject)
            physicalobject.orders.remove(physicalobject)

    def __repr__(self):
        return "Order ID: " + str(self.order_id) + "; From: " + str(self.from_date) + "; Till: " + str(self.till_date)

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
    pictures            = relationship("File",                                             back_populates = "group")

class Organization(Base):
    """
    Organization is a group of members
    equivalent to FARAS
    """
    __tablename__       = "organization"
    organization_id     = Column(Integer,       primary_key = True)
    name                = Column(String(60),    unique = True,  nullable = False)
    location            = Column(String(60),    unique = False, nullable = False)
    # String name for the agb file location
    agb                 = relationship("File",                                                          back_populates = "organization", cascade="all, delete-orphan")

    users               = relationship("Organization_User",                                             back_populates = "organization")
    physicalobjects     = relationship("PhysicalObject",    secondary = physicalobject_organization,    back_populates = "organizations")

    def addUser(self, user, rights = userRights.member):
        """
        adds a user to the organization
        """
        tmp = Organization_User(organization = self, user = user, rights = rights)
        self.users.append(tmp)
        user.organizations.append(tmp)