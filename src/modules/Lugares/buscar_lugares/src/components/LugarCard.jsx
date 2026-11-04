import React from 'react'
import { FaStar, FaMapMarkerAlt, FaUsers } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../assets/buscar_lugares.css'

const LugarCard = ({ lugar }) => {
  const navigate = useNavigate();

  const handleVerDetalleClick = () => {
    navigate(`/buscar-lugares/ver-detalle-lugar/${lugar.id}`, {
      state: { showDisponibilidad: true }
    });
  };

  return (
    <div className="buscar-lugar-card">
      <img src={lugar.imagen} alt={lugar.nombreLugar} className="lugar-imagen" />

      <div className="lugar-contenido">
        <h3 className="lugar-nombre">
          {lugar.nombreLugar}
          <div className="lugar-contenedor-estrellas">
            <FaStar className="lugar-estrella" />
            <span>{lugar.estrellas}</span>
          </div>
        </h3>

        <p className="lugar-direccion">
          <FaMapMarkerAlt className="lugar-icono-direccion" />
          {lugar.direccion + ", " + lugar.localidad}
        </p>

        <span className="lugar-tipo">{lugar.tipoLugar}</span>

        <p className="lugar-cantidad-personas">
          <FaUsers className="lugar-icono-personas" />
          {lugar.capacidad}
        </p>

        <p className="lugar-precio">
          <strong>{"$ " + lugar.precioLugar + "/día"}</strong>
        </p>

        <div className="lugar-acciones">
          <button className="lugar-btn-detalle" onClick={handleVerDetalleClick}>
            Ver Detalle
          </button>
        </div>
      </div>
    </div>
  );
};

export default LugarCard;
