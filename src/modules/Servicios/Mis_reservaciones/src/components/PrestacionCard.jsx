
import { FaCamera, FaCalendarAlt } from 'react-icons/fa';
import { FaTools } from 'react-icons/fa';
import { FaRegCalendarCheck } from 'react-icons/fa';
import lugarImg from '../../../../Eventos/gestionar_eventos/src/assets/evento_default.jpeg';
import {useNavigate} from "react-router-dom"
const PrestacionCard = ({ reserva }) => {
  if (!reserva) return null;

  const colorEstado = {
    EN_CHAT: '#2f3fe0',
    COMPLETO: '#28a745',
    CANCELADA: '#dc3545'
  };
  const navigate = useNavigate();
  const handleChatClick = () => {
    if (reserva.estadoReserva !== "COMPLETO" && reserva.idChat) {
      navigate(`/chatear?id=${reserva.idChat}`);
    }
  };

  return (
    <div className="reservacion-card1">
  <div className="reservacion-card-content">
    {/* Imagen */}
    <div className="reservacion-card-image-container">
      <img
        src={reserva.imagen || lugarImg}
        alt={reserva.nombreEvento || 'Evento'}
        className="reservacion-card-image"
      />
    </div>

    {/* Detalles */}
    <div className="reservacion-details">
      {/* Encabezado con título y estado */}
      <div className="reservacion-header">
        <h3 className="reservacion-card-title">{reserva.nombreEvento}</h3>
        <span
          className="reservacion-estado-badge"
          style={{ color: colorEstado[reserva.estadoReserva] || '#000' }}
        >
          {reserva.estadoReserva}
        </span>
      </div>

      {/* Fecha */}
      {reserva.fechaReserva && (
        <p className="reservacion-fecha">
          <FaCalendarAlt className="reservacion-icono" />{' '}
          {new Date(reserva.fechaReserva).toLocaleDateString('es-AR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      )}

      {/* Servicio */}
      <p className="reservacion-tipo-evento">
        <FaCamera className="reservacion-icono" /> {reserva.nombreServicio}
      </p>

      {/* Tipo de servicio */}
      <p className="reservacion-tipo-evento">
        <FaTools className="reservacion-icono" /> {reserva.nombreTipoServicio}
      </p>

      {/* Tipo de evento */}
      <p className="reservacion-tipo-evento">
        <FaRegCalendarCheck className="reservacion-icono" /> {reserva.nombreTipoEvento}
      </p>

      {/* Footer con chat y precio */}
      <div className="reservacion-footer">
        <button
          className="btn-chat-prestador"
          disabled={
            reserva.estadoReserva === 'COMPLETO' ||
            reserva.estadoReserva === 'CANCELADA' ||
            !reserva.idChat
          }
          onClick={handleChatClick}
        >
          Ir a chat
        </button>

        <p className="reservacion-precio">
          <strong>${reserva.precioReserva?.toFixed(2) ?? 0}</strong>
        </p>
      </div>
    </div>
  </div>
</div>
  );
};

export default PrestacionCard;
