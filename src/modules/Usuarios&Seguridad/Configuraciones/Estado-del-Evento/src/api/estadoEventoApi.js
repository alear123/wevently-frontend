import dominio from "../../../../../../common/API";

const API_URL = `${dominio}/api/estado-del-evento`;

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };
}

export async function getEstadosEvento() {
  const res = await fetch(API_URL, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Error al obtener estados del evento");
  }
  return res.json();
}

export async function crearEstadoEvento(nombre) {
  const body = {
    nombre,
    fechaHoraAlta: new Date().toISOString(),
  };
  const res = await fetch(API_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Error al crear estado del evento");
  }
  return res.json();
}

export async function modificarEstadoEvento(id, nombre) {
  const body = {
    nombre,
    fechaHoraAlta: new Date().toISOString(),
  };
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Error al modificar estado del evento");
  }
  return res.json();
}

export async function eliminarEstadoEvento(id) {
  const res = await fetch(`${API_URL}/baja/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Error al dar de baja el estado del evento");
  }
}

export async function darDeBajaEstadoEvento(id) {
  try {
    const response = await fetch(`${API_URL}/baja-estadoevento/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
    });

    const text = await response.text();
    let data;

    try {
      data = JSON.parse(text);
    } catch {
      data = { mensaje: text };
    }

    if (!response.ok) {
      throw new Error(data.error || data.mensaje || "Error al dar de baja el estado del evento");
    }

    return data;
  } catch (error) {
    console.error("Error en darDeBajaEstadoEvento:", error);
    throw error;
  }
}

export async function habilitarEstadoEvento(id) {
  try {
    const response = await fetch(`${API_URL}/habilitar-estadoevento/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
    });

    const text = await response.text();
    let data;

    try {
      data = JSON.parse(text);
    } catch {
      data = { mensaje: text };
    }

    if (!response.ok) {
      throw new Error(data.error || data.mensaje || "Error al habilitar el estado del evento");
    }

    return data;
  } catch (error) {
    console.error("Error en habilitarEstadoEvento:", error);
    throw error;
  }
}
