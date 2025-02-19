import { gql } from "@apollo/client";
import { useSuspenseQueryWithResponseMapped } from "./response-helper";
import { Tag } from "../models/tag.model";

const GET_TAGS_QUERY =gql`
query GetTags($id: String!) {
  filterTags {
    tagid,
    name
  }
}
`;

interface GetTagsResponse {
    id: string,
    name: string,
}

export function useGetOrganizationByIdQuery(orgId: string) {
    const mapToGroup = (response: GetTagsResponse[]): Tag => {
        if (response.length !== 1) {
            throw new Error("Invalid response!");
        }
        const tagRes = response[0];



        return {
            id: tagRes.id,
            tag: tagRes.name,
        };
    }
    
    return useSuspenseQueryWithResponseMapped(
        GET_TAGS_QUERY,
        'filterTags',
        {},
        mapToGroup
    );
}