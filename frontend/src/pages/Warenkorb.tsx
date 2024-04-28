import React from 'react';
import Header from '../components/Header';

function Warenkorb(): JSX.Element {
  const selectedItemsString = localStorage.getItem('selectedItems');
  const selectedItems = selectedItemsString ? JSON.parse(selectedItemsString) : [];

  return (
    <>
      <Header pageTitleProp="Warenkorb" />
      <div style={{ padding: '20px' }}>
        {selectedItems.length > 0 ? (
          <ul>
            {selectedItems.map((item: any, index: number) => (
              <li key={index}>
                {item.name} - {item.startDate.toLocaleDateString()} to {item.endDate.toLocaleDateString()} - {item.amount}
              </li>
            ))}
          </ul>
        ) : (
          <p>Der Warenkorb ist leer.</p>
        )}
      </div>
    </>
  );
}

export default Warenkorb;
