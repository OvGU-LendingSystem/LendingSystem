import { gql, useMutation } from "@apollo/client";
import { flattenEdges, GQLResponse, useMutationWithResponse, useSuspenseQueryWithResponseMapped } from "./response-helper";

const GET_MAX_DEPOSIT_MUTATION = gql`
    mutation GetMaxDeposit($organizationId: String!, $userRight: String!) {
        getMaxDeposit(organizationId: $organizationId, userRight: $userRight) {
            maxDeposit,
            ok,
            infoText
        }
    }
`;

export function useGetDepositForCart() {
    return useMutation(GET_MAX_DEPOSIT_MUTATION);
}

