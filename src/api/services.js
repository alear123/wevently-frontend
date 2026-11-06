import dominio from '../common/API';
const base_URL = `${dominio}/api`; // Acá va la URL de la api

// Obtengo el token desde el almacenamiento (ejemplo localStorage)
const getToken = () => localStorage.getItem("token");

// Función para armar headers con el token
const authHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${getToken()}`
});

export const services = () => {

    const getElement = async ({ typeElement }) => {
        try {
            const response = await fetch(`${base_URL}/${typeElement}`, {
                headers: authHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error("Error fetching data:", error);
            return [];
        }
    };

    const getElementById = async ({ typeElement, id }) => {
        try {
            const response = await fetch(`${base_URL}/${typeElement}/${id}`, {
                headers: authHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error("Error fetching data:", error);
            return null;
        }
    };

    const createElement = async ({ typeElement, elementData }) => {
        try {
            const response = await fetch(`${base_URL}/${typeElement}`, {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify(elementData),
            });
            return await response.json();
        } catch (error) {
            console.error("Error creating element:", error);
            return null;
        }
    };

    const updateElement = async ({ typeElement, id, elementData }) => {
        try {
            const response = await fetch(`${base_URL}/${typeElement}/${id}`, {
                method: "PUT",
                headers: authHeaders(),
                body: JSON.stringify(elementData),
            });
            return await response.json();
        } catch (error) {
            console.error("Error updating element:", error);
            return null;
        }
    };

    const deleteElement = async ({ typeElement, id }) => {
        try {
            const response = await fetch(`${base_URL}/${typeElement}/${id}`, {
                method: "DELETE",
                headers: authHeaders()
            });
            return response.ok;
        } catch (error) {
            console.error("Error deleting element:", error);
            return false;
        }
    };

    const downElement = async ({ typeElement, id }) => {
        try {
            const response = await fetch(`${base_URL}/${typeElement}/down/${id}`, {
                method: "PUT",
                headers: authHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error("Error down element:", error);
            return null;
        }
    };

    return {
        getElement,
        getElementById,
        createElement,
        updateElement,
        deleteElement,
        downElement
    };
};

export async function obtenerPermisosUsuario() {
    try {
        if (getToken()) {
            const response = await fetch(`${base_URL}/seguridad/permisos/pantallas`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            });
            const data = await response.json();
            return data // Ej: ["/", "/perfil", "/admin"]
        }
    } catch (error) {
        console.error("Error obteniendo permisos:", error);
        return [];
    }
}


export async function verFotoPerfil() {
    try {
        if (getToken()) {
            const response = await fetch(`${base_URL}/seguridad/usuarios/foto`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            });
            const data = await response.text();
            if (response.ok) {
                return data // Ej: ["/", "/perfil", "/admin"]
            }
            throw new error
        }
    } catch (error) {
        console.error("Error obteniendo la foto de perfil:", error);
        return "";
    }
}

