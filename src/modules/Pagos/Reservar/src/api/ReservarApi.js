import dominio from '../../../../../common/API';
const API_URL = `${dominio}/api/reservas`; // ajustá la URL base según tu backend

// 🔹 Obtener datos para el formulario de reserva
export const getDatosFormularioReserva = async (idReserva) => {
  try {
    const token = localStorage.getItem("token"); // si usás autenticación JWT

    const response = await fetch(`${API_URL}/datosFormularioReserva/${idReserva}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error("Error al obtener los datos del formulario de reserva");
    }

    return await response.json();
  } catch (error) {
    console.error("Error en getDatosFormularioReserva:", error);
    throw error;
  }
};

export const reservaAPagar = async (dtoFormulario) => {
  try {
    const response = await fetch(`${API_URL}/reservaAPagar`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`, 
      },
      body: JSON.stringify(dtoFormulario),
    });

    if (!response.ok) {
      throw new Error("Error al generar la reserva para pagar");
    }

    const data = await response.json();
    return data; // devuelve un DtoReservaApagar
  } catch (error) {
    console.error("Error en reservaAPagar:", error);
    throw error;
  }
};
