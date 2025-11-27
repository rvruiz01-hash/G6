import React from 'react';
// import {aa} from '../App.jsx'; // Importing the variable 'aa' from App.jsx
// import { useContext } from 'react';
import './../styles/Enlace.css';
import { Link } from "react-router-dom";

export default function Enlace({claseLink, texto, url}){
   
    return(
        //    <div className={claseLink} onClick={HandleClick}>{texto}</div>
        <Link to={url} className={claseLink}>
           {texto}
        </Link>
    )
} 