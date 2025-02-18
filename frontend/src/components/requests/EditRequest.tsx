import './EditRequest.css';
import { useNavigate, useParams  } from "react-router-dom";
import { useSuspenseQuery, gql, useMutation } from "@apollo/client";
import { useTitle } from "../../hooks/use-title";
import { Suspense, useState, useEffect } from "react";
import CalendarQuerryNew from "../../core/input/Buttons/Calendar_Querry_New";
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

const statusTranslations: { [key in OrderStatus]: string } = {
  [OrderStatus.PENDING]: 'Ausstehend',
  [OrderStatus.ACCEPTED]: 'Akzeptiert',
  [OrderStatus.PICKED]: 'Abgeholt',
  [OrderStatus.REJECTED]: 'Abgelehnt',
  [OrderStatus.RETURNED]: 'Zurückgegeben'
}
const EDIT_ORDER = gql`
 query FilterOrdersById($orderId: String!) {
    filterOrders(orderId: $orderId) {
      orderId
      fromDate
      tillDate
      deposit
      physicalobjects {
        edges {
          node {
            orderStatus
            physId
            returnNotes
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
      organization {
           organizationId
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
    $status: String,
    $returnNotes : String
  ) {
    updateOrderStatus(
      orderId: $orderId,
      physicalObjects: $physicalObjects,
      returnDate: $returnDate,
      status: $status
      returnNotes: $returnNotes
    ) {
      ok
      infoText
    }
  }
`;

const UPDATE_ORDER_DATE = gql`
mutation UpdateOrder(
    $orderId: String!,
    $fromDate: Date!,
    $tillDate: Date!,
  ) {
    updateOrder(
      orderId: $orderId,
      fromDate: $fromDate,
      tillDate: $tillDate,
    ) {
      ok
      infoText
    }
  }
`;


const REMOVE_PHYSICAL_OBJECT_FROM_ORDER = gql`
mutation removePhysicalObjectFromOrder(
    $orderId: String!,
    $physicalObjects: [String]!,
  ) {
    removePhysicalObjectFromOrder(
      orderId: $orderId,
      physicalObjects: $physicalObjects,
    ) {
      ok
      infoText
    }
  }
`;

