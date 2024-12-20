import { MdKeyboardArrowRight } from "react-icons/md";
import { MdKeyboardArrowDown } from "react-icons/md";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useQuery, gql, ApolloClient, InMemoryCache, useMutation,} from '@apollo/client';

enum OrderStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  PICKED = 'PICKED',
  REJECTED = 'REJECTED',
  RETURNED = 'RETURNED',
  UNKNOWN = 'UNKNOWN'
}

function mapOrderStatusToUIStatus(orderStatus: OrderStatus): string {
  switch (orderStatus) {
      case OrderStatus.PENDING:
          return 'requested';
      case OrderStatus.ACCEPTED:
          return 'confirmed';
      case OrderStatus.PICKED:
          return 'lended';
      case OrderStatus.REJECTED:
          return 'rejected'; 
      case OrderStatus.RETURNED:
          return 'returned';
      default:
          return 'unknown';
  }
}

function formatDate(date: Date | null | undefined): string {
  if (!date || isNaN(date.getTime())) {
    return 'N/A'; // Handle invalid or null dates
  }
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
}

const GET_ORDERS = gql`
  query {
    filterOrders {
      orderId
      fromDate
      tillDate
      physicalobjects {
        edges {
          node {
            orderStatus
            physId
            physicalobject{
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


export function Requests() {
  const { loading, error, data, refetch } = useQuery(GET_ORDERS);
  const [updateOrderStatus] = useMutation(UPDATE_ORDER_STATUS);

  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [popupText, setPopupText] = useState("");
  const [currentRequest, setCurrentRequest] = useState<Quest | null>(null);
  const [currentStatus, setCurrentStatus] = useState("");
  const [checkBoxChecked, setCheckBoxChecked] = useState<boolean>(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  const showConfirmationPopup = (request: Quest, status: string) => {
    setCurrentRequest(request);
    switch (status) {
      case "requested":
        setPopupText("Bist du dir sicher, dass du das jetzt als bestätigt markieren willst?");
        setCurrentStatus("requested");
        break;
      case "confirmed":
        setPopupText("Bist du dir sicher, dass du das jetzt als verliehen markieren willst?");
        setCurrentStatus("confirmed");
        break;
      case "lended":
        setPopupText("Bist du dir sicher, dass du das jetzt als zurückgegeben markieren willst?");
        setCurrentStatus("lended");
        break;
        case "rejectOrder":
          setPopupText("Bist du dir sicher, dass du die Order ablehnen möchtest?");
          setCurrentStatus("reject");
          break;
      default:
        setPopupText("");
    }
    setShowModal(true);
  };

  const handleConfirm = async () => {
    if (!currentRequest) return;

    switch (currentStatus) {
      case "requested":
        await confirmed(currentRequest);
        break;
      case "confirmed":
        await lended(currentRequest);
        break;
      case "lended":
        await returned(currentRequest);
        break;
      case "reject":
        await rejected(currentRequest);
        break;
      default:
        break;
    }
    setShowModal(false);
    setCheckBoxChecked(false);
  };



useEffect(() => {
  refetch();
  function handleClickOutside(event: MouseEvent) {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
    buttonRef.current && !buttonRef.current.contains(event.target as Node))  {
      setDropdownVisible(false);
    }
  }

  document.addEventListener('mousedown', handleClickOutside);
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [dropdownRef, buttonRef]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message}</p>;

  const fetchedRequests = data.filterOrders.map((order: any) => {
    const orderStatus = order.physicalobjects.edges.length > 0
        ? order.physicalobjects.edges[0].node.orderStatus
        : 'PENDING';
    const user = order.users.edges.length > 0
        ? order.users.edges[0].node
        : {email: "unknown@mail.com", firstName: "unknown", lastName: "unknown"}
    const username = `${user.firstName} ${user.lastName}`;
    const useremail = user.email;

    return {
      id: order.orderId,
      name: username, 
      email: useremail, 
      products: order.physicalobjects.edges.map((edge: any) => ({
          id: edge.node.physId,
          name: edge.node.physicalobject.name, 
          description: edge.node.physicalobject.description,
          price: edge.node.physicalobject.deposit,
          imageUrl: 'https://via.placeholder.com/300', 
          category: '',
          amount: 1,
          startDate: new Date(order.fromDate),
          endDate: new Date(order.tillDate),
      })),
      status: mapOrderStatusToUIStatus(orderStatus),
  };
});

    const requests = [...fetchedRequests];
    const filteredRequests = requests 
      .filter((request) => selectedCategories.length === 0 || selectedCategories.includes(request.status || ''))
      .sort((a, b) => {
        const now = new Date().getTime();
    
    if (a.status === 'requested' && b.status === 'requested' && b.products.length > 0) {
      const aTimeDifference = a.products[0]?.startDate ? a.products[0].startDate.getTime() - now : new Date().getTime();
      const bTimeDifference = b.products[0]?.startDate ? b.products[0].startDate.getTime() - now : new Date().getTime();
      
      return aTimeDifference - bTimeDifference;
    }
    return 0;
  });

  
    const handleCategoryChange = (category: string) => {
      setSelectedCategories(prevCategories =>
        prevCategories.includes(category)
          ? prevCategories.filter(c => c !== category)
          : [...prevCategories, category]
      );
    };

    const confirmed = async (request : Quest) => {
      try {
        const returnDate = null;
   
        
        const { data } = await updateOrderStatus({
          variables: {
            orderId: request.id,
            physicalObjects: request.products.map(product => product.id),
            returnDate : returnDate,
            status: "accepted",
          },
        });
  
       if (data.updateOrderStatus.ok) {
         refetch();
       } else {
         console.log('Order confirmation failed:', data.updateOrderStatus.infoText);
       }
   } catch (error) {
     console.error('Error confirming order:', error);
   }
 };

    const rejected = async (request : Quest) => {
      try {
        const returnDate = null;
        
        const { data } = await updateOrderStatus({
          variables: {
            orderId: request.id,
            physicalObjects: request.products.map(product => product.id),
            returnDate : returnDate,
            status: "rejected",
          },
        });
  
        if (data?.updateOrderStatus.ok) {
          refetch();
        } else {
          console.log('Order confirmation failed:', data.updateOrder.infoText);
        }
      } catch (error) {
        console.error('Error confirming order:', error);
      }
    };
    
    const lended = async (request : Quest) => {
      try {
        const returnDate = null;
        console.log(request.id);
        console.log(request.products.map(product=>product.id));

        const { data } = await updateOrderStatus({
          variables: {
            orderId: request.id,
            physicalObjects: request.products.map(product => product.id),
            returnDate : returnDate,
            status: "picked",
          },
        });
  
        if (data?.updateOrderStatus.ok) {
          refetch();
        } else {
          console.log('Order confirmation failed:', data.updateOrder.infoText);
        }
      } catch (error) {
        console.error('Error confirming order:', error);
      }
    };

    const returned = async (request : Quest) => {
      try {
        const returnDate = new Date().toISOString().split('T')[0];

        const { data } = await updateOrderStatus({
          variables: {
            orderId: request.id,
            physicalObjects: request.products.map(product => product.id),
            returnDate: returnDate,
            status: 'returned',
          },
        });
  
        if (data?.updateOrderStatus.ok) {
          refetch();
        } else {
          console.log('failed:', data.updateOrder.infoText);
        }
      } catch (error) {
        console.error('Error', error);
      }
    };


    const reset = async (request : Quest) => {
      try {
        const returnDate = null;
        console.log(request.id);
        console.log(request.products.map(product=>product.id));

        const { data } = await updateOrderStatus({
          variables: {
            orderId: request.id,
            physicalObjects: request.products.map(product => product.id),
            returnDate : returnDate,
            status: "pending",
          },
        });
  
        if (data?.updateOrderStatus.ok) {
          refetch();
        } else {
          console.log('Order confirmation failed:', data.updateOrder.infoText);
        }
      } catch (error) {
        console.error('Error confirming order:', error);
      }
    };



    const edit = (orderID: string, product: Product) => {
      navigate(`/requests/edit/${orderID}`);
  };

    return (
        
        <div style={{padding: '20px'}}>
            <h2 style={{marginBottom: '20px'}}>Anfragen</h2>

            {/*<DisplayLocations /> */}
            <div style={{ position: 'relative', display: 'inline-block' }} ref={dropdownRef}>
            <button
              style={dropdownButtonStyle}
              onClick={() => setDropdownVisible(!dropdownVisible)}
              ref={buttonRef}
            >
              Filter
            </button>
            {dropdownVisible && (
              <div style={dropdownContentStyle}>
                <label style={checkboxLabelStyle}>
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes('requested')}
                    onChange={() => handleCategoryChange('requested')}
                  />
                  angefragt
                </label>
                <label style={checkboxLabelStyle}>
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes('confirmed')}
                    onChange={() => handleCategoryChange('confirmed')}
                  />
                  bestätigt
                </label>
                <label style={checkboxLabelStyle}>
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes('lended')}
                    onChange={() => handleCategoryChange('lended')}
                  />
                  verliehen
                </label>
                <label style={checkboxLabelStyle}>
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes('rejected')}
                    onChange={() => handleCategoryChange('rejected')}
                  />
                  Abgelehnt
                </label>
                <label style={checkboxLabelStyle}>
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes('returned')}
                    onChange={() => handleCategoryChange('returned')}
                  />
                  Zurückgegeben
                </label>
              </div>
            )}
          </div>
          {filteredRequests.map((request) => (
            <div key={request.id} style={requestCardStyle}>
                {request.status=="requested" && (
                <div style={{backgroundColor: '#ffff00', width:'100%', paddingLeft:'10px', paddingTop: '5px', paddingBottom: '5px'}}>
                    <div style={{textAlign: "center"}}>
                        angefragt
                    </div>
                </div>
                )}
                {request.status=="confirmed" && (
                <div style={{backgroundColor: '#00ff7f', width:'100%', paddingLeft:'10px', paddingTop: '5px', paddingBottom: '5px'}}>
                    <div style={{textAlign: "center"}}>
                        bestätigt
                    </div>
                </div>
                )}
                {request.status=="lended" && (
                <div style={{backgroundColor: '#87cefa', width:'100%', paddingLeft:'10px', paddingTop: '5px', paddingBottom: '5px'}}>
                    <div style={{textAlign: "center"}}>
                        verliehen
                    </div>
                </div>
                )}
                {request.status=="returned" && (
                <div style={{backgroundColor: '#ffa500', width:'100%', paddingLeft:'10px', paddingTop: '5px', paddingBottom: '5px'}}>
                    <div style={{textAlign: "center"}}>
                        zurückgegeben
                    </div>
                </div>
                )}
                {request.status=="rejected" && (
                <div style={{backgroundColor: '#ff0000', width:'100%', paddingLeft:'10px', paddingTop: '5px', paddingBottom: '5px'}}>
                    <div style={{textAlign: "center"}}>
                        abgelehnt
                    </div>
                </div>
                )}

                <div style={infoStyle}>
                    <div style={personInfoStyle}>
                        <div>{request.name}</div>
                        <div>{request.email}</div>
                        <div>{request.phone}</div>
                        <hr />
                    </div>

                    <div>
                        {request.products.map((product : Product) => (
                            <div style={productInfoStyle}>
                                <div>{product.name}</div>
                                <div>{product.description}</div>
                                <div>{product.amount}</div>
                                <div>{formatDate(product.startDate)}</div>
                                <div>{formatDate(product.endDate)}</div>
                                <hr />
                            </div>
                            
                        ))}
                    </div>
                    

                    
                    {
                    <div>
                    
                    {request.status=="requested" && (
                        <button style={buttonStyle} onClick={() => showConfirmationPopup(request, request.status)}>
                            Anfrage bestätigen
                        </button>
                    )}
                    {request.status=="requested" && (
                        <button style={buttonStyle} onClick={() => showConfirmationPopup(request, "rejectOrder")}>
                            Anfrage ablehnen
                        </button>
                    )}
                    {request.status=="confirmed" && (
                        <button style={buttonStyle} onClick={() => showConfirmationPopup(request, request.status)}>
                            Verleihen
                        </button>
                    )}
                    {request.status=="lended" && (
                        <button style={buttonStyle} onClick={() => showConfirmationPopup(request, request.status)}>
                            Zurück gegeben
                        </button>
                    )}

                     <button style={buttonStyle} onClick={() => edit(request.id, request )}>
                            Edit
                        </button>


                        <button style={buttonStyle} onClick={() => reset(request)}>
                            reset
                        </button>
                    </div>
                    }

                </div>
            
            </div>
         
          
         ))}
        
        {showModal && (
                    <div style={modalOverlayStyle}>
                     <div style={modalContentStyle}>
                     <h3>Bestätigung</h3>
                     <p>{popupText}</p>
                     <div>
                      <label>
                        <input
                          type="checkbox"
                          checked={checkBoxChecked}
                          onChange={() => setCheckBoxChecked(!checkBoxChecked)}
                        />
                      Ich bestätige die Aktion
                      </label>
                    </div>
                     <div>
                        <button 
                        style={buttonStyle} 
                        onClick={handleConfirm}
                        disabled={!checkBoxChecked}
                        >
                            Bestätigen
                        </button>
                        <button 
                        style={buttonStyle} 
                        onClick={() => {
                          if (checkBoxChecked) setCheckBoxChecked(false);
                          setShowModal(false);
                          }}
                        >
                            Abbrechen
                        </button>
                        </div>
                      </div>
                    </div>
                    )}
        
        </div>
    );
  }


const requestCardStyle: React.CSSProperties = {
    marginBottom: '20px',
    border: '1px solid #ccc',
    paddingBottom: '10px',
    alignItems: 'center',
  };

const buttonStyle: React.CSSProperties = {
    backgroundColor: '#007bff',
    color: '#ffffff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '10px',
    marginLeft: '10px',
    marginTop: '5px',
  };

const dropdownButtonStyle: React.CSSProperties = {
    backgroundColor: '#007bff',
    color: '#ffffff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
  };

  const editButtonStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    color: '#191970',
    border: 'none',
    padding: '2px 4px',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '10px',
    textDecoration: 'underline',
  };

const infoStyle: React.CSSProperties = {
    flex: '1',
  };

const personInfoStyle: React.CSSProperties = {
    paddingLeft: '10px',
    paddingRight: '10px',
    paddingTop: '10px',
};

const productInfoStyle: React.CSSProperties = {
    paddingLeft: '10px',
    paddingRight: '10px',
};

const dropdownContentStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    position: 'absolute',
    backgroundColor: '#f1f1f1',
    minWidth: '160px',
    boxShadow: '0px 8px 16px 0px rgba(0,0,0,0.2)',
    padding: '12px 16px',
    zIndex: 1,
  };
  
const checkboxLabelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '10px',
  };

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