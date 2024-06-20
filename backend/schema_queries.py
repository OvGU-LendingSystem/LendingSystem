import graphene
from schema import *
from typing import Union, List, Dict

# Api Queries go here
class Query(graphene.ObjectType):
    node = relay.Node.Field()    
    
    filter_tags = graphene.List(
        #return type
        Tag,
        #int params
        tag_id              = graphene.Argument(type=graphene.Int, required=False),
        #string params
        name                = graphene.Argument(type=graphene.String, required=False),
        #list params for the relationships
        physicalobjects     = graphene.Argument(type=graphene.List(graphene.String), required=False),
        description         = "Returns all tags with the given parameters, List arguments get OR-ed together",
    )

    filter_physical_objects = graphene.List(
        #return type
        PhysicalObject,
        #int params
        phys_id             = graphene.Argument(type=graphene.Int, required=False),
        inv_num_internal    = graphene.Argument(type=graphene.Int, required=False),
        inv_num_external    = graphene.Argument(type=graphene.Int, required=False),
        deposit             = graphene.Argument(type=graphene.Int, required=False, description="Deposit has to be == to this value"),
        max_deposit         = graphene.Argument(type=graphene.Int, required=False, description="Deposit has to be <= to this value"),
        #string params
        storage_location    = graphene.Argument(type=graphene.String, required=False),
        faults              = graphene.Argument(type=graphene.String, required=False),
        name                = graphene.Argument(type=graphene.String, required=False),
        obj_description     = graphene.Argument(type=graphene.String, required=False),
        #list params for the relationships
        pictures            = graphene.Argument(type=graphene.List(graphene.String), required=False),
        tags                = graphene.Argument(type=graphene.List(graphene.String), required=False),
        orders              = graphene.Argument(type=graphene.List(graphene.String), required=False),
        groups              = graphene.Argument(type=graphene.List(graphene.String), required=False),
        organizations       = graphene.Argument(type=graphene.List(graphene.String), required=False),
        description         = "Returns all physical objects with the given parameters, List arguments get OR-ed together",
    )

    filter_orders = graphene.List(
        #return type
        Order,
        #int params
        order_id            = graphene.Argument(type=graphene.Int, required=False),
        #date params
        from_date           = graphene.Argument(type=graphene.DateTime, required=False),
        till_date           = graphene.Argument(type=graphene.DateTime, required=False),
        #list params for the relationships
        physicalobjects     = graphene.Argument(type=graphene.List(graphene.String), required=False),
        users               = graphene.Argument(type=graphene.List(graphene.String), required=False),
        description         = "Returns all orders with the given parameters, List arguments get OR-ed together",
    )

    filter_users = graphene.List(
        #return type
        User,
        #int params
        user_id             = graphene.Argument(type=graphene.Int, required=False),
        #string params
        first_name          = graphene.Argument(type=graphene.String, required=False),
        last_name           = graphene.Argument(type=graphene.String, required=False),
        email               = graphene.Argument(type=graphene.String, required=False),
        #list params for the relationships
        orders              = graphene.Argument(type=graphene.List(graphene.String), required=False),
        organizations       = graphene.Argument(type=graphene.List(graphene.String), required=False),
        description         = "Returns all users with the given parameters, List arguments get OR-ed together",
    )

    filter_groups = graphene.List(
        #return type
        Group,
        #int params
        group_id            = graphene.Argument(type=graphene.Int, required=False),
        #string params
        name                = graphene.Argument(type=graphene.String, required=False),
        #list params for the relationships
        physicalobjects     = graphene.Argument(type=graphene.List(graphene.String), required=False),
        description         = "Returns all groups with the given parameters, List arguments get OR-ed together",
    )  

    filter_organizations = graphene.List(
        #return type
        Organization,
        #int params
        organization_id     = graphene.Argument(type=graphene.Int, required=False),
        #string params
        name                = graphene.Argument(type=graphene.String, required=False),
        location            = graphene.Argument(type=graphene.String, required=False),
        #list params for the relationships
        users               = graphene.Argument(type=graphene.List(graphene.String), required=False),
        physicalobjects     = graphene.Argument(type=graphene.List(graphene.String), required=False),
        description         = "Returns all organizations with the given parameters, List arguments get OR-ed together",
    )

    @staticmethod
    def resolve_filter_tags(
        args,
        info,
        # int params
        tag_id: Union[int, None] = None,
        # string params
        name: Union[str, None] = None,
        # list params for the relationships
        physicalobjects: Union[List[int], None] = None,
    ):
        query = Tag.get_query(info=info)

        if tag_id:
            query = query.filter(TagModel.tag_id == tag_id)
        if name:
            query = query.filter(TagModel.name == name)
        # list params for the relationships .any() returns union (OR Statement)
        if physicalobjects:
            query = query.filter(TagModel.physicalobjects.any(PhysicalObjectModel.phys_id.in_(physicalobjects)))
        
        tags = query.all()
        return tags

    @staticmethod
    def resolve_filter_physical_objects(
        args,
        info,
        # int params
        phys_id: Union[int, None] = None,
        inv_num_internal: Union[int, None] = None,
        inv_num_external: Union[int, None] = None,
        deposit: Union[int, None] = None,
        max_deposit: Union[int, None] = None,
        # string params
        storage_location: Union[str, None] = None,
        faults: Union[str, None] = None,
        name: Union[str, None] = None,
        obj_description: Union[str, None] = None,
        # list params for the relationships
        pictures: Union[List[int], None] = None,
        tags: Union[List[int], None] = None,
        orders: Union[List[int], None] = None,
        groups: Union[List[int], None] = None,
        organizations: Union[List[int], None] = None,
    ):
        query = PhysicalObject.get_query(info=info)

        if phys_id:
            query = query.filter(PhysicalObjectModel.phys_id == phys_id)
        if inv_num_internal:
            query = query.filter(PhysicalObjectModel.inv_num_internal == inv_num_internal)
        if inv_num_external:
            query = query.filter(PhysicalObjectModel.inv_num_external == inv_num_external)
        if deposit:
            query = query.filter(PhysicalObjectModel.deposit == deposit)
        if max_deposit:
            query = query.filter(PhysicalObjectModel.deposit <= max_deposit)
        if storage_location:
            query = query.filter(PhysicalObjectModel.storage_location == storage_location)
        if faults:
            query = query.filter(PhysicalObjectModel.faults == faults)
        if name:
            query = query.filter(PhysicalObjectModel.name == name)
        if obj_description:
            query = query.filter(PhysicalObjectModel.description == obj_description)
        # list params for the relationships .any() returns union (OR Statement)
        if pictures:
            query = query.filter(PhysicalObjectModel.pictures.any(FileModel.file_id.in_(pictures)))
        if tags:
            query = query.filter(PhysicalObjectModel.tags.any(TagModel.tag_id.in_(tags)))
        if orders:
            query = query.filter(PhysicalObjectModel.orders.any(PhysicalObject_OrderModel.order_id.in_(orders)))
        if groups:
            query = query.filter(PhysicalObjectModel.groups.any(GroupModel.group_id.in_(groups)))
        if organizations:
            query = query.filter(PhysicalObjectModel.organizations.any(OrganizationModel.organization_id.in_(organizations)))
        
        physical_objects = query.all()
        return physical_objects
    
    @staticmethod
    def resolve_filter_orders(
        args,
        info,
        # int params
        order_id: Union[int, None] = None,
        # date params
        from_date: Union[str, None] = None,
        till_date: Union[str, None] = None,
        # list params for the relationships
        physicalobjects: Union[List[int], None] = None,
        users: Union[List[int], None] = None,
    ):
        query = Order.get_query(info=info)

        if order_id:
            query = query.filter(OrderModel.order_id == order_id)
        if from_date:
            query = query.filter(OrderModel.from_date == from_date)
        if till_date:
            query = query.filter(OrderModel.till_date == till_date)
        # list params for the relationships .any() returns union (OR Statement)
        if physicalobjects:
            query = query.filter(OrderModel.physicalobjects.any(PhysicalObject_OrderModel.phys_id.in_(physicalobjects)))
        if users:
            query = query.filter(OrderModel.users.any(UserModel.user_id.in_(users)))
        
        orders = query.all()
        return orders
    
    @staticmethod
    def resolve_filter_users(
        args,
        info,
        # int params
        user_id: Union[int, None] = None,
        # string params
        first_name: Union[str, None] = None,
        last_name: Union[str, None] = None,
        email: Union[str, None] = None,
        # list params for the relationships
        orders: Union[List[int], None] = None,
        organizations: Union[List[int], None] = None,
    ):
        query = User.get_query(info=info)

        if user_id:
            query = query.filter(UserModel.user_id == user_id)
        if first_name:
            query = query.filter(UserModel.first_name == first_name)
        if last_name:
            query = query.filter(UserModel.last_name == last_name)
        if email:
            query = query.filter(UserModel.email == email)
        # list params for the relationships .any() returns union (OR Statement)
        if orders:
            query = query.filter(UserModel.orders.any(OrderModel.order_id.in_(orders)))
        if organizations:
            query = query.filter(UserModel.organizations.any(Organization_UserModel.organization_id.in_(organizations)))
        
        users = query.all()
        return users
    
    @staticmethod
    def resolve_filter_groups(
        args,
        info,
        # int params
        group_id: Union[int, None] = None,
        # string params
        name: Union[str, None] = None,
        # list params for the relationships
        physicalobjects: Union[List[int], None] = None,
    ):
        query = Group.get_query(info=info)

        if group_id:
            query = query.filter(GroupModel.group_id == group_id)
        if name:
            query = query.filter(GroupModel.name == name)
        # list params for the relationships .any() returns union (OR Statement)
        if physicalobjects:
            query = query.filter(GroupModel.physicalobjects.any(PhysicalObjectModel.phys_id.in_(physicalobjects)))
        
        groups = query.all()
        return groups
    
    @staticmethod
    def resolve_filter_organizations(
        args,
        info,
        # int params
        organization_id: Union[int, None] = None,
        # string params
        name: Union[str, None] = None,
        location: Union[str, None] = None,
        # list params for the relationships
        users: Union[List[int], None] = None,
        physicalobjects: Union[List[int], None] = None,
    ):
        query = Organization.get_query(info=info)

        if organization_id:
            query = query.filter(OrganizationModel.organization_id == organization_id)
        if name:
            query = query.filter(OrganizationModel.name == name)
        if location:
            query = query.filter(OrganizationModel.location == location)
        # list params for the relationships .any() returns union (OR Statement)
        if users:
            query = query.filter(OrganizationModel.users.any(Organization_UserModel.user_id.in_(users)))
        if physicalobjects:
            query = query.filter(OrganizationModel.physicalobjects.any(PhysicalObjectModel.phys_id.in_(physicalobjects)))
        
        organizations = query.all()
        return organizations