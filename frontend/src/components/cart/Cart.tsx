import React from "react";
import { OrderPopup } from "./OrderPopup";
import { useState } from "react";
import './Cart.css';
import Calendar from '../../core/input/Buttons/Calendar';

//APOLLO STUFF ZUM TESTEN

import { useQuery, gql } from '@apollo/client';

const GET_LOCATIONS = gql`
  query {
    filterTags {
      tagId
      name
    }
  }
`;

function DisplayLocations() {
  const { loading, error, data } = useQuery(GET_LOCATIONS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message}</p>;

  return data.filterTags.map(({ tagId, name }: { tagId: number, name: string }) => (
    <div key={tagId}>
      <p>
        {tagId}: {name}
      </p>
    </div>
  ));
}

//ENDE APOLLO STUFF

type CartProbs = {
    selectedItems: Product[];
    removeSelectedItem: any;
    editSelectedItem: any;
}

export function Cart(probs: CartProbs) {
    const [buttonPopup, SetButtonPopup] = useState(false);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [amount, setAmount] = useState<number>(1);

    var productNew: Product;

    const openModal = (product: Product) => {
        setSelectedProduct(product);
        setShowModal(true);
    };
    const closeModal = () => {
        setShowModal(false);
        setSelectedProduct(null);
    };

    return (
        
        <div>

            <div style={{padding: '20px'}}>
                <h2 style={{marginBottom: '20px'}}>Warenkorb</h2>

                {probs.selectedItems.map((product) => (
                 <div key={product.id} style={productCardStyle}>
                 <img src={product.imageUrl} alt={product.name} style={imageStyle} />
                 <div style={productInfoStyle}>
                   <h3>{product.name}</h3>
                   
                   <div style={descriptionStyle}>
                     <div style={descriptionContentStyle}>{product.description}</div>
                     <button style={descriptionButtonStyle}>Beschreibung</button>
                   </div>
                   <div style={priceStyle}>{product.price}</div>
                   <div>{product.startDate?.toLocaleDateString() ?? 'N/A'}</div>
                   <div>{product.endDate?.toLocaleDateString() ?? 'N/A'}</div>
                   <div>{product.amount}</div>

                   
                   <button style={addToCartButtonStyle} onClick={() => openModal(product)}>
                     Bearbeiten
                   </button>
                   <button style={addToCartButtonStyle} onClick={() => probs.removeSelectedItem(product)}>
                     Entfernen
                   </button>
                 </div>
               </div>
                ))}

                {showModal && (
                    <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <h2>Objekt bearbeiten</h2>
                        <Calendar
                        />
                        <div style={inputContainerStyle}>
                        <label>Menge:</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(parseInt(e.target.value))}
                            min="1"
                            style={{ marginLeft: '10px' }}
                        />
                        </div>
                        <div style={buttonContainerStyle}>
                        <button onClick={() => probs.editSelectedItem(selectedProduct, productNew)}>Edit</button>
                        <button onClick={closeModal} style={{ marginLeft: '10px' }}>
                            Cancel
                        </button>
                        </div>
                    </div>
                    </div>
                )}
            
            <button onClick={() => SetButtonPopup(true)} style={addToCartButtonStyle}>Bestellen</button>

            <OrderPopup trigger={buttonPopup} setTrigger={SetButtonPopup} />
            </div>
        </div>
    );
}


const filterContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '20px',
  };
  
  const searchInputStyle: React.CSSProperties = {
    padding: '10px',
    width: '200px',
    marginRight: '10px',
  };
  
  const dropdownButtonStyle: React.CSSProperties = {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
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
  
  const productCardStyle: React.CSSProperties = {
    marginBottom: '20px',
    border: '1px solid #ccc',
    padding: '10px',
    display: 'flex',
    alignItems: 'center',
  };
  
  const imageStyle: React.CSSProperties = {
    width: '250px',
    height: '150px',
    marginRight: '20px',
  };
  
  const productInfoStyle: React.CSSProperties = {
    flex: '1',
  };
  
  const addToCartButtonStyle: React.CSSProperties = {
    backgroundColor: '#007bff',
    color: '#ffffff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '10px',
    marginTop: '5px',
  };
  
  const descriptionStyle: React.CSSProperties = {
    marginBottom: '10px',
  };
  
  const descriptionButtonStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    color: '#191970',
    border: 'none',
    padding: '2px 4px',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '10px',
    textDecoration: 'underline',
  };
  
  
  const descriptionContentStyle: React.CSSProperties = {
    //display: 'none',
  };
  
  
  const priceStyle: React.CSSProperties = {
    fontWeight: 'bold',
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
  
  const inputContainerStyle: React.CSSProperties = {
    marginBottom: '20px',
  };
  
  const buttonContainerStyle: React.CSSProperties = {
    textAlign: 'right',
  };