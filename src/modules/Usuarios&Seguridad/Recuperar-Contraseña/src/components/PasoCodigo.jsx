import { useState, useEffect } from "react";
import usuarioApi from "../../../src/api/UsuarioApi.js";

export default function PasoCodigo({
  email,
  codigo,
  setCodigo,
  intentos,
  setIntentos,
  onSuccess,
  onRestart,
}) {
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(50);
  const [reenviando, setReenviando] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (timer > 0) {
      const t = setTimeout(() => setTimer((t) => t - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [timer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!codigo || codigo.length !== 4) {
      setError("El código debe tener 4 dígitos");
      return;
    }
    setLoading(true);
    try {
      await usuarioApi.validarCodigo(email, codigo);
      onSuccess();
    } catch (err) {
      setIntentos(intentos + 1);
      setError(err.message || "Código inválido o expirado");
      if (intentos + 1 >= 5) onRestart();
    } finally {
      setLoading(false);
    }
  };

  const handleReenviar = async () => {
    setReenviando(true);
    setError("");
    try {
      await usuarioApi.reenviarCodigo(email);
      setTimer(50);
    } catch (err) {
      setError(err.message || "Error al reenviar código");
    } finally {
      setReenviando(false);
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
        <h2 className="recuperar-title">Recuperacion de contraseña</h2>
        <p className="recuperar-desc">
          Te enviamos un código de recuperación a tu correo electrónico de 4
          dígitos.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="recuperar-codigo-input-group">
            <input
              type="text"
              maxLength={4}
              pattern="[0-9]*"
              inputMode="numeric"
              className="recuperar-input recuperar-codigo-input"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
              disabled={loading}
            />
          </div>

          {error && <div className="recuperar-error">{error}</div>}

          {/* Botones alineados horizontalmente */}
          <div
            className="recuperar-codigo-btns"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              marginTop: "8px",
            }}
          >
            <button
              type="button"
              className="recuperar-btn"
              style={{ background: "#8888cc" }}
              onClick={handleReenviar}
              disabled={timer > 0 || reenviando}
            >
              {reenviando ? "Reenviando..." : "Reenviar código"}
            </button>

            <button type="submit" className="recuperar-btn" disabled={loading}>
              {loading ? "Verificando..." : "Siguiente"}
            </button>
          </div>

          {/* Timer debajo de los botones */}
          <div className="recuperar-codigo-timer" style={{ marginTop: 6 }}>
            Tiempo espera: {timer > 0 ? `${timer}seg` : "Disponible"}
          </div>
        </form>
      </div>
    </div>
  );
}
