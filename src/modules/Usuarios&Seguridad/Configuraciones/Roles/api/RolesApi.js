import axios from "axios";
import dominio from "../../../../../common/API";
import * as Utils from '../../../../../common/Utils'
const BASE_URL = `${dominio}/api/seguridad/roles`;
const GRUPOS_URL = `${dominio}/api/seguridad/grupos`;

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };
}

export async function getRoles(
  page = 1,
  size = 10,
  estado = "",
  busqueda = ""
) {
  // Convierte filtroEstado a string "true"/"false" si es booleano
  let estadoParam =
    estado === true ? "true" : estado === false ? "false" : estado;
  const params = new URLSearchParams({
    page: page - 1,
    size,
    ...(estadoParam && { estado: estadoParam }),
    ...(busqueda && { busqueda }),
  });
  const res = await fetch(`${BASE_URL}?${params}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Error al obtener roles");
  return await res.json();
}

export async function crearRol(dto) {
  const res = await fetch(`${BASE_URL}/nuevo`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export async function editarRol(id, dto) {
  console.log("Enviando edición de rol:", id, dto); // <-- SOLO ESTE LOG
  try {
    const res = await axios.put(`${BASE_URL}/${id}/actualizar`, dto, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error al editar el rol");
  }
}

export async function eliminarRol(id) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return { ok: res.ok };
}

export async function cambiarEstadoRol(id, activo) {
  const res = await fetch(`${BASE_URL}/${id}/estado?activo=${activo}`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });
  return { ok: res.ok };
}

export async function getGrupos() {
  const res = await fetch(GRUPOS_URL, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Error al obtener grupos");
  return await res.json();
}

export async function getPantallasInicioPosibles(rol) {
  const params = new URLSearchParams();
  const res = await fetch(`${BASE_URL}/pantallas-inicio-posibles?rol=${rol}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Error al obtener pantallas de inicio posibles");
  return await res.json();
}

export async function getPantallasInicioPorGrupos(gruposIds) {
  const params = new URLSearchParams();
  gruposIds.forEach((id) => params.append("gruposIds", id));
  const res = await fetch(`${BASE_URL}/pantallas-inicio-posibles-por-grupos?${params}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Error al obtener pantallas de inicio posibles");
  return await res.json();
}
