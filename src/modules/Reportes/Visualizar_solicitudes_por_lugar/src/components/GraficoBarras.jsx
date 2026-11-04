import { Bar } from 'react-chartjs-2';
import { useRef, useEffect } from 'react';


export default function GraficoBarras({
    datos = [],
    tipoAgrupacion = 'dia',
    titulo = "Gráfico",
    labelDataset = "Datos",
    backgroundColor = '#9CC0FF',
    borderColor = '#1a2899',
    height = 400,
    mostrarLeyenda = true,
    mostrarTitulo = true,
    formatoTooltip = null,
    onBarClick = null,
    mostrarEtiquetas = false
}) {

    const mostrarEtiquetasRef = useRef(mostrarEtiquetas);

    useEffect(() => {
        mostrarEtiquetasRef.current = mostrarEtiquetas;
    }, [mostrarEtiquetas]);

    const aplicarColor = (color, datos) => Array.isArray(color) ? color : datos.map(() => color);

    const formatearLabelSegunAgrupacion = (item, tipoAgrupacion) => {
        if (item.label) return item.label;
        if (!item.fecha) return item.periodo || '';

        const tipo = item.tipoAgrupacion || tipoAgrupacion;

        if (!tipo || tipo === 'dia') {
            const fecha = new Date(item.fecha + 'T00:00:00');
            return fecha.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
        }

        if (tipo === 'semana') {
            const monday = new Date(item.fecha + 'T00:00:00');
            return `Semana del ${monday.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}`;
        }

        if (tipo === 'mes') {
            const parts = String(item.fecha).split('-');
            if (parts.length >= 2) {
                const year = Number(parts[0]);
                const month = Number(parts[1]) - 1;
                const d = new Date(year, month, 1);
                return d.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
            }
        }

        return item.fecha;
    };

    const chartData = {
        labels: datos.map(item => formatearLabelSegunAgrupacion(item, item.tipoAgrupacion || tipoAgrupacion)),
        datasets: [{
            label: labelDataset,
            data: datos.map(item => item.cantidad || item.valor || 0),
            backgroundColor: aplicarColor(backgroundColor, datos),
            borderColor: aplicarColor(borderColor, datos),
            borderWidth: 1,
            borderRadius: 4,
            borderSkipped: false,
        }]
    };

    // Plugin personalizado para dibujar etiquetas
    const datalabelsPlugin = {
        id: 'customDatalabels',
        afterDatasetsDraw(chart) {
            if (!mostrarEtiquetasRef.current) return;
            const { ctx } = chart;
            chart.data.datasets.forEach((dataset, i) => {
                const meta = chart.getDatasetMeta(i);
                meta.data.forEach((bar, index) => {
                    const valor = dataset.data[index];
                    if (valor !== null && valor !== undefined) {
                        ctx.save();
                        ctx.font = 'bold 14px Arial';
                        ctx.fillStyle = '#000';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'bottom';
                        const x = bar.x;
                        const y = bar.y - 5;
                        ctx.fillText(valor, x, y);
                        ctx.restore();
                    }
                });
            });
        }
    };

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
                        size: 20 // Eje Y - aumentado para mejor lectura
                    },
                    callback: function (value) {
                        //formatear nros grandes
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
                        size: 18 // Eje X - aumentado para mejor lectura
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
            <div id="grafico-pdf-captura" className="grafico-wrapper" style={{ height: `${height}px` }}>
                <Bar data={chartData} options={options} plugins={[datalabelsPlugin]} />
            </div>
        </div>
    );
}