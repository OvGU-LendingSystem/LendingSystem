import { gql } from "@apollo/client";
import { flattenEdges, GQLResponse, useMutationWithResponse, useSuspenseQueryWithResponseMapped } from "./response-helper";
import { AddInventoryItem, InventoryItem } from "../models/InventoryItem.model";
import { RemoteFile, RemoteImage } from "../models/file.model";
import { RemoteTag } from "../models/tag.model";

const ADD_PYSICAL_OBJECT = gql`
    mutation AddPhysicalObject(
        $invNumInternal: Int!, $invNumExternal: Int!, $storageLocation: String!,
        $name: String!, $tags: [String!]!,
        $deposit: Int!,
        $faults: String!, $description: String!,
        $borrowable: Boolean!,
        $storageLocation2: String!,
        $organizationId: String!,
        $pictures: [String!]!,
        $manuals: [String!]!
    ) {
        createPhysicalObject(
            invNumInternal: $invNumInternal, invNumExternal: $invNumExternal,
            borrowable: $borrowable,
            storageLocation: $storageLocation, storageLocation2: $storageLocation2,
            name: $name, organizationId: $organizationId,
            tags: $tags,
            deposit: $deposit,
            faults: $faults, description: $description,
            pictures: $pictures,
            manual: $manuals
        ) {
            ok    
            infoText
            physicalObject {
                physId
            }
        }
    }
`;

export interface AddPhysicalObjectResponse extends GQLResponse {
    physicalObject: {
        physId: string
    }
}

export interface AddPhysicalObjectVars {
    invNumInternal: number,
    invNumExternal: number,
    storageLocation: string,
    name: string,
    tags: string[],
    deposit: number,
    faults: string,
    description: string,
    borrowable: boolean,
    storageLocation2: string,
    organizationId: string,
    pictures: string[],
    manuals: string[]
}

export function useAddPhysicalObject() {
    const [ mutate ] = useMutationWithResponse<AddPhysicalObjectResponse, AddPhysicalObjectVars>(
        ADD_PYSICAL_OBJECT,
        'createPhysicalObject',
        { refetchQueries: [ GET_PHYSICAL_OBJECT, GET_PHYSICAL_OBJECTS, FILTER_INVENTORY_BY_NAME ] }
    );
    return [ mutate ];
}

// -----------------------------------------------------------------------------

const EDIT_PYSICAL_OBJECT = gql`
    mutation EditPhysicalObject(
        $physId: String!,
        $invNumInternal: Int!, $invNumExternal: Int!, $storageLocation: String!,
        $name: String!, $deposit: Int!,
        $faults: String!, $description: String!,
        $pictures: [String!]!,
        $manuals: [String!]!,
        $tags: [String!]!,
        $storageLocation2: String!,
        $borrowable: Boolean!
    ) {
        updatePhysicalObject(
            physId: $physId,
            invNumInternal: $invNumInternal, invNumExternal: $invNumExternal,
            storageLocation: $storageLocation,
            name: $name, deposit: $deposit,
            faults: $faults, description: $description,
            pictures: $pictures,
            manual: $manuals,
            tags: $tags,
            storageLocation2: $storageLocation2,
            borrowable: $borrowable
        ) {
            ok    
            infoText
        }
    }
`;

export interface EditPhysicalObjectVars {
    physId: string,
    invNumInternal: number,
    invNumExternal: number,
    storageLocation: string,
    name: string,
    deposit: number,
    faults: string,
    description: string,
    pictures: string[],
    manuals: string[],
    tags: string[],
    storageLocation2: string,
    borrowable: boolean
}

export interface EditPhysicalObjectResponse extends GQLResponse {
    ok: boolean,
    infoText: string
}

export function useEditPhysicalObject() {
    const [ mutate ] = useMutationWithResponse<EditPhysicalObjectResponse, EditPhysicalObjectVars>(
        EDIT_PYSICAL_OBJECT,
        'updatePhysicalObject',
        { refetchQueries: [ GET_PHYSICAL_OBJECT, GET_PHYSICAL_OBJECTS, FILTER_INVENTORY_BY_NAME ] }
    );
    return [ mutate ];
}

// -----------------------------------------------------------------------------

