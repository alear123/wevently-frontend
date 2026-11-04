  import React from "react"
  import { useParams,useNavigate,useLocation } from "react-router-dom"
  import { useRef, useState } from "react"
  import "./src/assets/VerDetalleLugar.css"
  import Navbar_Organizador from "../../../common/layouts/Navbar_Organizador"
  import Navbar_Administrador from '../../../common/layouts/Navbar_Administrador.jsx';
  import Navbar_Prestador from '../../../common/layouts/Navbar_Prestador.jsx';
  import Navbar_Propietario from '../../../common/layouts/Navbar_Propietario.jsx';
  import Navbar from "../../../common/layouts/Navbar"
  import Header from "../../../common/layouts/Navbar_Organizador"
  import CalendarPicker from "../../Servicios/VerDetalleServicio.jsx/src/components/CalendarPicker"
  import Breadcrumbs from "../../../common/layouts/Breadcrumbs"
  import Modal_Info from "../../../common/layouts/Modal_Info"
  import FormularioNuevoEvento from "../../Eventos/gestionar_eventos/src/components/FormularioNuevoEvento"
  import { FaCheckCircle } from "react-icons/fa";
  import { useEffect } from "react";
  import { getDetalleLugar } from "./src/api/VerDetalleLugarApi"
  import { getEventosPosibles } from "./src/api/VerDetalleLugarApi"
  import { iniciarReserva } from "./src/api/VerDetalleLugarApi"
  import Carousel from "../../../common/layouts/Carrusel"
  import ModalAuth from "../../../common/layouts/ModalAuth"
  import Modal_Error from "../../../common/layouts/ModalError"
  import { getLoggedUser } from "../../../common/Utils.js"

  const VerDetalleLugar = () => {
    const { idLugar } = useParams(); // se tiene que obtener el ID de la URL
    const [lugarData, setLugarData] = useState(null);
    const navigate = useNavigate()
    const selectRef = useRef(null)
    const location = useLocation();
    const showDisponibilidad = location.state?.showDisponibilidad ?? false;

    // Chequeo si hay token
    const hasToken = Boolean(localStorage.getItem("token"))
    const [mostrarModalAuth, setMostrarModalAuth] = useState(false);
    

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null)
    const [selectedEvent, setSelectedEvent] = useState(null)
    const [mostrarModalInfo, setMostrarModalInfo] = useState(false)
    const [mostrarModalSeleccionFecha, setMostrarModalSeleccionFecha] = useState(false)
    const [mostrarModalEvento, setMostrarModalEvento] = useState(false)
    const [eventosDisponibles, setEventosDisponibles] = useState([])
    const [cargandoEventos, setCargandoEventos] = useState(false)

    const [mostrarError, setMostrarError] = useState(false);
    const [mensajeError, setMensajeError] = useState('');

    const mostrarModalError = (mensaje) => {
      setMensajeError(mensaje);
      setMostrarError(true);
    };
        

    

    useEffect(() => {
      const fetchLugarData = async () => {
        try {
          console.log("Iniciando carga del lugar con ID:", idLugar);
          setLoading(true);
          const data = await getDetalleLugar(idLugar);
          console.log("Datos recibidos:", data);
          setLugarData(data);
        } catch (err) {
          setError(err.message);
          console.error("Error fetching lugar data:", err);
          mostrarModalError("No se pudieron cargar los datos del lugar. " + (err.message || ""));
        } finally {
          console.log("Finalizando carga");
          setLoading(false);
        }
      };

      if (idLugar) {
        fetchLugarData();
      }
    }, [idLugar]);

    const handleDateSelect = async (date) => {
      if (!hasToken) {
        setMostrarModalAuth(true);
        return;
      }
      setSelectedDate(date);
      console.log("Fecha seleccionada:", date);

      try {
        setCargandoEventos(true);
        setEventosDisponibles([]);

        const eventos = await getEventosPosibles(idLugar, date);

        // Mapeo para asegurar formato { id, name }
        const mappedEventos = eventos.map((e) => ({
          id: e.id,
          name: e.nombre,
        }));

        setEventosDisponibles(mappedEventos);
      } catch (error) {
        console.error("❌ Error cargando eventos posibles:", error);
        setEventosDisponibles([]);
        mostrarModalError("Error al cargar los eventos disponibles. " + (error.message || ""));
      } finally {
        setCargandoEventos(false);
      }
    };

    const handleSelectEvent = (event) => {
        if (!hasToken) {
        setMostrarModalAuth(true);
        return;
      }
      const selectedId = event.target.value
      const selectedOption = eventosDisponibles.find((opt) => String(opt.id) === selectedId);

      if (!selectedDate) {
        setMostrarModalInfo(true)
        return
      }

    if (selectedId === "crear") {
      setMostrarModalEvento(true);
    } else if (selectedOption) {
      setSelectedEvent({ id: selectedOption.id, name: selectedOption.name });
      console.log("Evento seleccionado:", selectedOption.name);
    }
  }

    const handleChatClick = async () => {
      if (!hasToken) {
        setMostrarModalAuth(true);
        return;
      }

      if (!selectedDate || !selectedEvent) {
        setMostrarModalInfo(true)
        return
      }
      try{
          const ReservaId = await iniciarReserva({ idLugar, idEvento: selectedEvent.id, fechaReserva: selectedDate });
          if (ReservaId) navigate(`/Reservar?id=${ReservaId}`);
      }catch (error) {
          console.error("❌ Error al iniciar reserva:", error);
          mostrarModalError("No se pudo iniciar la reserva. " + (error.message || ""));
        }
    }

    const handleSelectClick = (e) => {
       if (!hasToken) {
        e.preventDefault()
        setMostrarModalAuth(true)
        return
      }
      if (!selectedDate) {
        e.preventDefault()
        setMostrarModalSeleccionFecha(true)
      }
    }


    const mapLugarData = (data) => {
      const fechasReservadas = data.reservas 
        ? data.reservas.map(dateStr => new Date(dateStr))
        : [];
      return {
        idLugar: data.id,
        name: data.nombre,
        Ubicacion: data.direccion,
        provincia:data.provincia,
        localidad:data.localidad,
        tipoLugar: data.tipoLugar,
        rating: data.rating,
        countReviews: data.countReviews,
        description: data.descripcion,
        Propietario: data.propietario,
        Capacidad: data.capacidad,
        images: data.imagenes, // Placeholder por ahora
        TipoEventoSoportado: data.tiposEventosSoportados?.map(name => ({ name })) || [],
        TipoServicioSoportado: data.tiposServiciosSoportados?.map(name => ({ name })) || [],
        CaracteristicasLugar: data.caracteristicas?.map(name => ({ name })) || [],
        lugarPrecio: data.precioLugar || "$0",
        fechasReservadas: fechasReservadas || [],
        reseñas: data.reseñas || [],
      };
    };

    if (loading) {
      return <div className="loading">Cargando...</div>;
    }

    if (error) {
      return <div className="error">Error: {error}</div>;
    }

    if (!lugarData) {
      return <div className="error">Lugar no encontrado</div>;
    }

    const mappedLugarData = mapLugarData(lugarData);

    return (
      <div className="lugar-detail-container">
        {localStorage.getItem("token")
            ? (getLoggedUser().rol == 'Admin' ? <Navbar_Administrador/> : (getLoggedUser().rol == 'Prestador' ? <Navbar_Prestador/> : (getLoggedUser().rol == 'Propietario' ? <Navbar_Propietario/> : <Navbar_Organizador/>)))
            : (<Navbar />
            )}
        <div className="breadcrumbs">
          <Breadcrumbs/>
        </div>
        <div className="main-content">
          <div className="left-content">
            <div className="lugar-header">
              <h1 className="lugar-title"> {mappedLugarData.name}</h1>
            </div>
             <Carousel images={mappedLugarData.images} height={300} />

            <div className="lugar-info">
              <div className="lugar-meta">
                <div className="lugar-ubicacion-container">
                  <svg
                    className="location-icon"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle
                      cx="12"
                      cy="10"
                      r="3"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                    <p className="lugar-ubicacion">
                      {mappedLugarData.Ubicacion}, {mappedLugarData.localidad}, {mappedLugarData.provincia}
                    </p>
                </div>
                <span className="tipo-tag">{mappedLugarData.tipoLugar}</span>
                <span className="precio-lugar">${mappedLugarData.lugarPrecio}</span>
                <div className="rating">
                  <span className="star">⭐</span>
                  <span className="rating-value">{mappedLugarData.rating}</span>
                  <span className="review-count">({mappedLugarData.countReviews} reseñas)</span>
                </div>
              </div>

              <p className="lugar-description">{mappedLugarData.description}</p>

              <div className="lugar-details">
                <div className="detail-item">
                  <span className="detail-label">Propietario:</span>
                  <span className="detail-value">{mappedLugarData.Propietario}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Capacidad:</span>
                  <span className="detail-value">{mappedLugarData.Capacidad}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Tipos de Evento Soportados:</span>
                  <div className="tags-container">
                    {mappedLugarData.TipoEventoSoportado.map((tipo, index) => (
                      <span key={index} className="tipo-tag">
                        {tipo.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Tipos de Servicio Soportados:</span>
                  <div className="tags-container">
                    {mappedLugarData.TipoServicioSoportado.map((tipo, index) => (
                      <span key={index} className="tipo-tag">
                        {tipo.name}
                      </span>
                    ))}
                  </div>
                </div>  
                <div className="lugar-caracteristicas-der">
                    <span className="detail-label">Prestaciones ofrecidas:</span>
                    <ul className="caracteristicas-lista">
                      {mappedLugarData.CaracteristicasLugar.map((carac, index) => (
                        <li key={index} className="caracteristica-item">
                          <FaCheckCircle className="caracteristica-icono" />
                          <span>{carac.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="right-sidebar">
            {showDisponibilidad && (
            <div className="availability-section">
              <h3>Disponibilidad</h3>
              <div className="calendar-header">
                <CalendarPicker
                  selectedDate={selectedDate}
                  onSelect={handleDateSelect}
                  reservedDates={
                    mappedLugarData.fechasReservadas}
                />
              </div>
              <div className="action-buttons">
              <div onMouseDown={handleSelectClick}>
                <select
                  className="event-select"
                  value={selectedEvent?.id || ""}
                  onChange={handleSelectEvent}
                  disabled={cargandoEventos}
                >
                  <option value="" disabled hidden>
                    {cargandoEventos ? "Cargando eventos..." : "Asignar evento"}
                  </option>
                  {eventosDisponibles.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name}
                    </option>
                  ))}
                  <option value="crear">➕ Crear nuevo evento</option>
                </select>
              </div>
              <button className="iniciar-reserva-btn" onClick={handleChatClick}>
                Iniciar Reserva
              </button>
            </div>
          </div>)}

            <div className="reviews-section">
              <h3>Reseñas de otros usuarios</h3>
              <div className="reviews-list">
                {mappedLugarData.reseñas.map((review) => (
                  <div key={review.id} className="review-item">
                    <div className="review-header">
                      <div
                        className="review-avatar"
                        data-initials={review.usuario
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      ></div>
                      <div className="review-info">
                        <span className="review-user">{review.usuario}</span>
                        <div className="review-rating">
                          <span className="star">⭐</span>
                          <span>{review.rating}</span>
                        </div>
                      </div>
                    </div>
                    <p className="review-comment">{review.comentario}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Modal_Info
          titulo="Primero completá los datos"
          mensaje="Seleccioná una fecha y un evento antes de avanzar con la reserva"
          mostrar={mostrarModalInfo}
          onEntendido={() => setMostrarModalInfo(false)}
        />

        <Modal_Info
          titulo="Seleccioná una fecha"
          mensaje="Antes de asignar un evento, tenés que elegir una fecha en el calendario."
          mostrar={mostrarModalSeleccionFecha}
          onEntendido={() => setMostrarModalSeleccionFecha(false)}
        />
        <ModalAuth
        mostrar={mostrarModalAuth}
        onCerrar={() => setMostrarModalAuth(false)}
        />
        <FormularioNuevoEvento
          visible={mostrarModalEvento}
          fecha={selectedDate}
          tiposSoportados={mappedLugarData.TipoEventoSoportado}
          onGuardar={(nuevoEvento) => {


          // Actualizamos el estado selectedEvent con el ID real
          setSelectedEvent({ id: nuevoEvento.id, name: nuevoEvento.nombre });

          // Actualizamos el select de eventos para que incluya este evento
          setEventosDisponibles((prev) => [...prev, { id: nuevoEvento.id, name: nuevoEvento.nombre }]);

          setMostrarModalEvento(false);
        }}
        onCancelar={() => {
          setMostrarModalEvento(false);
          setSelectedEvent(null); // Resetear para que el select pueda disparar onChange otra vez
        }}
        max={mappedLugarData?.Capacidad}
        />
        <Modal_Error
          titulo="Ocurrió un error"
          mensaje={mensajeError}
          mostrar={mostrarError}
          onCerrar={() => setMostrarError(false)}
        />
      </div>
    )
  }

  export default VerDetalleLugar; 