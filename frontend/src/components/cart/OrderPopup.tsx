import React from "react";
import './OrderPopup.css';

type PopupProbs = {
    trigger: boolean;
}

export function OrderPopup(props: PopupProbs) {
    var name, mail, number, agb;
    return (props.trigger) ? (
        <div className="popup">
            <div className="wrapper popup-inner">
                <div> <label>Name: </label> </div>
                <div> <input type="text" value={name} ></input> </div>
                <div> <label>Email: </label> </div>
                <div> <input type="mail" value={mail} ></input> </div>
                <div> <label>Telefon: </label> </div>
                <div> <input type="text" value={number} ></input> </div>
            </div>

            <div>
                <input type="checkbox" value={agb} ></input>
                <label>Hiermit stimme ich den AGB's zu.</label>
            </div>

            <div>
                <button >Abbrechen</button>
                <button>Abschicken</button>
            </div>

        </div>
    ) : <div />;
}