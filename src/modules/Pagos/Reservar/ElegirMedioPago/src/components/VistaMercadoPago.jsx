import React from "react";
import {useState} from "react"
import ModalAccionExito from "../../../../../../common/layouts/ModalAccionExito"

const VistaMercadoPago = () => {

  const [mostrarModalAccionExito,setMostrarModalAccionExito]=useState(false)

  const handleContinuar = () => {
    console.log("Redirigiendo a Mercado Pago...");
    // Aquí iría la lógica para generar el link de pago y redirigir
    setMostrarModalAccionExito(true)
  };


  const handleCancelar = () => {
    console.log("Pago con Mercado Pago cancelado");
    // Aquí podrías limpiar el estado o volver a la pantalla anterior
  };

  return (
    <>
      <div className="mercadopago-container">
        <div className="mercadopago-icon">
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 
            10-10S17.52 2 12 2zm-2 15l-5-5 
            1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        </div>
        <h3 className="mercadopago-title">Mercado Pago</h3>
        <p className="mercadopago-description">
          Serás redirigido a Mercado Pago para completar tu pago de forma segura.
        </p>

        <div className="action-buttons">
          <button className="btn btn-primary" onClick={handleContinuar}>Continuar</button>
          <button className="btn btn-secondary" onClick={handleCancelar}>Cancelar</button>
        </div>
      </div>
      <ModalAccionExito
        titulo="Pago exitoso"
        mensaje="La transacción se ha procesado correctamente."
        mostrar={mostrarModalAccionExito}
        onAceptar={() => setMostrarModalAccionExito(false)}
      />
    </>
  );
};

export default VistaMercadoPago;
