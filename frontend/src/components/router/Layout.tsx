import React from "react";
import { MdOutlineShoppingBasket } from "react-icons/md";
import { Link, Outlet } from "react-router-dom";

declare global{
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

  interface Quest {
    id: number;
    name: string;
    email: string;
    phone?: string;
    products: Product[];
    status: string; //requested, confirmed, lended
  }
}


export function Layout() {
    return (<>
        <nav className='nav-bar'>
          <ul>
            <li>
              <Link to='/'>Home</Link>
            </li>
            <li>
              <Link to='/requests'>Anfragen</Link>
            </li>
            <li>
              <Link to='/todo'>Todo</Link>
            </li>
          </ul>
  
          <ul>
            <li>
              <Link to='/login'>Login</Link>  
            </li>
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
  