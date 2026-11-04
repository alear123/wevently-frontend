import React, { useRef, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function GraficoLinealReseñas({
    datos = [],
    getLabel = (item) => item.label ?? item.fecha ?? '',
    getValor = (item) => item.valor ?? item.promedioEstrellas ?? 0,
    labelDataset = "Datos",
    borderColor = '#fbbf24',
    backgroundColor = 'rgba(251, 191, 36, 0.1)',
    height = 330,
    yMax = 5,
    tooltipCallbacks = null,
    mostrarEtiquetas = false
}) {
    const mostrarEtiquetasRef = useRef(mostrarEtiquetas);

    useEffect(() => {
        mostrarEtiquetasRef.current = mostrarEtiquetas;
    }, [mostrarEtiquetas]);
    const chartData = {
        labels: datos.map(getLabel),
        datasets: [{
            label: labelDataset,
            data: datos.map(getValor),
            borderColor,
            backgroundColor,
            borderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: 0.4,
            fill: true,
        }],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: '#fbbf24',
                borderWidth: 1,
                titleFont: { size: 16 },
                bodyFont: { size: 14 },
                callbacks: tooltipCallbacks || {
                    label: function (context) { return `${labelDataset}: ${context.formattedValue}`; },
                    title: function (context) { return `Fecha: ${context[0].label}`; },
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                max: yMax,
                grid: { color: 'rgba(0, 0, 0, 0.1)' },
                ticks: {
                    font: { size: 19 }, // Eje Y - aumenta este valor para letras más grandes
                    callback: (value) => value.toFixed(1) + ' ⭐',
                },
            },
            x: {
                grid: { display: false },
                ticks: {
                    display: false,
                    font: { size: 14 }, // Eje X - aumenta este valor si muestras etiquetas
                },
            },
        },
        animation: {
            duration: 1000,
            easing: 'easeInOutQuart',
        },
    };

    // Plugin personalizado para dibujar etiquetas en los puntos
    const datalabelsPlugin = {
        id: 'customDatalabels',
        afterDatasetsDraw(chart) {
            if (!mostrarEtiquetasRef.current) return;
            const { ctx } = chart;
            chart.data.datasets.forEach((dataset, i) => {
                const meta = chart.getDatasetMeta(i);
                meta.data.forEach((point, index) => {
                    const valor = dataset.data[index];
                    if (valor !== null && valor !== undefined) {
                        ctx.save();
                        ctx.font = 'bold 12px Arial';
                        ctx.fillStyle = '#000';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'bottom';
                        const x = point.x;
                        const y = point.y - 10;
                        ctx.fillText(`${valor.toFixed(1)}⭐`, x, y);
                        ctx.restore();
                    }
                });
            });
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
            <div className="grafico-wrapper" style={{ height }}>
                <Line data={chartData} options={options} plugins={[datalabelsPlugin]} />
            </div>
        </div>
    );
}
