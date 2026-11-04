import { useState, useEffect, useCallback, useRef } from 'react';
import Select from 'react-select';
import '../../src/assets/abm-shared.css';
import { getPantallasInicioPorGrupos, getPantallasInicioPosibles } from '../api/RolesApi';

/* Modal específico para creación/edición de Roles con lógica dinámica de pantallas de inicio */
export default function ModalRol({
  modo = 'crear',
  mostrar = true,
  rol = null,
  grupos = [],
  onClose,
  onSave
}) {
  const esEdicion = modo === 'editar' && rol;

  // Estado campos
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [activo, setActivo] = useState(true);
  const [tienePrivilegios, setTienePrivilegios] = useState(false);
  const [gruposIds, setGruposIds] = useState([]);
  const [pantallaInicio, setPantallaInicio] = useState('');
  const [pantallasPosibles, setPantallasPosibles] = useState([]);
  const [cargandoPantallas, setCargandoPantallas] = useState(false);
  const [errorPantallas, setErrorPantallas] = useState('');

  // Validaciones simples
  const [errores, setErrores] = useState({});
  const cachePantallas = useRef({}); // cache por key de grupos ordenados

  // Inicializar en abrir
  useEffect(() => {
    if (!mostrar) return;

    if (esEdicion && rol) {
      setNombre(rol.nombre || '');
      setDescripcion(rol.descripcion || '');
      setActivo(rol.activo ?? true);
      setTienePrivilegios(rol.tienePrivilegios ?? false);

      const g = rol.gruposIds || [];
      setGruposIds(g);

      // Valor inicial del backend
      setPantallaInicio(rol.pantallaInicio || '');
    } else {
      setNombre('');
      setDescripcion('');
      setActivo(true);
      setTienePrivilegios(false);
      setGruposIds([]);
      setPantallaInicio('');
      setPantallasPosibles([]);
    }

    setErrores({});
  }, [mostrar, esEdicion, rol]);

  const opcionesGrupos = grupos.map(g => ({ value: g.id, label: g.nombre }));

  // Función para cargar pantallas posibles según grupos
  const cargarPantallas = useCallback(async (ids) => {
    const ordenada = [...ids].sort((a, b) => a - b);
    const key = ordenada.join('-');

    if (!ids.length) {
      setPantallasPosibles([]);
      setPantallaInicio('');
      return;
    }

    if (cachePantallas.current[key]) { // cache hit
      setPantallasPosibles(cachePantallas.current[key]);
      if (pantallaInicio && !cachePantallas.current[key].includes(pantallaInicio)) {
        setPantallaInicio('');
      }
      return;
    }

    try {
      setCargandoPantallas(true);
      setErrorPantallas('');
      let rutas = []
      if (modo != "crear") {
        rutas = await getPantallasInicioPosibles(rol.nombre);
      } else {
        rutas = await getPantallasInicioPorGrupos(ordenada);
      }
      cachePantallas.current[key] = rutas || [];
      setPantallasPosibles(rutas || []);

      // Respetar valor del backend si es válido
      if (rol) {
        if (rol?.pantallaInicio && rutas?.includes(rol.pantallaInicio)) {
          setPantallaInicio(rol.pantallaInicio);
        } else if (pantallaInicio && !rutas?.includes(pantallaInicio)) {
          setPantallaInicio('');
        }
      }

    } catch (e) {
      setPantallasPosibles([]);
      setErrorPantallas('No se pudieron cargar las pantallas para los grupos seleccionados.');
      setPantallaInicio('');
    } finally {
      setCargandoPantallas(false);
    }
  }, [pantallaInicio, rol]);

  // Cargar pantallas cuando cambian los grupos
  useEffect(() => {
    cargarPantallas(gruposIds);
  }, [gruposIds, cargarPantallas]);

  // Validaciones simples
  const validar = () => {
    const nuevos = {};
    if (!nombre.trim()) nuevos.nombre = 'El nombre es requerido';
    if (nombre.trim().length < 2) nuevos.nombre = 'Mínimo 2 caracteres';
    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  };

  const handleGuardar = () => {
    if (!validar()) return;
    onSave && onSave({
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      activo,
      tienePrivilegios,
      gruposIds,
      pantallaInicio: pantallaInicio || ''
    });
  };

  if (!mostrar) return null;

  const titulo = esEdicion ? 'Editar rol' : 'Nuevo rol';
  const subtitulo = esEdicion ? 'Modificar' : 'Agregar';
  const descripcionModal = esEdicion ? 'Actualiza los datos del rol.' : 'Completa los campos para crear un rol.';

  return (
    <div className="abm-modal-overlay">
      <div className="abm-modal-shell" style={{ maxWidth: 560 }}>
        <button className="abm-modal-close" aria-label="Cerrar" onClick={onClose}></button>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '.5em' }}>
          <span style={{ fontWeight: 'bold', color: '#4B4EFD', fontSize: '1.15em' }}>{titulo}</span>
        </div>
        <h2 style={{ margin: 0, fontSize: '1.5em', color: '#222' }}>{subtitulo}</h2>
        <div style={{ color: '#666', marginBottom: '1em', fontSize: '.9rem' }}>{descripcionModal}</div>

        <div>
          {/* Nombre */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Nombre *</label>
            <input
              type="text"
              className={`form-control abm-pill-input ${errores.nombre ? 'abm-field-error' : ''}`}
              placeholder="Ej: Administrador"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              autoFocus
              maxLength={80}
            />
            {errores.nombre && <div style={{ color: '#ef4444', fontSize: '.75rem', marginTop: 4 }}>{errores.nombre}</div>}
          </div>

          {/* Descripcion */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Descripción</label>
            <textarea
              className="form-control abm-pill-input"
              placeholder="Descripción del rol (opcional)"
              rows={3}
              value={descripcion}
              maxLength={150}
              onChange={e => setDescripcion(e.target.value)}
            />
            <div style={{ fontSize: '.65rem', textAlign: 'right', color: '#6b7280', marginTop: 2 }}>{descripcion.length}/150</div>
          </div>

          {/* Switches */}
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginBottom: 14 }}>
            <label className="abm-switch" style={{ marginBottom: 0 }}>
              <input type="checkbox" checked={activo} onChange={e => setActivo(e.target.checked)} />
              <span className="track"><span className="thumb" /></span>
              <span style={{ fontSize: '.8rem', fontWeight: 600 }}>{activo ? "Activo" : "Inactivo"}</span>
            </label>
            <label className="abm-switch" style={{ marginBottom: 0 }}>
              <input type="checkbox" checked={tienePrivilegios} onChange={e => setTienePrivilegios(e.target.checked)} />
              <span className="track"><span className="thumb" /></span>
              <span style={{ fontSize: '.8rem', fontWeight: 600 }}> {tienePrivilegios ? "Privado" : "Publico"}</span>
            </label>
          </div>

          {/* Grupos */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Grupos de permisos</label>
            <Select
              isMulti
              options={opcionesGrupos}
              value={opcionesGrupos.filter(o => gruposIds.includes(o.value))}
              onChange={(vals) => setGruposIds(vals.map(v => v.value))}
              placeholder="Seleccionar grupos..."
              classNamePrefix="rs-abm"
              styles={{
                control: (base, state) => ({
                  ...base, borderRadius: 6, minHeight: 44,
                  borderColor: state.isFocused ? '#4B4EFD' : '#d1d5db',
                  boxShadow: 'none', ':hover': { borderColor: '#4B4EFD' }, fontSize: '.8rem'
                }),
                multiValue: base => ({ ...base, background: '#eef2ff', borderRadius: 4 }),
                multiValueLabel: base => ({ ...base, fontSize: '.65rem', fontWeight: 500, color: '#1f2937' }),
                multiValueRemove: base => ({ ...base, color: '#6b7280', ':hover': { background: 'transparent', color: '#ef4444' } }),
                option: (base, state) => ({ ...base, fontSize: '.75rem', backgroundColor: state.isSelected ? '#4B4EFD' : state.isFocused ? '#eef2ff' : '#fff', color: state.isSelected ? '#fff' : '#111' }),
                placeholder: base => ({ ...base, fontSize: '.75rem', color: '#888' }),
                menu: base => ({ ...base, zIndex: 9999, borderRadius: 6 })
              }}
              noOptionsMessage={() => 'Sin opciones'}
            />
          </div>

          {/* Pantalla de inicio */}
          {gruposIds.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Pantalla de inicio</label>
              {cargandoPantallas ? (
                <div style={{ fontSize: '.75rem', color: '#666' }}>Cargando opciones...</div>
              ) : errorPantallas ? (
                <div style={{ fontSize: '.7rem', color: '#ef4444' }}>{errorPantallas}</div>
              ) : pantallasPosibles.length === 0 ? (
                <div style={{ fontSize: '.7rem', color: '#6b7280' }}>No hay pantallas disponibles para esta combinación.</div>
              ) : (
                <select
                  className="form-control abm-pill-input"
                  value={pantallaInicio}
                  onChange={e => setPantallaInicio(e.target.value)}
                >
                  <option value="">Seleccionar...</option>
                  {pantallasPosibles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              )}
            </div>
          )}
        </div>

        <div className="abm-modal-actions">
          <button className="abm-primary-btn" style={{ width: '100%' }} onClick={handleGuardar}>Guardar</button>
          <button className="abm-action-btn cancel" style={{ width: '100%' }} type="button" onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}
