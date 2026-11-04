import { FaStar } from "react-icons/fa"
import "./abm-service-card.css"
import { useNavigate } from "react-router-dom";

const ABMServiceCard = ({ servicio, handleModificarServicio, handleBajaServicio }) => {
  const showDisponibilidad = false;
  
  const navigate = useNavigate();

  const handleOnNavigate = () =>{
    navigate(`/Inicio/mis-servicios/ver-detalle-Servicio/${servicio.id}`,
      {
      state: {
        showDisponibilidad: false
      }
    }
    );
  }

  const isActivo = !servicio.fechaBaja; // Si no tiene fecha de baja, está activo
  return (
    <div className="service-card">
      <div className="service-card-content">
        <div className="service-image-container">
          <img src={servicio.imagen || "/placeholder.svg"} alt="servicio" className="service-image" />
        </div>

        <div className="service-details">
          <div className="service-header">
            <h3 className="service-title">{servicio.nombreServicio}</h3>
            <div className="service-rating">
              <FaStar className="service-rating-icon" />
              <span className="service-rating-text">{servicio.estrellas}</span>
            </div>
          </div>

          <div className="service-type-container">
            <span className="service-type-badge">{servicio.tipoServicio}</span>
          </div>

          <p className="service-description">{servicio.descripcion}</p>

          <div className="service-actions">
            <button
              className="btnDetalleLugar"
              onClick= {handleOnNavigate }
              >
              Ver detalle
            </button>
            <button disabled = {!isActivo} className="btn-modificar" onClick={handleModificarServicio}>
              Modificar
            </button>
            <button
              className={isActivo ? "btn-eliminar" : "btn-habilitar"}
              onClick={handleBajaServicio}
            >
              {isActivo ? "Dar de baja" : "Habilitar"}
            </button>
            
          </div>
        </div>
      </div>
    </div>
  )
}

export default ABMServiceCard
