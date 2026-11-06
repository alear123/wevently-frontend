import HOST from '../../../../../common/API'

const BASE_URL = `${HOST}`
// Se arma en cada request para usar siempre el token actual
const configuracionBase = () => ({
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem("token")}`
    },
})



// Manejo de respuestas HTTP
export const manejarRespuesta = async (response) => {
    if (!response.ok) {
        const errorText = await response.text();
        let errorData = {};
        try {
            errorData = JSON.parse(errorText);
        } catch {
            errorData = {};
        }
        throw new Error(errorData.message || errorText || `Error HTTP: ${response.status}`);
    }
    const text = await response.text();
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
};

// Obtener medios de pago disponibles
export const obtenerMediosDePagoDisponibles = async () => {
    try {
        const response = await fetch(`${BASE_URL}/api/pagos/disponibles`, {
            method: 'GET',
            ...configuracionBase()
        })

        return await manejarRespuesta(response)
    } catch (error) {
        console.error('Error obteniendo medios de pago:', error)
        throw error
    }
}

// Crear preferencia de MercadoPago
export const crearPreferenciaMercadoPago = async (datosPreferencia) => {
    try {
        const response = await fetch(`${BASE_URL}/api/pagos/crear-preferencia`, {
            method: 'POST',
            ...configuracionBase(),
            body: JSON.stringify(datosPreferencia),
        })
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Respuesta del backend:', result);
        
        return result;
    } catch (error) {
        console.error('Error creando preferencia MercadoPago:', error)
        throw error
    }
}

// Procesar pago con token de tarjeta
export const procesarPagoConToken = async (datosPago) => {
    try {
        const response = await fetch(`${BASE_URL}/api/pagos/procesar-pago`, {
            method: 'POST',
            ...configuracionBase(),
            body: JSON.stringify(datosPago),
        })

        return await manejarRespuesta(response)
    } catch (error) {
        console.error('Error procesando pago:', error)
        throw error
    }
}

export const confirmarReserva = async (DatosReservaDTO) => {
    console.log(DatosReservaDTO);
    try {
        const response = await fetch(`${BASE_URL}/api/reservas/confirmar-reserva`, {
            method: 'PUT',
            ...configuracionBase(),
            body: JSON.stringify(DatosReservaDTO),
        })

        console.log(response);

        return await manejarRespuesta(response)
    } catch (error) {
        console.error('Error confirmando la reserva:', error)
        throw error
    }
};

