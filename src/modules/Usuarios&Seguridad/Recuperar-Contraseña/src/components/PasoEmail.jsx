import { useState } from "react";
import usuarioApi from "../../../src/api/UsuarioApi.js";

export default function PasoEmail({ email, setEmail, onSuccess }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email) {
      setError("El correo electrónico es obligatorio");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("El correo electrónico no es válido");
      return;
    }
    setLoading(true);
    try {
      // Llama al backend para solicitar recuperación
      await usuarioApi.solicitarRecuperacion(email);
      // Siempre muestra mensaje genérico, no importa si el email existe
      onSuccess();
    } catch (err) {
      setError(err.message || "Error al solicitar recuperación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recuperar-bg">
      <div className="recuperar-card">
        <h1 className="recuperar-logo">
          <span className="recuperar-logo-w">W</span>
          <span className="recuperar-logo-event">EVENT</span>
          <span className="recuperar-logo-ly">LY</span>
        </h1>
        <hr />
        <h2 className="recuperar-title">Recuperar contraseña</h2>
        <p className="recuperar-desc">
          Introduce tu correo electrónico para enviar el código de recuperación.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="recuperar-input"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          {error && <div className="recuperar-error">{error}</div>}
          <div className="recuperar-btn-group">
            <button type="submit" className="recuperar-btn" disabled={loading}>
              {loading ? "Enviando..." : "Siguiente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
