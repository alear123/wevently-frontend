import React, { useState,useEffect } from 'react';
import EventoCard from './src/components/EventoCard';
import FiltroDesplegable from '../../../common/components/FiltroDesplegable.jsx';
import ModalConfirmarEliminar from '../../../common/layouts/ModalConfirmarEliminar.jsx';
import FiltroFecha from '../../../common/components/FiltroFecha.jsx';
import Buscador from '../../../common/components/Buscador.jsx';
import Pagination from '../../../common/layouts/Pagination.jsx';
import './src/assets/gestionar_eventos.css';
import Navbar_Organizador from '../../../common/layouts/Navbar_Organizador.jsx';
import FormularioNuevoEvento from './src/components/FormularioNuevoEvento.jsx';
import FormularioEditarEvento from './src/components/FormularioEditarEvento.jsx';
import SuccessAlert from '../../../common/layouts/SuccessAlert.jsx';
import { getMisEventos,cancelarEvento } from './src/api/misEventosApi.js';
import defaultImage from './src/assets/evento_default.jpeg';
import Modal_Error from '../../../common/layouts/ModalError.jsx';
 


  const gestionar_eventos = () => {
  // Estados
  const [filtro, setFiltro] = useState(''); // Texto del buscador
  const [paginaActual, setPaginaActual] = useState(1); // Página actual para paginación
  const [cantidadMostrar, setCantidadMostrar] = useState(10); // Cantidad de eventos por página
  const [mostrarError, setMostrarError] = useState(false);
  const [mensajeError, setMensajeError] = useState('');

  const [mostrarFiltros, setMostrarFiltros] = useState(false); // Mostrar u ocultar filtros
  const [estadoSeleccionado, setEstadoSeleccionado] = useState(''); // Filtro por estado del evento
  const [tipoSeleccionado, setTipoSeleccionado] = useState(''); // Filtro por tipo

  const [mostrarFormulario, setMostrarFormulario] = useState(false); // Mostrar u ocultar formulario para nuevo evento
  const [eventos, setEventos] = useState([]); // Eventos a mostrar en la lista
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [mostrarFormularioEdicion, setMostrarFormularioEdicion] = useState(false); // Mostrar u ocultar formulario de edición
  const [eventoAEditar, setEventoAEditar] = useState(null); // Evento que se está editando

  const [fechaDesde, setFechaDesde] = useState(''); // Fecha desde para el filtro de fecha
  const [fechaHasta, setFechaHasta] = useState(''); // Fecha hasta para el filtro de fecha

  const [mostrarModalCancelar, setMostrarModalCancelar] = useState(false); // Mostrar u ocultar modal de confirmación de cancelación
  const [eventoACancelar, setEventoACancelar] = useState(null); // Evento que se está cancelando

  const [mostrarAlerta, setMostrarAlerta] = useState(false); // Mostrar u ocultar alerta de éxito
  const [mensajeAlerta, setMensajeAlerta] = useState(''); // Mensaje de la alerta de éxito

  
  const handleCancelarClick = (evento) => {
    setEventoACancelar(evento);  // guardamos el evento que queremos cancelar
    setMostrarModalCancelar(true); // mostramos el modal
  };


  const mostrarModalError = (mensaje) => {
    setMensajeError(mensaje);
    setMostrarError(true);
  };
  
  // Antes del useEffect:
  const fetchEventos = async () => {
    try {
      const data = await getMisEventos();
      setEventos(data);
    } catch (err) {
      console.error("Error cargando eventos:", err);
      mostrarModalError("No se pudieron cargar los eventos. " + (err.message || ""));
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchEventos();
  }, []);

  // Función para cerrar la alerta de éxito
  const mostrarNotificacion = (mensaje) => {
    setMensajeAlerta(mensaje);
    setMostrarAlerta(true);
  };

  // Función para agregar nuevo evento 
  const agregarEvento = async (nuevoEvento) => {
    try {
      // acá podrías llamar al backend si lo tuvieras
      setMostrarFormulario(false);
      mostrarNotificacion('¡Evento creado con éxito!');
      await fetchEventos(); // 🔄 Recargar lista desde el backend
    } catch (error) {
      mostrarModalError("Error al crear el evento.");
    }
  };


  // Función para manejar la edición
  const editarEvento = async (eventoActualizado) => {
    try {
      setMostrarFormularioEdicion(false);
      mostrarNotificacion('¡Evento editado correctamente!');
      await fetchEventos(); // 🔄 Refrescar lista
    } catch (error) {
      mostrarModalError("Error al editar el evento.");
    }
  };

  const confirmarCancelacion = async () => {
    if (!eventoACancelar) return;
    try {
      await cancelarEvento(eventoACancelar.id);
      mostrarNotificacion('¡Evento cancelado exitosamente!');
      await fetchEventos(); // 🔄 Refrescar lista
    } catch (error) {
      console.error('Error al cancelar evento:', error);
      mostrarNotificacion('Error al cancelar el evento: ' + error.message);
    } finally {
      setMostrarModalCancelar(false);
      setEventoACancelar(null);
    }
  };

  // Función para abrir el formulario de edición
  const handleEditarClick = (evento) => {
    setEventoAEditar(evento);
    setMostrarFormularioEdicion(true);
  };
  
  // Renderizar EventoCard con la función de edición
  const renderEventoCard = (evento) => (
    <EventoCard 
      key={evento.id} 
      evento={evento}
      onEditarClick={() => handleEditarClick(evento)}
      onCancelarClick={() => handleCancelarClick(evento)}
    />
  );

  // Lógica de filtrado
  const eventosFiltrados = eventos.filter((evento) => {
    const texto = filtro.toLowerCase();

    const coincideTexto =
      evento.nombre.toLowerCase().includes(texto) 

    const coincideEstado =
      estadoSeleccionado === '' || evento.estado === estadoSeleccionado;

    const coincideTipo =
      tipoSeleccionado === '' || evento.tipo === tipoSeleccionado;

    const fechaEvento = new Date(evento.fecha); // Asumiendo que evento.fecha es tipo ISO string

    const dentroDeRango =
      (!fechaDesde || new Date(fechaDesde) <= fechaEvento) &&
      (!fechaHasta || fechaEvento <= new Date(fechaHasta));

    return coincideTexto && coincideEstado && coincideTipo && dentroDeRango;
  });

    // Lógica de paginación

    const totalItems = eventosFiltrados.length; // Total de eventos luego del filtrado
    const totalPaginas = Math.ceil(totalItems / cantidadMostrar); // Total de páginas
    const inicio = (paginaActual - 1) * cantidadMostrar; // Primer índice de la página actual
    const fin = inicio + cantidadMostrar; // Último índice
    const eventosPaginados = eventosFiltrados.slice(inicio, fin); // Eventos a mostrar en la página actual

  return (
    <>
    <Navbar_Organizador />
    <div className='contenedor-1'>
        <div className="contenedor-eventos">
          {mostrarFormulario ? (
            <FormularioNuevoEvento 
              onGuardar={agregarEvento} 
              onCancelar={() => setMostrarFormulario(false)} 
              visible={mostrarFormulario}
            />
          ) : mostrarFormularioEdicion ? (
          <FormularioEditarEvento
            evento={eventoAEditar}
            onGuardar={editarEvento}
            onCancelar={() => setMostrarFormularioEdicion(false)}
            max={eventoAEditar?.max}
          />) : (
            <>
              <h2 className="titulo-eventos">Mis Eventos</h2>
                {/* Barra de búsqueda y botones */}
                <div className="barra-controles">
                  <div className="grupo-busqueda">
                    <div className="buscador-contenedor-1">
                      <Buscador
                        placeholder="Buscar por nombre del evento"
                        value={filtro}
                        onChange={setFiltro}
                        filtrarMientrasEscribes={true}
                      />
                    </div>
                    <button
                      className="btn-filtros-1"
                      onClick={() => setMostrarFiltros(!mostrarFiltros)}
                    >
                      Filtros
                    </button>
                  </div>
                  <button 
                    className="btn-nuevo" 
                    onClick={() => setMostrarFormulario(true)}>
                    Nuevo evento
                  </button>
                  <SuccessAlert 
                    mensaje={mensajeAlerta} 
                    mostrar={mostrarAlerta} 
                    onClose={() => setMostrarAlerta(false)} 
                  />
        </div>
        </>)}

        {/* ⬇️ Filtros visibles solo cuando mostrarFiltros = true */}
        {mostrarFiltros && (
          <div className="filtros-panel-1">
            <div className="filtro-desplegable">
              <FiltroDesplegable
                label="Estado del evento"
                opciones={['Realizado', 'Pendiente', 'Cancelado']}
                valorSeleccionado={estadoSeleccionado}
                onCambio={setEstadoSeleccionado}
              />
            </div>
            <div className="filtro-desplegable">
              <FiltroDesplegable
                label="Tipo de evento"
                opciones={['Casamiento', 'Conferencia', 'Fiesta', 'Taller']}
                valorSeleccionado={tipoSeleccionado}
                onCambio={setTipoSeleccionado}
              />
            </div>
            <div className="filtro-fecha">
              <FiltroFecha
                fechaDesde={fechaDesde}
                setFechaDesde={setFechaDesde}
                fechaHasta={fechaHasta}
                setFechaHasta={setFechaHasta}
              /> 
            </div>
          </div>
        )}
        {/* 📋 Lista de eventos */}
        <div className="eventos-lista">
          {eventosPaginados.length > 0 ? (
            eventosPaginados.map(renderEventoCard) 
          ) : (
            <p className="mensaje-vacio">No se encontraron eventos.</p>
          )}
        </div>

        {/* 📌 Paginación */}
        <Pagination
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          setPaginaActual={setPaginaActual}
          inicio={inicio}
          fin={fin}
          totalItems={totalItems}
          cantidadMostrar={cantidadMostrar}
          setCantidadMostrar={setCantidadMostrar}
        />
        {mostrarModalCancelar && eventoACancelar && (
          <ModalConfirmarEliminar
            titulo="¿Deseás cancelar este evento?"
            mensaje={`Evento: "${eventoACancelar.nombre}".
                    Al dar de baja este evento, todas las reservas asociadas a este evento se darán de baja y perderá el dinero. `}
            mostrar={mostrarModalCancelar}
            onCancelar={() => setMostrarModalCancelar(false)}
            onConfirmar={confirmarCancelacion}
            accion="Dar de baja"
          />
        )}
        <Modal_Error
          titulo="Ocurrió un error"
          mensaje={mensajeError}
          mostrar={mostrarError}
          onCerrar={() => setMostrarError(false)}
        />
        </div>  
    </div>
    </>
  );
};
export default gestionar_eventos;
