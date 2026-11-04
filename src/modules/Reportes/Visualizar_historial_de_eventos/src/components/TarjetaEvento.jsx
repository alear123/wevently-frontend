import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapPin, faCalendar, faClock, faUsers, faBuilding, faHandshake } from "@fortawesome/free-solid-svg-icons";

export default function TarjetaEvento({ evento, onClick }) {
    const {
        nombreEvento,
        nombreLugar,
        descripcionEvento,
        fecha,
        horaInicio,
        horaFin,
        personas,
        totalGastado,
        estadoEvento,
        cantidadLugares,
        cantidadServicios
    } = evento;

    const formatearFecha = (fechaStr) => {
        if (!fechaStr) return '';
        const fecha = new Date(fechaStr);
        return fecha.toLocaleDateString('es-AR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatearHora = (horaStr) => {
        if (!horaStr) return '';
        return horaStr.substring(0, 5);
    };

    const formatearMonto = (monto) => {
        if (!monto && monto !== 0) return '$0,00';
        return `$${Number(monto).toLocaleString('es-AR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };

    const obtenerColorEstado = (estado) => {
        const estados = {
            'Pendiente': '#FFA500',
            'Realizado': '#28A745',
            'Cancelado': '#DC3545',
            'En progreso': '#17A2B8'
        };
        return estados[estado] || '#6C757D';
    };

    return (
        <div className="tarjeta-evento" onClick={onClick} style={{ cursor: 'pointer' }}>
            <div className="tarjeta-evento-header">
                <div className="evento-titulo-container">
                    <h4 className="evento-nombre">{nombreEvento}</h4>
                    <span 
                        className="evento-estado-badge"
                        style={{ backgroundColor: obtenerColorEstado(estadoEvento) }}
                    >
                        {estadoEvento}
                    </span>
                </div>
                <div className="evento-lugar">
                    <FontAwesomeIcon icon={faMapPin} style={{ marginRight: '6px' }} />
                    {nombreLugar}
                </div>
            </div>

            {descripcionEvento && (
                <p className="evento-descripcion">{descripcionEvento}</p>
            )}

            <div className="evento-detalles">
                <div className="evento-detalle-item">
                    <FontAwesomeIcon icon={faCalendar} className="detalle-icono" />
                    <div className="detalle-info">
                        <span className="detalle-label">Fecha</span>
                        <span className="detalle-valor">{formatearFecha(fecha)}</span>
                    </div>
                </div>

                <div className="evento-detalle-item">
                    <FontAwesomeIcon icon={faClock} className="detalle-icono" />
                    <div className="detalle-info">
                        <span className="detalle-label">Horario</span>
                        <span className="detalle-valor">
                            {formatearHora(horaInicio)} - {formatearHora(horaFin)}
                        </span>
                    </div>
                </div>

                <div className="evento-detalle-item">
                    <FontAwesomeIcon icon={faUsers} className="detalle-icono" />
                    <div className="detalle-info">
                        <span className="detalle-label">Asistentes</span>
                        <span className="detalle-valor">{personas} personas</span>
                    </div>
                </div>
            </div>

            <div className="evento-servicios">
                <div className="servicio-item">
                    <FontAwesomeIcon icon={faBuilding} className="servicio-icono" />
                    <span>{cantidadLugares} {cantidadLugares === 1 ? 'lugar' : 'lugares'}</span>
                </div>
                <div className="servicio-item">
                    <FontAwesomeIcon icon={faHandshake} className="servicio-icono" />
                    <span>{cantidadServicios} {cantidadServicios === 1 ? 'servicio' : 'servicios'}</span>
                </div>
            </div>

            <div className="evento-footer">
                <span className="evento-total-label">Total gastado</span>
                <span className="evento-total-monto">{formatearMonto(totalGastado)}</span>
            </div>
        </div>
    );
}