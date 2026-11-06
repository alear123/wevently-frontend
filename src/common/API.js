// URL base del backend. Se configura con VITE_API_URL (ver .env.example).
const dominio = import.meta.env?.VITE_API_URL ?? "http://localhost:8080";
export default dominio;
