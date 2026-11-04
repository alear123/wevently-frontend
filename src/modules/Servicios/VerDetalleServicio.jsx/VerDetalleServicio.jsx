"use client"
import { useParams, useNavigate,useLocation } from "react-router-dom"
import { useRef, useState, useEffect } from "react"
import "./src/assets/VerDetalleServicio.css"
import Navbar_Organizador from "../../../common/layouts/Navbar_Organizador"
import Navbar_Administrador from '../../../common/layouts/Navbar_Administrador.jsx';
import Navbar_Prestador from '../../../common/layouts/Navbar_Prestador.jsx';
import Navbar_Propietario from '../../../common/layouts/Navbar_Propietario.jsx';
import Navbar from "../../../common/layouts/Navbar"
import CalendarPicker from "./src/components/CalendarPicker"
import Breadcrumbs from "../../../common/layouts/Breadcrumbs"
import Modal_Info from "../../../common/layouts/Modal_Info"
import FormularioNuevoEvento from "../../Eventos/gestionar_eventos/src/components/FormularioNuevoEvento"
import { getDetalleServicio} from "./src/api/VerDetalleServicioApi"
import { obtenerEventosDisponibles} from "./src/api/VerDetalleServicioApi"
import { iniciarChat} from "./src/api/VerDetalleServicioApi"
import Carousel from "../../../common/layouts/Carrusel"
import ModalAuth from "../../../common/layouts/ModalAuth"
import Modal_Error from "../../../common/layouts/ModalError";
import { getLoggedUser } from "../../../common/Utils"

