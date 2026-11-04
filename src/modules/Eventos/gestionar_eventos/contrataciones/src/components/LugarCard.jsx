import React, { useState } from 'react';
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaUserFriends, FaCheckCircle, FaStar, FaRegCalendarCheck } from 'react-icons/fa';
import FormularioResena from '../../../../../../common/layouts/FormularioResena.jsx';
import { useNavigate } from 'react-router-dom';

const LugarCard = ({ lugar, ResenaActiva,idEvento }) => {
  const navigate = useNavigate();
  const [miResena, setMiResena] = useState(lugar ? lugar.miResena : null);

  const handleBuscarLugares = () => {
    console.log('Buscar lugares');
    navigate('/buscar-lugares');
  }

  if (!lugar) {
  return (
    <>
  <p>Aún no tienes un lugar contratado</p>
    <button 
      className="btn-lugar" 
      onClick={handleBuscarLugares}>
      Buscar lugares
    </button>
    </>
  )
  }

  const onGuardar = (nuevaResena) => {
    console.log('Reseña guardada:', nuevaResena);
    setMiResena(nuevaResena); 
  };

  console.log("id usado en en lugarcard:", lugar.id);

  const onEliminar = () => {
    console.log('Reseña eliminada');
    setMiResena(null); 
  };

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', fontWeight: 'bold', fontSize: '2rem', margin: '1.5rem' }}>
        <FaRegCalendarCheck style={{ marginRight: '0.5rem' }} />
        <span>Lugar contratado</span>
      </div>
      <div className="lugar-container">
        <h2 className="titulo-lugar izquierda" onClick={() => {navigate(`/buscar-lugares/ver-detalle-lugar/${lugar.id}`)}}>{lugar.nombre}</h2>

        <div className="imagenes-y-info">
          <div className="galeria">
            {lugar.imagenes && lugar.imagenes.length > 0 ? (
              <img
                src={lugar.imagenes[0]} 
                alt={`Imagen principal del lugar`}
                className="lugar-img"
              />
            ) : (
              <p>Sin imagen disponible</p>
            )}
          </div>

          <div className="info-y-resena" style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
            <div className="info-servicios">
              <div className='ubicacion-y-tipo' style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <p><FaMapMarkerAlt /> {lugar.direccion}</p>
                <span className="lugar-category-tag-1">{lugar.tipoLugar}</span>
                <span className="precio-lugar">${lugar.precio}</span>
              </div>
              <p className="descripcion">{lugar.descripcion}</p>
              <p className="puntuacion"><FaStar className="estrella" /> {lugar.puntuacion} ({lugar.resenas.length} reseñas)</p>
              <p><strong>Servicios incluidos:</strong></p>
              <ul>
                {lugar.serviciosIncluidos.map((serv, i) => (
                  <li key={i}><FaCheckCircle className="icono-verde" /> {serv}</li>
                ))}
              </ul>
              <p><FaPhoneAlt /> {lugar.contacto.telefono}</p>
              <p><FaEnvelope /> {lugar.contacto.email}</p>
              <p><FaUserFriends /> Capacidad: {lugar.capacidad} personas</p>
            </div>

            {ResenaActiva && (
            <FormularioResena
              tipo={"Lugar"}
              id={lugar.id}
              idEvento={idEvento}
            />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default LugarCard;