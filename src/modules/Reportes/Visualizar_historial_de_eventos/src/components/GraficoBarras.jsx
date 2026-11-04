import React from 'react';
import { Bar } from 'react-chartjs-2';

function parseFechaLocal(fechaStr) {
    if (!fechaStr) return null;
    const [y, m, d] = fechaStr.split('-');
    return new Date(Number(y), Number(m) - 1, Number(d), 0, 0, 0, 0);
}

function fechaToDDMMYYYY(fechaStr) {
    const d = parseFechaLocal(fechaStr);
    if (!d || isNaN(d.getTime())) return "";
    return d.toLocaleDateString('es-AR');
}

export default function GraficoBarras({
    datos = [],
    titulo = "Gráfico",
    labelDataset = "Datos",
    backgroundColor = '#9CC0FF',
    borderColor = '#1a2899',
    height = 400,
    mostrarLeyenda = true,
    mostrarTitulo = true,
    formatoTooltip = null,
    onBarClick = null
}) {
    // Preparar datos para Chart.js
    const chartData = {
        labels: datos.map(item => {
            // Usar el label si está disponible, sino formatear fecha
            if (item.label) {
                return item.label;
            }
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
            backgroundColor: Array.isArray(backgroundColor) 
                ? backgroundColor 
                : datos.map(() => backgroundColor),
            borderColor: Array.isArray(borderColor) 
                ? borderColor 
                : datos.map(() => borderColor),
            borderWidth: 1,
            borderRadius: 4,
            borderSkipped: false,
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
                titleFont: { size: 18, weight: "bold" },   
                bodyFont: { size: 16 }, 
                callbacks: formatoTooltip || {
                    label: function(context) {
                        return `${labelDataset}: ${context.formattedValue}`;
                    },
                    title: function(context) {
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
                        size: 20
                    },
                    callback: function(value) {
                        // Formatear números grandes
                        if (value >= 1000000) {
                            return (value / 1000000).toFixed(1) + 'M';
                        } else if (value >= 1000) {
                            return (value / 1000).toFixed(1) + 'K';
                        }
                        return value;
                    }
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    font: {
                        size: 20
                    },
                    maxRotation: 45,
                    minRotation: 0
                }
            }
        },
        onClick: onBarClick ? (event, elements) => {
            if (elements.length > 0) {
                const index = elements[0].index;
                const dataPoint = datos[index];
                onBarClick(dataPoint, index);
            }
        } : undefined,
        animation: {
            duration: 1000,
            easing: 'easeInOutQuart'
        }
    };

    // Validar que hay datos
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
                <Bar data={chartData} options={options} />
            </div>
        </div>
    );
}