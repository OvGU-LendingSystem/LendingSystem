import React from "react";
import StandardLonghandProperties from "react";
import './ButtonStyle.css';

interface ButtonInfo {
    label: string;  
    onClick: () => void;
    type? : string;
    Backgroundcolor? : string; 
    color_? : string;
    roundness? : number;
    border_string? : string;
    font_? : string;
    boxShadow_? : string;
    state? : boolean;
    Icon? : React.ReactNode;
    width_? : string;
    height_? : string;
 // width, height dynamisch größen 
 //   textTransform_? : "none" | "capitalize" | "uppercase" | "lowercase" | "full-width" | "full-size-kana" ;
  }
  
  const Button : React.FC<ButtonInfo> = ({ label,type, onClick, Backgroundcolor, color_,  roundness, border_string, font_, boxShadow_, state, Icon, width_, height_}) => {
    return <div>
    <button disabled={state} style={{backgroundColor: Backgroundcolor, color : color_, borderRadius: roundness, border: '2.8px solid black', font: font_, boxShadow: boxShadow_, width:width_, height: height_ }} className={type}  onClick={onClick}>{label} {Icon}
    </button>
    </div> 
  }
  export default Button;