import dominio from '../../../../../../common/API'; 
//const HOST = 'http://localhost:8080';
const BASE_URL = `${dominio}/api/pagos`;


export const obtenerMediosDisponibles = async() => {
    try {
        const respuesta = await fetch(`${BASE_URL}/disponibles`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            //falta lo del cors
        });

        if(!respuesta.ok){
            throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`);
        }

        const data = await respuesta.json();
        console.log(data);
        return {success: true, data};
    } catch (error) {
        console.error('Error al obtener los medios disponibles: ', error);
        return {
            success: false,
            error: error.message || 'Error al obtener los medios de pago'
        };
    }
};

export const cambiarVisibilidadMedio = async (id) => {
    try {
        const respuesta = await fetch(`${BASE_URL}/${id}/cambiar-visibilidad`, {
            method: 'PUT',
            headers: {
                'Content-type': 'application/json',
                'Accept': 'application/json',
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            //falta lo del cors
        });

        if(!respuesta.ok){
            throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`);
        }

        const data = await respuesta.json();
        return {success: true, data};
    } catch (error) {
        console.error('Error al cambiar la visibilidad:', error);
        return { 
            success: false, 
            error: error.message || 'Error al cambiar la visibilidad del medio de pago' 
        };
    }
};


export const sincronizarConProveedor = async () => {
    try {
        const respuesta = await fetch(`${BASE_URL}/sincronizar`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            //falta lo del cors
        });

        if(!respuesta.ok){
            throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`);
        }

        return {success: true};
    } catch (error) {
        console.error('Error al sincronizar con el proveedor:', error);
        return {
            success: false,
            error: error.message || 'Error al sincronizar idk'
        };
    }
};