const ADD_PHYSICAL_OBJECT_TO_ORDER = gql`
mutation addPhysicalObjectToOrder(
    $orderId: String!,
    $physicalObjects: [String]!,
  ) {
    addPhysicalObjectToOrder(
      orderId: $orderId,
      physicalObjects: $physicalObjects,
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
        deposit: number;
        physicalobjects: {
            edges: {
                node: {
                    orderStatus: OrderStatus;
                    physId: string;
                    returnNotes: string;
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
        organization: {
          organizationId : string;
      };
    }[];
}

function EditRequestScreen({ orderId }: EditRequestProps) {
    const [showSelectOverlay, setShowSelectOverlay] = useState(false);
    const [selectedObjectIds, setSelectedObjectIds] = useState<string[]>([]);

    const [showModal, setShowModal] = useState<boolean>(false);
    const [showDeletePopUp, setShowDeletePopUp] = useState<boolean>(false);
    const [showEditPopUp, setShowEditPopUp] = useState<boolean>(false);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(null); 
    const [returnNotes, setReturnNotes] = useState<string>("");
    const navigate = useNavigate();

    const {error, data, refetch } = useSuspenseQuery<FilterOrdersData>(EDIT_ORDER, {
        variables: { orderId }, 
      });

    const [DeleteOrder] = useMutation(DELETE_ORDER);
    const [UpdateOrderStatus] = useMutation(UPDATE_ORDER_STATUS);
    const [UpdateOrderDate] = useMutation(UPDATE_ORDER_DATE);
    const [removePhysicalObjectFromOrder] = useMutation(REMOVE_PHYSICAL_OBJECT_FROM_ORDER);
    const [addPhysicalObjectToOrder] = useMutation(ADD_PHYSICAL_OBJECT_TO_ORDER);

    
    const orgId = [data.filterOrders[0].organization.organizationId];
    console.log(orgId);

    const { data: allPhysicalObjects } = useFilterPhysicalObjectsByName(orgId, undefined); // TODO: filter by organization that only objects of same organization get fetched and can be put into requests?
      
      // Set the initial values for Date, selectedObjectIds and Status of the Order
      useEffect(() => {
        setSelectedObjectIds(data?.filterOrders[0]?.physicalobjects?.edges?.map((item) => item.node.physId) ?? []);
        refetch()
        if (data && data.filterOrders.length > 0) {
            const { fromDate, tillDate } = data.filterOrders[0];
                setStartDate(fromDate ?? null);
                setEndDate(tillDate ?? null);
                if (physicalobjects.edges.length > 0) {
                    setSelectedStatus(physicalobjects.edges[0].node.orderStatus);
                    setReturnNotes(physicalobjects.edges[0].node.returnNotes)
                }

        }
    }, [data]);

    if (error) return <p>Error: {error.message}</p>;

    if (!data || !data.filterOrders) return <p>No data found</p>;



    const {fromDate, tillDate, physicalobjects} = data.filterOrders[0];

    const physicalObjectsEdges = physicalobjects?.edges || [];
    const physicalObjectIds = physicalObjectsEdges.map(edge => edge.node.physId);
    const notInBoth_Remove = physicalObjectIds.filter( (id) => !selectedObjectIds.includes(id))
    const notInBoth_Add = selectedObjectIds.filter( (id) => !physicalObjectIds.includes(id))


    const handleRemoveObject = async () => {
      try {
      
        const { data } = await removePhysicalObjectFromOrder({
        variables: {
          orderId: orderId,
          physicalObjects: notInBoth_Remove,
        },
        });

        if (data.removePhysicalObjectFromOrder.ok) {
        } else {
          console.log('Order confirmation failed:', data.removePhysicalObjectFromOrder.infoText);
        }
        } catch (error) {
          console.error('Error confirming order:', error);
        }


    };

    const handleAddObject = async () => {
      try {
      
        const { data } = await addPhysicalObjectToOrder({
        variables: {
          orderId: orderId,
          physicalObjects: notInBoth_Add,
        },
        });

        if (data.addPhysicalObjectToOrder.ok) {
        } else {
          console.log('Order confirmation failed:', data.addPhysicalObjectToOrder.infoText);
        }
        } catch (error) {
          console.error('Error confirming order:', error);
        }
    }

    const handleAllRequests = async () => {
      try {

        if (selectedObjectIds.length === 0) {
          await handleDelete();
          return;
        }

        if(notInBoth_Add.length !== 0){
        await handleAddObject();
        }

        if(notInBoth_Remove.length !== 0){
        await handleRemoveObject();
        }

        if (!(new Date(tillDate).getTime() === new Date(endDate!).getTime()) || !(new Date(startDate!).getTime() === new Date(fromDate).getTime())){
          await handleChangeDate();
        }

        if (selectedStatus) {
          await handleEditRequest();
        }
        
      } catch(error) {
        console.error('Error while handling requests:', error);
      }
    }


    const handleEditRequest = async () => {
        if (!selectedStatus) {
            console.error('No status selected');
            return; 
        }
        
        try {
            let returnDate = null; 

            if (selectedStatus === "RETURNED") {
                returnDate = new Date().toISOString().split('T')[0]; 
            }
          
          const { data } = await UpdateOrderStatus({
            variables: {
              orderId: orderId,
              physicalObjects: selectedObjectIds,
              returnDate : returnDate,
              status: selectedStatus.toLowerCase(),
              returnNotes: returnNotes,
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

        startDateUtc.setHours(startDateUtc.getHours()+2);  // Da bei new Date() in die lokale Zeit umgerechnet wird und wir Daten bekommen von UTC würden wir einen Tag verlieren also rechnen wir zwei stunde drauf
        endDateUtc.setHours(endDateUtc.getHours()+2);

        try {

          const { data } = await UpdateOrderDate({
            variables: {
              orderId: orderId,
              fromDate: startDateUtc.toISOString().split('T')[0],
              tillDate: endDateUtc.toISOString().split('T')[0],
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
        navigate('/requests');
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


    return (
        <div style={{ padding: "20px" }}>
            <h1>Order Details</h1>
            <div>
            <select
                id="order-status"
                value={selectedStatus || ''}
                onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
                style={{ marginLeft: "10px", padding: "5px" }}
            >
              {Object.values(OrderStatus).map((status) => (
                                    <option key={status} value={status}>
                                        {statusTranslations[status]}
                                    </option>
                ))}
            </select>
            </div>

            <h2>Objekte:</h2>
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
                            <p>{"Beschreibung " + physicalObject.description}</p>
                            <p>{"Intenre Inventarnummer " + physicalObject.invNumInternal}</p>
                            <p>{"Extenre Inventarnummer " + physicalObject.invNumExternal}</p>
                            <p>{"Leihgebühr" + physicalObject.deposit}</p>
                           {/* <p>Status:</p>
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
                            </select>*/}
                        </div>
                    </div>
                ))
            ) : (
                <p>Keine Objekte gefunden</p>
            )}

            <div style={{
                border: "1px solid #ccc",
                padding: "10px",
                margin: "10px 0",
                borderRadius: "5px"
            }}>
            <h3>Deposit Information</h3>
            <p>Deposit: {data.filterOrders[0].deposit} </p>
            </div>


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
                <button onClick={() => setShowEditPopUp(true)} style={{ marginRight: "10px" }}>Bearbeiten abschließen</button>
                <button onClick={openHandleChangeDate}>Ausleihzeit ändern</button>
                <button onClick={() => setShowDeletePopUp(true)}> Order löschen</button>
                <button onClick={() => handleGoBack()}> Zurück</button>
            </div>

            <SelectObjectsOverlay showOverlay={showSelectOverlay} close={() => setShowSelectOverlay(false)}
                selectedItemIds={selectedObjectIds} setSelectedItemIds={setSelectedObjectIds} organizationId={orgId} fromDate={startDate} tillDate={endDate} />

            {showModal && (
                     <div style={modalOverlayStyle}>
                     <div style={modalContentStyle}>
                         <h2 
                         >Objekt bearbeiten
                         </h2>
                    <CalendarQuerryNew setEndDate={setEndDate} setStartDate={setStartDate} tillDate={endDate} fromDate={startDate} physicalobjects={physicalObjectIds}/>

                    <div style={buttonContainerStyle}>
                    <button onClick={() => {setShowModal(false);}}>Ausleihzeit ändern</button>
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
                        <div>
                            <label htmlFor="returnNotes">Rückgabebemerkungen</label>
                            <textarea
                                id="returnNotes"
                                value={returnNotes}
                                onChange={(e) => setReturnNotes(e.target.value)}
                                placeholder="Optional: Geben Sie hier Rückgabebemerkungen ein"
                                rows={4}
                             />
                        </div>
                        <button onClick={handleAllRequests}>Bestätigen</button>
                        <button onClick={() => setShowEditPopUp(false)}>Abbrechen</button>
                    </div>
                </div>
            )}


        </div>
    );
}


// selectedObjects Overlay + Add Objects

interface SelectObjectsOverlayProps {
    showOverlay: boolean;
    close: () => void;
    selectedItemIds: string[];
    setSelectedItemIds: (item: string[]) => void;
    organizationId : string[];
    fromDate : Date | null;
    tillDate : Date | null;
}

function SelectObjectsOverlay({ showOverlay, close, selectedItemIds, setSelectedItemIds, organizationId, fromDate, tillDate }: SelectObjectsOverlayProps) {
    const IS_PHYSICAL_OBJECT_AVAILABLE = gql`
    mutation isPhysicalObjectAvailable(
        $endDate: Date!,
        $physId: String!,
        $startDate: Date!,
    ) {
        isPhysicalObjectAvailable(
          endDate: $endDate,
          physId: $physId,
          startDate: $startDate,
        ) {
          isAvailable
          ok
          infoText
        }
          
      }
    `;

    const [filterName, setFilterName] = useState<string>();
    const { data } = useFilterPhysicalObjectsByName(organizationId, filterName); // TODO org
    const [availableObjects, setAvailableObjects] = useState<any[]>([])
    const [checkAvailability] = useMutation(IS_PHYSICAL_OBJECT_AVAILABLE);

    useEffect(() => {
      const updateAvailableObjects = async () => {
          if (fromDate && tillDate && data) {
              const available = await filterAvailableObjects(data, fromDate, tillDate);
              setAvailableObjects(available);
          } else {
              setAvailableObjects(data);
          }
      };
      updateAvailableObjects();
  }, [data, fromDate, tillDate]);

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

    const filterAvailableObjects = async (objects: any[], fromDate: Date, tillDate: Date) => {
      const availableObjects = [];
  
      for (const object of objects) {
          const isAvailable = await checkObjectAvailability(object.id, fromDate, tillDate);
          if (isAvailable) {
              availableObjects.push(object);
          }
      }
      return availableObjects;
  };

  const checkObjectAvailability = async (itemId: string, fromDate: Date, tillDate: Date) => {
    try {
      const startDateUtc = new Date(fromDate); 
        const endDateUtc = new Date(tillDate);     

        startDateUtc.setHours(startDateUtc.getHours()+2);  // Da bei new Date() in die lokale Zeit umgerechnet wird und wir Daten bekommen von UTC würden wir einen Tag verlieren also rechnen wir zwei stunde drauf
        endDateUtc.setHours(endDateUtc.getHours()+2);
        const response = await checkAvailability({
            variables: {
                startDate: startDateUtc.toISOString().split('T')[0],
                endDate: endDateUtc.toISOString().split('T')[0],
                physId: itemId,
            }
        });
        if (response.data.isPhysicalObjectAvailable.ok) { 
          return response.data.isPhysicalObjectAvailable.isAvailable;
       } else {
         console.log('Order confirmation failed:', response.data.isPhysicalObjectAvailable.infoText);
    }} catch (error) {
        console.error('Fehler bei der Abfrage der Verfügbarkeit:', error);
        return false;
    }
};

    const isChecked = (id: string) => selectedItemIds.includes(id);
    const changeCheckedState = (id: string) => { updateItems(id, !isChecked(id)); console.error('changed') }

    return (
        <Overlay2 isOpen={showOverlay} onClose={close}>
            <div>
                <p className='select-objects--text' onClick={close}>Fertig</p>
                <div className="select-objects--list">
                    <InputGroup type="text" large={true} placeholder='Suchen...' onChange={(e) => setFilterName(e.target.value)} />
                    { data.length > 0 && <BaseInventoryList items={availableObjects} onItemClick={(id) => changeCheckedState(id)}
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