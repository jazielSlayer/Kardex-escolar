import "./Navegacion.css"
import { Link } from "react-router-dom";
import {  IconUser, IconHelp,IconHome, IconSearch, IconClipboardX, IconEdit, IconSchool, IconAddressBook } from '@tabler/icons-react';


function Navegacion({ isOpen, onToggle }) {

    const handleToggle = () => {
        if (onToggle) onToggle();
    };

    return (
        <>
        <header>
            <div className="left">
                <div className="menu-container">
                    <div className={`menu ${isOpen ? 'menu-toggle' : ''}`} id="menu" onClick={handleToggle}>
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>
                    <div className="brand">
                        <IconClipboardX className="logo" />
                        <span className="name">Kardex</span>
                    </div>
                </div>
            </div>
            <div className="right">
                {/* Registrar estudiante */}
                <Link to="/registrar/nuevo/estudiante" className="pestañas icons-header">
                    <IconEdit alt="Registrar-estudiante" />
                </Link>
                {/* Lista de estudiantes */}
                <Link to="/estudiante/lista" className="pestañas icons-header">
                    <IconSchool alt="estudiante-lista" />
                </Link>
                {/* resgistrar anotacion */}
                <Link to="/registrar/anotacion" className="pestañas icons-header">
                    <IconClipboardX alt="estudiante-anotacion" />
                </Link>
                {/* contactar al padre */}
                <Link to="/padre/contacto" className="pestañas icons-header">
                    <IconAddressBook alt="contacto-padre" />
                </Link>
                {/* perfil */}
                <Link href="#" className="pestañas icons-header">
                    <IconUser alt="img-user" className="user" />
                </Link>
            </div>
        </header>
        <div className={`sidebar ${isOpen ? 'menu-toggle' : ''}`} id="sidebar" >
            <nav>
                <ul className="nav-list">
                    <li>
                        {/* Buscar */}
                        <Link href="#" className="a search">
                            <IconSearch alt="buscar" className="img" />
                            <span>Buscars</span>
                        </Link>
                    </li>
                    <li>
                        {/* Home */}
                        <Link to="/admin" className="a selected">
                            <IconHome alt="inicio" className="img" />
                            <span>Inicio</span>
                        </Link>
                    </li>
                    <li>
                        {/* Registrar anotaciones */}
                        <Link to="/registrar/anotacion" className="a">
                            <IconClipboardX alt="actividad" className="img" />
                            <span>Anotaciones</span>
                        </Link>
                    </li>
                    <li>
                        {/* Retirar Dinero */}
                        <Link to="/estudiante/lista" className="a">
                            <IconSchool alt="retirar" className="img" />
                            <span>Estudiantes</span>
                        </Link>
                    </li>
                    <li>
                        {/* Registrar nuevo estudiante */}
                        <Link to="/registrar/estudiante/nuevo" className="a">
                            <IconEdit alt="agregar" className="img" />
                            <span>Registrar estudiante</span>
                        </Link>
                    </li>
                    <li>
                        {/* Ayuda */}
                        <Link to="/cliente/ayuda" className="a">
                            <IconHelp alt="ayuda" className="img" />
                            <span>Ayuda</span>
                        </Link>
                    </li>
                </ul>
            </nav>
        </div>
        </>
    );
}

export default Navegacion;