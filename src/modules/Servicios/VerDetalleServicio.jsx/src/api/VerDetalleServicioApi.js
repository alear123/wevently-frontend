const API_URL = "http://localhost:8080/api/servicios"; // tu backend

export const getDetalleServicio = async (idServicio) => {
  const res = await fetch(`${API_URL}/verDetalleServicio/${idServicio}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    },
  });
  if (!res.ok) {
    throw new Error("Error al obtener el servicio: " + res.status);
  }
  return await res.json();
};

export const obtenerEventosDisponibles = async (fecha,idServicio) => {
  try {
    const token = localStorage.getItem("token"); 
    const response = await fetch(
      `${API_URL}/obtenerEventosDisponibles/${fecha}/${idServicio}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, 
        },
      }
    );
    if (!response.ok) {
      throw new Error(`Error al obtener eventos posibles (status: ${response.status})`);
    }
    const data = await response.json();
    return data; // Esto será un array de DtoEventoDisponible
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const iniciarChat = async ({ idServicio, idEvento, fechaReserva }) => {
  try {
    const token = localStorage.getItem("token"); 

    // Formatear fecha a yyyy-MM-dd
    const formattedDate = new Date(fechaReserva).toISOString().split("T")[0];

    const body = {
      idServicio,
      idEvento,
      fechaReserva: formattedDate
    };

    const res = await fetch(`${API_URL}/iniciarChat`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) throw new Error("Error al iniciar chat");

    const chatId = await res.json();
    return chatId; // Devuelve el ID del chat creado
  } catch (err) {
    console.error(err);
    return null;
  }
};