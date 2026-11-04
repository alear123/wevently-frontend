import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGift, faCity, faHandshake, faMoneyBillWave } from "@fortawesome/free-solid-svg-icons";

// Mapeo de nombres de iconos a objetos de Font Awesome
const iconosFA = {
  faGift,
  faCity,
  faHandshake,
  faMoneyBillWave,
};

export default function TarjetaResumen({
    classNamePrefix = "tarjeta",
    mensajeVacio = "Sin datos",
    titulocabecera = "cabecera",
    valorResumen = 0,
    descripcionInformativa = "",
    icono = "faHandshake",
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

    // Función para renderizar el ícono de Font Awesome
    const renderIcono = () => {
        const iconoFA = iconosFA[icono];
        
        if (!iconoFA) {
            // Fallback si el icono no existe
            return (
                <span 
                    className={`${classNamePrefix}-icono`}
                    style={{ color: colorIcono }}
                >
                    ?
                </span>
            );
        }

        return (
            <div 
                className={`${classNamePrefix}-icono`}
                style={{ color: colorIcono }}
            >
                <FontAwesomeIcon icon={iconoFA} size="lg" />
            </div>
        );
    };

    const tituloStyle = {
        flex: 1,
        minWidth: 0,
        fontWeight: 600,
        fontSize: titulocabecera.length > 24 ? '1em' : '1.22em',
        margin: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        lineHeight: 1.16
    };

    return (
        <div className={`${classNamePrefix}-resumen-container`}>
            <div className={`${classNamePrefix}-card`}>
                <div className={`${classNamePrefix}-card-header`}>
                    <div className={`${classNamePrefix}-icono-container`}>
                        {renderIcono()}
                    </div>
                    <h3 className={`${classNamePrefix}-titulo`} style={tituloStyle}>
                        {titulocabecera}
                    </h3>
                </div>
                <div className="tarjeta-resumen-valor-wrapper">
                    <p className={`${classNamePrefix}-cifra`}
                        style={
                            valorResumen && String(valorResumen).length > 11
                                ? { fontSize: '2em', textAlign: 'center', top: '1000' }
                                : {}
                        }
                    >
                        {formatearNumero(valorResumen)}
                    </p>
                </div>
                
                {descripcionInformativa && (
                    <span className={`${classNamePrefix}-etiqueta`}>
                        {descripcionInformativa}
                    </span>
                )}
            </div>
        </div>
    );
}