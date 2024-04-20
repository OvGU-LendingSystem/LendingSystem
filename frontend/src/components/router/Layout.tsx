import React from "react";
import { MdOutlineShoppingBasket } from "react-icons/md";
import { Link, Outlet } from "react-router-dom";

export function Layout() {
    return (<>
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
  
        <Outlet />
      </>
    );
}
  