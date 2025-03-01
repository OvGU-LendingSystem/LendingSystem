import React, { Suspense } from "react";
import { useLoginStatus } from "../../context/LoginStatusContext";
import { Cart } from "./Cart"

export function CheckLoginCart(){
    const loginDispatcher = useLoginStatus();

    if (loginDispatcher.loggedIn){
        return <Cart />;
    }
    
    return (
        <div style={{marginTop: '10px', marginLeft: '10px'}}>Wenn Sie auf den Warenkorb zugreifen wollen, müssen Sie sich einloggen.</div>
    );

}