import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function GraficoLineal({
    datos = [],
    // Mapeo flexible
    getLabel = (item) => item.label ?? item.fecha ?? item.periodo ?? '',
    getValor = (item) => item.cantidad ?? item.valor ?? 0,
    // Visual
    labelDataset = "Datos",
    borderColor = '#2433FF',
    backgroundColor = 'rgba(36, 51, 255, 0.1)',
    borderWidth = 2,
    pointRadius = 4,
    pointHoverRadius = 6,
    tension = 0.4,
    fill = true,
    height = 400,
    mostrarLeyenda = true,
    leyendaPosition = 'top',
    mostrarTitulo = true,
    titulo = "Gráfico",
    tituloFontSize = 16,
    tituloFontWeight = 'bold',
    tituloPadding = 20,
    // Tooltips
    tooltipCallbacks = null,
    tooltipBackgroundColor = 'rgba(0, 0, 0, 0.8)',
    tooltipTitleColor = '#fff',
    tooltipBodyColor = '#fff',
    tooltipBorderColor = '#2433FF',
    tooltipBorderWidth = 1,
    tooltipTitleFontSize = 16,
    tooltipBodyFontSize = 14,
    // Ejes
    beginAtZero = true,
    yTickFontSize = 19,
    yTickCallback = (value) => {
        if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
        if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
        return value;
    },
    yGridColor = 'rgba(0, 0, 0, 0.1)',
    xGridDisplay = false,
    xTickDisplay = false,
    // Eventos
    onPointClick = null,
    // Animaciones/config extra
    animationDuration = 1000,
    animationEasing = 'easeInOutQuart',
}) {
    const chartData = {
        labels: datos.map(getLabel),
        datasets: [{
            label: labelDataset,
            data: datos.map(getValor),
            borderColor,
            backgroundColor,
            borderWidth,
            pointRadius,
            pointHoverRadius,
            tension,
            fill,
        }],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: mostrarLeyenda,
                position: leyendaPosition,
                labels: { padding: 20, font: { size: 12 } },
            },
            title: {
                display: mostrarTitulo,
                text: titulo,
                font: { size: tituloFontSize, weight: tituloFontWeight },
                padding: tituloPadding,
            },
            tooltip: {
                backgroundColor: tooltipBackgroundColor,
                titleColor: tooltipTitleColor,
                bodyColor: tooltipBodyColor,
                borderColor: tooltipBorderColor,
                borderWidth: tooltipBorderWidth,
                titleFont: { size: tooltipTitleFontSize },
                bodyFont: { size: tooltipBodyFontSize },
                callbacks: tooltipCallbacks || {
                    label: function (context) { return `${labelDataset}: ${context.formattedValue}`; },
                    title: function (context) { return `Fecha: ${context[0].label}`; },
                },
            },
        },
        scales: {
            y: {
                beginAtZero,
                grid: { color: yGridColor },
                ticks: { font: { size: yTickFontSize }, callback: yTickCallback },
            },
            x: {
                grid: { display: xGridDisplay },
                ticks: { display: xTickDisplay },
            },
        },
        onClick: onPointClick
            ? (event, elements) => {
                if (elements.length > 0) {
                    const index = elements[0].index;
                    const dataPoint = datos[index];
                    onPointClick(dataPoint, index);
                }
            }
            : undefined,
        animation: {
            duration: animationDuration,
            easing: animationEasing,
        },
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
                <Line data={chartData} options={options} />
            </div>
        </div>
    );
}