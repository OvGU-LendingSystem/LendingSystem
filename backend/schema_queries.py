import graphene
import os
from typing import Union, List

from config import template_directory
from models import orderStatus
from schema import *

# Api Queries go here
class Query(graphene.ObjectType):
    node = relay.Node.Field()    
    
    filter_tags = graphene.List(
        #return type
        Tag,
        #uuid params
        tag_id              = graphene.Argument(type=graphene.String, required=False),
        #string params
        name                = graphene.Argument(type=graphene.String, required=False),
        #list params for the relationships
        physicalobjects     = graphene.Argument(type=graphene.List(graphene.String), required=False),
        description         = "Returns all tags with the given parameters, List arguments get OR-ed together",
    )

    filter_physical_objects = graphene.List(
        #return type
        PhysicalObject,
        #uuid params
        phys_id             = graphene.Argument(type=graphene.String, required=False),
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
        #uuid params
        order_id            = graphene.Argument(type=graphene.String, required=False),
        #date params
        from_date           = graphene.Argument(type=graphene.DateTime, required=False),
        till_date           = graphene.Argument(type=graphene.DateTime, required=False),
        return_date         = graphene.Argument(type=graphene.DateTime, required=False, description="return_date has to be before this date"),
        creation_date       = graphene.Argument(type=graphene.DateTime, required=False),
        # float params
        deposit             = graphene.Argument(type=graphene.Float, required=False),
        #list params for the relationships
        order_status        = graphene.Argument(type=graphene.List(graphene.String), required=False),
        physicalobjects     = graphene.Argument(type=graphene.List(graphene.String), required=False),
        users               = graphene.Argument(type=graphene.List(graphene.String), required=False),
        description         = "Returns all orders with the given parameters, List arguments get OR-ed together",
    )

    filter_users = graphene.List(
        #return type
        User,
        #uuid params
        user_id             = graphene.Argument(type=graphene.String, required=False),
        #string params
        first_name          = graphene.Argument(type=graphene.String, required=False),
        last_name           = graphene.Argument(type=graphene.String, required=False),
        email               = graphene.Argument(type=graphene.String, required=False),
        #additional User information
        country             = graphene.Argument(type=graphene.String, required=False),
        postcode            = graphene.Argument(type=graphene.Int,    required=False),
        city                = graphene.Argument(type=graphene.String, required=False),
        street              = graphene.Argument(type=graphene.String, required=False),
        house_number        = graphene.Argument(type=graphene.Int,    required=False),

        phone_number        = graphene.Argument(type=graphene.Int,    required=False),
        matricle_number     = graphene.Argument(type=graphene.Int,    required=False),
        #list params for the relationships
        orders              = graphene.Argument(type=graphene.List(graphene.String), required=False),
        organizations       = graphene.Argument(type=graphene.List(graphene.String), required=False),
        description         = "Returns all users with the given parameters, List arguments get OR-ed together",
    )

    filter_groups = graphene.List(
        #return type
        Group,
        #uuid params
        group_id            = graphene.Argument(type=graphene.String, required=False),
        #string params
        name                = graphene.Argument(type=graphene.String, required=False),
        #list params for the relationships
        physicalobjects     = graphene.Argument(type=graphene.List(graphene.String), required=False),
        pictures            = graphene.Argument(type=graphene.List(graphene.String), required=False),
        description         = "Returns all groups with the given parameters, List arguments get OR-ed together",
    )  

    filter_organizations = graphene.List(
        #return type
        Organization,
        #uuid params
        organization_id     = graphene.Argument(type=graphene.String, required=False),
        #string params
        name                = graphene.Argument(type=graphene.String, required=False),
        location            = graphene.Argument(type=graphene.String, required=False),
        #list params for the relationships
        agb                 = graphene.Argument(type=graphene.List(graphene.String), required=False),
        users               = graphene.Argument(type=graphene.List(graphene.String), required=False),
        physicalobjects     = graphene.Argument(type=graphene.List(graphene.String), required=False),
        description         = "Returns all organizations with the given parameters, List arguments get OR-ed together",
    )

    filter_files = graphene.List(
        #return type
        File,
        #uuid params
        file_id             = graphene.Argument(type=graphene.String, required=False),
        # list params for the relationships
        physicalobjects    = graphene.Argument(type=graphene.List(graphene.String), required=False),
        groups             = graphene.Argument(type=graphene.List(graphene.String), required=False),
        organizations      = graphene.Argument(type=graphene.List(graphene.String), required=False),
        description         = "Returns all files with the given parameters, List arguments get OR-ed together",
    )

    get_imprint = graphene.String(
        description = "Returns the imprint of the LendingSystem"
    )

    get_privacy_policy = graphene.String(
        description = "Returns the privacy policy of the LendingSystem"
    )

    @staticmethod
    def resolve_filter_tags(
        args,
        info,
        # uuid params
        tag_id: Union[str, None] = None,
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
            query = query.filter(TagModel.physicalobjects.any(PhysicalObjectModel.phys_id.in_(physicalobjects)))
        
        tags = query.all()
        return tags

    @staticmethod
    def resolve_filter_physical_objects(
        args,
        info,
        # uuid params
        phys_id: Union[str, None] = None,
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
        pictures: Union[List[str], None] = None,
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
        # uuid params
        order_id: Union[str, None] = None,
        # date params
        from_date: Union[str, None] = None,
        till_date: Union[str, None] = None,
        return_date: Union[str, None] = None,
        creation_date: Union[str, None] = None,
        # int params
        deposit: Union[float, None] = None,
        # list params for the relationships
        order_status: Union[List[str], None] = None,
        physicalobjects: Union[List[str], None] = None,
        users: Union[List[str], None] = None,
    ):
        query = Order.get_query(info=info)

        if order_id:
            query = query.filter(OrderModel.order_id == order_id)
        if from_date:
            query = query.filter(OrderModel.from_date == from_date)
        if till_date:
            query = query.filter(OrderModel.till_date == till_date)
        if return_date:
            query = query.filter(OrderModel.physicalobjects.any(PhysicalObject_OrderModel.return_date <= return_date))
        if creation_date:
            query = query.filter(OrderModel.creation_time == creation_date)
        if deposit:
            query = query.filter(OrderModel.deposit == deposit)
        # list params for the relationships .any() returns union (OR Statement)
        if order_status:
            orderStatus_ = []
            for os in order_status:
                orderStatus_.append(orderStatus[os.lower()])
            query = query.filter(OrderModel.physicalobjects.any(PhysicalObject_OrderModel.order_status.in_(orderStatus_)))
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
        # uuid params
        user_id: Union[str, None] = None,
        # string params
        first_name: Union[str, None] = None,
        last_name: Union[str, None] = None,
        email: Union[str, None] = None,
        #additional User information
        country: Union[str, None] = None,
        postcode: Union[int, None] = None,
        city: Union[str, None] = None,
        street: Union[str, None] = None,
        house_number: Union[int, None] = None,
        phone_number: Union[int, None] = None,
        matricle_number: Union[int, None] = None,
        # list params for the relationships
        orders: Union[List[str], None] = None,
        organizations: Union[List[str], None] = None,
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
        if country:
            query = query.filter(UserModel.address.country == country)
        if postcode:
            query = query.filter(UserModel.address.postcode == postcode)
        if city:
            query = query.filter(UserModel.address.city == city)
        if street:
            query = query.filter(UserModel.address.street == street)
        if house_number:
            query = query.filter(UserModel.address.house_number == house_number)
        if phone_number:
            query = query.filter(UserModel.phone_number == phone_number)
        if matricle_number:
            query = query.filter(UserModel.matricle_number == matricle_number)
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
        # uuid params
        group_id: Union[str, None] = None,
        # string params
        name: Union[str, None] = None,
        # list params for the relationships
        physicalobjects: Union[List[str], None] = None,
        pictures: Union[List[str], None] = None,
    ):
        query = Group.get_query(info=info)

        if group_id:
            query = query.filter(GroupModel.group_id == group_id)
        if name:
            query = query.filter(GroupModel.name == name)
        # list params for the relationships .any() returns union (OR Statement)
        if physicalobjects:
            query = query.filter(GroupModel.physicalobjects.any(PhysicalObjectModel.phys_id.in_(physicalobjects)))
        if pictures:
            query = query.filter(GroupModel.pictures.any(FileModel.file_id.in_(pictures)))

        groups = query.all()
        return groups
    
    @staticmethod
    def resolve_filter_organizations(
        args,
        info,
        # uuid params
        organization_id: Union[str, None] = None,
        # string params
        name: Union[str, None] = None,
        location: Union[str, None] = None,
        # list params for the relationships
        agb: Union[List[str], None] = None,
        users: Union[List[str], None] = None,
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
        if agb:
            query = query.filter(OrganizationModel.agb.any(FileModel.file_id.in_(agb)))
        if users:
            query = query.filter(OrganizationModel.users.any(Organization_UserModel.user_id.in_(users)))
        if physicalobjects:
            query = query.filter(OrganizationModel.physicalobjects.any(PhysicalObjectModel.phys_id.in_(physicalobjects)))
        
        organizations = query.all()
        return organizations
    
    @staticmethod
    def resolve_filter_files(
        args,
        info,
        # uuid params
        file_id: Union[str, None] = None,
    ):
        query = File.get_query(info=info)

        if file_id:
            query = query.filter(FileModel.file_id == file_id)
        
        files = query.all()
        return files
    

    @staticmethod
    def resolve_get_imprint(
        args,
        info,
    ):
        with open(os.path.join(template_directory, "imprint.html"), encoding="utf-8") as file:
            return file.read()
        
    @staticmethod
    def resolve_get_privacy_policy(
        args,
        info,
    ):
        with open(os.path.join(template_directory, "privacy_policy.html"), encoding="utf-8") as file:
            return file.read()