import React from 'react';
// FontAwesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUsers,        // 👥
    faChartBar,     // 📊
    faChartLine,    // 📈
    faCoins,        // Dinero
    faHandshake     // Contrataciones
} from '@fortawesome/free-solid-svg-icons';
import '../assets/Reporte.css';

const ICON_MAP = {
    '👥': faUsers,
    '📊': faChartBar,
    '📈': faChartLine,
    'contratacion': faHandshake,
    'dinero': faCoins
};

function formatearNumero(numero) {
    if (typeof numero === 'string') return numero;
    if (numero === null || numero === undefined) return 'Sin datos';
    const num = Number(numero);
    if (isNaN(num)) return 'Sin datos';
    return num.toLocaleString('es-AR');
}

export default function TarjetaResumen({
    classNamePrefix = 'tarjeta',
    mensajeVacio = 'Sin datos',
    titulocabecera = '',
    valorResumen = 0,
    descripcionInformativa = '',
    icono = '',
    colorIcono = '#2433FF',
}) {
    const renderIcono = () => {
        const faIcon = ICON_MAP[icono] || faUsers;
        return (
            <span className={`${classNamePrefix}-icono`} style={{ color: colorIcono }}>
                <FontAwesomeIcon icon={faIcon} size="1.5x" />
            </span>
        );
    };

    return (
        <div className={`${classNamePrefix}-resumen-container`}>
            <div className={`${classNamePrefix}-card`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 290, maxWidth: 290, margin: '0 auto' }}>
                <div className={`${classNamePrefix}-card-header`} style={{ display: 'flex', alignItems: 'center', gap: 18, justifyContent: 'center' }}>
                    <div className={`${classNamePrefix}-icono-container`}>
                        {renderIcono()}
                    </div>
                    <h3 className={`${classNamePrefix}-titulo`} style={{ color: colorIcono, margin: 0 }}>{titulocabecera}</h3>
                </div>
                <p className={`${classNamePrefix}-cifra`} style={{ fontSize: '2.2rem', fontWeight: 700, textAlign: 'center', margin: 8 }}>{formatearNumero(valorResumen)}</p>
                <span className={`${classNamePrefix}-etiqueta`} style={{ color: '#666', fontStyle: 'italic', fontSize: 14, marginTop: 3 }}>{descripcionInformativa}</span>
            </div>
        </div>
    );
}
