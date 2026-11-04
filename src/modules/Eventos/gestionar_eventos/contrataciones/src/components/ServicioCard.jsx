import { FaStar } from "react-icons/fa";
import FormularioResena from '../../../../../../common/layouts/FormularioResena.jsx';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from "react-router-dom"

const ServicioCard = ({ servicio, ResenaActiva,idEvento }) => {
  // Estado local para la reseña propia
  const [miResena, setMiResena] = useState(servicio ? servicio.miResena : null);
  const navigate = useNavigate();


  const handleChatClick = () => {
    if (servicio.estado !== "COMPLETO" && servicio.idChat) {
      navigate(`/chatear?id=${servicio.idChat}`);
    }
  };

  const getEstadoClass = (estado) => {
    if (!estado) return "";
    const e = estado.toUpperCase();
    if (e === "COMPLETO") return "pill-contratado"; 
    if (e === "EN_CHAT") return "pill-en-chat";    
    return ""; 
  };
  
    // Formatea el texto visible
  const formatearEstado = (estado) => {
    if (!estado) return "";
    const e = estado.toLowerCase().replace("_", " ");
    return e.charAt(0).toUpperCase() + e.slice(1);
  };

  return (
    <div className="servicio-container-horizontal">
      {/* Card del servicio */}
      <div className="servicio-card-1">
        <div className="servicio-row servicio-row-top">
          <h3 className="servicio-nombre" onClick={() => {navigate(`/buscar-servicios/ver-detalle-Servicio/${servicio.id}`)}}>{servicio.nombre}</h3>
          <div className="servicio-pills">
              {["COMPLETO", "EN_CHAT"].includes(servicio.estado?.toUpperCase()) && (
              <span className={`pill ${getEstadoClass(servicio.estado)}`}>
                {formatearEstado(servicio.estado)}
              </span>
            )}
            <span className="pill pill-categoria">{servicio.tipo}</span>
          </div>
          <div className="servicio-rating">
            <FaStar className="star-icon" />
            <span className="rating-score">{servicio.puntuacion}</span>
            <span className="rating-count">
              ({servicio.cantidadResenas} reseñas)
            </span>
          </div>
        </div>
        <p className="descripcion">{servicio.descripcion}</p>
        <div className="servicio-row info-row">
          <span>
            Proveedor: <span className="info-gray">{servicio.proveedor}</span>
          </span>
          <span>
            Contratado: <span className="info-gray">{servicio.fechaContratacion}</span>
          </span>
        </div>
        <div className="chat-y-precio-row"> 
          <button 
          className="btn-chat-prestador" 
          disabled={servicio.estado === "COMPLETO"}
          onClick={handleChatClick}
          >
            Ir a chat
          </button>
          <p className="precio">
            <strong>${servicio.precio}</strong>
          </p>
        </div>
      </div>

      {/* Formulario de reseña al lado */}
          {ResenaActiva && (
            <FormularioResena
              tipo={"Servicio"}
              id={servicio.id}
              idEvento={idEvento}
            />
            )}
    </div>
  );
};
export default ServicioCard;