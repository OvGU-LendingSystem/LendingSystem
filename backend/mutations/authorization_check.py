from argon2.exceptions import VerificationError

from models import userRights
from schema import UserModel, PhysicalObjectModel, TagModel, GroupModel, OrganizationModel, OrderModel

def is_authorised(required_rights, executive_user_id, phys_id=None, organization_id=None, tag_id=None, group_id=None, order_id=None):
    executive_user = UserModel.query.filter(UserModel.user_id == executive_user_id).first()
    
    # if user is system admin, he is always authorized
    for user_org in executive_user.organizations:
        if user_org.rights == userRights.system_admin:
            return True


    if not executive_user:
        raise VerificationError("Executive User nicht gefunden")

    # Collect all relevant organizations
    organization_id = []

    # wenn phys_objects bearbeitet oder gelöscht werden sollen
    if phys_id:
        tmp = get_organizationID_from_phys_object(phys_id)
        if not tmp in organization_id:
            organization_id.append(tmp)

    # wenn tags bearbeitet oder gelöscht werden sollen
    if tag_id:
        tmp = get_organizationID_from_tag(tag_id)
        for org_id in tmp:
            if not org_id in organization_id:
                organization_id.append(org_id)

    # wenn groups bearbeitet oder gelöscht werden sollen
    if group_id:
        tmp = get_organization_id_from_group(group_id)
        if not tmp in organization_id:
            organization_id.append(tmp)

    if order_id:
        tmp = get_organization_id_from_order(order_id)
        for org_id in tmp:
            if not org_id in organization_id:
                organization_id.append(org_id)

    # Check if user has the required rights in all relevant organizations
    for org_id in organization_id:
        organization = OrganizationModel.query.filter(OrganizationModel.organization_id == org_id).first()
        user_relation = organization.users.filter(UserModel.user_id == executive_user_id).first()
        
        if not user_relation.user_rights > required_rights:
            return False
        
    return True


def get_organizationID_from_phys_object(phys_id):
    phys_obj = PhysicalObjectModel.query.filter(PhysicalObjectModel.phys_id == phys_id).first()
    if not phys_obj:
        raise VerificationError("physikalisches Object nicht gefunden")
    
    return phys_obj.organization_id

def get_organizationID_from_tag(tag_id):
    # ein tag soll nur vom user bearbeitet oder gelöscht werden können,
    # wenn er in allen Orgas, zu denen die Objekte gehören, die dem Tag angehören, mindestens ein inventory_admin ist
    tag = TagModel.query.filter(TagModel.tag_id == tag_id).first()
    if not tag:
        raise VerificationError("Tag nicht gefunden")

    # alle organization_ids die mit den phys_objs des tags verknüpft sind
    tag_phys_organizations = []
    for phys_obj in tag.physicalobjects:
        if tag_phys_organizations.contains(phys_obj.organization_id):
            tag_phys_organizations.append(phys_obj.organization_id)

    return tag_phys_organizations

def get_organization_id_from_group(group_id):
    group = GroupModel.query.filter(GroupModel.group_id == group_id).first()
    if not group:
        raise VerificationError("Group nicht gefunden")
    organization_id = group.physicalobjects[0].organization_id

    return organization_id

def get_organization_id_from_order(order_id):
    order = OrderModel.query.filter(OrderModel.order_id == order_id).first()
    if not order:
        raise VerificationError("Order nicht gefunden")
    
    organization_id = []
    for obj in order.physicalobjects:
        if not obj.organization_id in organization_id:
            organization_id.append(obj.organization_id)

    return organization_id




reject_message = "Sie sind nicht autorisiert diese Aktion auszuführen"