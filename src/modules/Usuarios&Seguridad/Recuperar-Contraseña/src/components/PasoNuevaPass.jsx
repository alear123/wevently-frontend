import { useState } from "react";
import usuarioApi from "../../../src/api/UsuarioApi.js";

export default function PasoNuevaPass({ email, codigo, onSuccess }) {
  const [pass, setPass] = useState("");
  const [repeat, setRepeat] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const cumpleRequisitos =
    pass.length >= 8 && /[a-z]/.test(pass) && /[A-Z]/.test(pass);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!cumpleRequisitos) {
      setError("No cumple los requisitos mínimos");
      return;
    }
    if (pass !== repeat) {
      setError("No coinciden las contraseñas");
      return;
    }
    setLoading(true);
    try {
      await usuarioApi.cambiarContrasena(email, codigo, pass);
      onSuccess();
    } catch (err) {
      setError(err.message || "Error al cambiar la contraseña");
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
        <h2 className="recuperar-title">Restablecer la contraseña</h2>
        <form onSubmit={handleSubmit}>
          <div className="recuperar-input-group">
            <input
              type={showPassword ? "text" : "password"}
              className="recuperar-input"
              placeholder="Nueva contraseña"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              disabled={loading}
            />
            <span
              className="recuperar-eye-icon"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={0}
              aria-label={
                showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
              }
            >
              {showPassword ? (
                // Contraseña visible: ojo normal
                <i className="fa-regular fa-eye"></i>
              ) : (
                // Contraseña oculta: ojo tachado
                <i className="fa-solid fa-eye-slash"></i>
              )}
            </span>
          </div>
          {!cumpleRequisitos && pass && (
            <div className="recuperar-error">
              No cumple los requisitos mínimos
            </div>
          )}
          <div className="recuperar-requisitos">
            8 caracteres como mínimo, distingue mayúsculas de minúsculas
          </div>
          <div className="recuperar-input-group">
            <input
              type={showPassword ? "text" : "password"}
              className="recuperar-input"
              placeholder="Vuelve a escribir la contraseña"
              value={repeat}
              onChange={(e) => setRepeat(e.target.value)}
              style={{ flex: 1, paddingRight: "2.5rem" }}
              disabled={loading}
            />
            <span
              className="recuperar-eye-icon"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={0}
              aria-label={
                showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
              }
            >
              {showPassword ? (
                <i className="fa-regular fa-eye"></i>
              ) : (
                <i className="fa-solid fa-eye-slash"></i>
              )}
            </span>
          </div>
          {error && <div className="recuperar-error">{error}</div>}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button
              type="button"
              className="recuperar-btn"
              style={{ background: "#e53935" }}
              onClick={() => window.location.reload()}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="recuperar-btn"
              disabled={!cumpleRequisitos || !pass || !repeat || loading}
            >
              {loading ? "Cambiando..." : "Siguiente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
