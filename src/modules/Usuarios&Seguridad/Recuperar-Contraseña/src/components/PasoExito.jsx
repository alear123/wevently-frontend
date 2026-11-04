import { useNavigate } from "react-router-dom";

export default function PasoExito() {
  const navigate = useNavigate();

  return (
    <div className="recuperar-bg">
      <div className="recuperar-card">
        <h1 className="recuperar-logo">
          <span className="recuperar-logo-w">W</span>
          <span className="recuperar-logo-event">EVENT</span>
          <span className="recuperar-logo-ly">LY</span>
        </h1>
        <hr />
        <div className="recuperar-exito-icon" aria-hidden="true">
          ✅
        </div>
        <div className="recuperar-exito-msg">
          Su contraseña ha sido restablecida con éxito
        </div>
        <div className="recuperar-exito-link">
          <button
            className="recuperar-btn"
            onClick={() => navigate("/Login_y_register")}
          >
            Ir a iniciar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
