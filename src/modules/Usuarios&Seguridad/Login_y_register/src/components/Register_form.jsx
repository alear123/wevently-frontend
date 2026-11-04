import React, { useState,useEffect } from "react"
import ModalAccionExito from "../../../../../common/layouts/ModalAccionExito";
import ModalError from "../../../../../common/layouts/ModalError";
import { useNavigate } from 'react-router-dom';
import usuarioApi from "../../../src/api/UsuarioApi"
import { Eye, EyeOff } from "lucide-react";
import ModalTerminosCondiciones from "../../../../../common/layouts/ModalTerminosCondiciones";

const RegisterForm = ({ onBackToLogin }) => {
  const [roles, setRoles] = useState([]);
  const [pantallaInicio, setPantallaInicio] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
    const cargarRoles = async () => {
      try {
        const listaRoles = await usuarioApi.obtenerRoles();
        setRoles(listaRoles); // Guardamos los roles en el estado
      } catch (error) {
        console.error('Error loading roles:', error);
      }
    };

    cargarRoles();
  }, []); // El array vacío [] asegura que se ejecute solo una vez
  
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    dni:"",
    dia: "",
    mes: "",
    año: "",
    genero: "",
    telefono: "",
    email: "",
    password: "",
    rol: "",
    alias: "", 
    cbu: "" 
  });

  const [errors, setErrors] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false); // Faltaba este estado
  const navigate = useNavigate();
  const [showTermsModal, setShowTermsModal] = useState(false);

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "nombre":
        if (!value.trim()) error = "Campo obligatorio";
        else if (value.trim().length < 3 || value.trim().length > 15)
          error = "Debe contener entre 3 y 15 caracteres";
        break;

      case "apellido":
        if (!value.trim()) error = "Campo obligatorio";
        else if (value.trim().length < 3 || value.trim().length > 15)
          error = "Debe contener entre 3 y 15 caracteres";
        break;

      case "dni":
        if (!value.trim()) error = "Campo obligatorio";
        else if (!/^\d{8}$/.test(value))
          error = "Debe contener exactamente 8 dígitos";
        break;

      case "telefono":
        if (!value.trim()) error = "Campo vacío";
        else if (!validatePhone(value)) error = "Formato inválido";
        break;

      case "email":
        if (!value.trim()) error = "Campo obligatorio";
        else if (!validateEmail(value)) error = "Formato inválido";
        break;

      case "password":
        if (!value.trim()) error = "Campo obligatorio";
        else if (value.length < 8 || value.length > 15)
          error = "Debe contener entre 8 y 15 caracteres";
        else if (!/(?=.*[a-z])(?=.*[A-Z])/.test(value))
          error = "Debe contener al menos una mayúscula y una minúscula";
        else if (!/(?=.*\d)/.test(value))
          error = "Debe contener al menos un número";
        else if (!/(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-])/.test(value))
          error = "Debe contener al menos un carácter especial";
        break;

      case "alias":
          if (!value.trim()) {
            error = "Campo obligatorio para este rol";
          } else if (value.length < 6 || value.length > 20) {
            error = "Debe tener entre 6 y 20 caracteres";
          } else if (!/^[A-Za-z.\-]+$/.test(value)) {
            error = "Solo se permiten letras, puntos y guiones";
          }
        break;

      case "cbu":
        if (value.trim() && !/^\d{22}$/.test(value)) {
          error = "El CBU/CVU debe contener exactamente 22 dígitos numéricos";
        }
        break;

      case "rol":
        if (!value) error = "Rol no seleccionado";
        break;

      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Creamos una copia del formData actualizado
    const updatedFormData = { ...formData, [name]: value };

    setFormData(updatedFormData);

    // Pasamos el formData actualizado a la validación
    validateField(name, value, updatedFormData);
  };


  const validateAge = (dia, mes, año) => {
    if (!dia || !mes || !año) return false;

    const today = new Date();
    const birthDate = new Date(año, meses.indexOf(mes), dia);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1 >= 18;
    }

    return age >= 18;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9+\-\s()]+$/;
    return phone.length >= 8 && phoneRegex.test(phone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // Validaciones
    if (!formData.nombre.trim()) {
      newErrors.nombre = "Campo obligatorio";
    } else if (formData.nombre.trim().length < 3 || formData.nombre.trim().length > 15) {
      newErrors.nombre = "Debe contener entre 3 y 15 caracteres";
    }

    if (!formData.dni.trim()) {
      newErrors.dni = "Campo obligatorio";
    } else if (!/^\d{8}$/.test(formData.dni)) {
      newErrors.dni = "Debe contener exactamente 8 dígitos";
    }

    if (!formData.apellido.trim()) {
      newErrors.apellido = "Campo obligatorio";
    } else if (formData.apellido.trim().length < 3 || formData.apellido.trim().length > 15) {
      newErrors.apellido = "Debe contener entre 3 y 15 caracteres";
    }

    if (!formData.dia || !formData.mes || !formData.año) {
      newErrors.fechaNacimiento = "Fecha de nacimiento no seleccionada";
    } else if (!validateAge(formData.dia, formData.mes, formData.año)) {
      newErrors.fechaNacimiento = "Debes ser mayor de 18 años";
    }

    if (!formData.genero) {
      newErrors.genero = "Género no seleccionado";
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = "Campo vacío";
    } else if (!validatePhone(formData.telefono)) {
      newErrors.telefono = "Formato inválido";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Campo obligatorio";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Formato de email inválido";
    }

    if (!formData.password) {
      newErrors.password = "Campo obligatorio";
    } else if (formData.password.length < 8 || formData.password.length > 15) {
      newErrors.password = "Debe contener entre 8 y 15 caracteres";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = "Debe contener al menos una mayúscula y una minúscula";
    } else if (!/(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Debe contener al menos un número";
    } else if (!/(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-])/.test(formData.password)) {
      newErrors.password = "Debe contener al menos un carácter especial";
    }

    if (!formData.rol) {
      newErrors.rol = "Rol no seleccionado";
    }

    if (!formData.alias.trim()) {
      newErrors.alias = "Campo obligatorio para este rol";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      try {
        const dtoNuevoUsuario = {
          nombre: formData.nombre,
          apellido: formData.apellido,
          fechaNacimiento: new Date(
            formData.año, 
            meses.indexOf(formData.mes), 
            formData.dia
          ),
          genero: formData.genero,
          telefono: formData.telefono,
          email: formData.email,
          contrasena: formData.password,
          dni:formData.dni,
          rol: formData.rol,
          alias: formData.alias , 
          cbu: formData.cbu  
        };
        console.log('Datos enviados al backend:', dtoNuevoUsuario);
        const respuesta = await usuarioApi.registrarse(dtoNuevoUsuario);
        setPantallaInicio(respuesta.pantallaInicio)
        localStorage.setItem('token', respuesta.token);
        console.log("Registration successful:", respuesta);
        setShowSuccessModal(true);
      } catch (error) {
        console.error('Error completo:', error.response?.data || error.message);
        let mensajeError = error.message;
        
        // Puedes personalizar mensajes específicos si lo deseas
        if (error.message.includes('Email ya está en uso')) {
          mensajeError = "El correo electrónico ya está registrado. Por favor, utiliza otro.";
        } else if (error.message.includes('Error al obtener los roles')) {
          mensajeError = "Error al cargar los roles. Por favor, recarga la página.";
        }
        
        setErrorMessage(mensajeError);
        setShowErrorModal(true);
      }finally {
        setLoading(false);
      }
    }
  }; 
  
  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
    setErrorMessage('');
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    navigate(`/${pantallaInicio.startsWith("/") ? pantallaInicio.substring(1, pantallaInicio.length) : pantallaInicio}`);
    setFormData({
      nombre: "",
      apellido: "",
      dni:"",
      dia: "",
      mes: "",
      año: "",
      genero: "",
      telefono: "",
      email: "",
      password: "",
      rol: "",
      alias: "",
      cbu: ""  
    });
    setErrors({});
  };

  const getDiasDelMes = (mes, año) => {
    if (!mes || !año) return Array.from({ length: 31 }, (_, i) => i + 1);
    const indexMes = meses.indexOf(mes);
    const cantidadDias = new Date(año, indexMes + 1, 0).getDate();
    return Array.from({ length: cantidadDias }, (_, i) => i + 1);
  };

  const meses = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
  ];

  const años = Array.from({ length: 80 }, (_, i) => 2024 - i);

  return (
    <div className="register-form-container">
      <div className="register-card">
        <div className="register-header">
          <h1 className="register-logo">WEVENTLY</h1>
          <h2 className="register-title">Crea una cuenta</h2>
          <p className="register-subtitle">Es rápido y fácil.</p>
        </div>

        <form className="register-form" onSubmit={handleSubmit}>
          {/* Mensaje de error general */}
          {errors.general && (
            <div className="error-message-general">
              {errors.general}
            </div>
          )}

          <div className="name-row">
            <div className="input-group-1">
              <input
                type="text"
                name="nombre"
                className={`form-input-1 ${errors.nombre ? "error" : ""}`}
                placeholder="Nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                disabled={loading}
              />
              {errors.nombre && <span className="error-text">{errors.nombre}</span>}
            </div>
            <div className="input-group-1">
              <input
                type="text"
                name="apellido"
                className={`form-input-1 ${errors.apellido ? "error" : ""}`}
                placeholder="Apellido"
                value={formData.apellido}
                onChange={handleInputChange}
                disabled={loading}
              />
              {errors.apellido && <span className="error-text">{errors.apellido}</span>}
            </div>
          </div>

          <div className="birth-section-1">
            <label className="section-label">Fecha nacimiento</label>
            {errors.fechaNacimiento && <span className="error-text">{errors.fechaNacimiento}</span>}
              <select
                name="año"
                className={`form-select-1 ${errors.fechaNacimiento ? "error" : ""}`}
                value={formData.año}
                onChange={handleInputChange}
                disabled={loading}
              >
                <option value="" disabled hidden>2025</option>
                {años.map((año) => (
                  <option key={año} value={año}>{año}</option>
                ))}
              </select>
              <select
                name="mes"
                className={`form-select-1 ${errors.fechaNacimiento ? "error" : ""}`}
                value={formData.mes}
                onChange={handleInputChange}
                disabled={loading}
              >
                <option value="" disabled hidden>may</option>
                {meses.map((mes, index) => (
                  <option key={index} value={mes}>{mes}</option>
                ))}
              </select>
              <select
                name="dia"
                className={`form-select-1 ${errors.fechaNacimiento ? "error" : ""}`}
                value={formData.dia}
                onChange={handleInputChange}
                disabled={loading}
              >
                <option value="" disabled hidden>27</option>
                {getDiasDelMes(formData.mes, formData.año).map((dia) => (
                  <option key={dia} value={dia}>{dia}</option>
                ))}
              </select>
          </div>

          <div className="gender-section-1">
            <label className="section-label">Género</label>
            {errors.genero && <span className="error-text">{errors.genero}</span>}
            <div className="gender-row">
              <label className="radio-label">
                <input
                  type="radio"
                  name="genero"
                  value="mujer"
                  checked={formData.genero === "mujer"}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                <span className="radio-text">Mujer</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="genero"
                  value="hombre"
                  checked={formData.genero === "hombre"}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                <span className="radio-text">Hombre</span>
              </label>
            </div>
          </div>

          <div className="input-group-1">
            <input
              type="tel"
              name="telefono"
              className={`form-input-1 ${errors.telefono ? "error" : ""}`}
              placeholder="Número de teléfono"
              value={formData.telefono}
              onChange={handleInputChange}
              disabled={loading}
            />
            {errors.telefono && <span className="error-text">{errors.telefono}</span>}
          </div>

          <div className="input-group-1">
            <input
              type="text"
              name="dni"
              className={`form-input-1 ${errors.dni ? "error" : ""}`}
              placeholder="DNI (8 dígitos)"
              value={formData.dni}
              onChange={handleInputChange}
              disabled={loading}
              maxLength={8}
              onKeyPress={(e) => {
                if (!/[0-9]/.test(e.key)) {
                  e.preventDefault();
                }
              }}
            />
            {errors.dni && <span className="error-text">{errors.dni}</span>}
          </div>

          <div className="input-group-1">
            <input
              type="email"
              name="email"
              className={`form-input-1 ${errors.email ? "error" : ""}`}
              placeholder="Indica tu dirección de email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={loading}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="input-group-1" style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              className={`form-input-1 ${errors.password ? "error" : ""}`}
              placeholder="Contraseña nueva"
              value={formData.password}
              onChange={handleInputChange}
              disabled={loading}
            />
            <span
              className="recuperar-eye-icon"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={0}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              style={{
                position: "absolute",
                right: "6%",
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
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>


          <div className="input-group-1">
            <input
              type="text"
              name="alias"
              className={`form-input-1 ${errors.alias ? "error" : ""}`}
              placeholder="Alias (obligatorio)"
              value={formData.alias}
              onChange={handleInputChange}
              disabled={loading}
            />
            {errors.alias && <span className="error-text">{errors.alias}</span>}
          </div>
          <div className="input-group-1">
            <input
              type="text"
              name="cbu"
              className={`form-input-1 ${errors.cbu ? "error" : ""}`}
              placeholder="CBU/CVU (opcional)"
              value={formData.cbu}
              onChange={handleInputChange}
              disabled={loading}
            />
            {errors.cbu && <span className="error-text">{errors.cbu}</span>}
          </div>

          <div className="input-group-1">
            <label className="section-label">Rol</label>
            {errors.rol && <span className="error-text">{errors.rol}</span>}
            <select
              name="rol"
              className={`form-select-1 ${errors.rol ? "error" : ""}`}
              value={formData.rol}
              onChange={handleInputChange}
              disabled={loading || roles.length === 0}
            >
              <option value="" disabled hidden>Selecciona un rol</option>
              {roles.map((rol) => (
                <option key={rol.id} value={rol.nombre}>
                  {rol.nombre}
                </option>
              ))}
            </select>
          </div>

          <p className="terms-text">
            Al hacer clic en "Registrarte", aceptas nuestros{" "}
            <span
              className="terms-link"
              style={{ color: '#3b82f6', cursor: 'pointer', textDecoration: 'underline' }}
              onClick={() => setShowTermsModal(true)}
            >
              Términos y condiciones
            </span>.
          </p>

          <button 
            type="submit" 
            className="register-btn"
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Registrarte'}
          </button>

          <button 
            type="button" 
            className="back-to-login-btn" 
            onClick={onBackToLogin}
            disabled={loading}
          >
            ¿Ya tienes cuenta? Inicia sesión
          </button>
        </form>
      </div>

      <ModalAccionExito
        titulo="Se ha creado una cuenta exitosamente"
        mensaje="Ahora podrás organizar tus eventos de la manera más eficiente posible!"
        mostrar={showSuccessModal}
        onAceptar={handleCloseModal}
      />
      <ModalError
        titulo="Error en el registro"
        mensaje={errorMessage}
        mostrar={showErrorModal}
        onCerrar={handleCloseErrorModal}
      />
      <ModalTerminosCondiciones
        mostrar={showTermsModal}
        onCerrar={() => setShowTermsModal(false)}
      />
    </div>
  );
};

export default RegisterForm;