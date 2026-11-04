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
    if (!d || isNaN(d.getTime())) return '';
    return d.toLocaleDateString('es-AR');
}

export default function TablaReporte({
    datos = [],
    tipoAgrupacion = "dia",
    tituloTabla = "Cantidad",
    height = 400 // altura de referencia, igual al gráfico principal
}) {
    const datosNormalizados = useMemo(() => {
        if (!datos) return [];
        return datos.map(item => ({
            ...item,
            fechaTs: item.fecha ? parseFechaLocal(item.fecha).getTime() : null,
            cantidadNum: item.cantidad ?? item.value ?? item.usuarios ?? 0
        }));
    }, [datos]);

    return (
        <div
            className="tabla-reporte-container"
            style={{ overflowY: 'auto' }}
        >
            <table className="tabla-reporte">
                <thead>
                    <tr>
                        <th className="col-fecha sort-header">
                            {tipoAgrupacion === "semana" ? "Semana" : tipoAgrupacion === "mes" ? "Mes" : "Fecha"}
                        </th>
                        <th className="col-cantidad sort-header text-right">
                            {tituloTabla}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {datosNormalizados.length === 0 ? (
                        <tr>
                            <td colSpan={2} className="tabla-sin-datos">
                                No hay datos disponibles para mostrar en la tabla
                            </td>
                        </tr>
                    ) : (
                        datosNormalizados.map((item, idx) => (
                            <tr key={idx}>
                                <td>{fechaToDDMMYYYY(item.fecha) || item.label}</td>
                                <td className="text-right">
                                    {item.cantidadNum.toLocaleString("es-AR")}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}