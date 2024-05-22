import graphene
from schema import *
from typing import Union, List, Dict

# Api Queries go here
class Query(graphene.ObjectType):
    node = relay.Node.Field()
    # Model Query:
    # all_contacts = SQLAlchemyConnectionField(Contact.connection)

    # Queries for all
    # all_physical_objects = SQLAlchemyConnectionField( PhysicalObject.connection )
    # all_tags = SQLAlchemyConnectionField( Tag.connection )
    # all_organizations = SQLAlchemyConnectionField( Organization.connection )
    # all_orders = SQLAlchemyConnectionField( Order.connection )
    # all_borrowers = SQLAlchemyConnectionField( Borrower.connection )
    # all_members = SQLAlchemyConnectionField( Member.connection )
    # all_groups = SQLAlchemyConnectionField( Group.connection ) 
    
    
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
        pic_path            = graphene.Argument(type=graphene.String, required=False),
        storage_location    = graphene.Argument(type=graphene.String, required=False),
        faults              = graphene.Argument(type=graphene.String, required=False),
        name                = graphene.Argument(type=graphene.String, required=False),
        obj_description     = graphene.Argument(type=graphene.String, required=False),
        #list params for the relationships
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
        borrowers           = graphene.Argument(type=graphene.List(graphene.String), required=False),
        description         = "Returns all orders with the given parameters, List arguments get OR-ed together",
    )

    # filter_persons = graphene.List(
    #     #return type
    #     Person,
    #     #type params
    #     type                = graphene.Argument(type=graphene.String, required=False),
    #     #int params
    #     person_id           = graphene.Argument(type=graphene.Int, required=False),
    #     #string params
    #     first_name          = graphene.Argument(type=graphene.String, required=False),
    #     last_name           = graphene.Argument(type=graphene.String, required=False),
    #     email               = graphene.Argument(type=graphene.String, required=False),
    #     password            = graphene.Argument(type=graphene.String, required=False),
    #     #list params for the relationships
    #     orders              = graphene.Argument(type=graphene.List(graphene.String), required=False),
    #     organizations       = graphene.Argument(type=graphene.List(graphene.String), required=False),
    #     description         = "Returns all persons with the given parameters, List arguments get OR-ed together",
    # )

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
        members             = graphene.Argument(type=graphene.List(graphene.String), required=False),
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
        physicalobjects: Union[List[str], None] = None,
    ):
        query = Tag.get_query(info=info)

        if tag_id:
            query = query.filter(TagModel.tag_id == tag_id)
        if name:
            query = query.filter(TagModel.name == name)
        # list params for the relationships .any() returns union (OR Statement)
        if physicalobjects:
            query = query.filter(TagModel.physicalobjects.any(PhysicalObjectModel.name.in_(physicalobjects)))
        
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
        pic_path: Union[str, None] = None,
        storage_location: Union[str, None] = None,
        faults: Union[str, None] = None,
        name: Union[str, None] = None,
        obj_description: Union[str, None] = None,
        # list params for the relationships
        tags: Union[List[str], None] = None,
        orders: Union[List[str], None] = None,
        groups: Union[List[str], None] = None,
        organizations: Union[List[str], None] = None,
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
        if pic_path:
            query = query.filter(PhysicalObjectModel.pic_path == pic_path)
        if storage_location:
            query = query.filter(PhysicalObjectModel.storage_location == storage_location)
        if faults:
            query = query.filter(PhysicalObjectModel.faults == faults)
        if name:
            query = query.filter(PhysicalObjectModel.name == name)
        if obj_description:
            query = query.filter(PhysicalObjectModel.description == obj_description)
        # list params for the relationships .any() returns union (OR Statement)
        if tags:
            query = query.filter(PhysicalObjectModel.tags.any(TagModel.name.in_(tags)))
        if orders:
            query = query.filter(PhysicalObjectModel.orders.any(OrderModel.name.in_(orders)))
        if groups:
            query = query.filter(PhysicalObjectModel.groups.any(GroupModel.name.in_(groups)))
        if organizations:
            query = query.filter(PhysicalObjectModel.organizations.any(OrganizationModel.name.in_(organizations)))
        
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
        physicalobjects: Union[List[str], None] = None,
        borrowers: Union[List[str], None] = None,
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
            query = query.filter(OrderModel.physicalobjects.any(PhysicalObjectModel.name.in_(physicalobjects)))
        if borrowers:
            query = query.filter(OrderModel.borrowers.any(BorrowerModel.name.in_(borrowers)))
        
        orders = query.all()
        return orders
    
    # @staticmethod
    # def resolve_filter_persons(
    #     args,
    #     info,
    #     # type params
    #     type: Union[str, None] = None,
    #     # int params
    #     person_id: Union[int, None] = None,
    #     # string params
    #     first_name: Union[str, None] = None,
    #     last_name: Union[str, None] = None,
    #     email: Union[str, None] = None,
    #     password: Union[str, None] = None,
    #     # list params for the relationships
    #     orders: Union[List[str], None] = None,
    #     organizations: Union[List[str], None] = None,
    # ):
    #     query = Person.get_query(info=info)

    #     if type:
    #         query = query.filter(PersonModel.type == type)
    #     if person_id:
    #         query = query.filter(PersonModel.person_id == person_id)
    #     if first_name:
    #         query = query.filter(PersonModel.first_name == first_name)
    #     if last_name:
    #         query = query.filter(PersonModel.last_name == last_name)
    #     if email:
    #         query = query.filter(PersonModel.email == email)
    #     if password:
    #         query = query.filter(PersonModel.password == password)
    #     # list params for the relationships .any() returns union (OR Statement)
    #     if orders:
    #         query = query.filter(BorrowerModel.orders.any(OrderModel.name.in_(orders)))
    #     if organizations:
    #         query = query.filter(MemberModel.organizations.any(OrganizationModel.name.in_(organizations)))
        
    #     persons = query.all()
    #     return persons
    
    @staticmethod
    def resolve_filter_groups(
        args,
        info,
        # int params
        group_id: Union[int, None] = None,
        # string params
        name: Union[str, None] = None,
        # list params for the relationships
        physicalobjects: Union[List[str], None] = None,
    ):
        query = Group.get_query(info=info)

        if group_id:
            query = query.filter(GroupModel.group_id == group_id)
        if name:
            query = query.filter(GroupModel.name == name)
        # list params for the relationships .any() returns union (OR Statement)
        if physicalobjects:
            query = query.filter(GroupModel.physicalobjects.any(PhysicalObjectModel.name.in_(physicalobjects)))
        
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
        members: Union[List[str], None] = None,
        physicalobjects: Union[List[str], None] = None,
    ):
        query = Organization.get_query(info=info)

        if organization_id:
            query = query.filter(OrganizationModel.organization_id == organization_id)
        if name:
            query = query.filter(OrganizationModel.name == name)
        if location:
            query = query.filter(OrganizationModel.location == location)
        # list params for the relationships .any() returns union (OR Statement)
        if members:
            query = query.filter(OrganizationModel.members.any(MemberModel.name.in_(members)))
        if physicalobjects:
            query = query.filter(OrganizationModel.physicalobjects.any(PhysicalObjectModel.name.in_(physicalobjects)))
        
        organizations = query.all()
        return organizations