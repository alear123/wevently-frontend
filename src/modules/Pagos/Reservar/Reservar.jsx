import { useState,useEffect } from "react"
import { useLocation,useNavigate } from 'react-router-dom';
import "./src/assets/ContratarLugar.css"
import Header from "../../../common/layouts/Navbar_Organizador"
import ProgressStep from "./src/components/ProgressSteps"
import DetalleReserva from "./src/components/DetalleReserva"
import { getDatosFormularioReserva } from "./src/api/ReservarApi";
import { reservaAPagar  } from "./src/api/ReservarApi";
import { useSearchParams } from "react-router-dom";
import Modal_Error from "../../../common/layouts/ModalError";



const Reservar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const idReserva = searchParams.get("id");
  const [mostrarError, setMostrarError] = useState(false);
  const [mensajeError, setMensajeError] = useState("");

  const mostrarModalError = (mensaje) => {
    setMensajeError(mensaje);
    setMostrarError(true);
  };

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    tipoFactura: "",
    provincia: "",
    localidad: "",
    cuitCuil: "",
  });

  const [errors, setErrors] = useState({});
  const [mostrarDetalleReserva, setMostrarDetalleReserva] = useState(false);
  const [dtoReserva, setDtoReserva] = useState(null); // <--- guardamos la respuesta del backend
  const [loading, setLoading] = useState(true);
  const [localidadesDisponibles, setLocalidadesDisponibles] = useState([]);

  useEffect(() => {
      console.log("ID de reserva recibido:", idReserva);
      const fetchDatosReserva = async () => {
        try {
          const data = await getDatosFormularioReserva(idReserva);
          console.log("Datos del formulario recibidos:", data);
          setDtoReserva(data);

          // Setear provincia
          setFormData((prev) => ({
            ...prev,
            provincia: data.provincia?.nombre || "",
          }));

          // Tipo Servicio → cargar localidades
          if (data.tipo === "Servicio") {
            setLocalidadesDisponibles(
              data.provincia?.localidades?.map((loc) => loc.nombre) || []
            );
          } else {
            // Tipo Lugar → localidad fija
            setFormData((prev) => ({
              ...prev,
              localidad: data.provincia?.localidades?.[0]?.nombre || "",
            }));
          }
        } catch (error) {
          console.error("Error al obtener datos de reserva:", error);
          mostrarModalError("No se pudieron cargar los datos de la reserva. " + (error.message || ""));
        } finally {
          setLoading(false);
        }
      };

      if (idReserva) fetchDatosReserva();
    }, [idReserva]);

      // Validación por campo (en tiempo real)
  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "nombre":
      case "apellido":
        if (!value.trim() || value.trim().length < 3 || value.trim().length > 20)
          error = "Debe tener entre 3 y 20 caracteres y no puede ser solo espacios";
        break;

      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value || !emailRegex.test(value))
          error = "Formato de email inválido";
        break;

      case "telefono":
        const telRegex = /^[0-9]{7,10}$/;
        if (!value || !telRegex.test(value))
          error = "Debe tener entre 7 y 10 digitos";
        break;

      case "tipoFactura":
        if (!value) error = "Seleccione tipo de factura";
        break;

      case "provincia":
        if (!value) error = "Seleccione una provincia";
        break;

      case "localidad":
        if (!value) error = "Seleccione una localidad";
        break;

      case "cuitCuil":
        const cuitRegex = /^[0-9]{2}-[0-9]{8}-[0-9]$/;
        if (!value || !cuitRegex.test(value))
          error = "CUIT inválido (formato: 20-12345678-3)";
        break;

      default:
        break;
    }

    return error;
  };

  // Detectar cambios y validar mientras escribe
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === "telefono") {
      newValue = value.replace(/\D/g, ""); // elimina todo lo que no sea número
      if (newValue.length > 10) newValue = newValue.slice(0, 10); // máximo 10 dígitos
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    const error = validateField(name, value);

    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  // Validar todo al presionar "Siguiente"
  const validate = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleCancel = () => {
    setFormData((prev) => ({
      nombre: "",
      apellido: "",
      email: "",
      telefono: "",
      tipoFactura: "",
      provincia: prev.provincia,
      localidad: prev.localidad, 
      cuitCuil: "",
    }));
    setErrors({});
    navigate("/Inicio");

  };

  const handleCuitChange = (e) => {
  let value = e.target.value.replace(/\D/g, ""); // eliminar todo lo que no sea número
  if (value.length > 11) value = value.slice(0, 11); // limitar a 11 dígitos

  // Formatear con guiones: XX-XXXXXXXX-X
  let formatted = value;
  if (value.length > 2 && value.length <= 10) {
    formatted = `${value.slice(0, 2)}-${value.slice(2)}`;
  } else if (value.length > 10) {
    formatted = `${value.slice(0, 2)}-${value.slice(2, 10)}-${value.slice(10)}`;
  }

  setFormData((prev) => ({
    ...prev,
    cuitCuil: formatted,
  }));

  setErrors((prev) => ({ ...prev, cuitCuil: "" }));
};

  const handleNext = async () => {
    if (validate()) {
      try {
        const dtoFormulario = {
          idReserva: Number(idReserva),
          id: dtoReserva?.id, // id del lugar o servicio
          nombreComprador: formData.nombre,
          apellidoComprador: formData.apellido,
          emailComprador: formData.email,
          telefonoComprador: formData.telefono,
          tipoFactura: formData.tipoFactura,
          provincia: formData.provincia,
          localidad: formData.localidad,
          cuit: formData.cuitCuil,
        };

        const dtoReservaApagar = await reservaAPagar(dtoFormulario);

        navigate("/MedioPago", {
          state: {
            datosReserva: dtoReservaApagar,
            monto: dtoReservaApagar?.monto 
          },
        });
      } catch (error) {
        console.error("Error en handleNext:", error);
        alert("Ocurrió un error al preparar la reserva para pagar");
      }
    }
  };


  const handleMostrarDetalleReserva = (mostrar) => {
    setMostrarDetalleReserva(mostrar);
  };

  const handleOcultarDetalle = () => {
    setMostrarDetalleReserva(false);
  };

  return (
    <div className="reservar-main">
      <Header />
      <div className="reservar">
        <ProgressStep currentStep={2} onClickTuSeleccion={handleMostrarDetalleReserva} />
        {mostrarDetalleReserva ? (
          <DetalleReserva ocultar={handleOcultarDetalle} reserva={reserva} />
        ) : (
          <div className="formulario-main">
            <div className="venue-info">
              <div className="venue-details">
                <h1 className="venue-name">{dtoReserva?.nombre}</h1>
                <p className="venue-address">{dtoReserva?.descripcion}</p>
              </div>
              <div className="venue-rating">
                <div className="rating">
                  <span className="star">⭐</span>
                  <span className="rating-value">{dtoReserva?.rating}</span>
                </div>
                <p className="reviews-count">({dtoReserva?.cantReviews} reseñas)</p>
              </div>
            </div>

            <div className="reservation-form">
              <h2 className="form-title">Datos reserva</h2>
              <p className="reservation-date">Fecha: 15 mayo</p>

              <form className="form">
                <div className="form-row">
                  <div className="form-field">
                    <input
                      type="text"
                      name="nombre"
                      placeholder="Nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      className={`form-input ${errors.nombre ? "input-error" : ""}`}
                    />
                    {errors.nombre && <p className="error-text">{errors.nombre}</p>}
                  </div>

                  <div className="form-field">
                    <input
                      type="text"
                      name="apellido"
                      placeholder="Apellido"
                      value={formData.apellido}
                      onChange={handleInputChange}
                      className={`form-input ${errors.apellido ? "input-error" : ""}`}
                    />
                    {errors.apellido && <p className="error-text">{errors.apellido}</p>}
                  </div>
                </div>


                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`form-input ${errors.email ? "input-error" : ""}`}
                />
                {errors.email && <p className="error-text">{errors.email}</p>}

                <input
                  type="tel"
                  name="telefono"
                  placeholder="Teléfono"
                  value={formData.telefono}
                  inputMode="numeric"
                  maxLength={10}
                  onChange={handleInputChange}
                  className={`form-input ${errors.telefono ? "input-error" : ""}`}
                />
                {errors.telefono && <p className="error-text">{errors.telefono}</p>}

                {/* Select Tipo de Factura */}
                <select
                  name="tipoFactura"
                  value={formData.tipoFactura}
                  onChange={handleInputChange}
                  className={`form-input ${errors.tipoFactura ? "input-error" : ""}`}
                >
                  <option value="">Seleccione tipo de factura</option>
                  <option value="A">Factura A</option>
                  <option value="B">Factura B</option>
                </select>
                {errors.tipoFactura && <p className="error-text">{errors.tipoFactura}</p>}

                {/* Select Provincia */}
                <select
                  name="provincia"
                  value={formData.provincia}
                  disabled={true} // Siempre disabled
                  className={`form-input ${errors.provincia ? "input-error" : ""}`}
                >
                  <option value="">{formData.provincia}</option>
                </select>
                {errors.provincia && <p className="error-text">{errors.provincia}</p>}

                {/* Select Localidad */}
                {dtoReserva?.tipo === "Servicio" ? (
                  <select
                    name="localidad"
                    value={formData.localidad}
                    onChange={handleInputChange}
                    className={`form-input ${errors.localidad ? "input-error" : ""}`}
                  >
                    <option value="">Seleccione una localidad</option>
                    {localidadesDisponibles.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                ) : (
                  <select
                    name="localidad"
                    value={formData.localidad}
                    disabled={true} // Lugar → no editable
                    className={`form-input ${errors.localidad ? "input-error" : ""}`}
                  >
                    <option value="">{formData.localidad}</option>
                  </select>
                )}
                {errors.localidad && <p className="error-text">{errors.localidad}</p>}

                {/* Campo CUIT */}
                <input
                  type="text"
                  name="cuitCuil"
                  placeholder="CUIT (formato: 20-12345678-3)"
                  value={formData.cuitCuil}
                  onChange={handleCuitChange}
                  maxLength={13} // 11 dígitos + 2 guiones
                  className={`form-input ${errors.cuitCuil ? "input-error" : ""}`}
                />
                {errors.cuitCuil && <p className="error-text">{errors.cuitCuil}</p>}
              </form>
            </div>

            <div className="reservar-action-buttons">
              <button className="btn-1 btn-cancel-1" onClick={handleCancel}>
                Cancelar
              </button>
              <button className="btn-1 btn-next-1" onClick={handleNext}>
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
      <Modal_Error
        titulo="Ocurrió un error"
        mensaje={mensajeError}
        mostrar={mostrarError}
        onCerrar={() => setMostrarError(false)}
      />
    </div>
  );
};

export default Reservar;
