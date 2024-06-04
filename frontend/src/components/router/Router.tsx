import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Layout } from "./Layout";
import { NotFound } from "../not-found/NotFound";
import { Inventory } from "../inventory/Inventory";
import { Cart } from "../cart/Cart";
import { AddInventory } from "../add-inventory/AddInventory";
import { Login } from "../login/Login";
import { Requests } from "../requests/Requests";
import { useLocalStorage } from "../../hooks/use-local-storage";

const dateReviver = (key: string, value: string) => {
  if (['startDate', 'endDate'].includes(key))
    return new Date(value);
  return value;
}

export function Router() {
    const [ itemsInCart, setItemsInCart ] = useLocalStorage<Product[]>('cart', [], undefined, dateReviver);

    const removeItemFromCart = (product: Product) => {
      console.log("delete item " + product.name);
      setItemsInCart(itemsInCart.filter(item => item.id != product.id));
    };
    const editItemFromCart = (product: Product, productNew: Product) => {
      console.log("edit item " + product.name);
      const newItemsInCart = itemsInCart.map(x => {
        if (x.id === product.id)
          return productNew;
        return x;
      });
      setItemsInCart(newItemsInCart);
    }

    return (
        <Routes>
          <Route path='/' element={<Layout />}>
            <Route index element={<Inventory selectedItems={itemsInCart} setSelectedItems={setItemsInCart} />}/>
            <Route path='cart' element={<Cart selectedItems={itemsInCart} editSelectedItem={editItemFromCart} removeSelectedItem={removeItemFromCart}/>}/>
            <Route path='*' element={<NotFound />} />
    
            <Route path='inventory'>
              <Route index element={<Inventory selectedItems={itemsInCart} setSelectedItems={setItemsInCart}/>} />
              <Route path="add" element={<AddInventory />} />
            </Route>

            <Route path='login' element={<Login />}/>

            <Route path='requests' element={<Requests />}/>
          </Route>
        </Routes>
      );
}