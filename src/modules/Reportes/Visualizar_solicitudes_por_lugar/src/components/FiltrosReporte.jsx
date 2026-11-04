import React, { useState } from 'react';
import CampoFecha from './CampoFecha';

export default function FiltrosReporte({
    fechaDesde,
    fechaHasta,
    onFiltrosChange,
    onAplicarFiltros,
    validacion = { esValido: true },
    cargando = false,
    modoCompacto = false 
}) {
    const [erroresCampos, setErroresCampos] = useState({});

    // Función para manejar cambio de fecha desde
    const handleFechaDesdeChange = (fecha) => {
        onFiltrosChange({ fechaDesde: fecha });
        
        // Limpiar errores relacionados
        if (erroresCampos.fechaDesde || erroresCampos.rango) {
            setErroresCampos(prev => ({ 
                ...prev, 
                fechaDesde: null,
                rango: null 
            }));
        }
    };

    // Función para manejar cambio de fecha hasta
    const handleFechaHastaChange = (fecha) => {
        onFiltrosChange({ fechaHasta: fecha });
        
        // Limpiar errores relacionados
        if (erroresCampos.fechaHasta || erroresCampos.rango) {
            setErroresCampos(prev => ({ 
                ...prev, 
                fechaHasta: null,
                rango: null 
            }));
        }
    };

    // Función para validar y aplicar filtros
    const handleAplicarFiltros = () => {
        const nuevosErrores = {};

        // Validar campos requeridos
        if (!fechaDesde) {
            nuevosErrores.fechaDesde = 'Debe elegir una fecha desde';
        }
        if (!fechaHasta) {
            nuevosErrores.fechaHasta = 'Debe elegir una fecha hasta';
        }

        // Validar rango de fechas
        if (fechaDesde && fechaHasta && !validacion.esValido) {
            nuevosErrores.rango = validacion.mensaje;
        }

        setErroresCampos(nuevosErrores);

        // Si no hay errores, aplicar filtros
        if (Object.keys(nuevosErrores).length === 0 && validacion.esValido) {
            onAplicarFiltros();
        }
    };

    // Mostrar error de rango si existe
    const tieneErrorRango = !validacion.esValido;
    const claseErrorFecha = tieneErrorRango || erroresCampos.rango ? 'error' : '';

    return (
        <div className={`filtros-reporte-container${modoCompacto ? ' filtros-reporte-compacto' : ''}`}>
            {!modoCompacto && (
                <h3 className="filtros-titulo">Filtros de búsqueda</h3>
            )}
            <div className={`filtros-row${modoCompacto ? ' filtros-row-compacto' : ''}`}>
                {/* Fecha desde */}
                <div className="filtro-campo">
                    <CampoFecha
                        value={fechaDesde}
                        onChange={handleFechaDesdeChange}
                        placeholder="Desde"
                        maxDate={fechaHasta || new Date()}
                        className={`${erroresCampos.fechaDesde ? 'error' : ''}`}
                        disabled={cargando}
                    />
                </div>
                {/* Fecha hasta */}
                <div className="filtro-campo">
                    <CampoFecha
                        value={fechaHasta}
                        onChange={handleFechaHastaChange}
                        placeholder="Hasta"
                        minDate={fechaDesde}
                        maxDate={new Date()}
                        className={`${erroresCampos.fechaHasta ? 'error' : ''}`}
                        disabled={cargando}
                    />
                </div>
                {/* Botón aplicar */}
                <div className="filtro-campo filtro-campo-btn">
                    <button
                        className="btn-aplicar-filtros"
                        onClick={handleAplicarFiltros}
                        disabled={cargando}
                    >
                        {cargando ? 'Cargando...' : 'Aplicar'}
                    </button>
                </div>
            </div>
            {/* Errores */}
            {(erroresCampos.rango || !validacion.esValido) && (
                <div className="error-rango-container">
                    <span className="error-message error-rango">
                        {erroresCampos.rango || validacion.mensaje}
                    </span>
                </div>
            )}
        </div>
    );
}