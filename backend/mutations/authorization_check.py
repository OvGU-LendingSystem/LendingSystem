from argon2.exceptions import VerificationError

from schema import UserModel, PhysicalObjectModel, TagModel, GroupModel

def is_authorised(required_rights, executive_user_id, phys_id=None, organization_id=None, tag_id=None, group_id=None):
    user_rights = 5
    executive_user = UserModel.query.filter(UserModel.user_id == executive_user_id).first()
    if not executive_user:
        raise VerificationError("Executive User nicht gefunden")

    # wenn phys_objects bearbeitet oder gelöscht werden sollen
    if phys_id:
        phys_obj = PhysicalObjectModel.query.filter(PhysicalObjectModel.phys_id == phys_id).first()
        if not phys_obj:
            raise VerificationError("physikalisches Object nicht gefunden")
        organization_id = phys_obj.organization_id

    # wenn tags bearbeitet oder gelöscht werden sollen
    if tag_id:
        # ein tag soll nur vom user bearbeitet oder gelöscht werden können,
        # wenn er in allen Orgas, zu denen die Objekte gehören, die dem Tag angehören, mindestens ein inventory_admin ist
        tag = TagModel.query.filter(TagModel.tag_id == tag_id).first()
        if not tag:
            raise VerificationError("Tag nicht gefunden")

        # alle organization_ids die mit den phys_objs des tags verknüpft sind
        tag_phys_organizations = []
        for phys_obj in tag.physicalobjects:
            tag_phys_organizations.append(phys_obj.organization_id)

        # alle organization_ids zu denen der User verknüpft ist
        executive_user_organizations = []
        for organization in executive_user.organizations:
            executive_user_organizations.append(organization.organization_id)

        # wenn der User nicht mindestens zu allen Organisationen, zu denen die Objekte des Tags gehören, gehört → False
        if not set(tag_phys_organizations).issubset(set(executive_user_organizations)):
            return False

        # Schnitt aus Organisationen des Users und des Tags
        organization_ids = list(set(tag_phys_organizations) & set(executive_user_organizations))

        # nur wenn der User in allen organisationen mindestens inventory_admin ist, darf er den Tag bearbeiten
        # für alle orga_ids aus dem schnitt von user und tag
        for organization_id in organization_ids:
            # für jede organisation die mit dem user verbunden ist
            for organization in executive_user.organizations:
                # wenn die orga des user eine aus der liste ist, dann werden die user_rights demnach gesetzt
                if organization.organization_id == organization_id:
                    user_rights = organization.rights.value
                    # wenn die user_rights nicht den required rights entsprechen wird der Zugriff verweigert
                    if user_rights > required_rights.value:
                        return False
            return True

    # wenn groups bearbeitet oder gelöscht werden sollen
    if group_id:
        group = GroupModel.query.filter(GroupModel.group_id == group_id).first()
        if not group:
            raise VerificationError("Group nicht gefunden")
        organization_id = group.physicalobjects[0].organization_id

    # falls noch keine Organisation gefunden wurde
    if organization_id is None:
        for user_organization in executive_user.organizations:
            if user_organization.rights.value < user_rights:
                user_rights = user_organization.rights.value
                organization_id = user_organization.organization_id
    else:
        # ist der User der Organisation zugeordnet
        if organization_id not in [org.organization_id for org in executive_user.organizations]:
            return False

    # userRights des Users in gegebener Organisation bestimmen
    for organization in executive_user.organizations:
        if organization.organization_id == organization_id:
            user_rights = organization.rights.value
            break

    # Berechtigungen prüfen
    if user_rights <= required_rights.value:
        return True
    else:
        return False

reject_message = "Sie sind nicht autorisiert diese Aktion auszuführen"