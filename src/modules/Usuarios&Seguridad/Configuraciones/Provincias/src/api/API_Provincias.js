import dominio from '../../../../../../common/API';
const BASE_URL = `${dominio}`;

export const obtenerDisponibles = async () => {
    try {
        const response = await fetch(`${BASE_URL}/api/provincias/TODAS`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem("token")}`,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error obteniendo provincias: ', error);
        throw error;
    }
};

export const crearNuevo = async (datos) => {
    try {
        const response = await fetch(`${BASE_URL}/api/provincias`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify(datos),
        });

        if (!response.ok) {
            const errorData = await response.json();
            const errorMessage = errorData.error || errorData.message || `HTTP error! status: ${response.status}`;
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        console.error('Error creando provincia: ', error);
        throw error;
    }
};

export const actualizarUno = async (id, datos) => {
    try {
        const response = await fetch(`${BASE_URL}/api/provincias/actualizar/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify(datos),
        });

        if (!response.ok) {
            const errorData = await response.json();
            const errorMessage = errorData.error || errorData.message || `HTTP error! status: ${response.status}`;
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        console.error('Error actualizando provincia: ', error);
        throw error;
    }
};

// NUEVO: Dar de baja con validación
export const darDeBajaUno = async (id) => {
    try {
        const response = await fetch(`${BASE_URL}/api/provincias/dardebaja/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem("token")}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            // Si es 409 (CONFLICT), devolver el objeto con exitoso:false
            if (response.status === 409) {
                return data; // { exitoso: false, mensaje: "...", cantidadLocalidades: X }
            }
            throw new Error(data.mensaje || 'Error al dar de baja');
        }

        return data; // { exitoso: true, mensaje: "..." }
    } catch (error) {
        console.error('Error dando de baja provincia: ', error);
        throw error;
    }
};

// NUEVO: Dar de alta nuevamente
export const darDeAltaUno = async (id) => {
    try {
        const response = await fetch(`${BASE_URL}/api/provincias/darDeAltaAgain/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem("token")}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al dar de alta');
        }

        return await response.json();
    } catch (error) {
        console.error('Error dando de alta provincia: ', error);
        throw error;
    }
};
