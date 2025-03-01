import React from "react";
import './../../core/input/Buttons/ButtonStyle.css';
import { useState, useEffect, useRef } from 'react';
import '../cart/OrderPopup.css';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { zoomPlugin, RenderZoomInProps, RenderZoomOutProps } from '@react-pdf-viewer/zoom';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import packageJson from '../../../package.json';
import { OrderPopup } from "../cart/OrderPopup";
import {useGetOrganizationByIdQuery} from '../../hooks/organization-helper';

import { useQuery, gql, useMutation,} from '@apollo/client';
import { useLoginStatus, useUserInfo } from "../../context/LoginStatusContext";
import { ALL } from "dns";
import { InventoryItemInCart } from "../../models/InventoryItem.model";
import { User } from "../../models/user.model";

const pdfjsVersion = packageJson.dependencies['pdfjs-dist'];

type AGBPopUpProbs = {
    trigger : boolean,
    setTrigger : any,
    products: InventoryItemInCart[],
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
const zoomPluginInstance = zoomPlugin();

const {data} = useGetOrganizationByIdQuery(props.products[0].organizationId);

const status = useLoginStatus();
//const user = useUserInfo();


const handleCreateOrder = async () => {
    try {
        const fromDate: Date[] = [];
        const tilDate: Date[] = [];
        const productsDividedByDate: InventoryItemInCart[][] = [];
        const deposit: number[] = [];

        props.products.forEach(item => {
            let x = false;
            for (let i=0; i<fromDate.length; i++){
                if (fromDate[i] == item.startDate && tilDate[i] == item.endDate){
                    productsDividedByDate[i].push(item);
                    deposit[i] += item.deposit;
                    x = true;
                    break;
                }
            }
            if (!x){
                const ind = fromDate.length;
                
                if (item.startDate==undefined) throw new Error('undefined startDate');
                fromDate.push(item.startDate);
                if (item.endDate==undefined) throw new Error('undefined endDate');
                tilDate.push(item.endDate);
                productsDividedByDate.push([]);
                productsDividedByDate[ind].push(item);
                deposit.push(item.deposit);
            }
        });

        

        for (let i=0; i<deposit.length; i++){
            //Rechte aus useUserInfo und Minimum bilden
            
            var maxD = 1000000;

            if (deposit[i]>maxD)
                deposit[i] = maxD;
        }
  
   } catch (error) {
     console.error('Error confirming order:', error);
   }
};

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

const { ZoomIn, ZoomOut } = zoomPluginInstance;

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
                            <Viewer fileUrl={data.agb}  plugins={[zoomPluginInstance]}/>
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
                <div>
                <button 
                    onClick={() => {handleCreateOrder(); 
                         SetButtonPopup(true);
                         props.setTrigger(false);}}
                    disabled={!(Close&&isChecked)}
                >
                    Akzeptiern
                </button>
                <button
                    onClick={() => {props.setTrigger(false)}}>
                    Zurück
                </button>
                <ZoomIn>
                {(props: RenderZoomInProps) => <button onClick={props.onClick}>+</button>}
                </ZoomIn>
                <ZoomOut>
                {(props: RenderZoomOutProps) => <button onClick={props.onClick}>-</button>}
                </ZoomOut>
                </div>
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