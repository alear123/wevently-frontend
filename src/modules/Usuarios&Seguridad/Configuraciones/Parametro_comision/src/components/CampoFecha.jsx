import React, { useState, useRef, useEffect } from "react";
// Se eliminó react-datepicker: ahora usamos el selector nativo HTML (type=date)
// Estilos migrados a abm-shared.css y se mantiene la clase `abm-datepicker`.

const CampoFecha = ({
    value,
    onChange,
    placeholder = 'dd/mm/aaaa',
    minDate = null,
    maxDate = null,
    className = "",
    disabled = false
}) => {
    const [type, setType] = useState('text');
    const inputRef = useRef(null);

    useEffect(() => {
        // guard: if browser supports showPicker we could call it when switching to date
    }, []);

    const toInputValue = (val) => {
        if (!val) return '';
        const d = val instanceof Date ? val : new Date(val);
        if (isNaN(d.getTime())) return '';
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };

    const toDisplay = (val) => {
        if (!val) return '';
        const d = val instanceof Date ? val : new Date(val);
        if (isNaN(d.getTime())) return '';
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${day}/${m}/${y}`;
    };

    const handleFocus = () => {
        if (disabled) return;
        setType('date');
        // try to open native picker if available
        setTimeout(() => {
            try { inputRef.current?.showPicker?.(); } catch (e) { /* ignore */ }
        }, 0);
    };

    const handleBlur = () => {
        // keep behavior simple: show display format when not focused
        setType('text');
    };

    const handleChange = (e) => {
        const val = e.target.value;
        if (!val) {
            onChange && onChange(null);
            return;
        }

        if (type === 'date') {
            // yyyy-mm-dd -> create Date at midnight
            const d = new Date(`${val}T00:00:00`);
            const fecha = isNaN(d.getTime()) ? null : d;
            onChange && onChange(fecha);
            // cerrar el selector nativo y volver a mostrar formato texto
            setType('text');
            try { inputRef.current?.blur(); } catch (e) { /* ignore */ }
        } else {
            // user typed text (dd/mm/yyyy) - try parse
            const parts = val.split('/');
            if (parts.length === 3) {
                const [day, month, year] = parts;
                const d = new Date(`${year}-${month}-${day}T00:00:00`);
                onChange && onChange(isNaN(d.getTime()) ? null : d);
            } else {
                // fallback: pass raw value
                onChange && onChange(val);
            }
        }
    };

    const minAttr = toInputValue(minDate) || undefined;
    const maxAttr = toInputValue(maxDate) || undefined;
    const inputValue = type === 'date' ? toInputValue(value) : (value ? toDisplay(value) : '');
    // Mostrar placeholder de formato consistente (dd/mm/aaaa) cuando está vacío
    const displayPlaceholder = 'dd/mm/aaaa';

    return (
        <input
            ref={inputRef}
            type={type}
            value={inputValue}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            placeholder={displayPlaceholder}
            min={minAttr}
            max={maxAttr}
            className={`abm-datepicker ${className}`}
            disabled={disabled}
        />
    );
};

export default CampoFecha;