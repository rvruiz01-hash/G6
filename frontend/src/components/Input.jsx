import '../styles/Input.css';

export default function Input({tipo, placeholder, estilo, onChange}){
    return <input type={tipo} placeholder={placeholder} className={estilo} onChange={onChange}/>
}
