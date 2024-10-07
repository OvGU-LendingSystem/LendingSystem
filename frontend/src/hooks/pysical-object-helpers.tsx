import { gql } from "@apollo/client";
import { flattenEdges, GQLResponse, useMutationWithResponse, useSuspenseQueryWithResponseMapped } from "./response-helper";
import { InventoryItem } from "../models/InventoryItem.model";

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

export function useAddPhysicalObject() {
    const [ mutate ] = useMutationWithResponse<AddPhysicalObjectResponse>(ADD_PYSICAL_OBJECT, 'createPhysicalObject');
    return [ mutate ];
}

const EDIT_PYSICAL_OBJECT = gql`
    mutation EditPhysicalObject(
        $physId: String!,
        $invNumInternal: Int!, $invNumExternal: Int!, $storageLocation: String!,
        $name: String!, $deposit: Int!,
        $faults: String!, $description: String!,
        $pictures: [String!]!,
        $manuals: [String!]!,
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
            storageLocation2: $storageLocation2,
            borrowable: $borrowable
        ) {
            ok    
            infoText
        }
    }
`;

export interface EditPhysicalObjectResponse extends GQLResponse {
    ok: boolean,
    infoText: string
}

export function useEditPhysicalObject() {
    const [ mutate ] = useMutationWithResponse<EditPhysicalObjectResponse>(EDIT_PYSICAL_OBJECT, 'updatePhysicalObject');
    return [ mutate ];
}

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
    pictures: {
      edges: {
        node: {
          fileId: string,
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
                images: flattenedVal.pictures.map((pic) => {return { type: 'remote', ...pic }})
            };
            return res;
        });
    }

    return useSuspenseQueryWithResponseMapped<GetPhysicalObjectsResponse[], InventoryItem[]>(GET_PHYSICAL_OBJECTS, 'filterPhysicalObjects', {}, mapResponseToItem);
}