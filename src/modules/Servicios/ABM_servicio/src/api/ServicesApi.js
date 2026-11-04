
// Función para armar headers con el token
const authHeaders = (token) => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
});


const servicesApi = () => {
    const BASE_URL = "http://localhost:8080/api"
    
    // Obtengo el token desde el almacenamiento
    const getToken = () => localStorage.getItem("token");

    const getMyServices = async () => {
        try {
            const response = await fetch(`${BASE_URL}/servicios/getMisServicios`, {
                method: "GET",
                headers: authHeaders(getToken())
            })

        if (!response.ok) {
            throw new Error("Error en la petición: " + response.status);
            }

            return await response.json();
        } catch (error) {
            console.error("Error obteniendo los dtos:", error);
            throw error;
        }
    }

  return (
    {getMyServices}
  )
}

export default servicesApi
