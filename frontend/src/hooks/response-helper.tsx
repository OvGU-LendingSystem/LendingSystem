import { ApolloCache, DefaultContext, MutationFunctionOptions, OperationVariables, SuspenseQueryHookOptions, useLazyQuery, useMutation, useSuspenseQuery } from "@apollo/client";
import { DocumentNode } from "graphql";
import { useMemo } from "react";

export interface GQLResponse {
    ok: boolean;
    infoText: string;
}

export type SuccessResponse<T extends GQLResponse = GQLResponse> = Omit<Extract<T, { ok: true }>, 'ok' | 'infoText'> & { success: true };

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

export function useMutationWithResponseMapped<
    TVars = OperationVariables,
    TContext = DefaultContext,
    TCache extends ApolloCache<any> = ApolloCache<any>,
    T extends GQLResponse = GQLResponse,
    U extends GQLResponse = T
>(
    mutation: DocumentNode,
    queryName: string,
    map: (val: SuccessResponse<T>) => SuccessResponse<U>,
    baseOptions: MutationFunctionOptions<TVars, TContext, TCache> = {}
): [ (options?: MutationFunctionOptions<{ [queryName: string]: T }, TVars, TContext, TCache>) => Promise<SuccessResponse<T> | ErrorResponse> ] {
    const [ mutateInternal ] = useMutation<{ [queryName: string]: T }, TVars, TContext, TCache>(mutation);
    const mutate = async (options?: MutationFunctionOptions<{ [queryName: string]: T }, TVars, TContext, TCache>) => {
        const mutationOptions = {};
        Object.assign(mutationOptions, baseOptions, options);

        try {
            const response = await mutateInternal(mutationOptions);
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

export function useMutationWithResponse<
    T extends GQLResponse,
    TVars = OperationVariables,
    TContext= DefaultContext,
    TCache extends ApolloCache<any> = ApolloCache<any>
>(mutation: DocumentNode, queryName: string, baseOptions: MutationFunctionOptions<TVars, TContext, TCache> = {}) {
    return useMutationWithResponseMapped<TVars, TContext, TCache, T, T>(mutation, queryName, (val) => val, baseOptions);
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
    }, [queryResult, map, queryName]);

    return { ...queryResult, data };
}

export function useSuspenseQueryWithResponse<T>(query: DocumentNode, queryName: string, options: SuspenseQueryHookOptions<{ [queryName: string]: T }, OperationVariables>) {
    return useSuspenseQueryWithResponseMapped<T, T>(query, queryName, options, (val) => val);
}


export function useLazyQueryWithResponseMapped<T, U = T, TVariables extends OperationVariables = OperationVariables>(query: DocumentNode, queryName: string, map: (val: T) => U) {
    const [ queryFn ] = useLazyQuery<{ [queryName: string]: T }, TVariables>(query);
    
    const transform = (queryResult: Awaited<ReturnType<typeof queryFn>>) => {
        if (queryResult.error) {
            const result: ErrorResponse = {
                success: false,
                info: queryResult.error.toString()
            }
            return result;
        }

        if (queryResult.data) {
            return {
                success: true,
                data: map(queryResult.data[queryName])
            };
        }

        const result: ErrorResponse = {
            success: false,
            info: 'No data'
        };
        return result;
    }

    const queryMapped = async (...options: Parameters<typeof queryFn>) => {
        const result = await queryFn(...options);
        return transform(result);
    };

    return queryMapped;
}

export function useLazyQueryWithResponse<T>(query: DocumentNode, queryName: string) {
    return useLazyQueryWithResponseMapped<T, T>(query, queryName, (val) => val);
}