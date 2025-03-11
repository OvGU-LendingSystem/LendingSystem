import { gql } from "@apollo/client";
import { flattenEdges, GQLResponse, useMutationWithResponse, useSuspenseQueryWithResponseMapped } from "./response-helper";
import { AddGroupItem, Group } from "../models/group.model";
import { InventoryItem } from "../models/InventoryItem.model";
import { RemoteTag } from "../models/tag.model";

const ADD_GROUP_MUTATION = gql`
    mutation AddGroup($name: String!, $physicalObjects: [String!]!, $description: String!, $pictures: [String!]!, $organizationId: String!, $tags: [String!]!) {
        createGroup(name: $name, physicalobjects: $physicalObjects, description: $description, pictures: $pictures, organizationId: $organizationId, tags: $tags) {
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
    pictures: string[],
    organizationId: string,
    tags: string[]
}

export function useAddGroupMutation() {
    return useMutationWithResponse<AddGroupResponse, AddGroupVars>(ADD_GROUP_MUTATION, 'createGroup', {
        refetchQueries: [ GET_GROUPS_QUERY, GET_GROUP_BY_ID_QUERY ]
    });
}

const EDIT_GROUP_MUTATION = gql`
    mutation EditGroup($groupId: String!, $name: String!, $physicalObjects: [String!]!, $description: String!, $pictures: [String!]!, $tags: [String!]!) {
        updateGroup(groupId: $groupId, name: $name, physicalobjects: $physicalObjects, description: $description, pictures: $pictures, tags: $tags) {
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
    pictures: string[],
    tags: string[]
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
                physId,
                name,
                invNumInternal,
                invNumExternal,
                borrowable,
                deposit,
                storageLocation,
                faults,
                description,
                pictures(first: 1) {
                edges {
                    node {
                    fileId,
                    path
                    }
                }
                },
                tags{
                edges{
                    node{
                    tagId,
                    name
                    }
                }
                },
                organization{
                organizationId,
                name
                },
              	manual{
                  edges{
                    node{
                      path,
                      manualId
                    }
                  }
                }
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
    description,
    tags{
      edges{
        node{
          tagId,
          name
        }
      }
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
                physId: string;
                name: string;
                invNumInternal: number;
                invNumExternal: number;
                borrowable: boolean;
                deposit: number;
                storageLocation: string;
                faults: string;
                description: string;
                pictures: {
                edges: {
                    node: {
                    fileId: string,
                    path: string
                    }
                }[]
                };
                tags: {
                    edges: {
                        node:{
                            tagId: string,
                            name: string
                        }
                    }[]
                };
                organization: {
                    organizationId: string,
                    name: string
                };
                manual: {
                    edges: {
                        node:{
                            manualId: string,
                            path: string
                        }
                    }[]
                }

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
    description: string;
    tags: {
        edges: {
            node: {
                tagId: string,
                name: string
            }
        }[]
    }
}

export type PreviewGroup2 = Omit<Group, 'physicalObjects'> & { pysicalObjectNames: string[] };

export function useGetAllGroupsQuery() {
    const mapToGroup = (val: GroupsResponse[]) => {
        return val.map((groupResponse) => {
            const flattenedPhysicalObjects = flattenEdges<{ physId: string;
                name: string;
                invNumInternal: number;
                invNumExternal: number;
                borrowable: boolean;
                deposit: number;
                storageLocation: string;
                faults: string;
                description: string;
                pictures: {
                  edges: {
                    node: {
                      fileId: string,
                      path: string
                    }
                  }[]
                };
                tags: {
                    edges: {
                        node:{
                            tagId: string,
                            name: string
                        }
                    }[]
                };
                organization: {
                    organizationId: string,
                    name: string
                };
                manual: {
                    edges: {
                        node:{
                            manualId: string,
                            path: string
                        }
                    }[]
                }
            }, 'physicalobjects', GroupsResponse>(groupResponse, 'physicalobjects');
            const flattenedResponse = flattenEdges<{ fileId: string, path: string }, 'pictures', typeof flattenedPhysicalObjects>(flattenedPhysicalObjects, 'pictures');
            var sum=0;
            flattenedPhysicalObjects.physicalobjects.forEach(obj => {
                sum+=obj.deposit;
            });
            const phyObj = flattenedPhysicalObjects.physicalobjects.map((obj) =>{
                const res: InventoryItem = {
                    physId: obj.physId,
                    name: obj.name,
                    inventoryNumberExternal: obj.invNumExternal,
                    inventoryNumberInternal: obj.invNumInternal,    
                    storageLocation: obj.storageLocation,
                    defects: obj.faults,
                    borrowable: obj.borrowable,
                    deposit: obj.deposit,
                    description: obj.description,
                    images: obj.pictures.edges.map((pic) => {return { type: 'remote', ...pic.node }}),
                    category: obj.tags.edges[0]?.node?.name ?? "",
                    organizationId: obj.organization.organizationId,
                    organization: obj.organization.name,
                    physicalObjects: undefined,
                    manualPath: obj.manual.edges[0]?.node.path ?? ""
                };
                return res; 
            });
            const group: InventoryItem = {
                physId: "group " + flattenedResponse.groupId,
                name: flattenedResponse.name, 
                inventoryNumberInternal: -1,
                inventoryNumberExternal: -1,
                borrowable: true,
                deposit: sum,
                storageLocation: "group",
                defects: "group",
                description: flattenedResponse.description,
                images: flattenedResponse.pictures.map(pic => { return { ...pic, type: 'remote' } }),
                category: groupResponse.tags.edges[0]?.node.name ?? "",
                organizationId: groupResponse.organization.organizationId,
                organization: groupResponse.organization.name,
                physicalObjects: phyObj,
                manualPath: ""
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
    },
    tags {
      edges {
        node {
          tagId
          name
        }
      }
    },
    organizationId
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
    },
    tags: {
        edges: {
            node: {
                tagId: string;
                name: string;
            }
        }[]
    },
    organizationId: string
}

export function useGetAddGroupItemByIdQuery(groupId: string) {
    const mapToGroup = (val: GetGroupByIdResponse[]) => {
        if (!val || val.length !== 1)
            throw { error: 'Group invalid' };

        const flattenedPhysicalObjects = flattenEdges<{ physId: string }, 'physicalobjects', GetGroupByIdResponse>(val[0], 'physicalobjects');
        const flattenedPictures = flattenEdges<{ fileId: string, path: string }, 'pictures', typeof flattenedPhysicalObjects>(
            flattenedPhysicalObjects,
            'pictures'
        );
        const flattenedResponse = flattenEdges<{ tagId: string, name: string }, 'tags', typeof flattenedPictures>(
            flattenedPictures,
            'tags'
        );
        const group: AddGroupItem = {
            name: flattenedResponse.name,
            description: flattenedResponse.description,
            physicalObjectIds: flattenedResponse.physicalobjects.map(val => val.physId),
            pictures: flattenedResponse.pictures.map(pic => { return { type: 'remote', fileId: pic.fileId, path: pic.path } }),
            orgId: flattenedResponse.organizationId,
            tags: flattenedResponse.tags.map((tagResponse): RemoteTag => ({ id: tagResponse.tagId, tag: tagResponse.name }))
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