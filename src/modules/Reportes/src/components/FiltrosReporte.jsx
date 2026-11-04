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
    const handleFechaDesdeChange = (fecha) => {
        onFiltrosChange({ fechaDesde: fecha });
        if (erroresCampos.fechaDesde || erroresCampos.rango) {
            setErroresCampos(prev => ({ ...prev, fechaDesde: null, rango: null }));
        }
    };
    const handleFechaHastaChange = (fecha) => {
        onFiltrosChange({ fechaHasta: fecha });
        if (erroresCampos.fechaHasta || erroresCampos.rango) {
            setErroresCampos(prev => ({ ...prev, fechaHasta: null, rango: null }));
        }
    };
    const handleAplicarFiltros = () => {
        const nuevosErrores = {};
        if (!fechaDesde) nuevosErrores.fechaDesde = 'Debe elegir una fecha desde';
        if (!fechaHasta) nuevosErrores.fechaHasta = 'Debe elegir una fecha hasta';
        if (fechaDesde && fechaHasta && !validacion.esValido) {
            nuevosErrores.rango = validacion.mensaje;
        }
        setErroresCampos(nuevosErrores);
        if (Object.keys(nuevosErrores).length === 0 && validacion.esValido) {
            onAplicarFiltros();
        }
    };
    const tieneErrorRango = !validacion.esValido;
    return (
        <div className={`filtros-reporte-container${modoCompacto ? ' filtros-reporte-compacto' : ''}`}>
            {!modoCompacto && (
                <h3 className="filtros-titulo">Filtros de búsqueda</h3>
            )}
            <div className={`filtros-row${modoCompacto ? ' filtros-row-compacto' : ''}`}>
                <div className="filtro-campo">
                    <CampoFecha
                        value={fechaDesde}
                        onChange={handleFechaDesdeChange}
                        placeholder="Desde"
                        maxDate={fechaHasta || new Date()}
                        className={erroresCampos.fechaDesde ? 'error' : ''}
                        disabled={cargando}
                    />
                </div>
                <div className="filtro-campo">
                    <CampoFecha
                        value={fechaHasta}
                        onChange={handleFechaHastaChange}
                        placeholder="Hasta"
                        minDate={fechaDesde}
                        maxDate={new Date()}
                        className={erroresCampos.fechaHasta ? 'error' : ''}
                        disabled={cargando}
                    />
                </div>
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
