import React, { useState, useRef, useEffect, useCallback } from "react";
import { toYMD } from "../utils/fechas";
// Importar estilos compartidos ABM para reutilizar clases de botones
import "../../../Usuarios&Seguridad/Configuraciones/src/assets/abm-shared.css";

export default function SeleccionarReporteModal({
  open,
  onClose,
  reportesDisponibles,
  onSeleccionar,
}) {
  const [reporte, setReporte] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [touchedHasta, setTouchedHasta] = useState(false);
  const [activeRange, setActiveRange] = useState("");
  const today = new Date();
  // Formatear en horario local para evitar corrimiento por UTC
  const format = (d) => toYMD(d);
  // Fecha hoy en formato YMD (usada para limitar selects y clamping)
  const todayYMD = format(today);
  const clampToToday = (d) => (d && d > todayYMD ? todayYMD : d);
  const addDays = (base, days) => { const c = new Date(base); c.setDate(c.getDate()+days); return c; };
  const firstDayThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayThisMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const hasDateError = !!(fechaHasta && fechaDesde && fechaHasta < fechaDesde);

  // Persistencia de último rango usado
  useEffect(() => {
    if (fechaDesde && fechaHasta) {
      // Guardar sólo si no hay error y todo está completo
      if (!hasDateError && reporte) {
        localStorage.setItem('reportes:lastRange', JSON.stringify({ reporte, fechaDesde, fechaHasta, activeRange }));
      }
    }
  }, [reporte, fechaDesde, fechaHasta, activeRange]);

  // Restaurar al abrir
  useEffect(() => {
    if (open) {
      try {
        const saved = JSON.parse(localStorage.getItem('reportes:lastRange'));
        if (saved && saved.reporte === reporte && saved.fechaDesde && saved.fechaHasta) {
          // Clamp de las fechas restauradas para no permitir valores futuros
          let sd = clampToToday(saved.fechaDesde);
          let sh = clampToToday(saved.fechaHasta);
          // Asegurar consistencia: si desde > hasta después del clamp, ajustar desde = hasta
          if (sd && sh && sd > sh) sd = sh;
          setFechaDesde(sd);
          setFechaHasta(sh);
          setActiveRange(saved.activeRange || "");
          setTouchedHasta(true);
        }
      } catch { /* ignore */ }
    }
  }, [open, reporte]);

  // Helper para limpiar persistencia explícitamente
  const clearSavedRange = useCallback(() => {
    try { localStorage.removeItem('reportes:lastRange'); } catch { /* ignore */ }
  }, []);

  // Si ambas fechas quedan vacías, eliminar persistencia para no restaurar al volver a seleccionar
  useEffect(() => {
    if (!fechaDesde && !fechaHasta) {
      clearSavedRange();
      setActiveRange("");
    }
  }, [fechaDesde, fechaHasta, clearSavedRange]);

  // Rangos sugeridos dinámicos por tipo de reporte (ejemplo: algunos limitan a 30 días)
  const baseRanges = [
    { key: '7d', label: 'Últimos 7 días', action: () => {
      const desde = addDays(today, -6); setFechaDesde(format(desde)); setFechaHasta(format(today)); setActiveRange('7d'); } },
    { key: 'month', label: 'Este mes', action: () => {
      setFechaDesde(format(firstDayThisMonth));
      // Hasta hoy (no futuro dentro del mes)
      setFechaHasta(format(today));
      setActiveRange('month'); } },
    { key: 'year', label: 'Año actual', action: () => {
      const firstYear = new Date(today.getFullYear(),0,1);
      // Hasta hoy (no usar 31 Dic futuro)
      setFechaDesde(format(firstYear));
      setFechaHasta(format(today));
      setActiveRange('year'); } },
  ];

  // Simular reglas por reporte (placeholder para futura lógica real)
  const reportRetentionDays = {
    usuariosactivos: 365,
    // otroReporte: 30,
  };
  const retention = reporte ? reportRetentionDays[reporte] : null;
  let suggestedRanges = baseRanges;
  if (retention && retention <= 31) {
    // Si el reporte sólo soporta 31 días, quitamos año actual
    suggestedRanges = baseRanges.filter(r => r.key !== 'year');
  }

  const applyRange = (range) => {
    range.action();
    setTouchedHasta(true);
  };

  // Mensaje explicando por qué está deshabilitado el botón
  let disabledReason = "";
  if (!reporte) disabledReason = "Seleccioná un tipo de reporte";
  else if (!fechaDesde || !fechaHasta) disabledReason = "Completá ambas fechas";
  else if (hasDateError) disabledReason = "La fecha hasta es menor que la fecha desde";
  const selectRef = useRef(null);
  const containerRef = useRef(null);

  // Enfocar automáticamente el select al abrir
  useEffect(() => {
    if (open && selectRef.current) {
      selectRef.current.focus();
    }
  }, [open]);

  // Manejar tecla ESC solo mientras el modal está abierto
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (open) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, handleKeyDown]);

  // Focus trap (ciclar tab dentro del modal)
  useEffect(() => {
    if (!open) return;
    const node = containerRef.current;
    if (!node) return;

    const selector = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([type="hidden"]):not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(',');

    const getFocusable = () => Array.from(node.querySelectorAll(selector))
      .filter(el => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true');

    const handleTab = (e) => {
      if (e.key !== 'Tab') return;
      const focusables = getFocusable();
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (e.shiftKey) { // Shift + Tab
        if (active === first || !node.contains(active)) {
          e.preventDefault();
            last.focus();
        }
      } else { // Tab normal
        if (active === last || !node.contains(active)) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    node.addEventListener('keydown', handleTab);
    return () => node.removeEventListener('keydown', handleTab);
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reportes-modal-title"
      ref={containerRef}
      style={{
        background: "white",
        borderRadius: 16,
        minWidth: 340,
        maxWidth: "520px",
        width: "100%",
        boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
      }}
    >
      <div className="modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
        <h5 id="reportes-modal-title" className="modal-title mb-0" style={{ fontSize: 18, fontWeight: 600 }}>Seleccionar Reporte</h5>
        <button
          type="button"
          aria-label="Cerrar"
          className="btn-close"
          onClick={onClose}
        />
      </div>
      <div className="modal-body" style={{ padding: '20px 24px 8px' }}>
        <label style={{ fontWeight: 600, display: 'block', marginBottom: 4 }}>Tipo de reporte</label>
        <div className="abm-select-wrapper" style={{ marginBottom: 16 }}>
          <select
            ref={selectRef}
            value={reporte}
            onChange={(e) => setReporte(e.target.value)}
            className="abm-select"
          >
            <option value="">Seleccionar...</option>
            {reportesDisponibles.map((r) => (
              <option key={r.value} value={r.value} disabled={!r.implemented}>
                {r.label}{!r.implemented ? ' (Próx.)' : ''}
              </option>
            ))}
          </select>
          <span className="select-arrow" aria-hidden="true">▼</span>
        </div>
        <div className="quick-ranges">
          <span className="quick-ranges-label">Rangos rápidos</span>
          <div className="quick-range-buttons">
            {suggestedRanges.map(r => (
              <button
                key={r.key}
                type="button"
                className={`abm-outline-btn ${activeRange === r.key ? 'active' : ''}`}
                onClick={() => {
                  if (activeRange === r.key) {
                    // Deseleccionar rango rápido: limpiar fechas y estado
                    setActiveRange("");
                    setFechaDesde("");
                    setFechaHasta("");
                    setTouchedHasta(false);
                    clearSavedRange();
                  } else {
                    applyRange(r);
                  }
                }}
              >{r.label}</button>
            ))}
          </div>
        </div>
        <label style={{ fontWeight: 600, display: 'block', marginBottom: 4 }}>Fecha desde</label>
        <div className={`abm-date-field ${fechaHasta && fechaDesde && fechaHasta < fechaDesde ? 'error' : ''}`} style={{ marginBottom: 12 }}>
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => {
              const v = e.target.value;
              // No permitir fechas futuras: clamp a today
              setFechaDesde(v > todayYMD ? todayYMD : v);
            }}
            max={fechaHasta || todayYMD}
            className="abm-datepicker"
          />
          {fechaDesde && (
            <button
              type="button"
              className="date-inline-btn clear-date-btn"
              aria-label="Limpiar fecha desde"
              onClick={() => setFechaDesde("")}
            >
              ×
            </button>
          )}
          <button
            type="button"
            className="date-inline-btn calendar-btn"
            aria-label="Abrir selector fecha desde"
            onClick={() => selectRef.current && selectRef.current.blur()}
            onMouseDown={(e) => {
              // Hack: forzar apertura del picker nativo reenfocando el input
              e.preventDefault();
              const input = e.currentTarget.parentElement.querySelector('input[type="date"]');
              if (input && input.showPicker) {
                input.showPicker();
              } else if (input) {
                input.focus();
              }
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="3" ry="3"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </button>
        </div>
        <label style={{ fontWeight: 600, display: 'block', marginBottom: 4 }}>Fecha hasta</label>
        <div className={`abm-date-field ${fechaHasta && fechaDesde && fechaHasta < fechaDesde ? 'error' : ''}`} style={{ marginBottom: 4 }}>
          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => {
              const v = e.target.value;
              // No permitir fechas futuras: clamp a today
              setFechaHasta(v > todayYMD ? todayYMD : v);
            }}
            onBlur={() => setTouchedHasta(true)}
            min={fechaDesde || undefined}
            max={todayYMD}
            className="abm-datepicker"
          />
          {fechaHasta && (
            <button
              type="button"
              className="date-inline-btn clear-date-btn"
              aria-label="Limpiar fecha hasta"
              onClick={() => setFechaHasta("")}
            >
              ×
            </button>
          )}
          <button
            type="button"
            className="date-inline-btn calendar-btn"
            aria-label="Abrir selector fecha hasta"
            onMouseDown={(e) => {
              e.preventDefault();
              const input = e.currentTarget.parentElement.querySelector('input[type="date"]');
              if (input && input.showPicker) {
                input.showPicker();
              } else if (input) {
                input.focus();
              }
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="3" ry="3"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </button>
        </div>
        {touchedHasta && fechaHasta && fechaDesde && fechaHasta < fechaDesde && (
          <div className="abm-date-error-text">La fecha hasta no puede ser menor que la fecha desde.</div>
        )}
        <div style={{ height: 12 }} />
        <div className={"abm-modal-actions"} style={{ marginTop: 16 }}>
          <button
            type="button"
            className="abm-action-btn cancel"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="abm-primary-btn"
            disabled={!reporte || !fechaDesde || !fechaHasta || hasDateError}
            onClick={() => onSeleccionar({ reporte, fechaDesde, fechaHasta })}
          >
            Ver reporte
          </button>
          {disabledReason && (
            <span
              className={`disabled-hint ${hasDateError ? 'error' : ''}`}
              style={{ gridColumn: '2 / 3', marginTop: 4, justifySelf: 'center' }}
            >
              {disabledReason}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
