import { ApolloCache, DefaultContext, MutationFunctionOptions, OperationVariables, SuspenseQueryHookOptions, useMutation, useSuspenseQuery } from "@apollo/client";
import { DocumentNode } from "graphql";
import { useMemo } from "react";

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

export function flattenEdges<U = any, Key extends string = string, T extends { [key in Key]: { edges: { node: U }[] } } = any>(obj: T, key: Key): Omit<T, Key> & { [key in Key]: U[] } {
    const res = { ...obj, [key]: obj[key].edges.map(edge => edge.node) };
    return res;
}

export function useMutationWithResponseMapped<T extends GQLResponse, U extends GQLResponse = T>(mutation: DocumentNode, queryName: string, map: (val: SuccessResponse<T>) => SuccessResponse<U>) {
    const [ mutateInternal ] = useMutation<{ [queryName: string]: T }>(mutation);
    const mutate = async (options?: MutationFunctionOptions<{ [queryName: string]: T }, OperationVariables, DefaultContext, ApolloCache<any>> | undefined) => {
        try {
            const response = await mutateInternal(options);
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

export function useSuspenseQueryWithResponseMapped<T, U = T>(query: DocumentNode, queryName: string, options: SuspenseQueryHookOptions<{ [queryName: string]: T }, OperationVariables>, map: (val: T) => U) {
    const queryResult = useSuspenseQuery<{ [queryName: string]: T }>(query, options);
    const data = useMemo(() => {
        if (queryResult.error) {
            const result: ErrorResponse = {
                success: false,
                info: queryResult.error.toString()
            }
            throw result;
        }

        if (queryResult.data) {
            return map(queryResult.data[queryName]);
        }

        const result: ErrorResponse = {
            success: false,
            info: 'No data'
        };
        throw result;
    }, [queryResult, queryResult.data]);

    return { ...queryResult, data };
}

export function useSuspenseQueryWithResponse<T>(query: DocumentNode, queryName: string, options: SuspenseQueryHookOptions<{ [queryName: string]: T }, OperationVariables>) {
    return useSuspenseQueryWithResponseMapped<T, T>(query, queryName, options, (val) => val);
}