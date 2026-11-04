  import { useState, useEffect } from 'react';
  import DatePicker from 'react-datepicker';
  import 'react-datepicker/dist/react-datepicker.css';
  import { getTiposEvento, crearEvento } from '../api/misEventosApi';
  import Modal_Error from '../../../../../common/layouts/ModalError';

  /**
   * Componente: FormularioNuevoEvento
   * -------------------------------
   * Permite crear un nuevo evento, recibiendo como props:
   * - onGuardar: callback al guardar el evento
   * - onCancelar: callback al cancelar el formulario
   * - fecha: fecha seleccionada (opcional)
   * - visible: determina si el modal se muestra
   */
  const FormularioNuevoEvento = ({ onGuardar, onCancelar, fecha, visible,max,tiposSoportados  }) => {

    
    // ----------------------------
    // Estado principal del formulario
    // ----------------------------
    const [formData, setFormData] = useState({
      nombre: '',
      descripcion: '',
      fecha: fecha || new Date(), // inicializa con la fecha recibida o hoy
      horaInicio: '',
      horaFin: '',
      tipo: '',
      personas: ''
    });

    // ----------------------------
    // Sincroniza formData.fecha cuando cambia la prop fecha
    // ----------------------------
    useEffect(() => {
      if (fecha) {
        setFormData(prev => ({
          ...prev,
          fecha: fecha
        }));
      }
    }, [fecha]);

    // ----------------------------
    // Estado de tipos de evento
    // ----------------------------
    const [tiposEvento, setTiposEvento] = useState([]);
    const [cargando, setCargando] = useState(true);

    const [mostrarErrorModal, setMostrarErrorModal] = useState(false);
    const [mensajeError, setMensajeError] = useState('');
    

    // ----------------------------
    // Estado de guardado y validaciones
    // ----------------------------


    const [guardando, setGuardando] = useState(false);
    const [errores, setErrores] = useState({});
    const [mostrarErrores, setMostrarErrores] = useState(false);

    useEffect(() => {
      if (mostrarErrores) {
        validarFormulario();
      }
    }, [formData]);

    // ----------------------------
    // Cargar tipos de evento desde backend
    // ----------------------------
    useEffect(() => {
      const cargarTiposEvento = async () => {
        try {
          const tipos = await getTiposEvento();
          const tiposFiltrados = tiposSoportados && tiposSoportados.length > 0
            ? tipos.filter(t => tiposSoportados.some(s => s.name === t.nombre))
            : tipos;

          setTiposEvento(tiposFiltrados);
          } catch (error) {
          console.error('Error al cargar tipos de evento:', error);
          setTiposEvento([]); // fallback en caso de error
        } finally {
          setCargando(false);
        }
      };
      cargarTiposEvento();
    }, []);

    // ----------------------------
    // Determina si la fecha está bloqueada (no editable)
    // ----------------------------
    const fechaBloqueada = !!fecha;

    // ----------------------------
    // Array de horas disponibles para los selects
    // ----------------------------
    const horasDisponibles = Array.from({ length: 24 }, (_, i) =>
      `${i.toString().padStart(2, '0')}:00`
    );

    const [touched, setTouched] = useState({});
    // ----------------------------
    // Funciones manejadoras de cambios
    // ----------------------------
    const handleChange = (e) => {
      const { name, value } = e.target;
      const nuevoFormData = { ...formData, [name]: value };

      setFormData(nuevoFormData);
      setTouched((prev) => ({ ...prev, [name]: true }));
      validarFormulario(nuevoFormData); // 👈 validar con el valor actualizado
    };

    const handleFechaChange = (date) => {
      const nuevoFormData = { ...formData, fecha: date };
      setFormData(nuevoFormData);
      setTouched((prev) => ({ ...prev, fecha: true }));
      validarFormulario(nuevoFormData);
    };

    // ----------------------------
    // Validación del formulario
    // ----------------------------
    const validarFormulario = (datos) => {
    const nuevosErrores = {};

    const f = datos || formData; // si no pasan datos, usar formData

    // Nombre: 8-35 caracteres
    if (formData.nombre.trim().length < 8 || formData.nombre.trim().length > 35) {
      nuevosErrores.nombre = 'El nombre debe tener entre 8 y 35 caracteres y no puede ser solo espacios';
    }

    if (formData.descripcion.trim().length < 15 || formData.descripcion.trim().length > 150) {
      nuevosErrores.descripcion = 'La descripción debe tener entre 15 y 150 caracteres y no puede ser solo espacios';
    }

    // Fecha
    if (!f.fecha) {
      nuevosErrores.fecha = 'Debe seleccionar una fecha';
    } else if (f.fecha < new Date()) {
      nuevosErrores.fecha = 'La fecha debe ser en el futuro';
    }

    // Hora de inicio
    if (!f.horaInicio) {
      nuevosErrores.horaInicio = 'Debe seleccionar la hora de inicio';
    }

    // Hora de fin
    if (!f.horaFin) {
      nuevosErrores.horaFin = 'Debe seleccionar la hora de fin';
    } else {
      const horaInicioNum = parseInt(f.horaInicio.split(':')[0]);
      const horaFinNum = parseInt(f.horaFin.split(':')[0]);
      if (horaFinNum <= horaInicioNum) {
        nuevosErrores.horaFin = 'La hora de fin debe ser mayor a la de inicio';
      }
    }

    // Tipo
    if (!f.tipo) {
      nuevosErrores.tipo = 'Debe seleccionar un tipo de evento';
    }

    // Personas
    const personas = parseInt(f.personas);
    if (personas < 1) {
      nuevosErrores.personas = 'Debe haber al menos 1 persona';
    } else if (personas > (max ?? 1000)) {
      nuevosErrores.personas = `No puede superar las ${max ?? 1000} personas permitidas`;
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };


    // ----------------------------
    // Envío del formulario
    // ----------------------------
    const handleSubmit = async (e) => {
      e.preventDefault();

      if (!validarFormulario()) {
        setMostrarErrores(true);
        setTouched({
          nombre: true,
          descripcion: true,
          fecha: true,
          horaInicio: true,
          horaFin: true,
          tipo: true,
          personas: true
        });
        return;
      }

      setGuardando(true);

      try {
        // Buscar el ID del tipo de evento seleccionado
        const tipoSeleccionado = tiposEvento.find(tipo => tipo.nombre === formData.tipo);

        // Preparar datos para el backend
        const eventoParaBackend = {
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          fecha: formData.fecha.toISOString().split('T')[0], // formato YYYY-MM-DD
          horaInicio: formData.horaInicio,
          horaFin: formData.horaFin,
          personas: parseInt(formData.personas),
          idTipoEvento: tipoSeleccionado.id
        };

        console.log('Enviando al backend:', eventoParaBackend);

        // Crear evento en backend
        const eventoCreado = await crearEvento(eventoParaBackend);

        console.log('Evento creado:', eventoCreado);

        // Formatear para frontend
        const eventoParaFrontend = {
          id: eventoCreado.id,
          nombre: eventoCreado.nombre,
          descripcion: eventoCreado.descripcion,
          fecha: new Date(eventoCreado.fecha).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long'
          }),
          hora: `${formData.horaInicio.substring(0, 5)} - ${formData.horaFin.substring(0, 5)}`,
          estado: eventoCreado.estadoEvento?.nombre || 'Pendiente',
          tipo: eventoCreado.tipoEvento?.nombre || formData.tipo,
          personas: eventoCreado.personas,
          imagen: null
        };

        // Callback al componente padre
        onGuardar(eventoParaFrontend);

      } catch (error) {
        console.error('Error al crear el evento:', error);
        setMensajeError(error.message || 'Ocurrió un error al crear el evento.');
        setMostrarErrorModal(true);
      } finally {
        setGuardando(false);
      }
    };

    // ----------------------------
    // Renderizado del modal y formulario
    // ----------------------------
    if (!visible) return null; // No mostrar si visible=false

    return (
      <div className="modal-formulario">
        <div className="contenedor-formulario">
          <h2>Nuevo Evento</h2>

          <form onSubmit={handleSubmit}>
            {/* Nombre del evento */}
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
              {touched.nombre && errores.nombre && <span className="error">{errores.nombre}</span>}
            </div>

            {/* Descripción */}
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
                {touched.descripcion && errores.descripcion && <span className="error">{errores.descripcion}</span>}
            </div>

            {/* Fecha */}
            <div className="campo-formulario">
              <label>Fecha del evento*</label>
              <DatePicker
                selected={formData.fecha}
                onChange={handleFechaChange}
                minDate={new Date()}
                dateFormat="dd/MM/yyyy"
                placeholderText="Seleccione una fecha"
                disabled={fechaBloqueada || guardando}
              />
              {touched.fecha && errores.fecha && <span className="error">{errores.fecha}</span>}
            </div>

            {/* Horas */}
            <div className="grupo-horas">
              <div className="campo-formulario">
                <label>Hora de inicio*</label>
                <select
                  name="horaInicio"
                  value={formData.horaInicio}
                  onChange={handleChange}
                  disabled={guardando}
                >
                  <option value="">Seleccione hora de inicio</option>
                  {horasDisponibles.map((hora) => (
                    <option key={`inicio-${hora}`} value={hora}>
                      {hora.substring(0, 5)}
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
                  <option value="">Seleccione hora de fin</option>
                  {horasDisponibles
                    .filter(hora => parseInt(hora.split(':')[0]) > parseInt(formData.horaInicio.split(':')[0]))
                    .map((hora) => (
                      <option key={`fin-${hora}`} value={hora}>
                        {hora.substring(0, 5)}
                      </option>
                    ))}
                </select>
                  {touched.horaFin && errores.horaFin && <span className="error">{errores.horaFin}</span>}
              </div>
            </div>

            {/* Tipo de evento */}
            <div className="campo-formulario">
              <label>Tipo de evento*</label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                disabled={cargando || guardando}
              >
                <option value="" disabled hidden>
                  {cargando ? 'Cargando...' : 'Seleccione un tipo de evento'}
                </option>
                {tiposEvento.map((tipo) => (
                  <option key={tipo.id} value={tipo.nombre}>
                    {tipo.nombre}
                  </option>
                ))}
              </select>
              {touched.tipo && errores.tipo && <span className="error">{errores.tipo}</span>}
            </div>

            {/* Personas */}
            <div className="campo-formulario">
              <label>Cantidad estimada de personas*</label>
              <input
                type="number"
                name="personas"
                value={formData.personas}
                onChange={handleChange}
                disabled={guardando}
              />
              {touched.personas && errores.personas && <span className="error">{errores.personas}</span>}
            </div>

            {/* Botones */}
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
                {guardando ? 'Guardando...' : 'Guardar Evento'}
              </button>
              <Modal_Error
                titulo="Error al crear el evento"
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

  export default FormularioNuevoEvento;
