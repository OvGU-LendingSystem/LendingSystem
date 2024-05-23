import "./Layout.css";
import { MdOutlineShoppingBasket } from "react-icons/md";
import { Link, Outlet } from "react-router-dom";

export function Layout() {
    return (
      <div className="layout">
        <nav className='nav-bar'>
          <ul>
            <li>
              <Link to='/'>Home</Link>
            </li>
            <li>
              <Link to='/todo'>Todo</Link>
            </li>
          </ul>
  
          <ul>
            <li>
              <Link to='/cart'>
                <MdOutlineShoppingBasket size={24} />
              </Link>
            </li>
          </ul>
        </nav>
  
        <main className="content">
          <div><Outlet /></div>
        </main>
      </div>
    );
}
  