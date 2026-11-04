import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {editarEvento} from '../api/misEventosApi'
import Modal_Error from '../../../../../common/layouts/ModalError';

const FormularioEditarEvento = ({ evento, onGuardar, onCancelar,max }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    fecha: new Date(),
    horaInicio: '08:00',
    horaFin: '09:00',
    tipo: 'Casamiento',
    personas: 50
  });

   const horasDisponibles = Array.from({ length: 24 }, (_, i) => 
    `${i.toString().padStart(2, '0')}:00`
  );

  const [errores, setErrores] = useState({});
  const [mostrarErrores, setMostrarErrores] = useState(false);
  const [touched, setTouched] = useState({});
  const [guardando, setGuardando] = useState(false); // Estado para loading
  const [mostrarErrorModal, setMostrarErrorModal] = useState(false);
  const [mensajeError, setMensajeError] = useState('');

  // Cargar los datos del evento al montar el componente
  useEffect(() => {
    if (evento) {
      console.log('Evento a editar:', evento);
      
      // Función para extraer horas del formato "HH:MM - HH:MM" y convertir a formato backend
          const extraerHoras = (horaString) => {
      if (!horaString) return { inicio: '08:00', fin: '09:00' };

      const horas = horaString.split(' - ');

      // Nos aseguramos de que siempre quede "HH:00"
      const normalizar = (h) => {
        if (!h) return null;
        const [hh, mm] = h.split(':'); 
        return `${hh.padStart(2, '0')}:${mm || '00'}`;
      };

      const inicio = normalizar(horas[0]) || '08:00';
      const fin = normalizar(horas[1]) || '09:00';

      return { inicio, fin };
    };

      const { inicio, fin } = extraerHoras(evento.hora);

      setFormData({
        nombre: evento.nombre || '',
        descripcion: evento.descripcion || '',
        fecha: evento.fecha || '',
        horaInicio: inicio,
        horaFin: fin,
        tipo: evento.tipo || 'Casamiento',
        personas: evento.personas || 1
      });
    }
  }, [evento]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    const nuevoFormData = { ...formData, [name]: value };
    setFormData(nuevoFormData);
    setTouched((prev) => ({ ...prev, [name]: true }));
    validarFormulario(nuevoFormData);
  };

  const validarFormulario = (datos = formData) => {
    const nuevosErrores = {};
    
    if (formData.nombre.trim().length < 8 || formData.nombre.trim().length > 35) {
      nuevosErrores.nombre = 'El nombre debe tener entre 8 y 35 caracteres y no puede ser solo espacios';
    }

    if (formData.descripcion.trim().length < 15 || formData.descripcion.trim().length > 150) {
      nuevosErrores.descripcion = 'La descripción debe tener entre 15 y 150 caracteres y no puede ser solo espacios';
    }

    
    const horaInicioNum = parseInt(formData.horaInicio.split(':')[0]);
    const horaFinNum = parseInt(formData.horaFin.split(':')[0]);
    
    if (horaFinNum <= horaInicioNum) {
      nuevosErrores.horaFin = 'La hora de fin debe ser mayor a la hora de inicio';
    }

    const personas = parseInt(formData.personas);

    if (isNaN(personas) || formData.personas === '' || personas <= 0) {
      nuevosErrores.personas = 'Debe ingresar un número válido mayor a 0';
    } else if (personas > (max ?? 1000)) {
      nuevosErrores.personas = `No puede superar las ${max ?? 1000} personas permitidas`;
    }
        
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      setMostrarErrores(true);
      return;
    }

    setGuardando(true);

    try {
      // Preparar datos para el backend (usando el mismo DTO que crearEvento)
      const eventoParaBackend = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        fecha: "2024-12-15", // Fecha dummy ya que no se edita
        horaInicio: `${formData.horaInicio}:00`,
        horaFin: `${formData.horaFin}:00`,  
        personas: parseInt(formData.personas),
        idTipoEvento: 1 // ID dummy ya que no se edita el tipo
      };

      console.log('Enviando al backend para editar:', eventoParaBackend);
      console.log('ID del evento:', evento.id);

      // Llamar a la API
      const eventoEditado = await editarEvento(evento.id, eventoParaBackend);
      
      console.log('Evento editado exitosamente:', eventoEditado);

      // Formatear la respuesta para el frontend
      const eventoParaFrontend = {
        ...evento, // Mantener datos originales
        nombre: eventoEditado.nombre,
        descripcion: eventoEditado.descripcion,
        hora: `${formData.horaInicio.substring(0, 5)} - ${formData.horaFin.substring(0, 5)}`,
        personas: eventoEditado.personas
      };

      // Llamar al callback del componente padre
      onGuardar(eventoParaFrontend);
      setTouched({
        nombre: true,
        descripcion: true,
        horaInicio: true,
        horaFin: true,
        personas: true
      });

    } catch (error) {
      console.error('Error al editar el evento:', error);
      setMensajeError(error.message || 'Ocurrió un error al editar el evento.');
      setMostrarErrorModal(true);
    }finally {
      setGuardando(false);
    }
  };

  return (
    <div className="modal-formulario">
      <div className="contenedor-formulario">
        <h2>Editar Evento</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="campo-formulario">
            <label>Nombre del evento*</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: Casamiento de María y Juan"
              maxLength="35"
              disabled={guardando}
            />
            {touched.nombre && errores.nombre && (
              <span className="error">{errores.nombre}</span>
            )}
          </div>
          
          <div className="campo-formulario">
            <label>Descripción*</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Descripción detallada del evento..."
              maxLength="150"
              disabled={guardando}
            />
            {touched.descripcion && errores.descripcion && (
              <span className="error">{errores.descripcion}</span>
            )}
          </div>
          
          <div className="campo-formulario">
            <label>Fecha del evento</label>
            <input
              type="text"
              value={evento.fecha}
              readOnly
              className="campo-deshabilitado"
            />
          </div>
          
          <div className="grupo-horas">
            <div className="campo-formulario">
              <label>Hora de inicio*</label>
              <select
                name="horaInicio"
                value={formData.horaInicio}
                onChange={handleChange}
                disabled={guardando}
              >
                {horasDisponibles.map((hora) => (
                  <option key={`inicio-${hora}`} value={hora}>
                    {hora}
                  </option>
                ))}
              </select>
              {touched.horaInicio && errores.horaInicio && <span className="error">{errores.horaInicio}</span>}
            </div>
            
            <div className="campo-formulario">
              <label>Hora de fin*</label>
              <select
                name="horaFin"
                value={formData.horaFin}
                onChange={handleChange}
                disabled={guardando}
              >
                {horasDisponibles
                  .filter(hora => parseInt(hora.split(':')[0]) > parseInt(formData.horaInicio.split(':')[0]))
                  .map((hora) => (
                    <option key={`fin-${hora}`} value={hora}>
                      {hora}
                    </option>
                  ))}
              </select>
              {touched.horaFin && errores.horaFin && <span className="error">{errores.horaFin}</span>}
            </div>
          </div>
          
          <div className="campo-formulario">
            <label>Tipo de evento</label>
            <input
              type="text"
              value={evento.tipo}
              readOnly
              className="campo-deshabilitado"
            />
          </div>
          
          <div className="campo-formulario">
            <label>Cantidad estimada de personas*</label>
            <input
              type="number"
              name="personas"
              value={formData.personas}
              onChange={handleChange}
              disabled={guardando}
            />
            {touched.personas && errores.personas && (
              <span className="error">{errores.personas}</span>
            )}
          </div>
          <div className="botones-formulario">
            <button
            type="button" 
            className="btn-cancelar" 
            onClick={onCancelar}
            disabled={guardando}
            >
              Cancelar
            </button>
            <button 
            type="submit" 
            className="btn-nuevo"
            disabled={guardando}
            >
              {guardando ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            <Modal_Error
              titulo="Error al editar el evento"
              mensaje={mensajeError}
              mostrar={mostrarErrorModal}
              onCerrar={() => setMostrarErrorModal(false)}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioEditarEvento;