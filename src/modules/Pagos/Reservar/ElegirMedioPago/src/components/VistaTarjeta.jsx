import React, { useState } from "react";
import ModalAccionExito from "../../../../../../common/layouts/ModalAccionExito"
import ModalError from "../../../../../../common/layouts/ModalError"

const VistaTarjeta = () => {
  const mockTarjeta = {
    numero: "4111111111111111",
    vencimiento: "05/28",
    cvv: "123",
    nombre: "JUAN PEREZ PRUEBA"
  };

  const [formData, setFormData] = useState({
    numero: "",
    vencimiento: "",
    cvv: "",
    nombre: ""
  });

  const [errors, setErrors] = useState({});
  const [mostrarModalAccionExito, setMostrarModalAccionExito] = useState(false);
  const [mostrarModalError, setMostrarModalError] = useState(false);

  const validarCampo = (name, value) => {
    let error = "";
    switch (name) {
      case "numero":
        if (!value) error = "Campo obligatorio";
        else if (!/^\d{16}$/.test(value)) error = "Debe tener 16 dígitos";
        break;
      case "vencimiento":
        if (!value) error = "Campo obligatorio";
        else if (!/^(0?[1-9]|1[0-2])\/\d{2}$/.test(value))
          error = "Formato inválido (Ej: 05/28)";
        break;
      case "cvv":
        if (!value) error = "Campo obligatorio";
        else if (!/^\d{3}$/.test(value)) error = "Formato inválido (3 dígitos)";
        break;
      case "nombre":
        if (!value) error = "Campo obligatorio";
        else if (!/^[a-zA-Z\s]{15,40}$/.test(value))
          error = "Solo texto (15-40 caracteres)";
        break;
      default:
        break;
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === "numero") newValue = value.replace(/\D/g, "").slice(0, 16);
    if (name === "cvv") newValue = value.replace(/\D/g, "").slice(0, 3);
    if (name === "nombre") newValue = value.replace(/[^a-zA-Z\s]/g, "");

    setFormData((prev) => ({ ...prev, [name]: newValue }));
    setErrors((prev) => ({ ...prev, [name]: validarCampo(name, newValue) }));
  };

  const handleContinuar = () => {
    const nuevosErrores = {};
    Object.keys(formData).forEach((key) => {
      nuevosErrores[key] = validarCampo(key, formData[key]);
    });
    setErrors(nuevosErrores);

    if (Object.values(nuevosErrores).some((e) => e)) return;

    const coincideMock = Object.keys(mockTarjeta).every(
      (key) => formData[key] === mockTarjeta[key]
    );

    if (coincideMock) {
      setMostrarModalAccionExito(true);
    } else {
      setMostrarModalError(true)
    }
  };

  const handleCancelar = () => {
    setFormData({ numero: "", vencimiento: "", cvv: "", nombre: "" });
    setErrors({});
  };

  return (
    <>
      <div className="form-container">
        <div className="form-group">
          <input
            type="text"
            name="numero"
            placeholder="Número tarjeta"
            className="form-input"
            value={formData.numero}
            onChange={handleChange}
          />
          {errors.numero && <p style={{ color: "red" }}>{errors.numero}</p>}
        </div>

        <div className="form-group">
          <input
            type="text"
            name="vencimiento"
            placeholder="Vence el"
            className="form-input"
            value={formData.vencimiento}
            onChange={handleChange}
          />
          {errors.vencimiento && (
            <p style={{ color: "red" }}>{errors.vencimiento}</p>
          )}
          <p className="form-help-text">Ejemplo: 05/28</p>
        </div>

        <div className="form-group">
          <input
            type="text"
            name="cvv"
            placeholder="CVV"
            className="form-input"
            value={formData.cvv}
            onChange={handleChange}
          />
          {errors.cvv && <p style={{ color: "red" }}>{errors.cvv}</p>}
        </div>

        <div className="form-group">
          <input
            type="text"
            name="nombre"
            placeholder="Nombre en la tarjeta"
            className="form-input"
            value={formData.nombre}
            onChange={handleChange}
          />
          {errors.nombre && <p style={{ color: "red" }}>{errors.nombre}</p>}
        </div>

        <div className="action-buttons">
          <button className="btn btn-primary" onClick={handleContinuar}>
            Continuar
          </button>
          <button className="btn btn-secondary" onClick={handleCancelar}>
            Cancelar
          </button>
        </div>
      </div>

      <ModalAccionExito
        titulo="Pago exitoso"
        mensaje="La transacción se ha procesado correctamente."
        mostrar={mostrarModalAccionExito}
        onAceptar={() => setMostrarModalAccionExito(false)}
      />
      <ModalError
        titulo="Error al pagar"
        mensaje="Los datos de tarjeta no son válidos"
        mostrar={mostrarModalError}
        onCerrar={() => setMostrarModalError(false)}
      />
    </>
  );
};

export default VistaTarjeta;
