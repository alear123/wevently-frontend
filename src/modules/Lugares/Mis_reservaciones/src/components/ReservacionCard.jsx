import React from 'react';
import '../assets/ReservacionCard.css';
import { FaMapMarkerAlt, FaCalendarAlt, FaUsers } from 'react-icons/fa';
import { FaLandmark } from 'react-icons/fa';
import { FaRegCalendarCheck } from 'react-icons/fa';
import lugarImg from '../../../../Eventos/gestionar_eventos/src/assets/evento_default.jpeg';

const ReservacionCard = ({ reserva }) => {
  if (!reserva) return null;

  const colorEstado = {
    PARCIAL: '#2f3fe0',
    COMPLETO: '#28a745',
    CANCELADA: '#dc3545'
  };

  return (
    <div className="reservacion-card1">
      <div className="reservacion-card-content">
        <div className="reservacion-card-image-container">
          <img
            src={reserva.imagen || lugarImg}
            alt={reserva.nombreEvento || 'Evento'}
            className="reservacion-card-image"
          />
        </div>

        <div className="reservacion-details">
          {/* Header con nombre del evento y estado */}
          <div className="reservacion-header">
            <h3 className="reservacion-card-title">{reserva.nombreEvento}</h3>
            <span
              className="reservacion-estado-badge"
              style={{
                color: colorEstado[reserva.estadoReserva] || '#000',
              }}
            >
              {reserva.estadoReserva}
            </span>
          </div>

          {/* Fecha */}
          {reserva.fechaReserva && (
            <p className="reservacion-fecha">
              <FaCalendarAlt className="reservacion-icono" />{' '}
              {reserva.fechaReserva.toLocaleDateString('es-AR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          )}

          {/* Lugar */}
          <p className="reservacion-lugar">
            <FaMapMarkerAlt className="reservacion-icono" /> {reserva.nombreLugar}
          </p>

          {/* Tipo lugar */}
          <div className="reservacion-lugar">
              <FaLandmark className="reservaciones-lugar-icono" />{reserva.nombreTipoLugar}
          </div>

          {/* Tipo evento */}
          <p className="reservacion-tipo-evento">
            <FaRegCalendarCheck className="reservacion-icono" />{' '}
            {reserva.nombreTipoEvento}
          </p>

          {/* Capacidad */}
          <p className="reservacion-capacidad">
            <FaUsers className="reservacion-icono" /> {reserva.capacidad} personas
          </p>

          {/* Precio */}
          <p className="reservacion-precio">
            <strong>$ {reserva.precioReserva?.toFixed(2) ?? 0}</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReservacionCard;
