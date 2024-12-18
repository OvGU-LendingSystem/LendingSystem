import { useMemo } from "react";
import { useUserInfo } from "../context/LoginStatusContext";
import { OrganizationInfo, OrganizationRights } from "../models/user.model";

export function filterOrganizationInfo(orgs: OrganizationInfo[], right: OrganizationRights) {
    const orgRightsAscending = [
        OrganizationRights.WATCHER,
        OrganizationRights.MEMBER,
        OrganizationRights.INVENTORY_ADMIN,
        OrganizationRights.ORGANIZATION_ADMIN,
        OrganizationRights.SYSTEM_ADMIN
    ];
    const startIdx = orgRightsAscending.indexOf(right);
    const allowedRights = orgRightsAscending.slice(startIdx);
    return orgs.filter((org) => allowedRights.indexOf(org.rights) !== -1);
}

export function useFilterUserOrganizationInfo(right: OrganizationRights) {
    const user = useUserInfo();
    return useMemo(() => {
        return filterOrganizationInfo(user.organizationInfoList, right);
    }, [user, right]);
}