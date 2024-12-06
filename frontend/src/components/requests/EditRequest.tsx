import { useNavigate, useSearchParams, useParams  } from "react-router-dom";
import { useSuspenseQuery, useQuery, gql, ApolloClient, InMemoryCache, useMutation } from "@apollo/client";
import { useTitle } from "../../hooks/use-title";
import { Suspense, useMemo, useState, useEffect } from "react";
import Calendar_Querry_New from "../../core/input/Buttons/Calendar_Querry_New";
import React from 'react';
import { start } from "repl";

enum OrderStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    PICKED = 'PICKED',
    REJECTED = 'REJECTED',
    RETURNED = 'RETURNED',
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
              invNumInternal
              invNumExternal
              deposit
              storageLocation
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

const DELETE_ORDER = gql`
mutation DeleteOrder(
    $orderId: String!
) {
    deleteOrder(
        orderId: $orderId
    ) {
    ok
    infoText
    }
}
`;  

const UPDATE_ORDER_STATUS = gql`
mutation UpdateOrderStatus(
    $orderId: String!,
    $physicalObjects: [String]!,
    $returnDate: Date,
    $status: String
  ) {
    updateOrderStatus(
      orderId: $orderId,
      physicalObjects: $physicalObjects,
      returnDate: $returnDate,
      status: $status
    ) {
      ok
      infoText
    }
  }
`;

const UPDATE_ORDER_DATE = gql`
mutation UpdateOrder(
    $orderId: String!,
    $physicalObjects: [String],
    $fromDate: Date!,
    $tillDate: Date!,
    $users: [String]!
  ) {
    updateOrder(
      orderId: $orderId,
      physicalobjects: $physicalObjects,
      fromDate: $fromDate,
      tillDate: $tillDate,
      users: $users
    ) {
      ok
      infoText
    }
  }
`;


