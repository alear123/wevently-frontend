import { useState, useRef, useEffect } from 'react';
import '../assets/Reporte.css';

export default function FiltroTipo({
    tiposDisponibles = [],
    tipoSeleccionado = 'Todos',
    onChange,
    className = '',
    maxLength = 20,
    showTooltip = true,
    compact = false
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [showTooltipState, setShowTooltipState] = useState(false);
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (evento) => {
            if (dropdownRef.current && !dropdownRef.current.contains(evento.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSelect = (tipo) => {
        onChange(tipo);
        setIsOpen(false);
    };

    const formatearTipo = (tipo) => {
        if (tipo === 'Todos') return tipo;
        return tipo
            .replace(/_/g, ' ')
            .toLowerCase()
            .replace(/\b\w/g, char => char.toUpperCase());
    };

    const truncarTexto = (texto, maxLen = maxLength) => {
        if (texto.length <= maxLen) return texto;
        return texto.substring(0, maxLen) + '...';
    };

    const textoCompleto = formatearTipo(tipoSeleccionado);
    const textoTruncado = truncarTexto(textoCompleto);
    const necesitaTooltip = textoCompleto !== textoTruncado;

    const opciones = ['Todos', ...tiposDisponibles.filter(tipo => tipo !== 'Todos')];

    return (
        <div
            className={`filtro-tipo-container ${compact ? 'compact' : ''} ${className}`}
            ref={dropdownRef}
            onMouseEnter={() => setShowTooltipState(true)}
            onMouseLeave={() => setShowTooltipState(false)}
        >
            <button
                ref={buttonRef}
                type='button'
                className={`filtro-tipo-button ${isOpen ? 'active' : ''}`} 
                onClick={() => setIsOpen(!isOpen)}
                title={necesitaTooltip ? textoCompleto : undefined} 
            >
                {!compact && <span className='filtro-tipo-label'>Tipo:</span>}
                <span className='filtro-tipo-valor'>
                    {textoTruncado}
                </span>
                <svg
                    className={`filtro-tipo-icon ${isOpen ? 'rotated' : ''}`}
                    width="12"
                    height="12"
                    viewBox='0 0 12 12'
                    fill='none'
                >
                    <path
                        d="M3 4.5L6 7.5L9 4.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap='round'
                        strokeLinejoin='round'
                    />
                </svg>
            </button>

            {showTooltip && necesitaTooltip && showTooltipState && !isOpen && (
                <div className='filtro-tipo-tooltip'>
                    {textoCompleto}
                </div>
            )}

            {isOpen && (
                <div className='filtro-tipo-dropdown'>
                    {opciones.map((tipo) => {
                        const textoOpcion = formatearTipo(tipo);
                        const textoOpcionTruncado = truncarTexto(textoOpcion, maxLength + 10);

                        return (
                            <button
                                key={tipo}
                                type='button'
                                className={`filtro-tipo-option ${tipo === tipoSeleccionado ? 'selected' : ''}`}
                                onClick={() => handleSelect(tipo)}
                                title={textoOpcion !== textoOpcionTruncado ? textoOpcion : undefined}
                            >
                                {/* ✅ CORREGIDO: Clase correcta sin punto */}
                                <span className='filtro-tipo-option-text'>
                                    {textoOpcionTruncado}
                                </span>
                                {tipo === tipoSeleccionado && (
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox='0 0 16 16'
                                        fill='none'
                                    >
                                        <path
                                            d="M13.5 4.5L6 12L2.5 8.5"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap='round'
                                            strokeLinejoin='round' 
                                        />
                                    </svg>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}