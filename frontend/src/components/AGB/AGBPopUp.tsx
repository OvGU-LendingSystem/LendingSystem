import React from "react";
import './../../core/input/Buttons/ButtonStyle.css';
import { useState, useEffect, useRef } from 'react';
import '../cart/OrderPopup.css';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import packageJson from '../../../package.json';
import { OrderPopup } from "../cart/OrderPopup";

const pdfjsVersion = packageJson.dependencies['pdfjs-dist'];


type AGBPopUpProbs = {
    trigger : boolean,
    setTrigger : any;
}

/**
 * 
 * @param props trigger as a boolean and setTrigger to change the boolean to show or not show the PopUp
 * @returns a PopUp where the user needs to read the AGB before loaning
 */
export default function AGBPopUp(props : AGBPopUpProbs){

const [buttonPopup, SetButtonPopup] = useState(false);
const [Close, setClose] = useState(false);
const [isChecked, setIsChecked] = useState(false);
const [text, setText] = useState<string[]>([]);
const textRef = useRef<HTMLDivElement>(null);


useEffect(() => {
    if (!props.trigger) return;

    const element = textRef.current;

    if (!element) return;

    const handleScroll = () => {
        const tolerance = 10; 
        const isAtBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + tolerance;
        setClose(isAtBottom);
    };

    element.addEventListener('scroll', handleScroll);
    handleScroll(); 

    return () => {
        element.removeEventListener('scroll', handleScroll);
    };
}, [props.trigger]);


useEffect(() => {
    if (props.trigger) {
        setIsChecked(false);
        setClose(false);
    }
}, [props.trigger]);


const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
};

return (
    props.trigger ?
        <div className="overlay">
            <div className="popup">
                <div 
                    ref={textRef} 
                    style={{ margin: 0, padding: '10px', maxHeight: '400px', overflowY: 'auto' }}
                >
              {/*      {text.map((paragraph, index) => (
                        <p key={index} dangerouslySetInnerHTML={{ __html: paragraph }}></p>
                    ))}*/}
                     <Worker workerUrl={`https://unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.js`}>
                            <Viewer fileUrl="/agb.pdf"/>
                        </Worker>
                </div>
                <div style={{ marginTop: '10px' }}>
                        <input
                            type="checkbox"
                            id="agreeCheckbox"
                            checked={isChecked}
                            onChange={handleCheckboxChange}
                        />
                    <label htmlFor="agreeCheckbox">Ich stimme den AGB zu.</label>
                </div>
                <button 
                    onClick={() => {SetButtonPopup(true);
                         props.setTrigger(false);}}
                    disabled={!(Close&&isChecked)}
                >
                    Close
                </button>
                
            </div>
        </div>
    : <OrderPopup trigger={buttonPopup} setTrigger={SetButtonPopup}/>
);
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