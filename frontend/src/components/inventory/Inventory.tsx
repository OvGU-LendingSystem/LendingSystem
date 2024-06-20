import React, { useState, useEffect, useRef } from 'react';
import Calendar from '../../core/input/Buttons/Calendar';
import { useCart, useCartDispatcher } from '../../context/CartContext';
import './Inventory.css';

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  category: string;
}


export function Inventory(): JSX.Element {
  const itemsInCart = useCart();
  const itemsInCartDispatcher = useCartDispatcher();

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
    {
      id: 4,
      name: 'Tastatur2',
      description: 'Beschreibung für Objekt 4',
      price: 'Kaution: 30€',
      imageUrl: 'https://via.placeholder.com/300',
      category: 'Office'
    },
    {
      id: 5,
      name: 'Beamer',
      description: 'Beschreibung für Objekt 5',
      price: 'Kaution: 50€',
      imageUrl: 'https://via.placeholder.com/300',
      category: 'Elektronik'
    },
  ];

  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
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
    if (selectedProduct && startDate && endDate) {
      itemsInCartDispatcher({
        type: 'add',
        item: { ...selectedProduct, startDate, endDate, amount }
      });
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
      <div style={{ padding: '20px' }}>
        <div className="filter-container">
          <input
            type="text"
            placeholder="Suchen"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <div style={{ position: 'relative', display: 'inline-block' }} ref={dropdownRef}>
            <button
              className="dropdown-button"
              onClick={() => setDropdownVisible(!dropdownVisible)}
            >
              Filter
            </button>
            {dropdownVisible && (
              <div className="dropdown-content">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes('Elektronik')}
                    onChange={() => handleCategoryChange('Elektronik')}
                  />
                  Elektronik
                </label>
                <label className="checkbox-label">
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
            <div key={product.id} className="product-card">
              <img src={product.imageUrl} alt={product.name} className="product-image" />
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <div className="product-description">
                  <div className="description-content">{product.description}</div>
                  <div className="tooltip-container">
                    <button
                      className="description-button"
                    >
                      Mehr Informationen
                    </button>
                    <div className="tooltip-content">
                      <p>Kaution: {product.price}</p>
                      <p>Kategorie: {product.category}</p>
                    </div>
                  </div>
                </div>
                <div className="product-price">{product.price}</div>
                <button className="add-to-cart-button" onClick={() => openModal(product)}>
                  In den Warenkorb hinzufügen
                </button>
              </div>
            </div>
          ))}
        </div>
        {itemsInCart.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <ul>
              {itemsInCart.map((item, index) => (
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
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Objekt hinzufügen</h2>
            <Calendar fromDate={startDate} tillDate={endDate} setStartDate={setStartDate} setEndDate={setEndDate} />
            <div className="input-container">
              <label>Menge:</label>
              <input
                type="number"
                value={amount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(parseInt(e.target.value))}
                min="1"
                style={{ marginLeft: '10px' }}
              />
            </div>
            <div className="button-container">
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
