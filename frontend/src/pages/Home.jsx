import '../styles/Home.css';
import '../styles/Nav.css';
import Nav from '../components/Nav.jsx';
import Enlace from '../components/Enlace.jsx';

export default function Home() {
  return (
    <div className='div__root'>
        <Nav ClaseNav="nav nav__home">    
            <Enlace url="/consultar-asistencia" claseLink="enlace enlace--animation-left" texto='Consultar Asistencia '/>
            <Enlace url="/postulate" claseLink="enlace enlace--animation-left" texto='Postulate '/>
            <Enlace url="/activar-cuenta" claseLink="enlace enlace--animation-left" texto='Activar Cuenta '/>
            <Enlace url="/login" claseLink="enlace enlace--animation-left" texto='Login'/>
        </Nav>
    </div>
  );
}
