import dominio from '../../../../../../common/API';
const BASE_URL = `${dominio}`

export const obtenerEstadosDisponibles = async () => {
    try {
        const response = await fetch(`${BASE_URL}/api/estado-backup`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem("token")}`,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('error obteniendo los estados: ', error);
        throw error;
    }
};

export const crearEstado = async (datos) => {
    try {
        const response = await fetch(`${BASE_URL}/api/estado-backup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify(datos),
        });

        if (!response.ok) {
            const errorData = await response.json();
            // Si el backend devuelve un objeto con 'error', usarlo
            const errorMessage = errorData.error || errorData.message || `HTTP error! status: ${response.status}`;
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        console.error('error creando el estado: ', error);
        throw error;
    }
};

export const actualizarEstado = async (id, datos) => {
    try {
        console.log('Enviando actualización:', { id, datos }); // Debug

        const response = await fetch(`${BASE_URL}/api/estado-backup/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify(datos),
        });

        if (!response.ok) {
            const errorData = await response.json();
            const errorMessage = errorData.error || errorData.message || `HTTP error! status: ${response.status}`;
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        console.error('error actualizando el estado: ', error);
        throw error;
    }
}
export const darDeBajaEstado = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/api/estado-backup/baja-estadobackup/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { mensaje: text };
    }

    if (!response.ok) {
      throw new Error(data.mensaje || 'Error al eliminar el estado');
    }

    return data;
  } catch (error) {
    console.error('Error en darDeBajaEstado:', error);
    throw error;
  }
};

export const rehabilitarEstado = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/api/estado-backup/rehabilitar-estadobackup/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const text = await response.text();
    let data;

    try {
      data = JSON.parse(text);
    } catch {
      data = { mensaje: text };
    }

    if (!response.ok) {
      throw new Error(data.mensaje || 'Error al habilitar el estado');
    }

    return data;
  } catch (error) {
    console.error('Error en rehabilitarEstado:', error);
    throw error;
  }
};