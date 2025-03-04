import React, { useState, ReactNode, useEffect } from "react";
import "./Layout.css";
import { MdOutlineShoppingBasket } from "react-icons/md";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { Login } from "../login/Login";
import { useLoginStatus } from "../../context/LoginStatusContext";
import { Footer } from "../footer/Footer";
import { VscAccount } from "react-icons/vsc";
import { useLoginStatusDispatcher } from "../../context/LoginStatusContext";


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
        <button style={{ marginRight: "40px", marginTop: "5px" }} className="modal-close" onClick={onClose}>
          &times;
        </button>
        {children}
      </div>
    </div>
  );
}

declare global {
  interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    startDate?: Date;
    endDate?: Date;
    imageUrl: string;
    amount?: number;
    category?: string;
    status?: string;
    organization: string;
    organizationId: string;
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
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const setLoginAction = useLoginStatusDispatcher();
  const loginStatus = useLoginStatus();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest(".dropdown-menu") && !(event.target as HTMLElement).closest(".account-icon")) {
        setDropdownVisible(false);
      }
    };

    if (isDropdownVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownVisible]);

  const handleLoginClick = () => {
    setLoginModalVisible(true);
  };

  const handleCloseModal = () => {
    setLoginModalVisible(false);
  };

  const handleLogout = () => {
    console.log("Logout clicked");
    setDropdownVisible(false);
    setLoginAction({ type: "logout" });
    localStorage.removeItem("authToken");
    console.log("User logged out");
    navigate("/");
  };

  return (
    <div className="layout">
      <nav className="nav-bar">
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          {loginStatus.loggedIn && 
            (<li>
              <Link to='/requests'>Anfragen</Link>
            </li>)
          }   
          {loginStatus.loggedIn &&
            (<div><li>
              <Link to='/internal/inventory'>Internes Inventar</Link>
            </li>
            <li>
            <Link to='/internal/calendar'>Interner Kalender</Link>
            </li></div>)
          }
          <li>
            {loginStatus.loggedIn ? `Hallo ${loginStatus.user.firstName}` : "Nicht eingeloggt"}
          </li>
          <li>
            {loginStatus.loggedIn && loginStatus.user.organizationInfoList.length > 0
              ? `Organisation Rechte ${loginStatus.user.organizationInfoList[0].rights}`
              : "keine Orga"}
          </li>
        </ul>

        <ul>
          <li style={{ position: "relative" }}>
            {loginStatus.loggedIn ? (
              <>
                <VscAccount
                  size={24}
                  className="account-icon"
                  style={{ cursor: "pointer", color: "white" }}
                  onClick={() => setDropdownVisible(!isDropdownVisible)}
                />
                {isDropdownVisible && (
                  <div className="dropdown-menu">
                    <button onClick={() => { setDropdownVisible(false); navigate("/profile"); }}>Nutzereinstellungen</button>
                    <button onClick={handleLogout}>Logout</button>
                  </div>
                )}
              </>
            ) : (
              <button style={{ padding: "3px" }} onClick={handleLoginClick}>
                Login
              </button>
            )}
          </li>
          <li>
            <Link to="/cart">
              <MdOutlineShoppingBasket size={24} />
            </Link>
          </li>
        </ul>
      </nav>
      <div className="main-scroller">
        <main className="content">
          <Outlet />
        </main>
        <Footer />
      </div>
      <Modal isVisible={isLoginModalVisible} onClose={handleCloseModal}>
        <Login onClose={handleCloseModal} />
      </Modal>
    </div>
  );
}
