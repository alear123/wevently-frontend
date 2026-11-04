import dominio from "../../../../../../common/API";

const API_URL = `${dominio}/api/tipo-de-lugar`;

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };
}

export async function getTiposLugar() {
  const res = await fetch(API_URL, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Error al obtener tipos de lugar");
  }
  return res.json();
}

export async function crearTipoLugar(nombre) {
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
    throw new Error(error.error || "Error al crear tipo de lugar");
  }
  return res.json();
}

export async function modificarTipoLugar(id, nombre) {
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
    throw new Error(error.error || "Error al modificar tipo de lugar");
  }
  return res.json();
}

export async function eliminarTipoLugar(id) {
  const res = await fetch(`${API_URL}/baja/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Error al dar de baja el tipo de lugar");
  }
}
