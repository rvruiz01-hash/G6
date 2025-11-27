// src/components/Navbar.tsx
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/">Inicio</Link>
      <Link to="/contacto">Contacto</Link>
      <Link to="/postulate">Postúlate</Link>
      <Link to="/signin" className="login-button">
        Login
      </Link>
    </nav>
  );
}
