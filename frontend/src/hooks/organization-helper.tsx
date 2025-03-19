import { gql } from "@apollo/client";
import { useSuspenseQueryWithResponseMapped } from "./response-helper";
import { Organization } from "../models/organization.model";

const GET_ALL_ORGANIZATIONS =gql`
query GetAllOrganizations {
  filterOrganizations{
    organizationId
    name
    location
    agb{
        edges {
            node{
                path
            }
        }
    }
  }
}
`;

interface GetOrgByIdResponse {
    id: string,
    name: string,
    location: string,
    agb: {
        edges: {
            node: {
                    path: string;
                }
        }[]
    }
}

export function useGetAllOrganizations() {
    const mapToOrganization = (val: GetOrgByIdResponse[]) => {
        var res =  val.map((orgResponse): Organization => ({ 
            id: orgResponse.id, 
            name: orgResponse.name, 
            location: orgResponse.location, 
            agb: orgResponse.agb?.edges[0]?.node?.path ?? "" 
        }));
        return res.filter((org) => org.name!='root_organization');
    };

    return useSuspenseQueryWithResponseMapped<GetOrgByIdResponse[], Organization[]>(GET_ALL_ORGANIZATIONS, 'filterOrganizations', {}, mapToOrganization);
}

const GET_ORGANIZATION_BY_ID_QUERY =gql`
query GetOrgById($id: String!) {
  filterOrganizations(organizationId: $id) {
    id: organizationId
    name
    location
    agb{
        edges {
            node{
                path
            }
        }
    }
  }
}
`;

export function useGetOrganizationByIdQuery(orgId: string) {
    const mapToGroup = (response: GetOrgByIdResponse[]): Organization => {
        // TODO: error
        if (response.length !== 1) {
            throw new Error("Invalid response!");
        }
        const orgRes = response[0];



        return {
            id: orgRes.id,
            name: orgRes.name,
            location: orgRes.location,
            agb: orgRes.agb?.edges[0]?.node?.path ?? ""
        };
    }
    
    return useSuspenseQueryWithResponseMapped(
        GET_ORGANIZATION_BY_ID_QUERY,
        'filterOrganizations',
        { variables: { id: orgId } },
        mapToGroup
    );
}