import React from 'react';
import { useNavigate } from 'react-router-dom';

import defaultImage from '../assets/evento_default.jpeg';

const EventoCard = ({ evento, onEditarClick, onCancelarClick }) => {
  const navigate = useNavigate();

  const imagenEvento = evento.imagen ? evento.imagen : defaultImage;

  const handleContratarClick = () => {
    navigate(`/Inicio/mis-eventos/contrataciones/${evento.id}`,{ state: { evento } });
  };

  return (
    <div className="card-evento">
      <img src={imagenEvento} alt="evento" className="imagen-evento" />
      <div className="contenido-evento">
        <h3 className="titulo-evento">
          {evento.nombre}{' '}
          <span className={`estado-evento ${
            evento.estado === 'Realizado' 
              ? 'estado-realizado' 
              : evento.estado === 'Cancelado' 
                ? 'estado-cancelado' 
                : 'estado-pendiente'
          }`}>
            {evento.estado}
          </span>
        </h3>
        <p>{evento.fecha} - {evento.horaInicio} a {evento.horaFin}</p>
        <p>{evento.descripcion}</p>
        <p>{evento.nombre}</p>
        <p>Tipo: {evento.tipo}</p>
        <p>{evento.personas} personas</p>

        <div className="acciones-evento">
          <button 
            className="btn-contratar" 
            onClick={handleContratarClick}
            disabled={evento.estado === 'Cancelado'}>
                Contrataciones
            </button>
          <button 
            className="btn-modificar" 
            onClick={onEditarClick}
            disabled={evento.estado === 'Realizado' || evento.estado === 'Cancelado'}>
              Modificar
          </button>
          <button 
            className={`btn-cancelar ${
              evento.estado === 'Cancelado' ? 'btn-cancelar-rojo' : ''
            }`}
            disabled={evento.estado === 'Cancelado' || evento.estado === 'Realizado'}
            onClick={onCancelarClick}
          >
            Cancelar
          </button>          
        </div>
      </div>
    </div>
  );
};

export default EventoCard;
