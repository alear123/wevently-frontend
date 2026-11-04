import React, { useMemo } from "react";
import '../assets/Reporte.css';
import useSort from '../../../../Usuarios&Seguridad/Configuraciones/src/hooks/useSort';

function parseFechaLocal(fechaStr) {
    if (!fechaStr) return null;
    const [y, m, d] = fechaStr.split('-');
    return new Date(Number(y), Number(m) - 1, Number(d), 0, 0, 0, 0);
}

function fechaToDDMMYYYY(fechaStr) {
    const d = parseFechaLocal(fechaStr);
    if (!d || isNaN(d.getTime())) return "";
    return d.toLocaleDateString('es-AR');
}

export default function TablaReporte({ datos, tipoAgrupacion, tituloTabla }) {
    if (!datos || datos.length === 0) {
        return (
            <div className="tabla-sin-datos">
                <p>No hay datos disponibles para mostrar en la tabla</p>
            </div>
        );
    }

        const normalizar = (item) => {
            // Asegurar campos explícitos para sort: timestamp numérico y cantidad numérica
            let fechaTs = null;
            if (item.fecha) {
                const d = new Date(item.fecha);
                if (!isNaN(d)) fechaTs = d.getTime();
            }
            const cantidadNum = item.cantidad ?? item.value ?? item.usuarios ?? 0;
            return { ...item, __fechaTs: fechaTs, __cantidadNum: cantidadNum };
        };

    const datosNormalizados = useMemo(() => datos.map(normalizar), [datos]);

    const { sortedItems, sortConfig, handleSort } = useSort(datosNormalizados, {
        storageKey: 'reportes:usuariosactivos:sort'
    });

    const formatearFecha = (fecha) => fechaToDDMMYYYY(fecha);


    const obtenerEncabezadoFecha = () => {
        switch (tipoAgrupacion) {
            case 'semana': return 'Semana';
            case 'mes': return 'Mes';
            default: return 'Fecha';
        }
    };

        const iconoSort = (key) => {
        if (sortConfig.key !== key) return '↕';
        if (sortConfig.direction === 'asc') return '▲';
        if (sortConfig.direction === 'desc') return '▼';
        return '↕';
    };

    return (
        <div className="tabla-reporte-container">
            <table className="tabla-reporte">
                <thead>
                    <tr>
                                    <th onClick={() => handleSort('__fechaTs')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                {obtenerEncabezadoFecha()}
                                            <span className={sortConfig.key === '__fechaTs' ? 'sort-icon-active' : 'sort-icon-neutral'}>{iconoSort('__fechaTs')}</span>
                            </span>
                        </th>
                        <th onClick={() => handleSort('__cantidadNum')} style={{ cursor: 'pointer', userSelect: 'none', textAlign: 'right' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                {tituloTabla}
                                <span className={sortConfig.key === '__cantidadNum' ? 'sort-icon-active' : 'sort-icon-neutral'}>{iconoSort('__cantidadNum')}</span>
                            </span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {sortedItems.map((item, idx) => (
                        <tr key={idx}>
                            <td>{formatearFecha(item.fecha)}</td>
                            <td style={{ textAlign: 'right' }}>{(item.cantidad ?? item.value ?? item.usuarios ?? 0).toLocaleString('es-AR')}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
