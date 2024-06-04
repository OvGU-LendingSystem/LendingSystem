import { Routes, Route } from "react-router-dom";
import { Layout } from "./Layout";
import { NotFound } from "../not-found/NotFound";
import { Inventory } from "../inventory/Inventory";
import { Cart } from "../cart/Cart";
import { AddInventory } from "../add-inventory/AddInventory";
import { Login } from "../login/Login";
import { Requests } from "../requests/Requests";

export function Router() {
    return (
        <Routes>
          <Route path='/' element={<Layout />}>
            <Route index element={<Inventory />}/>
            <Route path='cart' element={<Cart />}/>
            <Route path='*' element={<NotFound />} />
    
            <Route path='inventory'>
              <Route index element={<Inventory />} />
              <Route path="add" element={<AddInventory />} />
            </Route>

            <Route path='login' element={<Login />}/>

            <Route path='requests' element={<Requests />}/>
          </Route>
        </Routes>
      );
}