import React, { useState } from 'react';
import Header from '../components/Header';
import ComboBox from '../components/Filter';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  startDate?: Date; // Add startDate property
  endDate?: Date; // Add endDate property
  amount?: number; // Add amount property
}


export function Borrowing(): JSX.Element {
  const products: Product[] = [
    {
      id: 1,
      name: 'Objekt 1',
      description: 'Beschreibung für Objekt 1',
      price: 'Kaution: 10€',
      imageUrl: 'https://via.placeholder.com/300',
    },
    {
      id: 2,
      name: 'Objekt 2',
      description: 'Beschreibung für Objekt 2',
      price: 'Kaution: 20€',
      imageUrl: 'https://via.placeholder.com/300',
    },
    {
      id: 3,
      name: 'Objekt 3',
      description: 'Beschreibung für Objekt 3',
      price: 'Kaution: 30€',
      imageUrl: 'https://via.placeholder.com/300',
    },
  ];

  const [selectedItems, setSelectedItems] = useState<Product[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [amount, setAmount] = useState<number>(1);

  const handleSelect = (selectedOptions: string[]) => {
    // Your implementation for handleSelect
  };

  const openModal = (product: Product) => {
    // Your implementation for openModal
  };

  const closeModal = () => {
    // Your implementation for closeModal
  };

  const addToCart = () => {
    // Your implementation for addToCart
  };

  return (
    <>
      <Header pageTitleProp="Ausleihen" />
      <div style={{ padding: '20px' }}>
        <div style={{ marginTop: '20px' }}>
          {products.map((product) => (
            <div key={product.id} style={productCardStyle}>
              <img src={product.imageUrl} alt={product.name} style={imageStyle} />
              <div style={productInfoStyle}>
                <h3>{product.name}</h3>
                <button style={addToCartButtonStyle} onClick={() => openModal(product)}>
                  Ausleihen
                </button>
                <div style={descriptionStyle}>
                  <button style={descriptionButtonStyle}>Beschreibung</button>
                  <div style={descriptionContentStyle}>{product.description}</div>
                </div>
                <div style={priceStyle}>{product.price}</div>
              </div>
            </div>
          ))}
        </div>
        {selectedItems.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <ul>
            {selectedItems.map((item, index) => (
  <li key={index}>
    {products.find((product) => product.id === item.id)?.name} -{' '}
    {item.startDate?.toLocaleDateString() ?? 'N/A'} to{' '}
    {item.endDate?.toLocaleDateString() ?? 'N/A'} - {item.amount ?? 'N/A'}
  </li>
))}

            </ul>
          </div>
        )}
      </div>

      {showModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h2>Add to Cart</h2>
            <DatePicker
              selected={startDate}
              onChange={(date: Date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              inline
              placeholderText="Start Date"
            />
            <DatePicker
              selected={endDate}
              onChange={(date: Date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              inline
              placeholderText="End Date"
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
              <button onClick={addToCart}>Add</button>
              <button onClick={closeModal} style={{ marginLeft: '10px' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

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
};

const descriptionStyle: React.CSSProperties = {
  marginBottom: '10px',
};

const descriptionButtonStyle: React.CSSProperties = {
  backgroundColor: '#f0f0f0',
  color: '#333',
  border: 'none',
  padding: '5px 10px',
  borderRadius: '4px',
  cursor: 'pointer',
  marginRight: '10px',
};

const descriptionContentStyle: React.CSSProperties = {
  display: 'none',
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
export {};