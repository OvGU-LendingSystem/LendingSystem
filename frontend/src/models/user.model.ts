export enum OrganizationRights {
    SYSTEM_ADMIN        = 'SYSTEM_ADMIN',
    ORGANIZATION_ADMIN  = 'ORGANIZATION_ADMIN',
    INVENTORY_ADMIN     = 'INVENTORY_ADMIN',
    MEMBER              = 'MEMBER',
    CUSTOMER            = 'CUSTOMER',
    WATCHER             = 'WATCHER'
}

export interface OrganizationInfo {
    id: string;
    rights: OrganizationRights;
    agbDontShow: boolean;
    name: string;
}

export interface User {
    id: string;

    firstName: string;
    lastName: string;
    matricleNumber: number;
    userId: string;
    email: string;
    //phoneNumber: string; int?

    country: string;
    postcode: number;
    city: string;
    street: string;
    houseNumber: string;

    organizationInfoList: OrganizationInfo[];
}