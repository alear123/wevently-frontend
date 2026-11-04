import dominio from "../../../../../../common/API";

const API_URL = `${dominio}/api/caracteristicas-de-lugar`;

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };
}

export async function getCaracteristicasLugar() {
  const res = await fetch(API_URL, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(
      error.error || "Error al obtener características del lugar"
    );
  }
  return res.json();
}

export async function crearCaracteristicaLugar(nombre) {
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
    throw new Error(error.error || "Error al crear característica del lugar");
  }
  return res.json();
}

export async function modificarCaracteristicaLugar(id, nombre) {
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
    throw new Error(
      error.error || "Error al modificar característica del lugar"
    );
  }
  return res.json();
}

export async function eliminarCaracteristicaLugar(id) {
  const res = await fetch(`${API_URL}/baja/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(
      error.error || "Error al dar de baja la característica del lugar"
    );
  }
}
