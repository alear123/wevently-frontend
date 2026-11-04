import { useState, useRef, useEffect } from "react";
import "../assets/FiltroTipo.css";
import ReactDOM from "react-dom";

// Ahora soporta dos formas de pasar opciones:
// 1) Array de strings: ['1','2','3']
// 2) Array de objetos: [{ valor:'1', etiqueta:'Buenos Aires' }, { valor:'2', etiqueta:'Córdoba' }]
// Backward compatible con props existentes.
export default function FiltroTipo({
  tiposDisponibles = [],
  tipoSeleccionado = "Todos",
  onChange,
  className = "",
  maxLength = 20,
  showTooltip = true,
  compact = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltipState, setShowTooltipState] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Permite clicks dentro del dropdown en el portal
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !(event.target.closest && event.target.closest(".filtro-tipo-dropdown"))
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Normalizamos opciones
  const isObjectMode = tiposDisponibles.some((o) => typeof o === "object");
  const normalizadas = isObjectMode
    ? tiposDisponibles.map((o) => ({
        valor: o.valor ?? o.value,
        etiqueta: o.etiqueta ?? o.label ?? String(o.valor ?? o.value),
        disabled: Boolean(o.disabled),
        isHeader: Boolean(o.isHeader),
      }))
    : tiposDisponibles.map((v) => ({ valor: v, etiqueta: v }));

  // Garantizamos que "Todos" exista al principio si no viene explícito
  const hasTodos = normalizadas.some((o) => String(o.valor) === "Todos");
  const opcionesNormalizadas = hasTodos
    ? normalizadas
    : [{ valor: "Todos", etiqueta: "Todos" }, ...normalizadas];

  const mapValorEtiqueta = new Map(
    opcionesNormalizadas.map((o) => [String(o.valor), o.etiqueta])
  );

  const handleSelect = (option) => {
    if (!option || option.disabled || option.isHeader) return; // ignorar headers
    onChange(option.valor);
    setIsOpen(false);
  };
  const formatearTipo = (valor) => {
    if (valor === "Todos") return "Todos";
    const etiqueta = mapValorEtiqueta.get(String(valor));
    return (etiqueta || String(valor)).replace(/_/g, " ");
  };
  const truncarTexto = (texto, maxLen = maxLength) =>
    texto.length <= maxLen ? texto : texto.substring(0, maxLen) + "...";

  const textoCompleto = formatearTipo(tipoSeleccionado);
  const textoTruncado = truncarTexto(textoCompleto);
  const necesitaTooltip = textoCompleto !== textoTruncado;
  // Mantener el orden provisto, con Todos ya insertado si faltaba
  const opciones = opcionesNormalizadas;

  // --- Portal para el dropdown ---
  const [dropdownPos, setDropdownPos] = useState({
    left: 0,
    top: 0,
    width: 120,
  });

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({
        left: rect.left + window.scrollX,
        top: rect.bottom + window.scrollY,
        width: rect.width,
      });
    }
  }, [isOpen]);

  return (
    <div
      className={`filtro-tipo-container ${
        compact ? "compact" : ""
      } ${className}`}
      ref={dropdownRef}
      onMouseEnter={() => setShowTooltipState(true)}
      onMouseLeave={() => setShowTooltipState(false)}
      style={{ position: "relative" }}
    >
      <button
        ref={buttonRef}
        type="button"
        className={`filtro-tipo-button ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        title={necesitaTooltip ? textoCompleto : undefined}
      >
        {!compact && <span className="filtro-tipo-label">Tipo:</span>}
        <span className="filtro-tipo-valor">{textoTruncado}</span>
        <svg
          className={`filtro-tipo-icon ${isOpen ? "rotated" : ""}`}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
        >
          <path
            d="M3 4.5L6 7.5L9 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {showTooltip && necesitaTooltip && showTooltipState && !isOpen && (
        <div className="filtro-tipo-tooltip">{textoCompleto}</div>
      )}
      {isOpen &&
        ReactDOM.createPortal(
          <div
            className="filtro-tipo-dropdown"
            style={{
              position: "absolute",
              zIndex: 9999,
              left: dropdownPos.left,
              top: dropdownPos.top,
              minWidth: dropdownPos.width,
              width: dropdownPos.width,
              maxWidth: 260,
              maxHeight: 300,
              overflowY: "auto",
            }}
          >
            {opciones.map((option) => {
              const valor = option.valor;
              const textoOpcion = formatearTipo(valor);
              const trunc = truncarTexto(textoOpcion, maxLength + 10);
              return (
                <button
                  key={String(valor)}
                  type="button"
                  className={`filtro-tipo-option ${
                    option.isHeader ? "header" : ""
                  } ${valor === tipoSeleccionado ? "selected" : ""}`}
                  onClick={() => handleSelect(option)}
                  title={textoOpcion !== trunc ? textoOpcion : undefined}
                  disabled={option.isHeader || option.disabled}
                  aria-disabled={option.isHeader || option.disabled}
                >
                  <span className="filtro-tipo-option-text">{trunc}</span>
                  {!option.isHeader && valor === tipoSeleccionado && (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M13.5 4.5L6 12L2.5 8.5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
}
