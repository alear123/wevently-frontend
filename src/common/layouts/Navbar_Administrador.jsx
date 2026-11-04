import SearchSection from '../components/SearchSection';
import NotificationDropdown from '../../modules/Usuarios&Seguridad/Gestionar_notificaciones/NotificationDropdown';
import wevently from '../../assets/wevently.png';
import '../../assets/Navbar.css'
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import ModalConfirmarEditar from './ModalConfirmarEditar';
import { getLoggedUser } from '../Utils';
import UsuarioPopOverMenu from '../components/UsuarioPopOverMenu';
import { useReportesModal } from "../../modules/Reportes/src/ReportesModalContext";
import { verFotoPerfil as obtenerFotoPerfil} from '../../api/services';

export default function Navbar_Administrador() {
  const navigate = useNavigate();
  const [logOut, setLogOut] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [user, setUser] = useState({ email: '', rol: '' });
  const userIconRef = useRef(null);
  const { showReportesModal } = useReportesModal();
  const [foto, setFoto] = useState("");

  useEffect(() => {
    // Función async para obtener la foto
    const fetchFoto = async () => {
      try {
        const fotoUsuario = await obtenerFotoPerfil();
        setFoto(fotoUsuario);
      } catch (error) {
        console.error("Error al obtener la foto de perfil:", error);
      }
    };

    fetchFoto(); // se ejecuta solo una vez al montar
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) setScrolled(isScrolled);
    };
    const data = getLoggedUser();
    setUser({
      email: data?.email || 'Usuario',
      rol: data?.rol?.charAt(0).toUpperCase() + data?.rol?.slice(1) || 'Administrador'
    });
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        userIconRef.current &&
        !userIconRef.current.contains(event.target)
      ) {
        const popover = document.querySelector('.user-popover-menu');
        if (popover && popover.contains(event.target)) return;
        setPopoverOpen(false);
      }
    }
    if (popoverOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [popoverOpen]);

  const togglePopover = () => setPopoverOpen(!popoverOpen);
  const handleCancelarLogOut = () => setLogOut(false);
  const handleConfirmarLogOut = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/');
    location.reload();
  };

  return (
    <>
      <nav className={`navbar-wevently ${scrolled ? "navbar-scrolled" : ""}`}>
        <div className="navbar-wevently-container">
          <img
            src={wevently}
            className="navbar-wevently-logo"
            alt="Wevently"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/Inicio')}
            aria-label="Ir al inicio"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('/Inicio'); } }}
          />
          <div className="navbar-wevently-center">
            <div
              className="navbar-wevently-search-item"
              onClick={() => navigate("/buscar-lugares")}
            >
              <SearchSection icon="fa-map-marker-alt" text="Buscar lugares" />
            </div>
            <div
              className="navbar-wevently-search-item"
              onClick={() => navigate("/buscar-servicios")}
            >
              <SearchSection icon="fa-camera" text="Buscar servicios" />
            </div>
          </div>
          <div className="navbar-wevently-actions">
            <NotificationDropdown />
            <div style={{ position: "relative" }}>
              <div
                className="navbar-wevently-user-icon"
                ref={userIconRef}
                onClick={togglePopover}
              >
                {foto ? (
                  <img src={foto} style={{ height: "inherit", width: "inherit", borderRadius: "inherit" }} />) :
                  <i className="fas fa-user"></i>
                }
              </div>
              <UsuarioPopOverMenu
                open={popoverOpen}
                email={user.email}
                rol={user.rol}
                onClose={() => setPopoverOpen(false)}
              >
                <button
                  type="button"
                  className="user-popover-item"
                  onClick={() => {
                    navigate("/Inicio");
                    setPopoverOpen(false);
                  }}
                >
                  <i className="bi bi-house-door me-2"></i> Inicio
                </button>
                <button
                  type="button"
                  className="user-popover-item"
                  onClick={() => {
                    showReportesModal();
                    setPopoverOpen(false);
                  }}
                >
                  <i className="bi bi-graph-up me-2"></i> Mis Reportes
                </button>
                <button
                  type="button"
                  className="user-popover-item"
                  onClick={() => {
                    navigate("/Inicio/mi-perfil");
                    setPopoverOpen(false);
                  }}
                >
                  <i className="fas fa-user me-2"></i> Mi Perfil
                </button>
                <button
                  type="button"
                  className="user-popover-item logout"
                  onClick={() => {
                    setLogOut(true);
                    setPopoverOpen(false);
                  }}
                >
                  <i className="fas fa-sign-out-alt me-2"></i> Cerrar Sesión
                </button>
              </UsuarioPopOverMenu>
            </div>
          </div>
        </div>
      </nav>
      <ModalConfirmarEditar
        mostrar={logOut}
        titulo={"Cerrar Sesion"}
        mensaje={"¿Deseas cerrar la sesion?"}
        onCancelar={handleCancelarLogOut}
        onConfirmar={handleConfirmarLogOut}
        accion={"Confirmar"}
      />
    </>
  );
}
