import Header from "../../../../common/layouts/Navbar_Organizador";
import Pagar from "../../Pagar/Pagar";
import "./src/assets/ElegirMedioPago.css";
import { useState } from "react";
import ProgressSteps from "../src/components/ProgressSteps";
import { useLocation, useNavigate } from "react-router-dom";

const ElegirMedioPago = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const datosReserva = location.state?.datosReserva || {};
  const monto = location.state?.monto || 5000;

  const handlePagoExitoso = (resultado) => {
    // Asegurate que resultado tenga el DTO con TODA la info para la factura:
    navigate('/DescargarFactura', { state: { datosFactura: resultado } });
  };

  const handlePagoError = (error) => {
    console.error('Error en el pago:', error);
  };

  const handleCancelar = () => {
    navigate(-1);
  };

  return (
    <>
      <Header />
      <div className="payment-container">
        <div className="payment-content">
          <ProgressSteps currentStep={3} />
            <Pagar
              datosReserva={datosReserva}
              monto={monto}
              onPagoExitoso={handlePagoExitoso}
              OnPagoError={handlePagoError}
              onCancelar={handleCancelar}
            />
        </div>
      </div>
    </>
  );
};

export default ElegirMedioPago;
