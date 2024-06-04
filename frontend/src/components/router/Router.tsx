import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Layout } from "./Layout";
import { NotFound } from "../not-found/NotFound";
import { Inventory } from "../inventory/Inventory";
import { Cart } from "../cart/Cart";
import { AddInventory } from "../add-inventory/AddInventory";
import { Login } from "../login/Login";
import { Requests } from "../requests/Requests";


export function Router() {
    const [itemsInCart, setItemsInCart] = useState<Product[]>([]);

    const removeItemFromCart = (product: Product) => {
      console.log("delete item " + product.name);
      for (var i=0; i<itemsInCart.length; i++){
        if (itemsInCart[i].id==product.id){
          itemsInCart[i].name = "DELETED";
          itemsInCart.splice(i,i); //TODO funktioniert nicht
        }
      }
    };
    const editItemFromCart = (product: Product, productNew: Product) => {
      console.log("edit item " + product.name);
      for (var i=0; i<itemsInCart.length; i++){
        if (itemsInCart[i].id==product.id){
          itemsInCart[i].name = "EDITED";
          itemsInCart[i] = productNew; //TODO funktioniert nicht
        }
      }
    }

    return (
        <Routes>
          <Route path='/' element={<Layout />}>
            <Route index element={<Inventory selectedItems={itemsInCart} setSelectedItems={setItemsInCart}/>}/>
            <Route path='cart' element={<Cart selectedItems={itemsInCart} editSelectedItem={editItemFromCart} removeSelectedItem={removeItemFromCart}/>}/>
            <Route path='*' element={<NotFound />} />
    
            <Route path='inventory'>
              <Route index element={<Inventory selectedItems={itemsInCart} setSelectedItems={setItemsInCart}/>} />
              <Route path="add" element={<AddInventory />} />
            </Route>

            <Route path='login' element={< Login/>}/>

            <Route path='requests' element={< Requests/>}/>
          </Route>
        </Routes>
      );
}