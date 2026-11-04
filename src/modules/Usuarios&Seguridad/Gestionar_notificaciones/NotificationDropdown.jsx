import React, { useState, useRef, useEffect } from 'react';
import { useNotificaciones } from './src/api/useNotificaciones';
import './src/assets/NotificationDropdown.css';
import { useNavigate } from 'react-router-dom';
const MAX_RESUMEN_LENGTH = 85; // caracteres para mostrar plegado

const DropdownNotificaciones = () => {
    const [abierto, setAbierto] = useState(false);
    const refDropdown = useRef(null);
    const [expandidas, setExpandidas] = useState({}); // id: true/false, para el caret
    const navigate = useNavigate();
    const {
        notificaciones,
        cantidadNoLeidas,
        conectado,
        cargando,
        error,
        marcarComoLeida,
        marcarTodasComoLeidas,
        eliminarNotificacion,
        cargarMas,
        hayMas,
        reintentar
    } = useNotificaciones();

    useEffect(() => {
        const manejarClickAfuera = (evento) => {
            if (refDropdown.current && !refDropdown.current.contains(evento.target)) {
                setAbierto(false);
            }
        };
        document.addEventListener('mousedown', manejarClickAfuera);
        return () => document.removeEventListener('mousedown', manejarClickAfuera);
    }, []);

    const alternarDropdown = () => setAbierto(!abierto);

    const manejarClickNotificacion = async (notificacion) => {
        if (!notificacion.leida) {
            await marcarComoLeida(notificacion.id);
        }
        if (notificacion.urlReferencia) {
            //window.location.href = notificacion.urlReferencia;
            navigate(notificacion.urlReferencia);
        }
        setAbierto(false);
    };

    const toggleExpand = (id) => {
        setExpandidas(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const formatearHora = (fechaHora) => {
        if (!fechaHora) return '';
        const fecha = new Date(fechaHora);
        const ahora = new Date();
        const diffMs = ahora - fecha;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHoras = Math.floor(diffMins / 60);
        const diffDias = Math.floor(diffHoras / 24);
        if (diffMins < 1) return 'Hace un momento';
        if (diffMins < 60) return `Hace ${diffMins} minutos`;
        if (diffHoras < 24) return `Hace ${diffHoras} horas`;
        if (diffDias === 1) return 'Hace 1 día';
        if (diffDias < 7) return `Hace ${diffDias} días`;
        return fecha.toLocaleDateString('es-AR', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const obtenerIconoNotificacion = (tipo) => {
        const mapaIconos = {
            Propuesta: 'fas fa-handshake',
            Mensaje: 'fas fa-envelope',
            Recordatorio: 'fas fa-bell',
            Alerta: 'fas fa-exclamation-triangle'
        };
        return mapaIconos[tipo] || 'fas fa-info-circle';
    };

    return (
        <div className="notification-dropdown" ref={refDropdown}>
            {/* Campana con contador */}
            <div
                className={`notification-bell ${!conectado ? 'disconnected' : ''}`}
                onClick={alternarDropdown}
                data-testid="notification-bell"
            >
                <i className="fas fa-bell"></i>
                {cantidadNoLeidas > 0 && (
                    <span className="notification-badge" data-testid="notification-badge">
                        {cantidadNoLeidas > 99 ? '99+' : cantidadNoLeidas}
                    </span>
                )}
            </div>
            {/* Dropdown */}
            {abierto && (
                <div className="notification-dropdown-menu">
                    <div className="dropdown-header">
                        <h6>Notificaciones</h6>
                        {notificaciones.some(n => !n.leida) && (
                            <button
                                className="mark-all-read-btn"
                                onClick={marcarTodasComoLeidas}
                                data-testid="mark-all-read"
                            >
                                Marcar todas como leídas
                            </button>
                        )}
                    </div>
                    <div className="dropdown-body">
                        {error ? (
                            <div className="error-state">
                                <i className="fas fa-exclamation-triangle"></i>
                                <p>{error}</p>
                                <button className="retry-btn" onClick={reintentar}>
                                    Reintentar
                                </button>
                            </div>
                        ) : notificaciones.length === 0 && !cargando ? (
                            <div className="empty-state">
                                <i className="fas fa-bell-slash"></i>
                                <p>No tenés notificaciones nuevas</p>
                            </div>
                        ) : (
                            <>
                                <div className="notifications-list">
                                    {notificaciones.map((notificacion) => {
                                        const esLargo = notificacion.resumen && notificacion.resumen.length > MAX_RESUMEN_LENGTH;
                                        const expandido = Boolean(expandidas[notificacion.id]);
                                        return (
                                            <div
                                                key={notificacion.id}
                                                className={`notification-item ${!notificacion.leida ? 'unread' : 'read'}`}
                                                onClick={() => manejarClickNotificacion(notificacion)}
                                            >
                                                <div className="notification-content">
                                                    <div className="notification-header">
                                                        <i className={`notification-icon ${obtenerIconoNotificacion(notificacion.tipoNotificacion)}`}></i>
                                                        <span className="notification-title">
                                                            {notificacion.titulo}
                                                        </span>
                                                        {esLargo && (
                                                            <button
                                                                className="expand-btn"
                                                                onClick={e => { e.stopPropagation(); toggleExpand(notificacion.id); }}
                                                            >
                                                                <i className={`fas fa-chevron-${expandido ? 'up' : 'down'}`}></i>
                                                            </button>
                                                        )}
                                                        <button
                                                            className="delete-btn"
                                                            onClick={e => {
                                                                e.stopPropagation();
                                                                eliminarNotificacion(notificacion.id);
                                                            }}
                                                            data-testid={`delete-${notificacion.id}`}
                                                        >
                                                            <i className="fas fa-trash"></i>
                                                        </button>
                                                    </div>
                                                    <div style={{ position: "relative" }}>
                                                        <p className={`notification-text${expandido ? " expanded" : ""}`}>
                                                            {expandido
                                                                ? notificacion.resumen
                                                                : esLargo
                                                                    ? notificacion.resumen.slice(0, MAX_RESUMEN_LENGTH) + '...'
                                                                    : notificacion.resumen}
                                                        </p>
                                                    </div>
                                                    <span className="notification-time">
                                                        {formatearHora(notificacion.fechaHoraAlta)}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                {hayMas && (
                                    <div className="load-more-container">
                                        <button
                                            className="load-more-btn"
                                            onClick={cargarMas}
                                            disabled={cargando}
                                        >
                                            {cargando ? 'Cargando...' : 'Cargar más'}
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
export default DropdownNotificaciones;