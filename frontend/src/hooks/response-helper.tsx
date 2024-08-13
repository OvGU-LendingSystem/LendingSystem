import { ApolloCache, DefaultContext, MutationFunctionOptions, OperationVariables, useMutation } from "@apollo/client";
import { DocumentNode } from "graphql";

export interface GQLResponse {
    ok: boolean;
    infoText: string;
}

export type SuccessResponse<T extends GQLResponse> = Omit<T, 'ok' | 'infoText'> & { success: true };

export interface ErrorResponse {
    success: false;
    info: string;
}

export function isSuccessResponse<T extends GQLResponse>(response: T): SuccessResponse<T> | ErrorResponse {
    return response.ok ? {
        success: true,
        ...response
    } : {
        success: false,
        info: response.infoText
    }
}

export function useMutationWithResponseMapped<T extends GQLResponse, U extends GQLResponse = T>(mutation: DocumentNode, queryName: string, map: (val: SuccessResponse<T>) => SuccessResponse<U>) {
    const [ mutateInternal ] = useMutation<{ [queryName: string]: T }>(mutation);
    const mutate = async (options?: MutationFunctionOptions<{ [queryName: string]: T }, OperationVariables, DefaultContext, ApolloCache<any>> | undefined) => {
        try {
            const response = await mutateInternal(options);
            console.error("response", response);
            if (response.errors) {
                const result: ErrorResponse = {
                    success: false,
                    info: response.errors.toString()
                }
                return result;
            }

            if (response.data) {
                const result = isSuccessResponse(response.data[queryName]);
                return result.success ? map(result) : result;
            }

            const result: ErrorResponse = {
                success: false,
                info: 'No data'
            };
            return result;
        } catch (e: any) {
            return { success: false, info: e.toString() };
        }
    }

    return [ mutate ];
}

export function useMutationWithResponse<T extends GQLResponse>(mutation: DocumentNode, queryName: string) {
    return useMutationWithResponseMapped<T, T>(mutation, queryName, (val) => val);
}