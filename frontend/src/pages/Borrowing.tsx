import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  startDate?: Date;
  endDate?: Date;
  amount?: number;
  category?: string;
}

export function Borrowing(): JSX.Element {
  const products: Product[] = [
    {
      id: 1,
      name: 'Maus',
      description: 'Beschreibung für Objekt 1',
      price: 'Kaution: 10€',
      imageUrl: 'https://via.placeholder.com/300',
      category: 'Elektronik'
    },
    {
      id: 2,
      name: 'Maus2',
      description: 'Beschreibung für Objekt 2',
      price: 'Kaution: 20€',
      imageUrl: 'https://via.placeholder.com/300',
      category: 'Elektronik'
    },
    {
      id: 3,
      name: 'Tastatur',
      description: 'Beschreibung für Objekt 3',
      price: 'Kaution: 30€',
      imageUrl: 'https://via.placeholder.com/300',
      category: 'Office'
    },
  ];

  const [selectedItems, setSelectedItems] = useState<Product[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [amount, setAmount] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownVisible(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  const openModal = (product: Product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  const addToCart = () => {
    if (selectedProduct) {
      setSelectedItems([
        ...selectedItems,
        { ...selectedProduct, startDate, endDate, amount }
      ]);
      closeModal();
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prevCategories =>
      prevCategories.includes(category)
        ? prevCategories.filter(c => c !== category)
        : [...prevCategories, category]
    );
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().startsWith(searchQuery.toLowerCase()) &&
    (selectedCategories.length === 0 || selectedCategories.includes(product.category || ''))
  );

  return (
    <>
      <Header pageTitleProp="Ausleihen" />
      <div style={{ padding: '20px' }}>
        <div style={filterContainerStyle}>
          <input
            type="text"
            placeholder="Suchen"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={searchInputStyle}
          />
          <div style={{ position: 'relative', display: 'inline-block' }} ref={dropdownRef}>
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
                    checked={selectedCategories.includes('Elektronik')}
                    onChange={() => handleCategoryChange('Elektronik')}
                  />
                  Elektronik
                </label>
                <label style={checkboxLabelStyle}>
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes('Office')}
                    onChange={() => handleCategoryChange('Office')}
                  />
                  Office
                </label>
              </div>
            )}
          </div>
        </div>
        <div style={{ marginTop: '20px' }}>
          {filteredProducts.map((product) => (
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
