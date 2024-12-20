import { gql } from "@apollo/client";
import { flattenEdges, useLazyQueryWithResponseMapped, useMutationWithResponse } from "./response-helper";
import { OrganizationInfo, User } from "../models/user.model";

const CHECK_SESSION = gql`
mutation CheckSession {
  checkSession {
    ok,
    infoText,
    userId
  }
}
`;

const GET_USER = gql`
query GetUser($userId: String!) {
  filterUsers(userId: $userId) {
    id: userId
    
    firstName
    lastName
    matricleNumber
  
  	email
    
    country
    postcode
    city
    street
    houseNumber
    
    organizationInfoList: organizations {
      edges {
        node {
          id: organizationId
          rights
          agbDontShow
        }
      }
    }
  }
}
`;

export interface SessionSuccess {
    ok: true;
    infoText: string;
    userId: string;
}

export interface SessionError {
    ok: false;
    infoText: string;
}

export type CheckSessionResponse = SessionSuccess | SessionError;

export function useCheckSession() {
    return useMutationWithResponse<CheckSessionResponse>(CHECK_SESSION, 'checkSession');
}

type UserResponse = Omit<User, 'organizationInfoList'> & {
    organizationInfoList: {
        edges: {
            node: OrganizationInfo
        }[]
    }
};

export function useGetUserLazy() {
    const mapToUser = (response: UserResponse[]) => {
        if (response.length === 0) {
            console.error('User not found');
            return;
        }
        if (response.length !== 1) {
            console.error('Multiple users found for same id, using first');
        }

        return flattenEdges<OrganizationInfo, 'organizationInfoList', UserResponse>(response[0], 'organizationInfoList');
    };

    return useLazyQueryWithResponseMapped<UserResponse[], User | undefined>(GET_USER, 'filterUsers', mapToUser);
}