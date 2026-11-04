import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import '../../modules/Usuarios&Seguridad/Configuraciones/src/assets/abm-shared.css';

export default function ModalConfirmarRestauracion({ titulo, mensaje, mostrar, onCancelar, onConfirmar }) {
  const msgDefecto = 'Esta acción no se puede deshacer.';
  if (!mostrar) return null;

  // Teclas rápidas: Escape / Enter
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancelar && onCancelar();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onConfirmar && onConfirmar();
      }
    };
    document.addEventListener('keydown', handler);
    return () => {
      document.removeEventListener('keydown', handler);
    };
  }, [onCancelar, onConfirmar]);

  return createPortal(
    <div
      className="abm-modal-overlay"
      role="dialog"
      aria-modal="true"
      onClick={(e) => { if (e.target === e.currentTarget) onCancelar && onCancelar(); }}
    >
      <div className="abm-modal-shell" style={{ maxWidth: 480, padding: '32px 56px 28px 32px' }}>
        <button className="abm-modal-close" aria-label="Cerrar" onClick={onCancelar} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          
          {/* Círculo azul con ícono de restaurar */}
          <div
            style={{
              width: 82,
              height: 82,
              borderRadius: '50%',
              background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(59,130,246,0.3)',
              marginBottom: 28,
            }}
          >
            <span style={{ fontSize: 40, color: 'white', transform: 'rotate(-15deg)' }}>↻</span>
          </div>

          <h2 style={{ fontSize: 24, margin: '0 0 12px', fontWeight: 600, color: '#111827' }}>{titulo}</h2>
          <p style={{ color: '#6b7280', fontSize: 16, lineHeight: 1.5, margin: '0 0 10px', maxWidth: 340 }}>{mensaje}</p>
          <p style={{ color: '#6b7280', fontSize: 13, lineHeight: 1.4, margin: '0 0 30px', maxWidth: 340, fontStyle: 'italic' }}>{msgDefecto}</p>
          
          <div className="abm-modal-actions" style={{ gridTemplateColumns: '1fr 1fr', width: '100%', gap: 12 }}>
            <button
              type="button"
              style={{
                backgroundColor: '#ef4444', // rojo
                color: 'white',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
              onClick={onCancelar}
            >
              Cancelar
            </button>
            <button
              type="button"
              style={{
                backgroundColor: '#3b82f6', // azul
                color: 'white',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
              onClick={onConfirmar}
            >
              Restaurar
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
