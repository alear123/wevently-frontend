import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { reportDefinitions, normalizarRol, buildReportPathWithLastRange, getLastRange } from '../reportesConfig';
import { getLoggedUser } from '../../../../common/Utils';

/*
  Barra horizontal de selección de reportes reutilizable.
  Se muestra debajo de la Navbar y permite:
   - Ver los reportes disponibles para el rol logueado
   - Navegar haciendo click usando el último rango de fechas guardado
   - Si no hay rango guardado, dispara callback para abrir modal de selección
   - Mostrar descripción contextual al hacer hover (tooltip desplegable)
*/

export default function ReportesBar({ onSolicitarRango }) {
  const user = getLoggedUser() || {};
  const rol = normalizarRol(user.rol);
  const navigate = useNavigate();
  const location = useLocation();
  const [hovered, setHovered] = useState(null);

  // Mostrar TODOS los reportes del rol (implementados o no) y marcar los no implementados como deshabilitados
  const disponibles = reportDefinitions.filter(r => r.roles.includes(rol));
  const lastRange = getLastRange();

  const irAReporte = (rep) => {
    const pathWithRange = buildReportPathWithLastRange(rep);
    if (pathWithRange) {
      // Ya tenemos fechas guardadas, navegar directamente
      if (location.pathname + location.search !== pathWithRange) {
        navigate(pathWithRange);
      }
    } else {
      // No hay rango: pedir al caller abrir modal
      if (onSolicitarRango) onSolicitarRango(rep.value);
    }
  };

  if (!disponibles.length) return null;

  return (
    <div className="reportes-bar-wrapper">
      <div className="reportes-bar">
        {disponibles.map(r => {
          const activo = location.pathname === r.path;
          const disabled = !r.implemented;
          return (
            <div
              key={r.value}
              className={`reporte-pill ${activo ? 'activo' : ''} ${disabled ? 'disabled' : ''}`}
              onClick={() => { if (!disabled) irAReporte(r); }}
              onMouseEnter={() => setHovered(r.value)}
              onMouseLeave={() => setHovered(prev => prev === r.value ? null : prev)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (!disabled && e.key === 'Enter') irAReporte(r); }}
            >
              <span className="reporte-pill-label">{r.label}{disabled && ' (Próx.)'}</span>
              {hovered === r.value && (
                <div className="reporte-pill-tooltip">
                  <div className="tooltip-arrow" />
                  <p className="tooltip-title">{r.label}{disabled && ' (Próximamente)'}</p>
                  <p className="tooltip-desc">{r.description}</p>
                  {disabled && (
                    <p className="tooltip-range no-range">Este reporte aún no está disponible.</p>
                  )}
                  {lastRange && lastRange.fechaDesde && lastRange.fechaHasta && (
                    <p className="tooltip-range">Último rango: {lastRange.fechaDesde} → {lastRange.fechaHasta}</p>
                  )}
                  {!lastRange && (
                    <p className="tooltip-range no-range">Seleccioná un rango para habilitar la navegación directa.</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <style>{`
        .reportes-bar-wrapper { background:#fff; border-bottom:1px solid #e5e7eb; position:sticky; top:56px; z-index:120; }
        .reportes-bar { display:flex; gap:12px; padding:10px 24px; flex-wrap:wrap; }
  .reporte-pill { position:relative; background:#f1f5f9; color:#1f2937; padding:8px 14px; border-radius:999px; font-size:14px; font-weight:500; cursor:pointer; transition:.2s background,color,box-shadow,opacity; }
        .reporte-pill:hover { background:#e2e8f0; }
        .reporte-pill.activo { background:#2433FF; color:#fff; box-shadow:0 2px 6px -1px rgba(36,51,255,.4); }
        .reporte-pill.activo:hover { background:#1e2bd9; }
        .reporte-pill:focus { outline:2px solid #6366f1; outline-offset:2px; }
  .reporte-pill.disabled { opacity:.45; cursor:not-allowed; box-shadow:none; }
  .reporte-pill.disabled:hover { background:#f1f5f9; }

        .reporte-pill-tooltip { position:absolute; left:0; top:calc(100% + 10px); width:260px; background:#1f2937; color:#f8fafc; padding:12px 14px 14px; border-radius:12px; box-shadow:0 8px 28px -4px rgba(0,0,0,.45); animation:fadeInTooltip .18s ease; }
        .tooltip-arrow { position:absolute; top:-8px; left:18px; width:16px; height:16px; background:#1f2937; transform:rotate(45deg); }
        .tooltip-title { margin:0 0 4px; font-size:14px; font-weight:600; line-height:1.2; }
        .tooltip-desc { margin:0 0 8px; font-size:12px; line-height:1.35; color:#cbd5e1; }
        .tooltip-range { margin:0; font-size:11px; color:#94a3b8; }
        .tooltip-range.no-range { color:#fbbf24; }

        @media (max-width:640px){
          .reportes-bar { padding:8px 12px; gap:8px; }
          .reporte-pill { font-size:13px; padding:6px 12px; }
          .reporte-pill-tooltip { width:220px; }
        }
        @keyframes fadeInTooltip { from { opacity:0; transform:translateY(-4px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  );
}
