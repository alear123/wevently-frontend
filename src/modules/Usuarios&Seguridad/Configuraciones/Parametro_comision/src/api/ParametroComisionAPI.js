import dominio from '../../../../../../common/API';
const BASE_URL = `${dominio}`

export const obtenerDisponibles = async () => {
    try {
        const response = await fetch(`${BASE_URL}/api/parametro-comision`, {
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
        console.error('error obteniendo los estados: ', error);
        throw error;
    }
};

export const crearNuevo = async (datos) => {
    try {
        
        console.log('🔧 Datos antes de stringify:', datos);

        const response = await fetch(`${BASE_URL}/api/parametro-comision`, {
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
        console.error('error creando el estado: ', error);
        throw error;
    }
};

export const actualizarUno = async (id, datos) => {
    try {
        console.log('Enviando actualización:', { id, datos }); // Debug

        const response = await fetch(`${BASE_URL}/api/parametro-comision/${id}`, {
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
        console.error('error actualizando el estado: ', error);
        throw error;
    }
}

export const darDeBajaUno = async (id) => {
    try {
        const response = await fetch(`${BASE_URL}/api/parametro-comision/baja/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem("token")}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            const errorMessage = errorData.error || errorData.message || `HTTP error! status: ${response.status}`;
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        console.error('error dando de baja el estado: ', error);
        throw error;
    }
};