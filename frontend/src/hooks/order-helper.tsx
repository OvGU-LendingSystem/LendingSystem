import { gql, useMutation } from "@apollo/client";
import { flattenEdges, useSuspenseQueryWithResponseMapped } from "./response-helper";

const CREATE_ORDER = gql`
mutation CreateOrder(
    $deposit: Int,
    $fromDate: DateTime!,
    $tillDate: DateTime!,
    $physicalobjects: [String]!){
    
    createOrder(deposit: $deposit, fromDate: $fromDate, tillDate: $tillDate, physicalobjects: $physicalobjects){
        ok
        infoText
        order
        statusCode
    }
    
}
`;

export function useCreateOrder() {
    return useMutation(CREATE_ORDER);
}


const GET_ORDER = gql`
query All($fromDay: Date, $tillDay: Date, $organizationIds: [String!], $userIds: [String!]) {
  filterOrders(fromDay: $fromDay, tillDay: $tillDay, organizations: $organizationIds, users: $userIds) {
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

export function useGetOrder(fromDay: Date | undefined, tillDay: Date | undefined, organizationIds: string[] | undefined, userIds: string[] | undefined) {
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
            fromDay: fromDay ? getApolloDateString(fromDay) : undefined,
            tillDay: tillDay ? getApolloDateString(tillDay) : undefined,
            organizationIds,
            userIds
        },
        fetchPolicy: 'network-only'
    }, mapToOrder);
}

function getApolloDateString(date: Date) {
    const offset = date.getTimezoneOffset();
    date = new Date(date.getTime() - (offset * 60 * 1000));
    return date.toISOString().split('T')[0];
}