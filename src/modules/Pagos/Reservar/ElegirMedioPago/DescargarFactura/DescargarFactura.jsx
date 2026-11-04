import "./src/assets/DescargarFactura.css";
import Header from "../../../../../common/layouts/Navbar_Organizador";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import dominio from '../../../../../common/API';
import { useFacturaPdf } from "./src/api/API_Factura";

const DescargarFactura = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const datosFactura = location.state?.datosFactura;
  
  const pdfUrl = useFacturaPdf(datosFactura, dominio);

  const handleDescargar = () => {
    if (!pdfUrl) return;
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `factura-${datosFactura?.idReserva || 'compra'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleVolver = () => navigate('/buscar-lugares');

  if (!datosFactura) {
    return (
      <div className="descargar-factura-wrapper">
        <Header />
        <div className="descargar-factura">
          <div className="error-message">
            <h2>⚠️ No se encontraron datos de la factura</h2>
            <p>Por favor, intenta realizar la compra nuevamente.</p>
            <button className="btn-return" onClick={handleVolver}>
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="descargar-factura-wrapper">
      <Header />
      <div className="descargar-factura">
        <h1>Factura Electrónica</h1>
        
        <div className="visor-pdf">
          {pdfUrl ? (
            <iframe 
              src={pdfUrl} 
              title="Factura PDF"
              loading="lazy"
            />
          ) : (
            <div className="loading-pdf">
              <div className="loading-spinner"></div>
              <span>Generando factura...</span>
            </div>
          )}
        </div>

        <div className="action-buttons">
          <button 
            className="btn-download" 
            onClick={handleDescargar} 
            disabled={!pdfUrl}
            aria-label="Descargar factura en PDF"
          >
            Descargar PDF
          </button>
          <button 
            className="btn-return" 
            onClick={handleVolver}
            aria-label="Volver a la página de inicio"
          >
            Ir a inicio
          </button>
        </div>
      </div>
    </div>
  );
};

export default DescargarFactura;
