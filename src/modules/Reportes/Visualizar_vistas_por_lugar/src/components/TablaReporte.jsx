export default function TablaReporte({ datos, tipoAgrupacion, tituloTabla }) {
    if(!datos || datos.length === 0) {
        return(
            <div className="tabla-sin-datos">
                <p>No hay datos disponibles para mostrar en la tabla</p>
            </div>
        );
    }

    const formatearFecha = (fecha) => {
        if (!fecha) return '';
        if (/^\d{4}-\d{2}$/.test(fecha)) {
            const [y,m] = fecha.split('-');
            const d = new Date(Number(y), Number(m)-1, 1);
            return d.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
        }
        const fechaObj = new Date(fecha + 'T00:00:00');
        if (!isNaN(fechaObj)) return fechaObj.toLocaleDateString('es-AR');
        return fecha;
    };

    const obtenerEncabezadoFecha = () => {
        switch (tipoAgrupacion) {
            case 'semana': return 'Semana';
            case 'mes': return 'Mes';
            default: return 'Fecha';
        }
    };

    // Determinar si mostrar columna de lugares
    const mostrarColumnaLugares = datos.some(item => item.lugares && item.lugares.includes(','));

    return(
        <div className="tabla-reporte-container">
            <h3 className="tabla-titulo">{tituloTabla}</h3>
            <table className="tabla-reporte">
                <thead>
                    <tr>
                        <th>{obtenerEncabezadoFecha()}</th>
                        <th style={{ textAlign: 'right' }}>Cantidad</th>
                        {mostrarColumnaLugares && <th>Lugares</th>}
                    </tr>
                </thead>
                <tbody>
                    {datos.map((item, index) => (
                        <tr key={index}>
                            <td>{formatearFecha(item.fecha)}</td>
                            <td style={{ textAlign: 'right' }}>{item.cantidad.toLocaleString('es-AR')}</td>
                            {mostrarColumnaLugares && <td>{item.lugares}</td>}
                        </tr>
                    ))}
                    <tr className="tabla-total">
                        <td><strong>Total</strong></td>
                        <td style={{ textAlign: 'right' }}>
                            <strong>{datos.reduce((sum, item) => sum + item.cantidad, 0).toLocaleString('es-AR')}</strong>
                        </td>
                        {mostrarColumnaLugares && <td></td>}
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
