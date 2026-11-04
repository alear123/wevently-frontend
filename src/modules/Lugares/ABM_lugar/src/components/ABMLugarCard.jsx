import React from "react"
import { FaStar, FaMapMarkerAlt, FaUsers } from "react-icons/fa"
import "./abm-lugar-card.css"
import { useNavigate } from "react-router-dom"
const ABMLugarCard = ({ lugar, handleModificarLugar, handleBajaLugar }) => {
  const isActivo = !lugar.fechaBaja; // Si no tiene fecha de baja, está activo
  
  
  const navigate = useNavigate();
  
  const handleOnNavigate = () =>{
    navigate(`/Inicio/mis-lugares/ver-detalle-lugar/${lugar.id}`, {
      state: {
        showDisponibilidad: false
      }
    });
  }
  return (
    <div className="lugar-card1">
      <div className="lugar-card-content">
        <div className="lugar-card-image-container">
          <img
            src={lugar.imagen || "/placeholder.svg"}
            alt={lugar.nombreLugar}
            className="lugar-card-image"
          />
        </div>

        <div className="lugar-details">
          {/* Header con nombre y estrellas */}
          <div className="lugar-header">
            <h3 className="lugar-card-title">{lugar.nombreLugar}</h3>
            <div className="lugar-rating">
              <FaStar className="lugar-rating-icon" />
              <span className="lugar-rating-text">{lugar.estrellas}</span>
            </div>
          </div>

          {/* Dirección */}
          <p className="lugar-direccion">
            <FaMapMarkerAlt className="lugar-icono" />
            {lugar.direccion + ", " + lugar.localidad}
          </p>

          {/* Tipo de lugar */}
          <div className="lugar-type-container">
            <span className="lugar-type-badge">
              {lugar.tipoLugar}
            </span>
          </div>

          {/* Capacidad */}
          <p className="lugar-capacidad">
            <FaUsers className="lugar-icono" /> {lugar.capacidad} personas
          </p>

          {/* Precio */}
          <p className="lugar-precio">
            <strong>$ {lugar.precioLugar ?? 0} / día</strong>
          </p>

          {/* Botones de acción */}
          <div className="lugar-actions">
            <button
              className="btnDetalleLugar"
              onClick= {handleOnNavigate }
              >
              Ver detalle
            </button>
            <button disabled = {!isActivo} className="btn-modificar" onClick={handleModificarLugar}>
              Modificar
            </button>
            <button className={isActivo ? "btn-eliminar" : "btn-habilitar"} onClick={handleBajaLugar}>
              {isActivo ? "Dar de baja" : "Habilitar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ABMLugarCard
