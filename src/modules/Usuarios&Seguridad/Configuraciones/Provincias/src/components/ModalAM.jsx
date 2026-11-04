import { useState, useEffect } from 'react';
import '../../../src/assets/abm-shared.css';

export default function ModalAM({
  modo = 'crear',
  mostrar,
  item = null,
  textos = {
    crear: { titulo: 'Nueva provincia', subtitulo: 'Agregar', descripcion: 'Ingresa el nombre de la provincia' },
    editar: { titulo: 'Editar provincia', subtitulo: 'Modificar', descripcion: 'Actualiza el nombre de la provincia' }
  },
  onClose,
  onSave,
}) {
  const perfil = modo === 'editar' ? 'editar' : 'crear';
  const t = textos[perfil] || textos.crear;

  const [nombre, setNombre] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (mostrar === false) return;
    if (modo === 'editar' && item?.nombre) {
      setNombre(item.nombre);
    } else {
      setNombre('');
    }
    setError('');
  }, [item, modo, mostrar]);

  // Validación específica para provincias
  const validarNombre = (valor) => {
    if (!valor.trim()) {
      return 'El nombre es requerido';
    }
    if (valor.length > 30) {
      return 'Máximo 30 caracteres';
    }
    // Solo letras (con acentos), espacios, guiones y puntos
    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s.\-]+$/.test(valor)) {
      return 'Solo se permiten letras, espacios, guiones (-) y puntos (.)';
    }
    return '';
  };

  const handleChange = (valor) => {
    if (valor.length <= 30) {
      setNombre(valor);
      setError(validarNombre(valor));
    }
  };

  // El submit del form y al apretar Enter
  const handleGuardar = (e) => {
    if (e) e.preventDefault(); // previene submit real y recarga
    const errorValidacion = validarNombre(nombre);
    if (errorValidacion) {
      setError(errorValidacion);
      return;
    }
    if (onSave) onSave({ nombre: nombre.trim() });
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
        <form onSubmit={handleGuardar}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>
              Nombre *
            </label>
            <input
              type="text"
              className={`form-control abm-pill-input ${error ? 'abm-field-error' : ''}`}
              placeholder="Nombre de la provincia"
              value={nombre}
              onChange={e => handleChange(e.target.value)}
              autoFocus
              maxLength={30}
            />
            <div style={{ fontSize: '.7rem', color: '#888', marginTop: 4 }}>
              {nombre.length}/30 caracteres
            </div>
            {error && <div style={{ color: '#ef4444', fontSize: '.75rem', marginTop: 4 }}>{error}</div>}
          </div>
          <div className="abm-modal-actions">
            <button
              type="submit"
              className="abm-primary-btn"
              disabled={!!error || !nombre.trim()}
              style={{ width: '100%' }}
            >
              Guardar
            </button>
            <button
              className="abm-action-btn cancel"
              type="button"
              onClick={onClose}
              style={{ width: '100%' }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
