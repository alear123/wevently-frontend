import dominio from "../../../../../../common/API";

const API_URL = `${dominio}/api/tipo-de-servicio`;

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };
}

export async function getTiposServicio() {
  const res = await fetch(API_URL, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Error al obtener tipos de servicio");
  }
  return res.json();
}

export async function crearTipoServicio(nombre) {
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
    throw new Error(error.error || "Error al crear tipo de servicio");
  }
  return res.json();
}

export async function modificarTipoServicio(id, nombre) {
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
    throw new Error(error.error || "Error al modificar tipo de servicio");
  }
  return res.json();
}

export async function eliminarTipoServicio(id) {
  const res = await fetch(`${API_URL}/baja/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Error al dar de baja el tipo de servicio");
  }
}
