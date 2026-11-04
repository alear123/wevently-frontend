import { TiArrowSyncOutline } from 'react-icons/ti';
import dominio from '../../../../../../common/API'; 

const BASE_URL = `${dominio}/api/auditoriaTransaccion`;


export const obtenerTranferenciasPendientes = async() => {
    try {
        const url = `${BASE_URL}/transferencias-pendientes`;
        const respuesta = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type' : 'application/json',
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });

        if(!respuesta.ok){
            throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`);
        }

        const data = await respuesta.json();
        console.log(data);
        return {success: true, data};
    } catch (error) {
        console.error('Error al obtener las transferencias pendientes: ', error);
        return {
            success: false,
            error: error.message || 'Error al obtener las transferencias pendientes'
        };
    }
};


export const confirmarTransferencia = async(id) => {
    try {
        const url = `${BASE_URL}/confirmar-transferencia/${id}`;
        const respuesta = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type' : 'application/json',
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });

        if(!respuesta.ok){
            throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`);
        }


        let data = null;
        if(respuesta.status !== 204) {
            data = await respuesta.json();
        }

        return {success: true, data};
    } catch (error) {
        console.error('Error al confirmar transferencia: ', error);
        return {
            success: false,
            error: error.message || 'Error al confirmar transferencias pendientes'
        };
    }
};