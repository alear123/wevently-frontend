import React from 'react';

const CampoFecha = ({
    value,
    onChange,
    placeholder,
    minDate = null,
    maxDate = null,
    className = "",
    disabled = false
}) => {
    const formatearFechaParaInput = (fecha) => {
        if (!fecha) return '';
        if (typeof fecha === 'string') return fecha;
        if (fecha instanceof Date) {
            const anio = fecha.getFullYear();
            const mes = String(fecha.getMonth() + 1).padStart(2, '0');
            const dia = String(fecha.getDate()).padStart(2, '0');
            return `${anio}-${mes}-${dia}`;
        }
        return '';
    };
    const formatearFechaMin = (fecha) => {
        if (!fecha) return undefined;
        return formatearFechaParaInput(fecha);
    };
    const formatearFechaMax = (fecha) => {
        const hoy = new Date();
        const fechaHoyString = formatearFechaParaInput(hoy);
        if (!fecha) {
            return fechaHoyString;
        }
        const fechaMaxString = formatearFechaParaInput(fecha);
        const fechaMaxObj = new Date(fechaMaxString);
        return fechaMaxObj > hoy ? fechaHoyString : fechaMaxString;
    };
    const handleChange = (e) => {
        const fechaString = e.target.value;
        if (fechaString) {
            const fechaSeleccionada = new Date(fechaString + 'T00:00:00');
            const hoy = new Date();
            hoy.setHours(23, 59, 59, 999);
            if(fechaSeleccionada > hoy) {
                return;
            }
            onChange(fechaSeleccionada);
        } else {
            onChange(null);
        }
    };
    const tieneError = className.includes('error');
    return (
        <input
            type="date"
            value={formatearFechaParaInput(value)}
            onChange={handleChange}
            min={formatearFechaMin(minDate)}
            max={formatearFechaMax(maxDate)}
            placeholder={placeholder}
            disabled={disabled}
            className={`parametro-datepicker ${className}`}
            style={{
                border: tieneError ? '2px solid #FF0000 !important' : undefined,
            }}
        />
    );
};
export default CampoFecha;
