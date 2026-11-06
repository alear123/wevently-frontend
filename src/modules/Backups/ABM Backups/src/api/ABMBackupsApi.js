import dominio from '../../../../../common/API';
const API_URL =  `${dominio}/api/backups`;


export async function getBackups() {
  const res = await fetch(`${API_URL}/mis-backups`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!res.ok) throw new Error("Error al obtener los backups");
  return res.json();
}

export async function createBackup(backupData) {
  const res = await fetch(`${API_URL}/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(backupData),
  });

  if (!res.ok) throw new Error("Error al crear el backup");
  return res.json();
}

export async function updateBackup(id, backupData) {
  const res = await fetch(`${API_URL}/update/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(backupData),
  });

  if (!res.ok) throw new Error("Error al actualizar backup");
  return res.json();
}

export async function cancelarBackup(idBackup) {
  const res = await fetch(`${API_URL}/baja-logica-backup/${idBackup}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error al cancelar el backup: ${errorText}`);
  }

  return res.json();
}

export async function eliminarBackup(idBackup) {
  const res = await fetch(`${API_URL}/baja-fisica-backup/${idBackup}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error al eliminar el backup: ${errorText}`);
  }

  return true; // Confirmamos que se eliminó correctamente
}

export async function descargarBackup(idBackup) {
  const res = await fetch(`${API_URL}/download/${idBackup}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error al descargar el backup: ${errorText}`);
  }

  // Convertimos la respuesta a blob (archivo binario)
  const blob = await res.blob();
  // Creamos un link temporal para descargar
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;

  // Intentamos obtener el filename del header Content-Disposition
  const disposition = res.headers.get("Content-Disposition");
  let filename = "backup.sql";
  if (disposition && disposition.includes("filename=")) {
    filename = disposition.split("filename=")[1].replace(/"/g, "");
  }

  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export async function restaurarBackup(idBackup) {
  const res = await fetch(`${API_URL}/restaurar/${idBackup}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error al restaurar el backup: ${errorText}`);
  }

  return res.text(); // El backend devuelve un mensaje plano ("Backup restaurado correctamente")
}

export async function rehabilitarBackup(idBackup) {
  const res = await fetch(`${API_URL}/rehabilitar/${idBackup}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error al rehabilitar el backup: ${errorText}`);
  }

  return res.text(); // El backend devuelve "Backup rehabilitado correctamente"
}
