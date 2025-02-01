import { gql } from "@apollo/client";
import { useSuspenseQueryWithResponseMapped } from "./response-helper";
import { Organization } from "../models/organization.model";

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

interface GetOrgByIdResponse {
    id: string,
    name: string,
    location: string,
    agb: {
        edges: {
            node: {
                    path: string;
                }
            }
    }[]
}


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
            agb: orgRes.agb[0]?.edges?.node?.path ?? "/agb.pdf"
        };
    }
    
    return useSuspenseQueryWithResponseMapped(
        GET_ORGANIZATION_BY_ID_QUERY,
        'filterOrganizations',
        { variables: { id: orgId } },
        mapToGroup
    );
}