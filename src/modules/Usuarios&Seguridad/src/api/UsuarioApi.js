import axios from 'axios';
import dominio from "../../../../common/API";

const API_BASE_URL = `${dominio}/api/seguridad/usuarios`;

const usuarioApi = {
  iniciarSesion: async (dtoLogin) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, dtoLogin);
      return response.data;
    } catch (error) {
      throw new Error(error.response.data || "Error al iniciar sesión"); {
        throw new Error(error.response.data);
      }
      throw new Error('Error de conexión con el servidor');
    }
    },

  registrarse: async (dtoNuevoUsuario) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/registrarse`, 
        dtoNuevoUsuario
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        // El servidor respondió con un código de error
      const errorMessage = error.response.data || 'Error en el registro';
      console.error('Error del servidor:', error.response.data);
      console.error('Status:', error.response.status);
      throw new Error(errorMessage);
    } else if (error.request) {
      // La petición fue hecha pero no se recibió respuesta
      console.error('No se recibió respuesta del servidor');
      throw new Error('Error de conexión con el servidor');
    } else {
      // Algo pasó en la configuración de la petición
      console.error('Error en la configuración:', error.message);
      throw new Error('Error en la configuración de la petición');
    }
    }
  },

  solicitarRecuperacion: async (email) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/recuperar`,
        new URLSearchParams({ email }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data || "Error al solicitar recuperación");
    }
  },

  reenviarCodigo: async (email) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/reenviar-codigo`,
        new URLSearchParams({ email }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data || "Error al reenviar código");
    }
  },

  validarCodigo: async (email, codigo) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/validar-codigo`,
        new URLSearchParams({ email, codigo }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data || "Código inválido o expirado");
    }
  },

  cambiarContrasena: async (email, codigo, nuevaContrasena) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/cambiar-contrasena`,
        new URLSearchParams({ email, codigo, nuevaContrasena }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data || "Error al cambiar contraseña");
    }
  },

  obtenerRoles : async () => {
    try {
      const response = await axios.get(`${dominio}/api/seguridad/roles/sin-privilegios`); 
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data || "Error al obtener los roles sin privilegios");
    }
  },

};

export default usuarioApi;