const REMOVE_PHYSICAL_OBJECT_FROM_ORDER = gql`
mutation removePhysicalObjectFromOrder(
    $orderId: String!,
    $physicalObjects: [String],
  ) {
    removePhysicalObjectFromOrder(
      orderId: $orderId,
      physicalobjects: $physicalObjects,
    ) {
      ok
      infoText
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
    invNumInternal:  number;
    invNumExternal:  number;
    deposit: number;
    storageLocation: string;
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
    const [showModal, setShowModal] = useState<boolean>(false);
    const [showDeletePopUp, setShowDeletePopUp] = useState<boolean>(false);
    const [showEditPopUp, setShowEditPopUp] = useState<boolean>(false);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(null); 
    const navigate = useNavigate();


    console.log("Requesting order with ID:", orderId);
    const {error, data, refetch } = useSuspenseQuery<FilterOrdersData>(EDIT_ORDER, {
        variables: { orderId }, 
      });

    const [DeleteOrder] = useMutation(DELETE_ORDER);
    const [UpdateOrderStatus] = useMutation(UPDATE_ORDER_STATUS);
    const [UpdateOrderDate] = useMutation(UPDATE_ORDER_DATE);
    const [removePhysicalObjectFromOrder] = useMutation(REMOVE_PHYSICAL_OBJECT_FROM_ORDER);
      
      
      useEffect(() => {
        refetch()
        if (data && data.filterOrders.length > 0) {
            const { fromDate, tillDate } = data.filterOrders[0];
                setStartDate(fromDate ?? null);
                setEndDate(tillDate ?? null);
                if (physicalobjects.edges.length > 0) {
                    setSelectedStatus(physicalobjects.edges[0].node.orderStatus);
                }

        }
    }, [data]);

      if (error) return <p>Error: {error.message}</p>;

      if (!data || !data.filterOrders) return <p>No data found</p>;



      const {fromDate, tillDate, physicalobjects, users } = data.filterOrders[0];

      const physicalObjectsEdges = physicalobjects?.edges || [];
      const physicalObjectIds = physicalObjectsEdges.map(edge => edge.node.physId);


      const handleRemoveObject = (id: string) => {
        console.log(`Remove object with ID: ${id}`);
    
    };


    const handleEditRequest = async () => {
        if (!selectedStatus) {
            console.error('No status selected');
            return; 
        }
        
        try {
            let returnDate = null; 

            if (selectedStatus == "RETURNED") {
                returnDate = new Date().toISOString().split('T')[0]; 
            }
          
            const physicalObjectsIds = physicalObjectsEdges.map(edge => edge.node.physId);

          const { data } = await UpdateOrderStatus({
            variables: {
              orderId: orderId,
              physicalObjects: physicalObjectsIds,
              returnDate : returnDate,
              status: selectedStatus.toLowerCase(),
            },
          });
    
         if (data.updateOrderStatus.ok) {
           navigate('/requests'); 
         } else {
           console.log('Order confirmation failed:', data.updateOrderStatus.infoText);
         }
     } catch (error) {
       console.error('Error confirming order:', error);
     }
    };

    const openHandleChangeDate = () => {
        setShowModal(true);
        
    };

    const handleChangeDate = async () => {

        if (!startDate || !endDate) {
            console.error('Start date or end date is missing');
            return; // Verhindert die Weiterverarbeitung, wenn eines der Daten fehlt.
        }

        
        const startDateUtc = new Date(startDate); 
        const endDateUtc = new Date(endDate);     

        startDateUtc.setHours(startDateUtc.getHours()+1);  // Da bei new Date() in die lokale Zeit umgerechnet wird und wir Daten bekommen von UTC würden wir einen Tag verlieren also rechnen wir eine stunde drauf
        endDateUtc.setHours(endDateUtc.getHours()+1);


        try {
            const userIds = users.edges.map(edge => edge.node.id);

          const { data } = await UpdateOrderDate({
            variables: {
              orderId: orderId,
              physicalObjects: null,
              fromDate: startDateUtc.toISOString().split('T')[0],
              tillDate: endDateUtc.toISOString().split('T')[0],
              users: userIds,
            },
          });
    
         if (data.updateOrder.ok) { 
            refetch();
            setShowModal(false);
         } else {
           console.log('Order confirmation failed:', data.updateOrder.infoText);
         }
     } catch (error) {
       console.error('Error confirming order:', error);
     }
    };

    
    const handleGoBack = () => {
        console.log("Change date");
        
    };

    const handleDelete = async () => {
        try {
            const { data: deleteData } = await DeleteOrder({
                 variables: {  orderId: orderId } 
                });
            if (deleteData.deleteOrder.ok) {
                alert(deleteData.deleteOrder.infoText);
                navigate('/requests'); 
            } else {
                alert("Failed to delete the order.");
            }
        } catch (error) {
            console.error("Delete order failed:", error);
            alert("An error occurred while deleting the order.");
         }
    };

    const confirmDelete = () => {
        setShowDeletePopUp(false);
        handleDelete();
    };

    const confirmEdit = () => {
        setShowEditPopUp(false);
        handleEditRequest();
    }

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
                            <p>Status:</p>
                            <select 
                                value={selectedStatus || ''} 
                                onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
                                style={{ marginLeft: "10px" }}
                            >
                                {Object.values(OrderStatus).map((status) => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button onClick={() => handleRemoveObject(node.physId)}>Aus Order entfernen</button>
                    </div>
                ))
            ) : (
                <p>Keine Objekte gefunden</p>
            )}
            <div style={{ marginTop: "20px" }}>
                <button onClick={() => setShowEditPopUp(true)} style={{ marginRight: "10px" }}>Complete Edit</button>
                <button onClick={openHandleChangeDate}>Ausleihzeit ändern</button>
                <button onClick={() => setShowDeletePopUp(true)}> Delete Order</button>
                <button onClick={() => {navigate('/requests');}}> Zurück</button>
            </div>

            
            {showModal && (
                     <div style={modalOverlayStyle}>
                     <div style={modalContentStyle}>
                         <h2 
                         >Objekt bearbeiten
                         </h2>
                    <Calendar_Querry_New setEndDate={setEndDate} setStartDate={setStartDate} tillDate={endDate} fromDate={startDate} physicalobjects={physicalObjectIds}/>

                    <div style={buttonContainerStyle}>
                    <button onClick={handleChangeDate}>Ausleihzeit ändern</button>
                    <button onClick={() => {
                        setShowModal(false);
                        setEndDate(tillDate);
                        setStartDate(fromDate);
                    }}> Cancel </button>
                    </div>
                    </div>
                    </div>
                )}

            {showDeletePopUp && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <h2>Bestätigung</h2>
                        <p>Möchstest du diese Order wirklich löschen?</p>
                        <button onClick={confirmDelete}>Bestätigen</button>
                        <button onClick={() => setShowDeletePopUp(false)}>Abbrechen</button>
                    </div>
                </div>
            )}

            {showEditPopUp && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <h2>Bestätigung</h2>
                        <p>Möchstest du diese Order wirklich editeren?</p>
                        <button onClick={confirmEdit}>Bestätigen</button>
                        <button onClick={() => setShowEditPopUp(false)}>Abbrechen</button>
                    </div>
                </div>
            )}


        </div>
    );
}


const modalOverlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    backgroundColor: 'rgba(0,0,0,0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };
  
  const modalContentStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '5px',
  };

  const buttonContainerStyle: React.CSSProperties = {
    textAlign: 'right',
  };