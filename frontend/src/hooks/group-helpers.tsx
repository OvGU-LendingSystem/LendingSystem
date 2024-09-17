import { gql } from "@apollo/client";
import { flattenEdges, GQLResponse, useMutationWithResponse, useSuspenseQueryWithResponseMapped } from "./response-helper";
import { AddGroupItem, Group } from "../models/group.model";

const ADD_GROUP_MUTATION = gql`
    mutation AddGroup($name: String!, $physicalObjects: [String!]!) {
        createGroup(name: $name, physicalobjects: $physicalObjects) {
            ok,
            infoText
        }
    }
`;

type AddGroupResponse = GQLResponse;

export function useAddGroupMutation() {
    return useMutationWithResponse<AddGroupResponse>(ADD_GROUP_MUTATION, 'createGroup')
}

const EDIT_GROUP_MUTATION = gql`
    mutation EditGroup($groupId: String!, $name: String!, $physicalObjects: [String!]!) {
        updateGroup(groupId: $groupId, name: $name, physicalobjects: $physicalObjects) {
            ok,
            infoText
        }
    }
`;

type EditGroupResponse = GQLResponse;

export function useEditGroupMutation() {
    return useMutationWithResponse<EditGroupResponse>(EDIT_GROUP_MUTATION, 'updateGroup')
}

// -------------------------------------------------------------------------------------------------

const DELETE_GROUP_MUTATION = gql`
    mutation DeleteGroup($id: String!) {
        deleteGroup(groupId: $id) {
            ok,
            infoText
        }
    }
`;

export function useDeleteGroupMutation() {
    return useMutationWithResponse(DELETE_GROUP_MUTATION, 'deleteGroup');
}

// -------------------------------------------------------------------------------------------------

const GET_GROUPS_QUERY = gql`
query GetGroups {
  filterGroups {
    groupId,
    name,
    physicalobjects {
    	edges {
            node {
                name
            }
        }
    },
    pictures(first: 1) {
      edges {
        node {
          fileId,
          path
        }
      }
    }
  }
}
`;

interface GetGroupsResponse {
    groupId: string;
    name: string;
    physicalobjects: {
        edges: {
            node: {
                name: string;
            }
        }[]
    };
    pictures: {
        edges: {
            node: {
                fileId: string;
                path: string;
            }
        }[]
    }
}

export type PreviewGroup = Omit<Group, 'physicalObjects'> & { pysicalObjectNames: string[] };

export function useGetGroupsQuery() {
    const mapToGroup = (val: GetGroupsResponse[]) => {
        return val.map((groupResponse) => {
            const flattenedPhysicalObjects = flattenEdges<{ name: string }, 'physicalobjects', GetGroupsResponse>(groupResponse, 'physicalobjects');
            const flattenedResponse = flattenEdges<{ fileId: string, path: string }, 'pictures', typeof flattenedPhysicalObjects>(flattenedPhysicalObjects, 'pictures');
            const group: PreviewGroup = {
                groupId: flattenedResponse.groupId,
                name: flattenedResponse.name,
                pictures: flattenedResponse.pictures.map(pic => { return { ...pic, type: 'remote' } }),
                pysicalObjectNames: flattenedResponse.physicalobjects.map((val) => val.name)
            };
            return group;
        });
    };

    return useSuspenseQueryWithResponseMapped<GetGroupsResponse[], PreviewGroup[]>(GET_GROUPS_QUERY, 'filterGroups', {}, mapToGroup);
}

// -----------------------------------------------------------------


const GET_GROUP_BY_ID_QUERY = gql`
query GetGroupById($groupId: String!) {
  filterGroups(groupId: $groupId) {
    name,
    physicalobjects {
    	edges {
            node {
            physId
            }
        }
    },
    pictures {
      edges {
        node {
          fileId,
          path
        }
      }
    }
  }
}
`;

interface GetGroupByIdResponse {
    name: string;
    physicalobjects: {
        edges: {
            node: {
                physId: string;
            }
        }[]
    },
    pictures: {
        edges: {
            node: {
                fileId: string;
                path: string;
            }
        }[]
    }
}

export function useGetAddGroupItemByIdQuery(groupId: string) {
    const mapToGroup = (val: GetGroupByIdResponse[]) => {
        if (!val || val.length !== 1)
            throw { error: 'Group invalid' };

        const flattenedPhysicalObjects = flattenEdges<{ physId: string }, 'physicalobjects', GetGroupByIdResponse>(val[0], 'physicalobjects');
        const flattenedResponse = flattenEdges<{ fileId: string, path: string }, 'pictures', typeof flattenedPhysicalObjects>(
            flattenedPhysicalObjects,
            'pictures'
        );

        const group: AddGroupItem = {
            name: flattenedResponse.name,
            physicalObjectIds: flattenedResponse.physicalobjects.map(val => val.physId),
            pictures: flattenedResponse.pictures.map(pic => { return { type: 'remote', fileId: pic.fileId, path: pic.path } })
        }
        
        return group;
    };

    return useSuspenseQueryWithResponseMapped<GetGroupByIdResponse[], AddGroupItem>(
        GET_GROUP_BY_ID_QUERY,
        'filterGroups',
        { variables: { groupId: groupId } },
        mapToGroup
    );
}