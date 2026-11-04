export async function getMisEventos() {
  const token = localStorage.getItem("token"); 

  const response = await fetch("http://localhost:8080/api/eventos/mis-eventos", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`, 
    },
  });

  if (!response.ok) {
    throw new Error("Error al obtener los eventos: " + response.status);
  }

  return await response.json();
}

export async function getTiposEvento() {
  const token = localStorage.getItem("token"); 

  const response = await fetch("http://localhost:8080/api/tipo-de-evento", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`, 
    },
  });

  if (!response.ok) {
    throw new Error("Error al obtener los tipos de evento: " + response.status);
  }

  return await response.json();
}

export async function crearEvento(eventoData) {
  const token = localStorage.getItem("token");

  const response = await fetch("http://localhost:8080/api/eventos/nuevo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(eventoData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error al crear el evento: ${response.status} - ${errorText}`);
  }

  return await response.json();
}


export async function editarEvento(eventoId, eventoData) {
  const token = localStorage.getItem("token");

  const response = await fetch(`http://localhost:8080/api/eventos/editar/${eventoId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(eventoData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error al editar el evento: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

export async function cancelarEvento(eventoId) {
  const token = localStorage.getItem("token");

  const response = await fetch(`http://localhost:8080/api/eventos/cancelar/${eventoId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error al cancelar el evento: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

export async function obtenerLugar(eventoId) {
  const token = localStorage.getItem("token");

  const response = await fetch(`http://localhost:8080/api/eventos/obtenerLugar/${eventoId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  //  Si no hay contenido o el servidor devuelve 204
  if (response.status === 204) return null;

  //  Si el body está vacío, evitamos el error
  const text = await response.text();
  if (!text) return null;

  return JSON.parse(text);
}


export async function obtenerServiciosContratados(idEvento) {
  const url = `http://localhost:8080/api/eventos/obtenerServicios/${idEvento}`;
  const token = localStorage.getItem("token");
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error al obtener servicios del evento: ${response.status} - ${errorText}`);
  }

  const data = await res.json();
  return data;
}