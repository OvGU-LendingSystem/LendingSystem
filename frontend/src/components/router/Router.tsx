import { Routes, Route } from "react-router-dom";
import { Layout } from "./Layout";
import { NotFound } from "../not-found/NotFound";
import { Inventory } from "../inventory/Inventory";
import { Cart } from "../cart/Cart";
import { AddInventory } from "../add-inventory/AddInventory";
import { EditInventory } from "../edit-inventory/EditInventory";
import { Login } from "../login/Login";
import { Requests } from "../requests/Requests";
import { InternalInventory } from "../internal-inventory/InternalInventory";
import { AddGroup } from "../add-group/AddGroup";
import { EditGroup } from "../edit-group/EditGroup";
import { EditRequest } from "../../components/requests/EditRequest";
import { Calendar } from "../calendar/Calendar";

export function Router() {
    return (
        <Routes>
          <Route path='/' element={<Layout />}>
            <Route index element={<Inventory />}/>
            <Route path='cart' element={<Cart />}/>
            <Route path='*' element={<NotFound />} />
    
            <Route path='inventory'>
              <Route index element={<Inventory />} />
              <Route path="group">
                <Route path="add" element={<AddGroup />} />
                <Route path="edit/:groupId" element={<EditGroup />} />
              </Route>
              <Route path="add" element={<AddInventory />} />
              <Route path="edit/:itemId" element={<EditInventory />} />
            </Route>

            <Route path='internal'>
              <Route path='inventory' element={<InternalInventory />} />
              <Route path='calendar' element={<Calendar />} />
            </Route>

            <Route path='login' element={<Login />}/>

            <Route path='requests' element={<Requests />}/>

            <Route path='requests'>
              <Route path='edit/:orderId' element={<EditRequest/>}/>
            </Route>
          </Route>
        </Routes>
      );
}