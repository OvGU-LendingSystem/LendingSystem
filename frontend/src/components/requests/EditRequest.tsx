import { useNavigate, useSearchParams, useParams  } from "react-router-dom";
import { useSuspenseQuery, useQuery, gql, ApolloClient, InMemoryCache, useMutation } from "@apollo/client";
import { useTitle } from "../../hooks/use-title";
import { Suspense, useMemo } from "react";
import React from 'react';

enum OrderStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    PICKED = 'PICKED',
    REJECTED = 'REJECTED',
    RETURNED = 'RETURNED',
    // Add other statuses as needed
}


const EDIT_ORDER = gql`
 query FilterOrdersById($orderId: String!) {
    filterOrders(orderId: $orderId) {
      orderId
      fromDate
      tillDate
      physicalobjects {
        edges {
          node {
            orderStatus
            physId
            physicalobject {
              name
              description
            }
          }
        }
      }
      users {
        edges {
          node {
            email
            firstName
            lastName
            id
          }
        }
      }
    }
  }
`;

export function EditRequest() {
    useTitle('Edit Request');
    const params = useParams<'orderId'>();
    const navigate = useNavigate();

    if (params['orderId'] === undefined) {
        navigate('/');
        return <></>;
    }
    
    return (
        <Suspense fallback={<p>Loading...</p>}>
            <EditRequestScreen orderId={params['orderId']} />
            </Suspense>  
    );
}

interface EditRequestProps {
    orderId: string;
}

interface PhysicalObject {
    name: string;
    description: string;
}

interface FilterOrdersData {
    filterOrders: {
        orderId: string;
        fromDate: Date;
        tillDate: Date;
        physicalobjects: {
            edges: {
                node: {
                    orderStatus: OrderStatus;
                    physId: string;
                    physicalobject: PhysicalObject;
                }
            }[];
        };
        users: {
            edges: {
                node: {
                    email: string;
                    firstName: string;
                    lastName: string;
                    id: string;
                }
            }[];
        };
    }[];
}

function EditRequestScreen({ orderId }: EditRequestProps) {
    console.log("Requesting order with ID:", orderId);
    const {error, data } = useSuspenseQuery<FilterOrdersData>(EDIT_ORDER, {
        variables: { orderId }, 
      });
    
      if (error) return <p>Error: {error.message}</p>;

      if (!data || !data.filterOrders) return <p>No data found</p>;

      const { physicalobjects, users } = data.filterOrders[0];

      const physicalObjectsEdges = physicalobjects?.edges || [];

      console.log(data.filterOrders[0].orderId);

      const handleRemoveObject = (id: string) => {
        console.log(`Remove object with ID: ${id}`);
    
    };

    const handleEditRequest = () => {
        console.log("Edit request");
        
    };

    const handleChangeDate = () => {
        console.log("Change date");
        
    };


    return (
        <div style={{ padding: "20px" }}>
            <h1>Order Details</h1>
            <h2>Objects:</h2>
            {physicalObjectsEdges.length > 0 ? (
                physicalObjectsEdges.map(({ node }) => (
                    <div key={node.physId} style={{
                        border: "1px solid #ccc",
                        padding: "10px",
                        margin: "10px 0",
                        borderRadius: "5px",
                        display: "flex",
                        justifyContent: "space-between"
                    }}>
                        <div>
                            <h3>{node.physicalobject.name}</h3>
                            <p>{node.physicalobject.description}</p>
                            <p>Status: {node.orderStatus}</p>
                        </div>
                        <button onClick={() => handleRemoveObject(node.physId)}>Aus Order entfernen</button>
                    </div>
                ))
            ) : (
                <p>Keine Objekte gefunden</p>
            )}
            <div style={{ marginTop: "20px" }}>
                <button onClick={handleEditRequest} style={{ marginRight: "10px" }}>Complete Edit</button>
                <button onClick={handleChangeDate}>Ausleihzeit ändern</button>
            </div>
        </div>
    );
}