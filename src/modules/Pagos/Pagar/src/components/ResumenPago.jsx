import { useState } from "react";

const ResumenPago = ({ monto, datosFinales }) => {
    const [resumenDesplegado, setResumenDesplegado] = useState(false);

    return (
        <div className="info-pago-resumen">
            <div 
                className="info-pago-header" 
                onClick={() => setResumenDesplegado(!resumenDesplegado)}
            >
                <div className="info-pago-header-content">
                    <span className="info-label">Total a pagar:</span>
                    <span className="info-monto-valor">${monto}</span>
                </div>
                <svg 
                    className={`chevron-icon ${resumenDesplegado ? 'rotated' : ''}`}
                    width="20" 
                    height="20" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </div>
            
            {resumenDesplegado && (
                <div className="info-pago-detalles">
                    <div className="info-pago-item">
                        <span className="info-label">Concepto:</span>
                        <span>{datosFinales.nombre}</span>
                    </div>
                    <div className="info-pago-item">
                        <span className="info-label">Descripción:</span>
                        <span>{datosFinales.descripcion}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResumenPago;