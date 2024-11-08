import './EditRequest.css';
import { useNavigate, useParams  } from "react-router-dom";
import { useSuspenseQuery, gql, useMutation } from "@apollo/client";
import { useTitle } from "../../hooks/use-title";
import { Suspense, useMemo, useState, useEffect } from "react";
import Calendar_Querry_New from "../../core/input/Buttons/Calendar_Querry_New";
import React from 'react';
import { MdAdd } from "react-icons/md";
import { Checkbox, InputGroup, NonIdealState, Overlay2 } from "@blueprintjs/core";
import { BaseInventoryList } from '../internal-inventory/InternalInventory';
import { useFilterPhysicalObjectsByName } from '../../hooks/pysical-object-helpers';

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
    const { data: allPhysicalObjects } = useFilterPhysicalObjectsByName();
    const [showSelectOverlay, setShowSelectOverlay] = useState(false);
    const [selectedObjectIds, setSelectedObjectIds] = useState<string[]>([]);

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
      
      
      useEffect(() => {
        setSelectedObjectIds(data?.filterOrders[0]?.physicalobjects?.edges?.map((item) => item.node.physId) ?? []);
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

      console.log(data.filterOrders[0].orderId);


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
          
          const { data } = await UpdateOrderStatus({
            variables: {
              orderId: orderId,
              physicalObjects: selectedObjectIds,
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
        console.log("Change date");
        
    };

    const handleChangeDate = () => {
        console.log("Change date");
        
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
            {selectedObjectIds.length > 0 ? (
                selectedObjectIds.flatMap((id) => {
                    const item = allPhysicalObjects.find((item) => item.id === id);
                    return item ? item : []
                })
                .map((physicalObject) => (
                    <div key={physicalObject.id} style={{
                        border: "1px solid #ccc",
                        padding: "10px",
                        margin: "10px 0",
                        borderRadius: "5px",
                        display: "flex",
                        justifyContent: "space-between"
                    }}>
                        <div>
                            <h3>{physicalObject.name}</h3>
                            <p>{physicalObject.description}</p>
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
                        <button onClick={() => handleRemoveObject(physicalObject.id)}>Aus Order entfernen</button>
                    </div>
                ))
            ) : (
                <p>Keine Objekte gefunden</p>
            )}
            <div style={{
                    border: "1px solid #ccc",
                    padding: "10px",
                    margin: "10px 0",
                    borderRadius: "5px",
                    display: 'flex',
                    placeContent: 'center',
                    cursor: 'pointer'
                }}
                onClick={() => setShowSelectOverlay(true)}>
                <MdAdd size={36} />
            </div>
            <div style={{ marginTop: "20px" }}>
                <button onClick={() => setShowEditPopUp(true)} style={{ marginRight: "10px" }}>Complete Edit</button>
                <button onClick={openHandleChangeDate}>Ausleihzeit ändern</button>
                <button onClick={() => setShowDeletePopUp(true)}> Delete Order</button>
                <button onClick={() => {navigate('/requests');}}> Zurück</button>
            </div>

            <SelectObjectsOverlay showOverlay={showSelectOverlay} close={() => setShowSelectOverlay(false)}
                selectedItemIds={selectedObjectIds} setSelectedItemIds={setSelectedObjectIds} />

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

interface SelectObjectsOverlayProps {
    showOverlay: boolean;
    close: () => void;
    selectedItemIds: string[];
    setSelectedItemIds: (item: string[]) => void;
}

function SelectObjectsOverlay({ showOverlay, close, selectedItemIds, setSelectedItemIds }: SelectObjectsOverlayProps) {
    const [filterName, setFilterName] = useState<string>();
    const { data } = useFilterPhysicalObjectsByName(filterName);

    const updateItems = (id: string, checked: boolean) => {
        if (!checked) {
            setSelectedItemIds([...selectedItemIds.filter((itemId) => itemId !== id)]);
            return;
        }

        const itemId = data.find((item => item.id === id))?.id;
        if (!itemId)
            return;

        setSelectedItemIds([...selectedItemIds, itemId]);
    }

    const isChecked = (id: string) => selectedItemIds.includes(id);
    const changeCheckedState = (id: string) => { updateItems(id, !isChecked(id)); console.error('changed') }

    return (
        <Overlay2 isOpen={showOverlay} onClose={close}>
            <div>
                <p className='select-objects--text' onClick={close}>Fertig</p>
                <div className="select-objects--list">
                    <InputGroup type="text" large={true} placeholder='Suchen...' onChange={(e) => setFilterName(e.target.value)} />
                    { data.length > 0 && <BaseInventoryList items={data} onItemClick={(id) => changeCheckedState(id)}
                        after={(id) => <Checkbox checked={isChecked(id)} />} /> }
                    { data.length === 0 && <NonIdealState title='keine Objekte gefunden' /> }
                </div>
            </div>
        </Overlay2>
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