const DELETE_PHYSICAL_OBJECT = gql`
mutation DeletePhysicalObject($id: String!) {
  deletePhysicalObject(physId: $id) {
    ok
    infoText
    statusCode
  }
}`;


export interface DeletePhysicalObjectVars {
    id: string
}

export function useDeletePhysicalObject() {
    return useMutationWithResponse<GQLResponse, DeletePhysicalObjectVars>(
        DELETE_PHYSICAL_OBJECT,
        'deletePhysicalObject',
        { refetchQueries: [ GET_PHYSICAL_OBJECT, GET_PHYSICAL_OBJECTS, FILTER_INVENTORY_BY_NAME ] }
    );
}

// -----------------------------------------------------------------------------

const GET_PHYSICAL_OBJECT = gql`
    query GetPhysicalObject($id: String!) {
        filterPhysicalObjects(physId: $id) {
            physId,
            invNumInternal,
            invNumExternal,
            borrowable,
            storageLocation,
            name,
            deposit,
            faults,
            description,
            borrowable,
            storageLocation2,
            organizationId,
            manual {
                edges {
                    node {
                        path,
                        fileId
                    }
                }
            },
            pictures {
                edges {
                    node {
                        path,
                        fileId
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
            }
        }
    }
`;

interface GetPhysicalObjectResponse {
    name: string,
    borrowable: boolean,
    storageLocation: string,
    description: string,
    faults: string,
    deposit: number,
    invNumInternal: number,
    invNumExternal: number,
    storageLocation2: string,
    organizationId: string,
    manual: {
        edges: {
            node: {
                path: string,
                fileId: string
            }
        }[]
    },
    pictures: {
        edges: {
            node: {
                path: string,
                fileId: string
            }
        }[]
    },
    tags: {
        edges: {
            node: {
                tagId: string,
                name: string
            }
        }[]
    }
}

export function useGetAddPhysicalObject(id: string) {
    const mapResponseToItem = (response: GetPhysicalObjectResponse[]) => {
        if (response.length === 0) {
            throw new Error('Not found'); // TODO
        }

        const flattenedPics = flattenEdges<{ fileId: string, path: string }, 'pictures', GetPhysicalObjectResponse>(response[0], 'pictures');
        const flattenedManuals = flattenEdges<{ fileId: string, path: string }, 'manual', typeof flattenedPics>(flattenedPics, 'manual');
        const flattened = flattenEdges<{ tagId: string, name: string }, 'tags', typeof flattenedManuals>(flattenedManuals, 'tags');

        const res: AddInventoryItem = {
            name: flattened.name,
            inventoryNumberInternal: flattened.invNumInternal,
            inventoryNumberExternal: flattened.invNumExternal,
            borrowable: flattened.borrowable,
            deposit: flattened.deposit,
            storageLocation: flattened.storageLocation,
            storageLocation2: flattened.storageLocation2,
            defects: flattened.faults,
            description: flattened.description,
            images: flattened.pictures.map((pic): RemoteImage => ({ type: 'remote', ...pic })),
            manuals: flattened.manual.map((man): RemoteFile => ({ type: 'remote', ...man })),
            tags: flattened.tags.map((tag): RemoteTag => ({ id: tag.tagId, tag: tag.name })),
            organizationId: flattened.organizationId
        };
        return res;
    }

    return useSuspenseQueryWithResponseMapped<GetPhysicalObjectResponse[], AddInventoryItem>(
        GET_PHYSICAL_OBJECT,
        'filterPhysicalObjects',
        { variables: { id: id } },
        mapResponseToItem
    );
}

// -----------------------------------------------------------------------------

const GET_PHYSICAL_OBJECTS = gql`
query GetPhysicalObjects {
  filterPhysicalObjects {
    physId,
    name,
    invNumInternal,
    invNumExternal,
    borrowable,
    deposit,
    storageLocation,
    faults,
    description,
    lendingComment,
    returnComment,
    pictures{
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
          manualId,
          path
        }
      }
    }
  }
}
`;

