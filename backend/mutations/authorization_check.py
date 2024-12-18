from argon2.exceptions import VerificationError

from models import userRights
from schema import UserModel, PhysicalObjectModel, TagModel, GroupModel, OrganizationModel, OrderModel

def is_authorised(required_rights, executive_user_id, phys_id=None, organization_id=None, tag_id=None, group_id=None, order_id=None):
    executive_user = UserModel.query.filter(UserModel.user_id == executive_user_id).first()
    
    # if user is system admin, he is always authorized
    for user_org in executive_user.organizations:
        if user_org.rights == userRights.system_admin:
            return True

    # check rights for given physical object
    if phys_id:
        return check_for_phys_object(executive_user, required_rights, phys_id)

    # check rights for given tag
    if tag_id:
        return check_for_tag(executive_user, required_rights, tag_id)

    # check rights for given group
    if group_id:
        return check_for_group(executive_user, required_rights, group_id)

    return False


def check_for_phys_object(executive_user, required_rights, phys_id):
    """ 
    For editing  physical object the user has to be minimum the required right in the owner organization 
    """
    phys_obj = PhysicalObjectModel.query.filter(PhysicalObjectModel.phys_id == phys_id).first()
    if not phys_obj:
        raise VerificationError("physikalisches Object nicht gefunden")
    
    owner_organization = phys_obj.organization
    user_relation = owner_organization.users.filter(UserModel.user_id == executive_user.user_id).first()

    return user_relation.user_rights > required_rights

def check_for_tag(executive_user, required_rights, tag_id):
    """
    tag can only be edited or deleted by user if he is hat least the required rights in all organizations to which the objects belonging to the tag belong
    """
    tag = TagModel.query.filter(TagModel.tag_id == tag_id).first()

    # get all related organizations
    tag_phys_organizations = []
    for phys_obj in tag.physicalobjects:
        if not tag_phys_organizations.contains(phys_obj.organization_id):
            tag_phys_organizations.append(phys_obj.organization_id)

    # check if user has the required rights in all organizations
    for org_id in tag_phys_organizations:
        organization = OrganizationModel.query.filter(OrganizationModel.organization_id == org_id).first()
        user_relation = organization.users.filter(UserModel.user_id == executive_user.user_id).first()
        
        if not user_relation.user_rights > required_rights:
            return False
        
    return True

def check_for_group(executive_user, required_rights, group_id):
    """
    group can only be edited or deleted by user if he is hat least the required rights in all organizations to which the objects belonging to the group belong
    """
    group = GroupModel.query.filter(GroupModel.group_id == group_id).first()
    
    # get all related organizations
    group_phys_organizations = []
    for phys_obj in group.physicalobjects:
        if not group_phys_organizations.contains(phys_obj.organization_id):
            group_phys_organizations.append(phys_obj.organization_id)

    # check if user has the required rights in all organizations
    for org_id in group_phys_organizations:
        organization = OrganizationModel.query.filter(OrganizationModel.organization_id == org_id).first()
        user_relation = organization.users.filter(UserModel.user_id == executive_user.user_id).first()
        
        if not user_relation.user_rights > required_rights:
            return False

    return True

def check_for_order(executive_user, required_rights, order_id):
    """
    order can only be edited or deleted by user if the user is part of  the order users
    """
    order = OrderModel.query.filter(OrderModel.order_id == order_id).first()
    
    user_relation = order.users.filter(UserModel.user_id == executive_user.user_id).first()
    return user_relation.user_rights > required_rights




reject_message = "Sie sind nicht autorisiert diese Aktion auszuführen"