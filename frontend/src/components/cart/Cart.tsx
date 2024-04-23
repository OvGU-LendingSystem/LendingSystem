import React from "react";
import { OrderPopup } from "./OrderPopup";
import { useState } from "react";

export function Cart() {
    const [buttonPopup, SetButtonPopup] = useState(false);

    return (
        

        <div>
            <>Warenkorb</>

            <button onClick={() => SetButtonPopup(true)}>Bestellen</button>

            <OrderPopup trigger={buttonPopup} />
        </div>
    );
}