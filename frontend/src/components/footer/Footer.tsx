import './Footer.css';
import { NavLink } from "react-router-dom";

export function Footer() {
    return (
        <div className='footer'>
            <NavLink className='nav-link' to='/contact'>Kontakt</NavLink>
            <NavLink className='nav-link' to='/impressum'>Impressum</NavLink>
            <NavLink className='nav-link' to='/privacy'>Datenschutz</NavLink>
        </div>
    );
}