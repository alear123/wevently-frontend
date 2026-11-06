import dominio from '../../../../../common/API';
// src/api/VerDetalleLugarApi.js
const API_BASE_URL = `${dominio}/api/lugares`;

/**
 * 🔹 Obtiene el detalle de un lugar por su ID
 * Endpoint: GET /api/lugares/verDetalleLugar/{idLugar}
 */
export async function getDetalleLugar(idLugar) {
  try {
    const response = await fetch(`${API_BASE_URL}/verDetalleLugar/${idLugar}`);

    if (!response.ok) {
      throw new Error(`Error al obtener el detalle del lugar (status: ${response.status})`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en getDetalleLugar:", error);
    throw error;
  }
}

/**
 * 🔹 (Opcional) Obtiene los eventos posibles según fecha, lugar y usuario
 * Endpoint ejemplo: GET /api/lugares/eventosPosibles?idLugar=1&fecha=2025-10-10&email=user@gmail.com
 */
export async function getEventosPosibles(idLugar, fecha) {
  try {
    const token = localStorage.getItem("token"); 
    const formattedDate = new Date(fecha).toISOString().split("T")[0]; // yyyy-MM-dd
    const response = await fetch (
      `${API_BASE_URL}/obtenerEventosDisponibles/${formattedDate}/${idLugar}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, 
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Error al obtener eventos posibles (status: ${response.status})`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en getEventosPosibles:", error);
    throw error;
  }
}

/**
 * 🔹 (Opcional) Inicia una reserva
 * Endpoint: PUT /api/lugares/iniciarReserva
 * Body: { idEvento, idLugar, fechaReserva }
 */
export async function iniciarReserva(dtoIniciarReserva) {
  try {
    const token = localStorage.getItem("token"); // si usás JWT
    const response = await fetch(`${API_BASE_URL}/iniciarReserva`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify(dtoIniciarReserva),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "Error al iniciar la reserva");
    }

    const text = await response.text();
    const idReserva = Number(text);

    return idReserva;
  } catch (error) {
    console.error("Error en iniciarReserva:", error);
    throw error;
  }
}
