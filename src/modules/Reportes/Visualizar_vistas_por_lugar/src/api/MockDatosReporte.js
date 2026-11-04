// Estructura de datos corregida según criterios de aceptación
export const reporteMock = [
    {
        id: 1,
        nombrelugar: "Playa Sol",
        localidad: "Mar del Plata",
        datos: [
            { fecha: "2025-08-01", cantidad: 23 },
            { fecha: "2025-08-02", cantidad: 17 },
            { fecha: "2025-08-03", cantidad: 0 },
            { fecha: "2025-08-04", cantidad: 45 },
            { fecha: "2025-08-05", cantidad: 12 }
        ]
    },
    {
        id: 2,
        nombrelugar: "Fondo de bikini",
        localidad: "Puerto Madryn",
        datos: [
            { fecha: "2025-08-01", cantidad: 34 },
            { fecha: "2025-08-02", cantidad: 0 },
            { fecha: "2025-08-03", cantidad: 19 },
            { fecha: "2025-08-04", cantidad: 8 },
            { fecha: "2025-08-05", cantidad: 27 }
        ]
    },
    {
        id: 3,
        nombrelugar: "Parque Central",
        localidad: "Buenos Aires",
        datos: [
            { fecha: "2025-08-01", cantidad: 10 },
            { fecha: "2025-08-02", cantidad: 12 },
            { fecha: "2025-08-03", cantidad: 18 },
            { fecha: "2025-08-04", cantidad: 0 },
            { fecha: "2025-08-05", cantidad: 6 }
        ]
    },
    {
        id: 4,
        nombrelugar: "Lago Espejo",
        localidad: "Bariloche",
        datos: [
            { fecha: "2025-08-01", cantidad: 0 },
            { fecha: "2025-08-02", cantidad: 3 },
            { fecha: "2025-08-03", cantidad: 5 },
            { fecha: "2025-08-04", cantidad: 7 },
            { fecha: "2025-08-05", cantidad: 9 }
        ]
    },
    {
        id: 5,
        nombrelugar: "Plaza Mayor",
        localidad: "Córdoba",
        datos: [
            { fecha: "2025-08-01", cantidad: 25 },
            { fecha: "2025-08-02", cantidad: 30 },
            { fecha: "2025-08-03", cantidad: 28 },
            { fecha: "2025-08-04", cantidad: 40 },
            { fecha: "2025-08-05", cantidad: 15 }
        ]
    }
];

export const mediosDePagoMockAPI = {
    obtenerDatos: ({ fechaDesde, fechaHasta }) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const desde = new Date(fechaDesde);
                const hasta = new Date(fechaHasta);

                // Filtrar datos por rango de fechas
                const dataFiltrada = reporteMock.map(lugar => ({
                    ...lugar,
                    datos: lugar.datos.filter(d => {
                        const f = new Date(d.fecha);
                        return f >= desde && f <= hasta;
                    })
                })).filter(lugar => lugar.datos.length > 0); // Solo lugares con datos

                resolve(dataFiltrada);
            }, 800);
        });
    }
};