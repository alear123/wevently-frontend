const serviciosServices = () => {
    const BASE_URL = "http://localhost:8080/api"

    // Obtengo el token desde el almacenamiento (ejemplo localStorage)
    const getToken = () => localStorage.getItem("token");

    // Función para armar headers con el token
    const authHeaders = () => ({
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`
    });


    const obtenerDtosServicio = async () => {
        try {
            const response = await fetch(`${BASE_URL}/servicios/obtenerDtosServicio`, {
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

    const getMyServices = async () => {
        try {
            const response = await fetch(`${BASE_URL}/servicios/getMisServicios`, {
                method: "GET",
                headers: authHeaders()
            })

        const data = await response.json();

            if (!response.ok) {
                const errorMsg = data?.error || "Error en la petición";
                throw new Error(errorMsg);
            }

        return data;

        } catch (error) {
            console.error("Error obteniendo los dtos:", error);
            throw error;
        }
    };

    const crearServicio = async (servicio) => {
        try {
            const response = await fetch(`${BASE_URL}/servicios/crearServicio`, {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify(servicio)
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMsg = data?.error || "Error en la petición";
                throw new Error(errorMsg);
            }

            return data;

        } catch (error) {
            console.error("Error creando el servicio:", error);
            throw error;
        }
    };

    const modificarServicio = async (servicio) => {
        try {
            const response = await fetch(`${BASE_URL}/servicios/modificarServicio`, {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify(servicio)
            });
            const data = await response.json();

            if (!response.ok) {
                const errorMsg = data?.error || "Error en la petición";
                throw new Error(errorMsg);
            }

            return data;
        } catch (error) {
            console.error("Error modificando el servicio:", error);
            throw error;
        }
    };

    const bajaLogicaServicio = async (idServicio) => {
        try {
            const response = await fetch(`${BASE_URL}/servicios/bajaServicio/${idServicio}`, {
                method: "PUT",
                headers: authHeaders(),
            });
            const data = await response.json();

            if (!response.ok) {
                const errorMsg = data?.error || "Error en la petición";
                throw new Error(errorMsg);
            }

            return data;
        }
        catch (error) {
            console.error("Error en la baja lógica del servicio:", error);
            throw error;
        }
    };

    const getMisNombresServicios = async () => {
        try {
            const response = await fetch(`${BASE_URL}/servicios/getMisNombresServicios`, {
                method: "GET",
                headers: authHeaders()
            })

        const data = await response.json();

            if (!response.ok) {
                const errorMsg = data?.error || "Error en la petición";
                throw new Error(errorMsg);
            }

        return data;

        } catch (error) {
            console.error("Error obteniendo los dtos:", error);
            throw error;
        }
    };

    const getMisReservas = async () => {
        try {
            const response = await fetch(`${BASE_URL}/reservas/mis-reservas-servicio`, {
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

    const getMisNombresServicio = async () => {
        try {
            const response = await fetch(`${BASE_URL}/servicios/getMisNombresServicio`, {
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
    

    return { obtenerDtosServicio, obtenerLocalidades, 
        obtenerProvincias, obtenerDtosTipoServicio, 
        getMyServices , crearServicio, 
        modificarServicio, bajaLogicaServicio
     , getMisNombresServicios, getMisReservas
    ,getMisNombresServicio  };


}
export default serviciosServices;