import React, { useState, useEffect, useRef } from 'react';
import Calendar from '../../core/input/Buttons/Calendar';
import Calendar_Querry from '../../core/input/Buttons/Calendar_Querry';
import { useCart, useCartDispatcher } from '../../context/CartContext';
import {useGetOrganizationByIdQuery} from '../../hooks/organization-helper';

import { useQuery, gql, ApolloClient, InMemoryCache } from '@apollo/client';
import { useGetPhysicalObjects } from '../../hooks/pysical-object-helpers';

/*var products: Product[] = [
  {
    id: 1,
    name: 'Maus',
    description: 'Beschreibung für Objekt 1',
    price: 10,
    imageUrl: 'https://via.placeholder.com/300',
    category: 'Elektronik',
    organisation: 'FARAFIN'
  },
  {
    id: 2,
    name: 'Maus2',
    description: 'Beschreibung für Objekt 2',
    price: 20,
    imageUrl: 'https://via.placeholder.com/300',
    category: 'Elektronik',
    organisation: 'FARAFIN'
  },
  {
    id: 3,
    name: 'Tastatur',
    description: 'Beschreibung für Objekt 3',
    price: 30,
    imageUrl: 'https://via.placeholder.com/300',
    category: 'Office',
    organisation: 'FARAMATH'
  },
  {
    id: 4,
    name: 'Tastatur2',
    description: 'Beschreibung für Objekt 4',
    price: 30,
    imageUrl: 'https://via.placeholder.com/300',
    category: 'Office',
    organisation: 'STURA'
  },
  {
    id: 5,
    name: 'Beamer',
    description: 'Beschreibung für Objekt 5',
    price: 50,
    imageUrl: 'https://via.placeholder.com/300',
    category: 'Electronik',
    organisation: 'FARAFIN'
  },
];*/

const GET_CATEGORIES = gql`
  query{
    filterTags{
      name
    }
  }
`;

const GET_PRODUCTS = gql`
  query{
    filterPhysicalObjects{
      physId
      deposit
      name
      description
      pictures{
        edges{
          node{
            path
          }
        }
      }
      tags{
        edges{
          node{
            tagId
            name
          }
        }
      }
      groups{
        edges{
          node{
            groupId
          }
        }
      }
      organizationId
    }
  }
`;



function GetOrganisationInformation(id: string){
  const {data} = useGetOrganizationByIdQuery(id);
  return data;
}

/*function DisplayInventory() {
  const { loading, error, data } = useQuery(GET_PRODUCTS);

  useEffect(() => {
    if (data) {

      console.log(data);
      const newProducts: Product[] = [];

      data.filterPhysicalObjects.forEach((item: any) => {
        var org = GetOrganisationInformation(item.organizationId);
        var tmp = {
          id: item.physId,
          name: item.name,
          description: item.description,
          price: item.deposit,
          imageUrl: item.pictures.edges[0]?.node?.path ?? " ",
          amount: 1,
          category: item.tags.edges[0]?.node?.name ?? " ",
          organisation: org.name,
        };
        newProducts.push(tmp);
      });

      setProducts(newProducts);
      console.log(products);
  }}, [data]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message}</p>;

  return <div></div>;
  
}*/


export function Inventory(): JSX.Element {
  const itemsInCart = useCart();
  const itemsInCartDispatcher = useCartDispatcher();

  //DisplayInventory();
  
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [amount, setAmount] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const [products, setProducts] = useState<Product[]>([]);


  const [categories, setCategories] = useState<string[]>([]);
  //HILFE
  /*const { loading, error, data } = useQuery(GET_CATEGORIES);
  setCategories(data.filterTags);*/

  const { loading, error, data } = useQuery(GET_PRODUCTS);

  //HILFE
  /*useEffect(() => {
    if (data) {

      console.log(data);
      const newProducts: Product[] = [];

      data.filterPhysicalObjects.forEach((item: any) => {
        var org = await GetOrganisationInformation(item.organizationId);
        var tmp = {
          id: item.physId,
          name: item.name,
          description: item.description,
          price: item.deposit,
          imageUrl: item.pictures.edges[0]?.node?.path ?? " ",
          amount: 1,
          category: item.tags.edges[0]?.node?.name ?? " ",
          organisation: org.name,
        };
        newProducts.push(tmp);
      });

      setProducts(newProducts);
      console.log(products);
  }}, [data]);*/


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

  const openModal = (product: any) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  const openDetails = (product: any) => {
    setSelectedProduct(product);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setShowDetails(false);
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

  const filteredProducts = products?.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (error) return <p>Error loading products: {error.message}</p>;

  return (
    <>
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
                {categories.map((category) => (
                  <label style={checkboxLabelStyle}>
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={() => handleCategoryChange(category)}
                    />
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
        <div style={{ marginTop: '20px' }}>
          {filteredProducts.map((product) => (
            <div key={product.id} style={productCardStyle}>
              <img src={product.imageUrl || 'https://via.placeholder.com/300'} alt={product.name} style={imageStyle} />
              <div style={productInfoStyle}>
                <h3>{product.name}</h3>
                <div style={descriptionStyle}>
                  <div style={descriptionContentStyle}>{product.description}</div>
                  <button style={descriptionButtonStyle} onClick={() => openDetails(product)}>Mehr Informationen</button>
                </div>
                <div style={priceStyle}>{product.deposit} €</div>

                <button style={addToCartButtonStyle} onClick={() => openModal(product)}>
                  In den Warenkorb hinzufügen
                </button>
              </div>
            </div>
          ))}
        </div>
        {/*itemsInCart.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <ul>
              {itemsInCart.map((item, index) => (
                <li key={index}>
                  {products.find((product) => product.physId === item.name)?.name} -{' '}
                  {item.startDate?.toLocaleDateString() ?? 'N/A'} to{' '}
                  {item.endDate?.toLocaleDateString() ?? 'N/A'} - {item.amount ?? 'N/A'}
                </li>
              ))}
            </ul>
          </div>
        )*/}
      </div>

      {showModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
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
            <div style={buttonContainerStyle}>
              <button onClick={addToCart}>Hinzufügen</button>
              <button onClick={closeModal} style={{ marginLeft: '10px' }}>
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}

      {showDetails && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h2>{selectedProduct?.name}</h2>
            <div style={inputContainerStyle}>
              <div>{selectedProduct?.description}</div>
            </div>
            <div style={buttonContainerStyle}>
              <button onClick={closeDetails} style={{ marginLeft: '10px' }}>
                Abbrechen
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
  marginTop: '10px',
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