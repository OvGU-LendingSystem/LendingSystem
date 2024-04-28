import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons';

interface HeaderProps {
  pageTitleProp?: string;
}

export default function Header({ pageTitleProp }: HeaderProps): JSX.Element {
  const [pageTitle, setPageTitle] = useState<string>('My App');

  const headerStyle: React.CSSProperties = {
    backgroundColor: '#333',
    color: '#fff',
    padding: '5px 0',
    textAlign: 'center',
  };

  const pageTitleStyle: React.CSSProperties = {
    marginBottom: '10px',
    marginTop: '0',
  };

  const navStyle: React.CSSProperties = {
    backgroundColor: '#444',
  };

  const ulStyle: React.CSSProperties = {
    listStyleType: 'none',
    margin: 0,
    padding: 0,
    overflow: 'hidden',
  };

  const liStyle: React.CSSProperties = {
    float: 'left',
    marginRight: '20px',
  };

  const aStyle: React.CSSProperties = {
    display: 'block',
    color: '#fff',
    textAlign: 'center',
    padding: '14px 16px',
    textDecoration: 'none',
    transition: '0.3s',
  };

  const aHoverStyle: React.CSSProperties = {
    backgroundColor: '#555',
  };

  useEffect(() => {
    if (pageTitleProp) {
      setPageTitle(pageTitleProp);
    } else {
      setPageTitle('My App');
    }
  }, [pageTitleProp]);

  return (
    <header style={headerStyle}>
      <h1 style={{ ...pageTitleStyle }}>{pageTitle}</h1>
      <nav style={navStyle}>
        <ul style={ulStyle}>
          <li style={{ ...liStyle, float: 'right' }}>
            <a
              href="/warenkorb"
              style={aStyle}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#555')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '')}
            >
              <FontAwesomeIcon icon={faShoppingCart} />
            </a>
          </li>
          <li style={{ ...liStyle, float: 'left' }}>
            <a
              href="/"
              style={aStyle}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#555')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '')}
            >
              Home
            </a>
          </li>
          <li style={{ ...liStyle, float: 'left' }}>
            <a
              href="/borrowing"
              style={aStyle}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#555')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '')}
            >
              Ausleihen
            </a>
          </li>
          <li style={{ ...liStyle, float: 'left' }}>
            <a
              href="/contact"
              style={aStyle}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#555')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '')}
            >
              Kontakt
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
