

import React from 'react';

export default function TarjetaResumen({
    classNamePrefix = "tarjeta",
    mensajeVacio = "Sin datos",
    titulocabecera = "cabecera",
    valorResumen = 0,
    descripcionInformativa = "",
    icono = "👥",
    colorIcono = "#2433FF"
}) {
    // Función para formatear números grandes
    const formatearNumero = (numero) => {
        if (typeof numero === 'string') return numero;
        if (numero === null || numero === undefined) return mensajeVacio;
        
        const num = Number(numero);
        if (isNaN(num)) return mensajeVacio;
        
        return num.toLocaleString('es-AR');
    };

    // Función para renderizar el ícono
    const renderIcono = () => {
        if (typeof icono === 'string') {
            return (
                <span 
                    className={`${classNamePrefix}-icono`}
                    style={{ color: colorIcono }}
                >
                    {icono}
                </span>
            );
        }
        // Si es un componente React (como lucide-react)
        return (
            <div 
                className={`${classNamePrefix}-icono`}
                style={{ color: colorIcono }}
            >
                {icono}
            </div>
        );
    };

    return (
        <div id="tarjetas-pdf-captura" className={`${classNamePrefix}-resumen-container`}>
            <div className={`${classNamePrefix}-card`}>
                <div className={`${classNamePrefix}-card-header`}>
                    <div className={`${classNamePrefix}-icono-container`}>
                        {renderIcono()}
                    </div>
                    <h3 className={`${classNamePrefix}-titulo`}>
                        {titulocabecera}
                    </h3>
                </div>
                
                <p className={`${classNamePrefix}-cifra`}>
                    {formatearNumero(valorResumen)}
                </p>
                
                {descripcionInformativa && (
                    <span className={`${classNamePrefix}-etiqueta`}>
                        {descripcionInformativa}
                    </span>
                )}
            </div>
        </div>
    );
}