
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import '../../modules/Usuarios&Seguridad/Configuraciones/src/assets/abm-shared.css';
import WarningIcon from '../../assets/WarningIcon.svg';

export default function ModalConfirmarRestauracion({ titulo, mensaje, mostrar, accion, onCancelar, onConfirmar }) {
  const msgDefecto = 'Esta acción no se puede deshacer.';
  const accionLabel = accion && accion !== '' ? accion : 'Eliminar';
  if (!mostrar) return null;

  // Keyboard shortcuts (Escape / Enter)
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancelar && onCancelar();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (onConfirmar) onConfirmar();
      }
    };
    document.addEventListener('keydown', handler);
    return () => {
      document.removeEventListener('keydown', handler);
    };
  }, [onCancelar, onConfirmar]);

  return createPortal(
    <div className="abm-modal-overlay" role="dialog" aria-modal="true" onClick={(e)=>{ if(e.target===e.currentTarget) onCancelar && onCancelar(); }}>
      <div className="abm-modal-shell" style={{maxWidth:480, padding:'32px 56px 28px 32px'}}>
        <button className="abm-modal-close" aria-label="Cerrar" onClick={onCancelar} />
        <div style={{display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center'}}>
          <div style={{width:82,height:82,borderRadius:'50%',background:'linear-gradient(135deg,#f59e0b,#d97706)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 8px 32px rgba(245,158,11,0.3)',marginBottom:28}}>
            <img src={WarningIcon} alt="Advertencia" draggable="false" style={{width:38,height:38,display:'block'}} />
          </div>
          <h2 style={{fontSize:24,margin:'0 0 12px',fontWeight:600,color:'#111827'}}>{titulo}</h2>
          <p style={{color:'#6b7280',fontSize:16,lineHeight:1.5,margin:'0 0 10px',maxWidth:340}}>{mensaje}</p>
          <p style={{color:'#6b7280',fontSize:13,lineHeight:1.4,margin:'0 0 30px',maxWidth:340,fontStyle:'italic'}}>{msgDefecto}</p>
          <div className="abm-modal-actions" style={{gridTemplateColumns:'1fr 1fr', width:'100%', gap:12}}>
            <button type="button" className="abm-action-btn cancel" onClick={onCancelar}>Cancelar</button>
            <button type="button" className="abm-action-btn delete" onClick={onConfirmar}>{accionLabel}</button>
          </div>
        </div>
      </div>
    </div>, document.body);
}
