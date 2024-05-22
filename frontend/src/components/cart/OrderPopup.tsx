import React from "react";
import './OrderPopup.css';
import './../../core/input/Buttons/ButtonStyle.css';

type PopupProbs = {
    trigger: boolean;
    setTrigger: any;
}

export function OrderPopup(props: PopupProbs) {
    var name, mail, number, agb;

    const lending = () => {
        //TODO
        props.setTrigger(false);
    };

    return (props.trigger?
        <div className="overlay">
            <div className="popup">
                <div>
                    <div style={{padding: '10px'}}>
                        <div> <label>Name: </label> </div>
                        <div> <input type="text" value={name} style={input}></input> </div>
                    </div>
                    <div style={{padding: '10px'}}>
                        <div> <label>Email: </label> </div>
                        <div> <input type="mail" value={mail} style={input}></input> </div>
                    </div>
                    <div style={{padding: '10px'}}>
                        <div> <label>Telefon: </label> </div>
                        <div> <input type="text" value={number} style={input}></input> </div>
                    </div>
                </div>

                <div style={{padding: '10px'}}>
                    <input type="checkbox" value={agb} style={inputCheckbox}></input>
                    <label>Hiermit stimme ich den AGB's zu.</label>
                </div>

                <div style={buttonContainerStyle}>
                    <button className="button" onClick={() => lending()}>Abschicken</button>
                    <button onClick={() => props.setTrigger(false)} className="button">Abbrechen</button>
                </div>

            </div>
        </div>
        :<div />);
    
}

const buttonContainerStyle: React.CSSProperties = {
    textAlign: 'right',
};
const input: React.CSSProperties = {
    padding: '10px',
    width: '100%',
    marginRight: '10px',
};
const inputCheckbox: React.CSSProperties = {
    marginRight: '10px',
};