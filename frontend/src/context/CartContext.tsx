import { Dispatch, ReactNode, createContext, useContext } from "react";
import { useLocalStorageWithReducer } from "../hooks/use-local-storage";
import { InventoryItemInCart } from "../models/InventoryItem.model";

interface CartDispatcherAction {
    item: InventoryItemInCart;
    type: 'add' | 'remove' | 'edit';
}

export const CartContext = createContext<InventoryItemInCart[]>([]);
export const CartDispatcherContext = createContext<Dispatch<CartDispatcherAction>>(() => {});

export function CartProvider({ children }: { children: ReactNode }) {
    const [ itemsInCart, dispatchItemsInCart ] = useLocalStorageWithReducer('test', [], cartActionReducer, undefined, dateReviver);
    return (
        <CartContext.Provider value={itemsInCart}>
            <CartDispatcherContext.Provider value={dispatchItemsInCart}>
                { children }
            </CartDispatcherContext.Provider>
        </CartContext.Provider>
    );
}

const cartActionReducer = (items: InventoryItemInCart[], action: CartDispatcherAction) => {
    switch (action.type) {
        case "add": return [ ...items, action.item ];
        case "remove": return items.filter(item => item.physId !== action.item.physId);
        case "edit": return items.map(x => x.physId === action.item.physId ? action.item : x);
    }
}

const dateReviver = (key: string, value: string) => {
    if (['startDate', 'endDate'].includes(key))
        return new Date(value);
    return value;
}

export function useCart() {
    return useContext(CartContext);
}

export function useCartDispatcher() {
    return useContext(CartDispatcherContext);
}