import dominio from '../../../../common/API';
const LugaresServices = () => {
    const BASE_URL = `${dominio}/api`
    
    // Obtengo el token desde el almacenamiento
    const getToken = () => localStorage.getItem("token");

    // Función para armar headers con el token
    const authHeaders = () => ({
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`
    });


    
    const obtenerDtoLugares = async () => {
        try {
            const response = await fetch(`${BASE_URL}/lugares/obtenerDtoLugares`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"}
            });

            if (!response.ok) {
            throw new Error("Error en la petición: " + response.status);
            }

            return await response.json();
        } catch (error) {
            console.error("Error obteniendo los dtos:", error);
            throw error;
        }
    };

    const obtenerLocalidades = async () => {
        try {
            const response = await fetch(`${BASE_URL}/localidades`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"}
            });

            if (!response.ok) {
            throw new Error("Error en la petición: " + response.status);
            }

            return await response.json();
        } catch (error) {
            console.error("Error obteniendo los dtos:", error);
            throw error;
        }
    };

    const obtenerProvincias = async () => {
        try {
            const response = await fetch(`${BASE_URL}/provincias/obtenerDtosProvincia`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"}
            });

            if (!response.ok) {
            throw new Error("Error en la petición: " + response.status);
            }

            return await response.json();
        } catch (error) {
            console.error("Error obteniendo los datos:", error);
            throw error;
        }
    };

    const obtenerDtosTipoLugar = async () => {
        try {
            const response = await fetch(`${BASE_URL}/tipo-de-lugar/obtenerDtosTipoLugar`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"}
            });

            if (!response.ok) {
            throw new Error("Error en la petición: " + response.status);
            }

            return await response.json();
        } catch (error) {
            console.error("Error obteniendo los datos:", error);
            throw error;
        }
    };

    const getTiposEvento = async () => {
        try {
            const response = await fetch(`${BASE_URL}/tipo-de-evento`, {
                method: "GET",
                headers: authHeaders()
            })

        if (!response.ok) {
            throw new Error("Error en la petición: " + response.status);
            }

            return await response.json();
        } catch (error) {
            console.error("Error obteniendo los datos:", error);
            throw error;
        }
    };

    const getCaracteristicas = async () => {
        try {
            const response = await fetch(`${BASE_URL}/caracteristicas-de-lugar`, {
                method: "GET",
                headers: authHeaders()
            })

        if (!response.ok) {
            throw new Error("Error en la petición: " + response.status);
            }

            return await response.json();
        } catch (error) {
            console.error("Error obteniendo los datos:", error);
            throw error;
        }
    };


    
    const obtenerDtosTipoServicio = async () => {
        try {
            const response = await fetch(`${BASE_URL}/tipo-de-servicio/obtenerDtosTipoServicio`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"}
            });

            if (!response.ok) {
            throw new Error("Error en la petición: " + response.status);
            }

            return await response.json();
        } catch (error) {
            console.error("Error obteniendo los datos:", error);
            throw error;
        }
    };


    const getMisLugares = async () => {
        try {
            const response = await fetch(`${BASE_URL}/lugares/getMisLugares`, {
                method: "GET",
                headers: authHeaders()
            })

        if (!response.ok) {
            throw new Error("Error en la petición: " + response.status);
            }

            return await response.json();
        } catch (error) {
            console.error("Error obteniendo los dtos:", error);
            throw error;
        }
    };

    const crearLugar = async (lugar) => {
        try {
            const response = await fetch(`${BASE_URL}/lugares/crearLugar`, {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify(lugar)
            });

            const data = await response.json(); // leemos el cuerpo siempre

            if (!response.ok) {
                // Si viene un mensaje del backend, lo mostramos
                const errorMsg = data?.error || "Error en la petición";
                throw new Error(errorMsg);
            }

            return data;
        } catch (error) {
            console.error("Error creando el lugar:", error);
            throw error;
        }
    };

    const modificarLugar = async (lugar) => {
        try {
            const response = await fetch(`${BASE_URL}/lugares/modificarLugar`, {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify(lugar)
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMsg = data?.error || "Error en la petición";
                throw new Error(errorMsg);
            }

            return data;
        } catch (error) {
            console.error("Error modificando el lugar:", error);
            throw error;
        }
    };

    const bajaLogicaLugar = async (idLugar) => {
        try {
            const response = await fetch(`${BASE_URL}/lugares/bajaLugar/${idLugar}`, {
                method: "PUT",
                headers: authHeaders(),
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMsg = data?.error || "Error en la petición";
                throw new Error(errorMsg);
            }

            return data;
        } catch (error) {
            console.error("Error en la baja lógica del lugar:", error);
            throw error;
        }
    };

    const getMisReservas = async () => {
        try {
            const response = await fetch(`${BASE_URL}/reservas/mis-reservas-lugar`, {
                method: "GET",
                headers: authHeaders()
            })

        if (!response.ok) {
            throw new Error("Error en la petición: " + response.status);
            }

            return await response.json();
        } catch (error) {
            console.error("Error obteniendo los dtos:", error);
            throw error;
        }
    };

    const getMisNombresLugar = async () => {
        try {
            const response = await fetch(`${BASE_URL}/lugares/getMisNombresLugar`, {
                method: "GET",
                headers: authHeaders()
            })

        if (!response.ok) {
            throw new Error("Error en la petición: " + response.status);
            }

            return await response.json();
        } catch (error) {
            console.error("Error obteniendo los dtos:", error);
            throw error;
        }
    };

    const getNombresEstadoReserva = async () => {
        try {
            const response = await fetch(`${BASE_URL}/reservas/estados-reserva`, {
                method: "GET",
                headers: authHeaders()
            })

        if (!response.ok) {
            throw new Error("Error en la petición: " + response.status);
            }

            return await response.json();
        } catch (error) {
            console.error("Error obteniendo los dtos:", error);
            throw error;
        }
    };

    
    return { obtenerDtoLugares, obtenerLocalidades, 
        obtenerProvincias, obtenerDtosTipoLugar, 
        getMisLugares, crearLugar, 
        modificarLugar, bajaLogicaLugar, 
        getTiposEvento, getCaracteristicas,
        obtenerDtosTipoServicio, getMisReservas
     , getMisNombresLugar,getNombresEstadoReserva};

}

export default LugaresServices;