import React from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

function parseFechaLocal(fechaStr) {
    if (!fechaStr) return null;
    const [y, m, d] = fechaStr.split('-');
    return new Date(Number(y), Number(m) - 1, Number(d), 0, 0, 0, 0);
}

export default function GraficoLineal({
    datos = [],
    titulo = "Gráfico",
    labelDataset = "Datos",
    borderColor = '#2433FF',
    backgroundColor = 'rgba(36, 51, 255, 0.1)',
    height = 400,
    mostrarLeyenda = true,
    mostrarTitulo = true,
    formatoTooltip = null,
    onPointClick = null
}) {
    // Preparar datos para Chart.js
    const chartData = {
        labels: datos.map(item => {
            if (item.label) return item.label;
            if (item.fecha) {
                const fecha = parseFechaLocal(item.fecha);
                return fecha ? fecha.toLocaleDateString('es-AR', {
                    day: '2-digit',
                    month: '2-digit'
                }) : '';
            }
            return item.periodo || '';
        }),
        datasets: [{
            label: labelDataset,
            data: datos.map(item => item.cantidad || item.valor || 0),
            borderColor: borderColor,
            backgroundColor: backgroundColor,
            borderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: 0.4, // Curva suave
            fill: true,
        }]
    };

    // Opciones del gráfico
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: mostrarLeyenda,
                position: 'top',
                labels: {
                    padding: 20,
                    font: {
                        size: 12
                    }
                }
            },
            title: {
                display: mostrarTitulo,
                text: titulo,
                font: {
                    size: 16,
                    weight: 'bold'
                },
                padding: 20
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: '#2433FF',
                borderWidth: 1,
                titleFont: {
                    size: 16 // Aumentado tamaño título tooltip
                },
                bodyFont: {
                    size: 14 // Aumentado tamaño cuerpo tooltip
                },
                callbacks: formatoTooltip || {
                    label: function (context) {
                        return `${labelDataset}: ${context.formattedValue}`;
                    },
                    title: function (context) {
                        return `Fecha: ${context[0].label}`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)'
                },
                ticks: {
                    font: {
                        size: 19
                    },
                    callback: function (value) {
                        if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
                        if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
                        return value;
                    }
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    display: false // Ocultar etiquetas del eje X
                }
            }
        },
        onClick: onPointClick ? (event, elements) => {
            if (elements.length > 0) {
                const index = elements[0].index;
                const dataPoint = datos[index];
                onPointClick(dataPoint, index);
            }
        } : undefined,
        animation: {
            duration: 1000,
            easing: 'easeInOutQuart'
        }
    };

    if (!datos || datos.length === 0) {
        return (
            <div className="grafico-container">
                <div className="grafico-sin-datos">
                    <p>No hay datos disponibles para mostrar</p>
                </div>
            </div>
        );
    }

    return (
        <div className="grafico-container">
            <div className="grafico-wrapper" style={{ height: `${height}px` }}>
                <Line data={chartData} options={options} />
            </div>
        </div>
    );
}
