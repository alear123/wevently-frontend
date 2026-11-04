import SearchSection from '../components/SearchSection';
import wevently from '../../assets/wevently.png';
import '../../assets/Navbar.css'
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

function UsuarioPopOverMenuNoLogueado({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="user-popover-menu">
      <div className="user-popover-options" style={{ paddingTop: "1rem", paddingBottom: "1rem" }}>
        {children}
      </div>
    </div>
  );
}

export default function Navbar() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const userIconRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) setScrolled(isScrolled);
    };
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

  return (
    <nav className={`navbar-wevently ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-wevently-container">
        <img
          src={wevently}
          className="navbar-wevently-logo"
          alt="Wevently"
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/')}
          aria-label="Ir al inicio"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('/'); } }}
        />
        <div className="navbar-wevently-center">
          <div className="navbar-wevently-search-item" onClick={() => navigate('/buscar-lugares')}>
            <SearchSection icon="fa-map-marker-alt" text="Buscar lugares"/>
          </div>
          <div className="navbar-wevently-search-item" onClick={() => navigate('/buscar-servicios')}>
            <SearchSection icon="fa-camera" text="Buscar servicios"/>
          </div>
        </div>
        <div className="navbar-wevently-actions">
          <div style={{ position: 'relative' }}>
            <div className="navbar-wevently-user-icon" ref={userIconRef} onClick={togglePopover}>
              <i className="fas fa-user"></i>
            </div>
            <UsuarioPopOverMenuNoLogueado open={popoverOpen} onClose={() => setPopoverOpen(false)}>
              <button type='button' className="user-popover-item" onClick={() => { navigate('/Login_y_register?view=login'); setPopoverOpen(false); }}>
                <i className="fas fa-user me-2"></i> Iniciar Sesión
              </button>
              <button type='button' className="user-popover-item" onClick={() => { navigate('/Login_y_register?view=register'); setPopoverOpen(false); }}>
                <i className="fas fa-cog me-2"></i> Registrarse
              </button>
            </UsuarioPopOverMenuNoLogueado>
          </div>
        </div>
      </div>
    </nav>
  );
}
