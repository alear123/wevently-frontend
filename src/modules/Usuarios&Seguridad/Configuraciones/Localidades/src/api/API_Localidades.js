import dominio from '../../../../../../common/API';
const BASE_URL = `${dominio}`

export const obtenerDisponibles = async () => {
    try {
        const response = await fetch(`${BASE_URL}/api/provincias`, {
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
        console.error('error obteniendo los datos: ', error);
        throw error;
    }
};

export const crearNuevo = async (datos) => {
    try {
        
        console.log('🔧 Datos antes de stringify:', datos);

        const response = await fetch(`${BASE_URL}/api/localidades`, { 
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
        console.error('error creando: ', error);
        throw error;
    }
};

export const SetearProvincia = async (idProvincia, idLocalidad) => {
    try {
        
        const response = await fetch(`${BASE_URL}/api/provincias/${idProvincia}/localidad/${idLocalidad}`, {
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
        console.error('error: ', error);
        throw error;
    }
};

export const actualizarUno = async (id, datos) => {
    try {
        console.log('Enviando actualización:', { id, datos }); //para debug

        const response = await fetch(`${BASE_URL}/api/localidades/${id}`, {
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
        const response = await fetch(`${BASE_URL}/api/localidades/baja/${id}`, {
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


export const darDeBajaLocalidad = async (id) => {
    try {
        const response = await fetch(`${BASE_URL}/api/localidades/dardebaja/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem("token")}`,
            },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.mensaje || 'Error al dar de baja');
        return data;
    } catch (error) {
        throw error;
    }
};

export const darDeAltaLocalidad = async (id) => {
    try {
        const response = await fetch(`${BASE_URL}/api/localidades/darDeAltaAgain/${id}`, {
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
        throw error;
    }
};