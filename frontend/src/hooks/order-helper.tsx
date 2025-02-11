import { gql } from "@apollo/client";
import { flattenEdges, useSuspenseQueryWithResponseMapped } from "./response-helper";

const GET_ORDER = gql`
query All($fromDay: Date, $tillDay: Date) {
  filterOrders(fromDay: $fromDay, tillDay: $tillDay) {
    orderId,
    fromDate,
    tillDate,
    physicalobjects {
        edges {
            node {
                orderStatus
                physicalobject {
                    physId,
                    name,
                    lendingComment,
                    returnComment
                }
            }
        }
    }
    users(first: 1) {
        edges {
            node {
                firstName
                lastName
            }
        }
    }
  }
}`;

interface OrderResponse {
    orderId: string;
    fromDate: string;
    tillDate: string;
    physicalobjects: {
        edges: {
            node: {
                orderStatus: string;
                physicalobject: {
                    physId: string;
                    name: string;
                    lendingComment: string;
                    returnComment: string;
                }
            }
        }[]
    };
    users: {
        edges: {
            node: {
                firstName: string;
                lastName: string;
            }
        }[]
    }
}

export interface Order {
    orderId: string;
    fromDate: Date;
    tillDate: Date;
    physicalObjects: {
        orderStatus: string;
        physId: string;
        name: string;
        lendingComment: string;
        returnComment: string;
    }[];
    user: {
        firstName: string;
        lastName: string;
    }
}

export function useGetOrder(fromDay: Date | undefined, tillDay: Date | undefined) {
    const mapToOrder = (response: OrderResponse[]) => {
        return response.map(orderResponse => {
            const flattenedOrder = flattenEdges<{ orderStatus: string, physicalobject: {
                physId: string;
                name: string;
                lendingComment: string;
                returnComment: string;
            } }, 'physicalobjects', OrderResponse>(orderResponse, 'physicalobjects');
            const physicalObjects = flattenedOrder.physicalobjects.map((obj) => {
                return {
                    orderStatus: obj.orderStatus,
                    ...obj.physicalobject
                }
            });
            const order: Order = {
                orderId: orderResponse.orderId,
                fromDate: new Date(orderResponse.fromDate),
                tillDate: new Date(orderResponse.tillDate),
                physicalObjects: physicalObjects,
                user: {
                    firstName: flattenedOrder.users.edges[0]?.node?.firstName ?? '',
                    lastName: flattenedOrder.users.edges[0]?.node?.lastName ?? ''
                }
            };
            return order;
        });
    };

    return useSuspenseQueryWithResponseMapped<OrderResponse[], Order[]>(GET_ORDER, 'filterOrders', {
        variables: {
            fromDay: fromDay,
            tillDay: tillDay
        }
    }, mapToOrder);
}