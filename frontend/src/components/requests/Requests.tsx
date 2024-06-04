import { MdKeyboardArrowRight } from "react-icons/md";
import { MdKeyboardArrowDown } from "react-icons/md";
import { useState } from "react";

import { useQuery, gql, ApolloClient, InMemoryCache } from '@apollo/client';



const GET_ORDERS = gql`
  query {
    filterOrders {
      orderId
      fromDate
      tillDate
      physicalobjects {
        edges {
          node {
            id
          }
        }
      }
      users {
        edges {
          node {
            id
          }
        }
      }
    }
  }
`;

function DisplayLocations() {
  const { loading, error, data } = useQuery(GET_ORDERS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message}</p>;

  return data.filterOrders.map(({ orderId, fromDate, tillDate, physicalobjects, users }: { orderId: number, fromDate: any, tillDate: any, physicalobjects: any, users: any }) => (
    <div key={orderId}>
      <p>
        {orderId}: {new Date(fromDate)?.toLocaleDateString() ?? 'N/A'} - {new Date(tillDate)?.toLocaleDateString() ?? 'N/A'}
      </p>
    </div>
  ));
}

export function Requests() {
    const requests: Quest[] = [
        {
          id: 1,
          name: 'Hello Test',
          email: 'hello@test.de',
          products: [
            {
                id: 1,
                name: 'Maus',
                description: 'Beschreibung für Objekt 1',
                price: 'Kaution: 10€',
                imageUrl: 'https://via.placeholder.com/300',
                category: 'Elektronik',
                amount: 1,
                startDate: new Date(),
                endDate: new Date(),
            },
            {
                id: 2,
                name: 'Maus2',
                description: 'Beschreibung für Objekt 2',
                price: 'Kaution: 20€',
                imageUrl: 'https://via.placeholder.com/300',
                category: 'Elektronik',
                amount: 1,
                startDate: new Date(),
                endDate: new Date(),
            },
          ],
          status: "requested",
        },
        {
            id: 2,
            name: 'Testi Test',
            email: 'Testi@test.de',
            products: [
              {
                  id: 1,
                  name: 'Maus',
                  description: 'Beschreibung für Objekt 1',
                  price: 'Kaution: 10€',
                  imageUrl: 'https://via.placeholder.com/300',
                  category: 'Elektronik',
                  amount: 2,
                  startDate: new Date(),
                  endDate: new Date(),
              },
              {
                id: 3,
                name: 'Tastatur',
                description: 'Beschreibung für Objekt 3',
                price: 'Kaution: 30€',
                imageUrl: 'https://via.placeholder.com/300',
                category: 'Office',
                amount: 3,
                startDate: new Date(),
                endDate: new Date(),
              },
            ],
            status: "confirmed",
        },
        {
            id: 3,
            name: 'Testi Test',
            email: 'Testi@test.de',
            products: [
              {
                  id: 1,
                  name: 'Maus',
                  description: 'Beschreibung für Objekt 1',
                  price: 'Kaution: 10€',
                  imageUrl: 'https://via.placeholder.com/300',
                  category: 'Elektronik',
                  amount: 2,
                  startDate: new Date(),
                  endDate: new Date(),
              },
              {
                id: 3,
                name: 'Tastatur',
                description: 'Beschreibung für Objekt 3',
                price: 'Kaution: 30€',
                imageUrl: 'https://via.placeholder.com/300',
                category: 'Office',
                amount: 3,
                startDate: new Date(),
                endDate: new Date(),
              },
            ],
            status: "lended",
        },
      ];

    const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    const filteredRequests = requests.filter(request =>
      (selectedCategories.length === 0 || selectedCategories.includes(request.status || ''))
    );
    const handleCategoryChange = (category: string) => {
      setSelectedCategories(prevCategories =>
        prevCategories.includes(category)
          ? prevCategories.filter(c => c !== category)
          : [...prevCategories, category]
      );
    };

    const edit = (product: Product) => {
        //TODO
    };
    const confirmed = (request: Quest) => {
        //TODO
    };
    const lended = (request: Quest) => {
        //TODO
    };
    const returned = (request: Quest) => {
        //TODO
    };


    return (
        
        <div style={{padding: '20px'}}>
            <h2 style={{marginBottom: '20px'}}>Anfragen</h2>

            <DisplayLocations />
          
            <button
              style={dropdownButtonStyle}
              onClick={() => setDropdownVisible(!dropdownVisible)}
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
              </div>
            )}

          {filteredRequests.map((request) => (
            <div key={request.id} style={requestCardStyle}>
                {request.status=="requested" && (
                <div style={{backgroundColor: '#ff6a6a', width:'100%', paddingLeft:'10px', paddingTop: '5px', paddingBottom: '5px'}}>
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

                <div style={infoStyle}>
                    <div style={personInfoStyle}>
                        <div>{request.name}</div>
                        <div>{request.email}</div>
                        <div>{request.phone}</div>
                        <hr />
                    </div>

                    <div>
                        {request.products.map((product) => (
                            <div style={productInfoStyle}>
                                <div>{product.name}</div>
                                <div>{product.description}</div>
                                <div>{product.amount}</div>
                                <div>{product.startDate?.toLocaleDateString() ?? 'N/A'}</div>
                                <div>{product.endDate?.toLocaleDateString() ?? 'N/A'}</div>
                                <button style={editButtonStyle} onClick={() => edit(product)}>
                                    Bearbeiten
                                </button>
                                <hr />
                            </div>
                            
                        ))}
                    </div>
                    
                    <div>
                    {request.status=="requested" && (
                        <button style={buttonStyle} onClick={() => confirmed(request)}>
                            Anfrage bestätigen
                        </button>
                    )}
                    {request.status=="confirmed" && (
                        <button style={buttonStyle} onClick={() => lended(request)}>
                            Verleihen
                        </button>
                    )}
                    {request.status=="lended" && (
                        <button style={buttonStyle} onClick={() => returned(request)}>
                            Zurück gegeben
                        </button>
                    )}

                    </div>

                </div>
            
            </div>
         
          
         ))}
        
        
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
    marginRight: '10px',
    marginTop: '5px',
    marginBottom: '10px',
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
