import { gql } from "@apollo/client";
import { flattenEdges, GQLResponse, useMutationWithResponse, useSuspenseQueryWithResponseMapped } from "./response-helper";
import { AddGroupItem, Group } from "../models/group.model";
import { InventoryItem } from "../models/InventoryItem.model";

const ADD_GROUP_MUTATION = gql`
    mutation AddGroup($name: String!, $physicalObjects: [String!]!, $description: String!, $pictures: [String!]!) {
        createGroup(name: $name, physicalobjects: $physicalObjects, description: $description, pictures: $pictures) {
            ok,
            infoText
        }
    }
`;

export type AddGroupResponse = GQLResponse;

export interface AddGroupVars {
    name: string,
    description: string,
    physicalObjects: string[],
    pictures: string[]
}

export function useAddGroupMutation() {
    return useMutationWithResponse<AddGroupResponse, AddGroupVars>(ADD_GROUP_MUTATION, 'createGroup', {
        refetchQueries: [ GET_GROUPS_QUERY, GET_GROUP_BY_ID_QUERY ]
    });
}

const EDIT_GROUP_MUTATION = gql`
    mutation EditGroup($groupId: String!, $name: String!, $physicalObjects: [String!]!, $description: String!, $pictures: [String!]!) {
        updateGroup(groupId: $groupId, name: $name, physicalobjects: $physicalObjects, description: $description, pictures: $pictures) {
            ok,
            infoText
        }
    }
`;

export type EditGroupResponse = GQLResponse;

export interface EditGroupVars {
    groupId: string,
    name: string,
    description: string,
    physicalObjects: string[],
    pictures: string[]
}

export function useEditGroupMutation() {
    return useMutationWithResponse<EditGroupResponse, EditGroupVars>(EDIT_GROUP_MUTATION, 'updateGroup', {
        refetchQueries: [ GET_GROUPS_QUERY, GET_GROUP_BY_ID_QUERY ]
    });
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

export interface DeleteGroupVars {
    id: string
}

export function useDeleteGroupMutation() {
    return useMutationWithResponse<GQLResponse, DeleteGroupVars>(DELETE_GROUP_MUTATION, 'deleteGroup', {
        refetchQueries: [ GET_GROUPS_QUERY, GET_GROUP_BY_ID_QUERY ]
    });
}

// -------------------------------------------------------------------------------------------------

const GET_ALL_GROUPS_QUERY = gql`
query GetAllGroups {
  filterGroups{
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
    organization{
      organizationId,
      name
    }
  }
}
`;

interface GroupsResponse {
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
    };
    organization: {
        organizationId: string;
        name: string;
    }
}

export type PreviewGroup2 = Omit<Group, 'physicalObjects'> & { pysicalObjectNames: string[] };

export function useGetAllGroupsQuery() {
    const mapToGroup = (val: GroupsResponse[]) => {
        return val.map((groupResponse) => {
            const flattenedPhysicalObjects = flattenEdges<{ name: string }, 'physicalobjects', GroupsResponse>(groupResponse, 'physicalobjects');
            const flattenedResponse = flattenEdges<{ fileId: string, path: string }, 'pictures', typeof flattenedPhysicalObjects>(flattenedPhysicalObjects, 'pictures');
            const group: InventoryItem = {
                physId: "group " + flattenedResponse.groupId,
                name: flattenedResponse.name, 
                inventoryNumberInternal: -1,
                inventoryNumberExternal: -1,
                borrowable: true,
                deposit: 0,//TODO DEPOSIT helper
                storageLocation: "group",
                defects: "group",
                description: "Gruppe / group",//TODO description
                images: flattenedResponse.pictures.map(pic => { return { ...pic, type: 'remote' } }),
                category: "Gruppe / group",//TODO Kategorie
                organizationId: groupResponse.organization.organizationId,
                organization: groupResponse.organization.name

                /*groupId: flattenedResponse.groupId,
                name: flattenedResponse.name,
                pictures: flattenedResponse.pictures.map(pic => { return { ...pic, type: 'remote' } }),
                pysicalObjectNames: flattenedResponse.physicalobjects.map((val) => val.name)*/
            };
            return group;
        });
    };

    return useSuspenseQueryWithResponseMapped<GroupsResponse[], InventoryItem[]>(GET_ALL_GROUPS_QUERY, 'filterGroups', {}, mapToGroup);
}

const GET_GROUPS_QUERY = gql`
query GetGroups($name: String, $orgIds: [String!]!) {
  filterGroups(name: $name, organizations: $orgIds) {
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

export function useGetGroupsQuery(orgIds: string[], name?: string) {
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

    return useSuspenseQueryWithResponseMapped<GetGroupsResponse[], PreviewGroup[]>(GET_GROUPS_QUERY, 'filterGroups', {
        variables: {
            orgIds: orgIds,
            name: name
        }
    }, mapToGroup);
}

// -----------------------------------------------------------------


const GET_GROUP_BY_ID_QUERY = gql`
query GetGroupById($groupId: String!) {
  filterGroups(groupId: $groupId) {
    name,
    description
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
    description: string;
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
            description: flattenedResponse.description,
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