import { useState, useEffect } from 'react';
import Select from 'react-select';
import '../assets/abm-shared.css';

/*
 ModalAM generico
 Props principales:
 - modo: 'crear' | 'editar'
 - campos: [{ nombre, label, tipo='text', placeholder, requerido=true, validacion?(valor)=>string }]
 - item: objeto existente (para editar)
 - onClose, onSave(datos)
 - textos opcionales para personalizar títulos
 - extraActions? => render props para inyectar botones extra
*/

// campos soporta: { nombre, label, tipo='text'|'textarea'|'select'|'boolean'|'switch'|'component', placeholder, requerido=true,
//   validacion?(valor)=>string, valorPorDefecto, opciones (para select), soloLectura, formatValue(valor),
//   componente (para tipo component), props (extra para componente), filas (textarea), autofocus }
// validacionPersonalizada: (valores) => string (mensaje error) | '' | null
export default function ModalAM({
  modo = 'crear',
  // mostrar: si se pasa explicitamente false no se muestra; si es undefined asumimos que el padre ya controla el render
  mostrar,
  item = null,
  campos = [
    { nombre: 'nombre', label: 'Nombre *', placeholder: 'Ingrese nombre', requerido: true,
      validacion: v => {
        if (!v?.trim()) return 'Campo requerido';
        if (v.trim().length < 2) return 'Mínimo 2 caracteres';
        return ''; }
    }
  ],
  textos = {
    crear: { titulo: 'Nuevo registro', subtitulo: 'Agregar', descripcion: 'Complete los datos' },
    editar: { titulo: 'Editar registro', subtitulo: 'Modificar', descripcion: 'Actualice los datos' }
  },
  onClose,
  onSave,
  extraActions = null,
  validacionPersonalizada = null,
}) {
  const perfil = modo === 'editar' ? 'editar' : 'crear';
  const t = textos[perfil] || textos.crear;

  // estado campos
  const [valores, setValores] = useState({});
  const [errores, setErrores] = useState({});
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (mostrar === false) return; // solo evitar cuando se pasa false explícito
    const init = {};
    campos.forEach(c => {
      if (modo === 'editar' && item && item[c.nombre] != null) {
        init[c.nombre] = item[c.nombre];
      } else {
        // Compat: permitir valorPorDefecto | defaultValue
        const def = c.valorPorDefecto !== undefined ? c.valorPorDefecto : (c.defaultValue !== undefined ? c.defaultValue : undefined);
        if (c.tipo === 'boolean' || c.tipo === 'switch') {
          init[c.nombre] = def !== undefined ? def : false;
        } else if (c.tipo === 'multi-select') {
          init[c.nombre] = Array.isArray(def) ? def : [];
        } else {
          init[c.nombre] = def !== undefined ? def : '';
        }
      }
    });
    setValores(init);
    setErrores({});
    setFormError('');
  }, [item, modo, campos, mostrar]);

  const validarCampo = (def, valor) => {
    if (def.soloLectura) return '';
    if (def.validacion) return def.validacion(valor) || '';
    if (def.requerido) {
      if (def.tipo === 'boolean' || def.tipo === 'switch') return '';
      if (def.tipo === 'multi-select') {
        if (!Array.isArray(valor) || valor.length === 0) return 'Campo requerido';
      } else if (typeof valor === 'string') {
        if (!valor.trim()) return 'Campo requerido';
      } else if (valor === null || valor === undefined) {
        return 'Campo requerido';
      }
    }
    return '';
  };

  const handleChange = (nombre, valor) => {
    const def = campos.find(c => c.nombre === nombre);
    setValores(p => ({ ...p, [nombre]: valor }));
    if (def) {
      const err = validarCampo(def, valor);
      setErrores(p => ({ ...p, [nombre]: err }));
    }
    setFormError('');
  };

  const validarFormulario = () => {
    const nuevos = {};
    let hay = false;
    campos.forEach(c => {
      const val = valores[c.nombre];
      const err = validarCampo(c, val);
      if (err) { nuevos[c.nombre] = err; hay = true; }
    });
    setErrores(nuevos);
    if (hay) {
      setFormError('Hay campos con errores o incompletos.');
      return false;
    }
    if (validacionPersonalizada) {
      const errPers = validacionPersonalizada(valores);
      if (errPers) {
        setFormError(errPers);
        return false;
      }
    }
    return true;
  };

  const handleGuardar = () => {
    if (!validarFormulario()) return;
    const limpio = {};
    campos.forEach(c => {
      const v = valores[c.nombre];
      if (c.soloLectura) {
        limpio[c.nombre] = v; // dejar tal cual
      } else {
        limpio[c.nombre] = typeof v === 'string' ? v.trim() : v;
      }
    });
    onSave && onSave(limpio);
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      const anyErr = Object.values(errores).some(Boolean);
      const allFilled = campos.every(c => !c.requerido || valores[c.nombre]?.trim());
      if (!anyErr && allFilled) {
        handleGuardar();
      }
    }
  };

  if (mostrar === false) return null;

  return (
    <div className="abm-modal-overlay">
      <div className="abm-modal-shell" style={{ maxWidth: 520 }}>
        <button className="abm-modal-close" aria-label="Cerrar" onClick={onClose}></button>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '.5em' }}>
          <span style={{ fontWeight: 'bold', color: '#4B4EFD', fontSize: '1.15em' }}>{t.titulo}</span>
        </div>
        <h2 style={{ margin: 0, fontSize: '1.5em', color: '#222' }}>{t.subtitulo}</h2>
        <div style={{ color: '#666', marginBottom: '1em', fontSize: '.9rem' }}>{t.descripcion}</div>

        <div>
          {campos.map(c => {
            const valorOriginal = valores[c.nombre];
            let valor = valorOriginal ?? '';
            if (c.soloLectura && c.formatValue && valor) {
              try { valor = c.formatValue(valorOriginal); } catch { valor = valorOriginal; }
            }
            const err = errores[c.nombre];
            const esLectura = !!c.soloLectura || !!c.disabled;
            const estilosLectura = esLectura ? { backgroundColor:'#f5f5f5', color:'#666', cursor:'not-allowed', border:'1px solid #ddd' } : {};

            const labelExtra = esLectura ? <span style={{ fontSize: '.65em', fontWeight:'normal', marginLeft:6, color:'#888' }}>(Solo lectura)</span> : null;

            const renderCampo = () => {
              if (c.tipo === 'boolean' || c.tipo === 'switch') {
                return (
                  <input
                    type="checkbox"
                    checked={!!valor}
                    disabled={esLectura}
                    onChange={e => handleChange(c.nombre, e.target.checked)}
                    style={{ transform:'scale(1.2)', cursor: esLectura? 'not-allowed':'pointer' }}
                  />
                );
              }
              if (c.tipo === 'component' && c.componente) {
                const ComponenteCustom = c.componente;
                return (
                  <ComponenteCustom
                    value={valorOriginal}
                    onChange={v => handleChange(c.nombre, v)}
                    placeholder={c.placeholder}
                    minDate={c.minDate}
                    maxDate={c.maxDate}
                    disabled={esLectura}
                    readOnly={esLectura}
                    {...(c.props||{})}
                  />
                );
              }
              if (c.tipo === 'textarea') {
                return (
                  <textarea
                    className={`form-control abm-pill-input ${err ? 'abm-field-error' : ''}`}
                    rows={c.filas || 3}
                    placeholder={c.placeholder}
                    value={valor}
                    onChange={e => handleChange(c.nombre, e.target.value)}
                    onKeyDown={handleKeyDown}
                    readOnly={esLectura}
                    disabled={esLectura}
                    style={estilosLectura}
                  />
                );
              }
              if (c.tipo === 'select') {
                const opciones = c.opciones || c.options || [];
                return (
                  <select
                    className={`form-control abm-pill-input ${err ? 'abm-field-error' : ''}`}
                    value={valor}
                    onChange={e => handleChange(c.nombre, e.target.value)}
                    disabled={esLectura}
                    style={estilosLectura}
                  >
                    <option value="">{c.placeholder || 'Seleccionar...'}</option>
                    {opciones.map(op => {
                      const value = op.valor !== undefined ? op.valor : op.value;
                      const label = op.etiqueta !== undefined ? op.etiqueta : op.label;
                      return <option key={value} value={value}>{label}</option>;
                    })}
                  </select>
                );
              }
              if (c.tipo === 'multi-select') {
                const opciones = (c.opciones || c.options || []).map(op => ({
                  value: op.valor !== undefined ? op.valor : op.value,
                  label: op.etiqueta !== undefined ? op.etiqueta : op.label
                }));
                const seleccionados = Array.isArray(valor) ? valor : [];

                // Si se solicita usar react-select (default true) usamos ese componente
                const usarRS = c.usarReactSelect !== false; // por defecto sí
                if (usarRS) {
                  const selectedObjects = opciones.filter(o => seleccionados.includes(o.value));
                  return (
                    <Select
                      isMulti
                      isDisabled={esLectura}
                      options={opciones}
                      value={selectedObjects}
                      onChange={(vals) => handleChange(c.nombre, vals.map(v => v.value))}
                      placeholder={c.placeholder || 'Seleccione...'}
                      classNamePrefix="rs-abm"
                      styles={{
                        control: (base, state) => ({
                          ...base,
                          borderRadius: 6, // rectangular como otros inputs
                          minHeight: 44,
                          borderColor: err ? '#ef4444' : (state.isFocused ? '#4B4EFD' : '#d1d5db'),
                          boxShadow: 'none',
                          ':hover': { borderColor: err ? '#ef4444' : '#4B4EFD' },
                          fontSize: '.8rem',
                          backgroundColor: esLectura ? '#f5f5f5' : '#fff',
                          cursor: esLectura ? 'not-allowed' : 'text'
                        }),
                        valueContainer: (base) => ({ ...base, padding: '2px 8px', gap: 4 }),
                        multiValue: (base) => ({
                          ...base,
                          backgroundColor: '#eef2ff',
                          borderRadius: 4,
                          padding: '0 4px',
                          display: 'flex',
                          alignItems: 'center'
                        }),
                        multiValueLabel: (base) => ({
                          ...base,
                          color: '#1f2937',
                          fontSize: '.65rem',
                          fontWeight: 500,
                          paddingRight: 2
                        }),
                        multiValueRemove: (base) => ({
                          ...base,
                          color: '#6b7280',
                          ':hover': { background: 'transparent', color: '#ef4444' }
                        }),
                        placeholder: (base) => ({ ...base, fontSize: '.75rem', color:'#888' }),
                        option: (base, state) => ({
                          ...base,
                          fontSize: '.75rem',
                          backgroundColor: state.isSelected ? '#4B4EFD' : state.isFocused ? '#eef2ff' : 'white',
                          color: state.isSelected ? '#fff' : '#111'
                        }),
                        menu: base => ({ ...base, zIndex: 9999, fontSize: '.75rem', borderRadius: 6 }),
                        menuPortal: base => ({ ...base, zIndex: 9999 })
                      }}
                      noOptionsMessage={() => 'Sin opciones'}
                    />
                  );
                }

                // Fallback simple (chips) si se desactiva react-select
                const toggle = (val) => {
                  if (esLectura) return;
                  const existe = seleccionados.includes(val);
                  const nuevo = existe ? seleccionados.filter(v => v !== val) : [...seleccionados, val];
                  handleChange(c.nombre, nuevo);
                };
                return (
                  <div className={`abm-multiselect ${err ? 'abm-field-error' : ''}`} style={{
                    border:'1px solid '+(err? '#ef4444':'#d1d5db'), borderRadius:24, padding:'8px 12px', background:'#fff', minHeight:44,
                    ...(esLectura ? estilosLectura : {})
                  }}>
                    {opciones.length === 0 && <div style={{ fontSize:'.75rem', color:'#888' }}>{c.placeholder || 'Sin opciones'}</div>}
                    {opciones.length > 0 && (
                      <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                        {opciones.map(op => {
                          const checked = seleccionados.includes(op.value);
                          return (
                            <label key={op.value} style={{ display:'flex', alignItems:'center', gap:4, background: checked? '#4B4EFD':'#f3f4f6', color: checked? '#fff':'#111', padding:'4px 10px', borderRadius:16, cursor: esLectura? 'not-allowed':'pointer', fontSize:'.70rem', fontWeight:500 }}>
                              <input
                                type="checkbox"
                                checked={checked}
                                disabled={esLectura}
                                onChange={() => toggle(op.value)}
                                style={{ transform:'scale(1.05)' }}
                              />
                              {op.label}
                            </label>
                          );
                        })}
                      </div>
                    )}
                    {seleccionados.length === 0 && opciones.length > 0 && <div style={{ fontSize:'.65rem', color:'#666', marginTop:4 }}>{c.placeholder || 'Seleccione uno o más'}</div>}
                  </div>
                );
              }
              return (
                <input
                  type={c.tipo || 'text'}
                  className={`form-control abm-pill-input ${err ? 'abm-field-error' : ''}`}
                  placeholder={c.placeholder}
                  value={valor}
                  onChange={e => handleChange(c.nombre, e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus={c.autofocus}
                  readOnly={esLectura}
                  disabled={esLectura}
                  style={estilosLectura}
                />
              );
            };

            return (
              <div key={c.nombre} style={{ marginBottom: '14px' }}>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: 6, color: esLectura ? '#666':'inherit' }}>
                  {c.label} {labelExtra}
                </label>
                {renderCampo()}
                {err && <div style={{ color: '#ef4444', fontSize: '.75rem', marginTop: 4 }}>{err}</div>}
              </div>
            );
          })}
        </div>

        {formError && <div style={{ color: '#ef4444', fontSize: '.8rem', marginTop: 4, marginBottom: 8 }}>{formError}</div>}

        <div className="abm-modal-actions">
          <button
            className="abm-primary-btn"
            onClick={handleGuardar}
            disabled={Object.values(errores).some(Boolean) || !campos.filter(c=>!c.soloLectura).every(c => {
              const v = valores[c.nombre];
              if (!c.requerido) return true;
              if (c.tipo === 'boolean' || c.tipo === 'switch') return true; // siempre definido
              if (typeof v === 'string') return !!v.trim();
              return v !== null && v !== undefined;
            })}
            style={{ width: '100%' }}
          >Guardar</button>
          <button
            className="abm-action-btn cancel"
            type="button"
            onClick={onClose}
            style={{ width: '100%' }}
          >Cancelar</button>
        </div>

        {extraActions && (
          <div style={{ marginTop: '12px' }}>
            {typeof extraActions === 'function' ? extraActions({ valores, setValores }) : extraActions}
          </div>
        )}
      </div>
    </div>
  );
}
