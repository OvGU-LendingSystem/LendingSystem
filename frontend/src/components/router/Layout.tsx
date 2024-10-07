import React, { useState, ReactNode } from "react";
import "./Layout.css";
import { MdOutlineShoppingBasket } from "react-icons/md";
import { Link, Outlet } from "react-router-dom";
import { Login } from "../login/Login";

interface ModalProps {
  children: ReactNode;
  isVisible: boolean;
  onClose: () => void;
}

function Modal({ children, isVisible, onClose }: ModalProps) {
  if (!isVisible) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <button style={{marginRight:"40px", marginTop:"5px"}}className="modal-close" onClick={onClose}>
          &times;
        </button>
        {children}
      </div>
    </div>
  );
}

declare global {
  interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    startDate?: Date;
    endDate?: Date;
    imageUrl: string;
    amount?: number;
    category?: string;
    status?: string;
  }

  interface Quest {
    id: number;
    name: string;
    email: string;
    startDate?: Date;
    endDate?: Date;
    products: Product[];
    status?: string;
  }
}

export function Layout() {
  const [isLoginModalVisible, setLoginModalVisible] = useState(false);

  const handleLoginClick = () => {
    setLoginModalVisible(true);
  };

  const handleCloseModal = () => {
    setLoginModalVisible(false);
  };

  return (
    <div className="layout">
      <nav className='nav-bar'>
        <ul>
          <li>
            <Link to='/'>Home</Link>
          </li>
          <li>
            <Link to='/requests'>Anfragen</Link>
          </li>
          <li>
            <Link to='/internal/inventory'>Internes Inventar</Link>
          </li>
        </ul>

        <ul>
          <li>
            <button style={{ padding: "3px" }} onClick={handleLoginClick}>Login</button>
          </li>
          <li>
            <Link to='/cart'>
              <MdOutlineShoppingBasket size={24} />
            </Link>
          </li>
        </ul>
      </nav>
      <main className="content">
        <Outlet />
      </main>
      <Modal isVisible={isLoginModalVisible} onClose={handleCloseModal}>
        <Login />
      </Modal>
    </div>
  );
}