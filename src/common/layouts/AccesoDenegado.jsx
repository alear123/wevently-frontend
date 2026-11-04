// src/components/AccessDenied.jsx
import { useState } from 'react';
import * as Utils from '../../common/Utils';
import Navbar from './Navbar'
import Navbar_Organizador from './Navbar_Organizador'
import Navbar_Prestador from './Navbar_Prestador'
import Navbar_Propietario from './Navbar_Propietario'
import Navbar_Administrador from './Navbar_Administrador'
import Modal_Error from './ModalError';
import Footer from './Footer'

export default function AccesoDenegado() {

    const [mostrar, setMostrar] = useState(true);

    return (
        <>
            {Utils.getLoggedUser()?.rol == "Organizador" ?
                <Navbar_Organizador /> :
                Utils.getLoggedUser()?.rol == "Prestador" ?
                    <Navbar_Prestador /> :
                    Utils.getLoggedUser()?.rol == "Propietario" ?
                        <Navbar_Propietario /> :
                        Utils.getLoggedUser()?.rol == "Admin" ?
                            <Navbar_Administrador /> :
                            <Navbar />
            }
            <Modal_Error titulo="Acceso denegado" mensaje="No tienes permisos para acceder a esta página o la ruta no existe." mostrar={mostrar} onCerrar={() => { setMostrar(false) }} />
        </>
    );
}
