import { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import usuarioApi from "../../../src/api/UsuarioApi";
import ModalError from "../../../../../common/layouts/ModalError";

const LoginForm = ({ onShowRegister }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [intentos, setIntentos] = useState(0);
  const [bloqueado, setBloqueado] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState(0);

  useEffect(() => {
    let timer;
    if (bloqueado && tiempoRestante > 0) {
      timer = setInterval(() => {
        setTiempoRestante((prev) => prev - 1);
      }, 1000);
    } else if (bloqueado && tiempoRestante === 0) {
      setBloqueado(false);
      setIntentos(0);
    }
    return () => clearInterval(timer);
  }, [bloqueado, tiempoRestante]);

  // --- Validación simple de formato de email ---
  const validarEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async (e) => {

    if (bloqueado) {
      setErrorMessage(`Demasiados intentos fallidos. Espera ${tiempoRestante} segundos antes de volver a intentar.`);
      setShowErrorModal(true);
      return;
    }
    e.preventDefault();
    setEmailError("");
    setPasswordError("");

    let hayError = false;

    // Validar email
    if (!email.trim()) {
      setEmailError("El correo electrónico es obligatorio.");
      hayError = true;
    } else if (!validarEmail(email)) {
      setEmailError("Formato de correo inválido");
      hayError = true;
    }

    // Validar contraseña
    if (!password.trim()) {
      setPasswordError("La contraseña es obligatoria.");
      hayError = true;
    } else if (password.length < 6) {
      setPasswordError("Debe tener al menos 8 caracteres.");
      hayError = true;
    }

    if (hayError) return; // no sigue si hay errores

    setLoading(true);

    try {
      const dtoLogin = { email, contrasena: password };
      const respuesta = await usuarioApi.iniciarSesion(dtoLogin);
      localStorage.setItem("token", respuesta.token);

      navigate(
        `/${
          respuesta.pantallaInicio.startsWith("/")
            ? respuesta.pantallaInicio.substring(1)
            : respuesta.pantallaInicio
        }`
      );
    } catch (error) {
      let mensajeError;
      if (error.message.includes("No existe un usuario")) {
        mensajeError =
          "No existe un usuario con este correo electrónico. Por favor, verifica tu email o crea una cuenta.";
      } else if (error.message.includes("Contraseña incorrecta")) {
        mensajeError =
          "La contraseña es incorrecta. Por favor, intenta nuevamente.";
      } else if (error.message.includes("Demasiados intentos")) {
        mensajeError = "Demasiados intentos fallidos. Espera 1 minuto antes de volver a intentar.";
      } else {
        mensajeError = "Error al iniciar sesión. Por favor, intenta más tarde.";
      }

      // Incrementar intentos y bloquear si llega a 5
      setIntentos((prev) => {
        const nuevosIntentos = prev + 1;
        if (nuevosIntentos >= 5) {
          setBloqueado(true);
          setTiempoRestante(60); // tiempo en segundos (1 minuto)
        }
        return nuevosIntentos;
      });

      setErrorMessage(mensajeError);
      setShowErrorModal(true);
    }finally{
      setLoading(false)
    }
  }

  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
    setErrorMessage("");
  };

  const handleCreateAccount = () => onShowRegister();

  const handleForgotPassword = () => navigate("/recuperar-contraseña");

  return (
    <div className="login-form-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-logo">WEVENTLY</h1>
          <h2 className="login-title">Inicia sesión</h2>
          <p className="login-subtitle">Es rápido y fácil.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {/* Campo Email */}
          <div className="input-group-1">
            <input
              type="text"
              className={`form-input ${emailError ? "error" : ""}`}
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError("");
              }}
            />
            {emailError && <p className="error-text">{emailError}</p>}
          </div>

          {/* Campo Contraseña */}
          <div className="input-group-1" style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              className={`form-input ${passwordError ? "error" : ""}`}
              placeholder="Contraseña"
              value={password}
              maxLength={15}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError("");
              }}
            />
            <span
              className="recuperar-eye-icon"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={0}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              style={{
                position: "absolute",
                right: "10%",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
              }}
            >
              {showPassword ? (
                <i className="fa-regular fa-eye"></i>
              ) : (
                <i className="fa-solid fa-eye-slash"></i>
              )}
            </span>
            {passwordError && <p className="error-text">{passwordError}</p>}
          </div>

          {/* Botones */}
          <button type="submit" className="login-btn-blue" disabled={loading || bloqueado}>
            {bloqueado
              ? `Bloqueado (${tiempoRestante}s)`
              : loading
              ? "Iniciando sesión..."
              : "Iniciar sesión"}
          </button>

          <button
            type="button"
            className="create-account-btn"
            onClick={handleCreateAccount}
          >
            Crear cuenta
          </button>

          <button
            type="button"
            className="forgot-password-link"
            onClick={handleForgotPassword}
          >
            Recuperar contraseña
          </button>
        </form>
      </div>

      <ModalError
        titulo="Error al ingresar"
        mensaje={errorMessage}
        mostrar={showErrorModal}
        onCerrar={handleCloseErrorModal}
      />
    </div>
  );
};

export default LoginForm;
