import React from 'react'
import { FaStar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const ServiceCard = ({servicio}) => {
  const navigate = useNavigate();

  const handleVerDetalleClick = () => {
    navigate(`/buscar-servicios/ver-detalle-Servicio/${servicio.id}`, {
      state: { showDisponibilidad: true }
    });
  };

  return (
    <div className="cardServicio">
      <img src={servicio.imagen} alt="servicio" className="imagenServicio" />

      <div className="contenidoServicio">
        <h3 className="nombreServicio">
          {servicio.nombreServicio}
          <div className="contenedorEstrellas">
            <FaStar className="estrella" />
            <span>{servicio.estrellas}</span>
          </div>
        </h3>

        <span className="tipoServicio">{servicio.tipoServicio}</span>

        <p className="descripcionServicio">{servicio.descripcion}</p>

        <div className="accionesServicio">
          <button className="btnDetalle" onClick={handleVerDetalleClick}>
            Ver Detalle
          </button>
        </div>
      </div>
    </div>

  );
};

export default ServiceCard