interface GetPhysicalObjectsResponse {
    physId: string;
    name: string;
    invNumInternal: number;
    invNumExternal: number;
    borrowable: boolean;
    deposit: number;
    storageLocation: string;
    faults: string;
    description: string;
    lendingComment: string;
    returnComment: string;
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

export function useGetPhysicalObjects() {
    const mapResponseToItem = (response: GetPhysicalObjectsResponse[]) => {
        return response.map(val => {
            const flattenedVal = flattenEdges<{fileId: string, path: string}, 'pictures', GetPhysicalObjectsResponse>(val, 'pictures');
            const res: InventoryItem = {
                physId: flattenedVal.physId,
                name: flattenedVal.name,
                inventoryNumberInternal: flattenedVal.invNumInternal,
                inventoryNumberExternal: flattenedVal.invNumExternal,
                borrowable: flattenedVal.borrowable,
                deposit: flattenedVal.deposit,
                storageLocation: flattenedVal.storageLocation,
                defects: flattenedVal.faults,
                description: flattenedVal.description,
                images: flattenedVal.pictures.map((pic) => {return { type: 'remote', ...pic }}),
                category: flattenedVal.tags.edges[0]?.node?.name ?? "",
                organizationId: flattenedVal.organization.organizationId,
                organization: flattenedVal.organization.name,
                physicalObjects: undefined,
                lendingComment: flattenedVal.lendingComment,
                returnComment: flattenedVal.returnComment,
                manualPath: flattenedVal.manual.edges[0]?.node.path || ""
            };
            return res;
        });
    }

    return useSuspenseQueryWithResponseMapped<GetPhysicalObjectsResponse[], InventoryItem[]>(GET_PHYSICAL_OBJECTS, 'filterPhysicalObjects', {}, mapResponseToItem);
}

// -----------------------------------------------------------------------------

const FILTER_INVENTORY_BY_NAME = gql`
    query FilterInventoryByName($name: String, $orgIds: [String!]) {
        filterPhysicalObjects(name: $name, organizations: $orgIds) {
            physId,
            name,
            description,
            deposit,
            invNumInternal,
            invNumExternal,
            faults,
            pictures {
                edges {
                    node {
                        path
                    }
                }
            },
            manual  {
                edges  {
                    node  {
                        manualId,
                        path
                    }
                }
            }
        }
    }
`;

interface FilterPhysicalObjectsByNameResponse {
    physId: string;
    name: string;
    description: string;
    deposit: number;
    faults: string;
    invNumInternal: number;
    invNumExternal: number;
    pictures: {
        edges: {
            node: {
                path: string;
            }
        }[]
    }
    manual: {
        edges: {
            node:{
                manualId: string,
                path: string
            }
        }[]
    }
}

export interface PreviewPhysicalObject {
    id: string;
    name: string;
    description: string;
    invNumInternal?: number;
    invNumExternal?: number;
    deposit?: number;
    imageSrc?: string;
    manualPath? : string;
    faults?: string;
}

const BASE_IMAGE_PATH = process.env.REACT_APP_PICUTRES_BASE_URL;

export function useFilterPhysicalObjectsByName(orgIds?: string[], name?: string) {
    const mapResponseToItem = (response: FilterPhysicalObjectsByNameResponse[]) => {
        return response.map(val => {
            const flattenedVal = flattenEdges<{ path: string }, 'pictures', FilterPhysicalObjectsByNameResponse>(val, 'pictures');
            const imageSrc = flattenedVal.pictures[0]?.path ? BASE_IMAGE_PATH + flattenedVal.pictures[0]?.path : undefined;
            const res: PreviewPhysicalObject = {
                id: flattenedVal.physId,
                name: flattenedVal.name,
                invNumInternal: flattenedVal.invNumInternal,
                invNumExternal: flattenedVal.invNumExternal,
                deposit: flattenedVal.deposit,
                description: flattenedVal.description,
                imageSrc: imageSrc,
                manualPath: flattenedVal.manual.edges[0]?.node.path || "",
                faults: flattenedVal.faults,
            }
            return res;
        });
    }

    return useSuspenseQueryWithResponseMapped<FilterPhysicalObjectsByNameResponse[], PreviewPhysicalObject[]>(
        FILTER_INVENTORY_BY_NAME,
        'filterPhysicalObjects',
        { variables: { name: name, orgIds: orgIds } },
        mapResponseToItem
    );
}