const VerDetalleServicio = () => {
  // PRIMERO: Declarar todas las variables y hooks básicos
  const { idServicio } = useParams()
  const navigate = useNavigate()
  const selectRef = useRef(null)
  const location = useLocation();
  const showDisponibilidad = location.state?.showDisponibilidad ?? false;

  // Chequeo si hay token
  const hasToken = Boolean(localStorage.getItem("token"))
  const [mostrarModalAuth, setMostrarModalAuth] = useState(false);

  // SEGUNDO: Declarar todos los estados
  const [serviceData, setServiceData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [eventOptions, setEventOptions] = useState([
  ])
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [mostrarModalInfo, setMostrarModalInfo] = useState(false)
  const [mostrarModalSeleccionFecha, setMostrarModalSeleccionFecha] = useState(false)
  const [mostrarModalEvento, setMostrarModalEvento] = useState(false)
  const [mostrarModalError, setMostrarModalError] = useState(false);
  const [mensajeError, setMensajeError] = useState("");

  // tERCERO: useEffect después de que todas las variables estén declaradas
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDetalleServicio(idServicio)
        setServiceData(data)
        setLoading(false);
      } catch (err) {
          console.error("Error cargando servicio:", err);
          setMensajeError("No se pudo cargar la información del servicio.");
          setMostrarModalError(true);
      }
    }
    fetchData()
  }, [idServicio])



  // Early returns después de todos los hooks
  if (loading) return <p>Cargando...</p>
  if (!serviceData) return <p>Error cargando el servicio</p>


  //  Funciones del componente  
  const handleDateSelect = async (date) => {
    if (!hasToken) {
      setMostrarModalAuth(true);
      return;
    }
    setSelectedDate(date);
    console.log("Fecha seleccionada:", date);

    try{
    // Formatear la fecha a yyyy-MM-dd
    const formattedDate = new Date(date).toISOString().split("T")[0];

    // Llamada al backend
    const eventos = await obtenerEventosDisponibles(formattedDate,idServicio);

    // Mapear al formato que usa tu select
    const opcionesEventos = eventos.map((e) => ({
      id: e.id,
      name: e.nombre,
    }));

    opcionesEventos.push({ id: "crear", name: "➕ Crear nuevo evento" });

    setEventOptions(opcionesEventos);
  }catch(err){
      console.error("Error obteniendo eventos:", err);
      setMensajeError("Ocurrió un error al cargar los eventos disponibles.");
      setMostrarModalError(true);
  }
  };

  const handleSelectEvent = (event) => {
  if (!hasToken) {
    setMostrarModalAuth(true);
    return;
  }
  const selectedId = event.target.value;
  
  // IMPORTANTE: declarar esto siempre
  const selectedOption = eventOptions.find((opt) => String(opt.id) === selectedId);

  if (!selectedDate) {
    setMostrarModalInfo(true);
    return;
  }

  if (selectedId === "crear") {
    setMostrarModalEvento(true);
  } else if (selectedOption) {
    setSelectedEvent({ id: selectedOption.id, name: selectedOption.name });
    console.log("Evento seleccionado:", selectedOption.name);
  }
};


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
      const chatId = await iniciarChat({ idServicio, idEvento: selectedEvent.id, fechaReserva: selectedDate });
      if (chatId) navigate(`/chatear?id=${chatId}`);
    }catch(err){
      console.error("Error iniciando chat:", err);
      setMensajeError("Ocurrió un error al iniciar el chat. Intentalo nuevamente.");
      setMostrarModalError(true);
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

  return (
    <div className="service-detail-container">
      {localStorage.getItem("token")
        ? (getLoggedUser().rol == 'Admin' ? <Navbar_Administrador/> : (getLoggedUser().rol == 'Prestador' ? <Navbar_Prestador/> : (getLoggedUser().rol == 'Propietario' ? <Navbar_Propietario/> : <Navbar_Organizador/>)))
        : (<Navbar />
        )}
      <div className="breadcrumbs">
        <Breadcrumbs />
      </div>
      <div className="main-content">
        <div className="left-content">
          <div className="service-header">
            <h1 className="service-title-1"> {serviceData.nombre}</h1>
          </div>

          <Carousel images={serviceData.imagenes} height={300} />
          <div className="service-info">
            <div className="service-meta">
              <span className="coverage-tag">{serviceData.tipoServicio}</span>
              <div className="rating">
                <span className="star">⭐</span>
                <span className="rating-value">{serviceData.rating.toFixed(1)}</span>
                <span className="review-count">({serviceData.countReviews} reseñas)</span>
              </div>
            </div>

            <p className="service-description">{serviceData.descripcion}</p>

            <div className="service-details">
              <div className="detail-item">
                <span className="detail-label">Proveedor:</span>
                <span className="detail-value">{serviceData.prestador}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Duración:</span>
                <span className="detail-value">A definir</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Provincia de cobertura:</span>
                <span className="coverage-tag">{serviceData.provincia}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Áreas de cobertura:</span>
                <div className="tags-container">
                  {serviceData.localidades?.map((loc, index) => (
                    <span key={index} className="coverage-tag">{loc}</span>
                  ))}
                </div>
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
                reservedDates={serviceData.fechasReservadas.map((f) => new Date(f))}
                disabled={!hasToken}
              />
            </div>
            <div className="action-buttons">
              <div onMouseDown={handleSelectClick}>
                <select
                  className="event-select"
                  value={selectedEvent?.id || ""}
                  onChange={handleSelectEvent}
                >
                  <option value="" disabled hidden>
                    Asignar evento
                  </option>
                  {eventOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name}
                    </option>
                  ))}
                </select>
              </div>
              <button className="chat-btn" onClick={handleChatClick}>
                Iniciar chat
              </button>
            </div>
          </div>)}

          <div className="reviews-section">
            <h3>Reseñas de otros usuarios</h3>
            <div className="reviews-list">
              {serviceData.reseñas.map((review) => (
                <div key={review.id} className="review-item">
                  <div className="review-header">
                    <div className="review-avatar"></div>
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
        mensaje="Seleccioná una fecha y un evento antes de iniciar el chat."
        mostrar={mostrarModalInfo}
        onEntendido={() => setMostrarModalInfo(false)}
      />

      <Modal_Info
        titulo="Seleccioná una fecha"
        mensaje="Antes de asignar un evento, tenés que elegir una fecha en el calendario."
        mostrar={mostrarModalSeleccionFecha}
        onEntendido={() => setMostrarModalSeleccionFecha(false)}
      />
      <FormularioNuevoEvento
        visible={mostrarModalEvento}
        fecha={selectedDate}
        onGuardar={(nuevoEvento) => {


          // Actualizamos el estado selectedEvent con el ID real
          setSelectedEvent({ id: nuevoEvento.id, name: nuevoEvento.nombre });

          // Actualizamos el select de eventos para que incluya este evento
          setEventOptions((prev) => [...prev, { id: nuevoEvento.id, name: nuevoEvento.nombre }]);

          setMostrarModalEvento(false);
        }}
        onCancelar={() => {
          setMostrarModalEvento(false);
          setSelectedEvent(null); // Resetear para que el select pueda disparar onChange otra vez
        }}

      />
      <ModalAuth
        mostrar={mostrarModalAuth}
        onCerrar={() => setMostrarModalAuth(false)}
      />
      <Modal_Error
        titulo="Error"
        mensaje={mensajeError}
        mostrar={mostrarModalError}
        onCerrar={() => setMostrarModalError(false)}
      />
    </div>
  )
}

export default VerDetalleServicio
