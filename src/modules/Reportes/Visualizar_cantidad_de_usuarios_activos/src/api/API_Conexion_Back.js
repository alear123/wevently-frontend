// src/api/UsuariosActivosAPI.js

// actualizar cuando funcione el back
// const URL = ?
export const obtenerDatosUsuariosActivos = async (parametros) => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const { fechaDesde, fechaHasta, agrupacion } = parametros;
    
    const datos = generarDatosMock(fechaDesde, fechaHasta, agrupacion);
    
    return datos;
};

function generarDatosMock(fechaDesde, fechaHasta, agrupacion) {
    const inicio = crearFechaLocal(fechaDesde);
    const fin = crearFechaLocal(fechaHasta);
    const datosGrafico = [];
    
    switch (agrupacion) {
        case 'dia':
            generarDatosDiarios(inicio, fin, datosGrafico);
            break;
        case 'semana':
            generarDatosSemanales(inicio, fin, datosGrafico);
            break;
        case 'mes':
            generarDatosMensuales(inicio, fin, datosGrafico);
            break;
        default:
            generarDatosDiarios(inicio, fin, datosGrafico);
    }

    const resumenPeriodos = calcularResumenes(datosGrafico, agrupacion);

    return {
        resumenPeriodos,
        datosGrafico,
        rangoFechas: {
            desde: fechaDesde,
            hasta: fechaHasta
        },
        filtroActual: agrupacion,
        totalUsuarios: datosGrafico.reduce((total, item) => total + item.cantidad, 0)
    };
}

function crearFechaLocal(fechaString) {
    const [año, mes, dia] = fechaString.split('-');
    return new Date(parseInt(año), parseInt(mes) - 1, parseInt(dia));
}

function generarDatosDiarios(inicio, fin, datosGrafico) {
    const fechaActual = new Date(inicio); 
    
    while (fechaActual <= fin) {
        const cantidad = Math.floor(Math.random() * 50000) + 80000;
        
        datosGrafico.push({
            fecha: formatearFechaParaISO(fechaActual), 
            cantidad: cantidad,
            label: fechaActual.toLocaleDateString('es-AR', { 
                day: '2-digit', 
                month: '2-digit' 
            })
        });
        
        fechaActual.setDate(fechaActual.getDate() + 1);
    }
}

function generarDatosSemanales(inicio, fin, datosGrafico) {
    const fechaActual = new Date(inicio);
    
    const diasHastaLunes = fechaActual.getDay() === 0 ? 6 : fechaActual.getDay() - 1;
    fechaActual.setDate(fechaActual.getDate() - diasHastaLunes);
    
    while (fechaActual <= fin) {
        const finSemana = new Date(fechaActual);
        finSemana.setDate(finSemana.getDate() + 6);
        
        const cantidad = Math.floor(Math.random() * 200000) + 500000; 
        
        datosGrafico.push({
            fecha: formatearFechaParaISO(fechaActual),
            cantidad: cantidad,
            label: `${fechaActual.toLocaleDateString('es-AR', { 
                day: '2-digit', 
                month: '2-digit' 
            })} - ${finSemana.toLocaleDateString('es-AR', { 
                day: '2-digit', 
                month: '2-digit' 
            })}`,
            fechaFin: formatearFechaParaISO(finSemana)
        });
        
        fechaActual.setDate(fechaActual.getDate() + 7);
    }
}

function generarDatosMensuales(inicio, fin, datosGrafico) {
    const fechaActual = new Date(inicio.getFullYear(), inicio.getMonth(), 1);
    
    while (fechaActual <= fin) {
        const cantidad = Math.floor(Math.random() * 500000) + 2000000; 
        
        datosGrafico.push({
            fecha: formatearFechaParaISO(fechaActual),
            cantidad: cantidad,
            label: fechaActual.toLocaleDateString('es-AR', { 
                month: 'long', 
                year: 'numeric' 
            })
        });
        
        fechaActual.setMonth(fechaActual.getMonth() + 1);
    }
}

function formatearFechaParaISO(fecha) {
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
}

function calcularResumenes(datosGrafico, agrupacion) {
    if (!datosGrafico.length) return [];

    const total = datosGrafico.reduce((sum, item) => sum + item.cantidad, 0);
    
    const hoy = Math.floor(Math.random() * 50000) + 80000;
    const estaSemana = Math.floor(Math.random() * 200000) + 500000;
    const mesPasado = Math.floor(Math.random() * 500000) + 2000000;

    return [
        {
            periodo: 'hoy',
            valor: hoy,
            icono: '👥',
            descripcion: 'usuarios conectados hoy'
        },
        {
            periodo: 'esta semana',
            valor: estaSemana,
            icono: '📊',
            descripcion: 'usuarios activos esta semana'
        },
        {
            periodo: 'mes pasado',
            valor: mesPasado,
            icono: '📈',
            descripcion: 'total mes anterior'
        }
    ];
}

// ===========================================
// VERSIÓN REAL PARA BACKEND pendiente de probar
// ===========================================

/*
// Cuando tu backend esté listo, reemplaza la función de arriba con esta:

export const obtenerDatosUsuariosActivos = async (parametros) => {
    try {
        const response = await fetch('https://tu-backend.com/api/usuarios-activos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`, 
            },
            body: JSON.stringify(parametros)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const datos = await response.json();
        
       
        if (!datos.datosGrafico || !Array.isArray(datos.datosGrafico)) {
            throw new Error('Estructura de datos inválida recibida del backend');
        }

        return datos;
        
    } catch (error) {
        console.error('Error al obtener datos de usuarios activos:', error);
        throw error; // Re-lanzar el error para que lo maneje el componente
    }
};


function getAuthToken() {
    // Obtener el token desde localStorage, sessionStorage, context, etc.
    return localStorage.getItem('authToken') || '';
}
*/

// ===========================================
// ESTRUCTURA ESPERADA DEL BACKEND
// ===========================================

/*
El backend debe devolver exactamente esta estructura:

{
    "resumenPeriodos": [
        {
            "periodo": "hoy",
            "valor": 125000,
            "icono": "👥",
            "descripcion": "usuarios conectados hoy"
        },
        {
            "periodo": "esta semana", 
            "valor": 850000,
            "icono": "📊",
            "descripcion": "usuarios activos esta semana"
        },
        {
            "periodo": "mes pasado",
            "valor": 2500000,
            "icono": "📈", 
            "descripcion": "total mes anterior"
        }
    ],
    "datosGrafico": [
        {
            "fecha": "2025-07-03",
            "cantidad": 124081,
            "label": "03/07"
        },
        {
            "fecha": "2025-07-04", 
            "cantidad": 107723,
            "label": "04/07"
        }
        // ... más datos
    ],
    "rangoFechas": {
        "desde": "2025-07-03",
        "hasta": "2025-07-27"
    },
    "filtroActual": "dia",
    "totalUsuarios": 2608910
}

IMPORTANTE PARA EL BACKEND:
- Las fechas deben estar en formato "YYYY-MM-DD"
- Los labels deben coincidir exactamente con las fechas !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
- No usar new Date() con strings en el backend sin manejar zonas horarias
- Procesar las fechas como strings 
*/