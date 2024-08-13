import { gql } from "@apollo/client";
import { GQLResponse, useMutationWithResponse } from "./response-helper";

const ADD_PYSICAL_OBJECT = gql`
    mutation AddPhysicalObject(
        $invNumInternal: Int!, $invNumExternal: Int!, $storageLocation: String!,
        $name: String!, $tags: [String!]!,
        $deposit: Int!,
        $faults: String!, $description: String!,
        $borrowable: Boolean!,
        $storageLocation2: String!,
        $organizationId: String!,
        $pictures: [String!]!
    ) {
        createPhysicalObject(
            invNumInternal: $invNumInternal, invNumExternal: $invNumExternal,
            borrowable: $borrowable,
            storageLocation: $storageLocation, storageLocation2: $storageLocation2,
            name: $name, organizationId: $organizationId,
            tags: $tags,
            deposit: $deposit,
            faults: $faults, description: $description,
            pictures: $pictures
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
            storageLocation2: $storageLocation2,
            borrowable: $borrowable
        ) {
            ok    
            infoText
        }
    }
`;

interface EditPhysicalObjectResponse extends GQLResponse {
    ok: boolean,
    infoText: string
}

export function useEditPhysicalObject() {
    const [ mutate ] = useMutationWithResponse<EditPhysicalObjectResponse>(EDIT_PYSICAL_OBJECT, 'updatePhysicalObject');
    return [ mutate ];
}