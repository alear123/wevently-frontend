import React, { useRef, useEffect, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);


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

/**
 * Componente de barra genérico y parametrizable.
 */
export default function GraficoBarras({
    datos = [],
    // Mapeo flexible
    getLabel = (item) => item.label ?? item.nombreMedio ?? '',
    getValor = (item) => item.cantidad ?? item.cantidadVeces ?? 0,
    // Visual
    labelDataset = 'Cantidad',
    backgroundColor = '#9CC0FF',
    borderColor = '#1a2899',
    borderWidth = 1,
    borderRadius = 4,
    borderSkipped = false,
    height = 400,
    mostrarLeyenda = false,
    leyendaPosition = 'top',
    mostrarTitulo = true,
    titulo = '',
    tituloFontSize = 18,
    tituloFontWeight = 'bold',
    tituloPadding = 14,
    // Tooltips
    tooltipLabel = null,
    tooltipTitle = null,
    tooltipBackgroundColor = 'rgba(0, 0, 0, 0.8)',
    tooltipTitleColor = '#fff',
    tooltipBodyColor = '#fff',
    tooltipBorderColor = '#2433FF',
    tooltipBorderWidth = 1,
    tooltipTitleFontSize = 16,
    tooltipBodyFontSize = 15,
    // Ejes
    beginAtZero = true,
    yTickFontSize = 19,
    xTickFontSize = 19,
    yGridColor = 'rgba(0,0,0,0.1)',
    xGridDisplay = false,
    mostrarEtiquetas = false, // Nueva prop
}) {
    const chartData = {
        labels: datos.map(getLabel),
        datasets: [{
            label: labelDataset,
            data: datos.map(getValor),
            backgroundColor,
            borderColor,
            borderWidth,
            borderRadius,
            borderSkipped,
        }],
    };

    // Ref para manejar el estado de mostrarEtiquetas dentro del plugin sin cierres obsoletos
    const mostrarEtiquetasRef = useRef(mostrarEtiquetas);
    useEffect(() => {
        mostrarEtiquetasRef.current = mostrarEtiquetas;
    }, [mostrarEtiquetas]);

    // Plugin personalizado para dibujar etiquetas en barras
    const datalabelsPlugin = useMemo(() => ({
        id: 'customDatalabelsBar',
        afterDatasetsDraw(chart) {
            if (!mostrarEtiquetasRef.current) return;
            const { ctx } = chart;
            chart.data.datasets.forEach((dataset, i) => {
                const meta = chart.getDatasetMeta(i);
                meta.data.forEach((bar, index) => {
                    const valor = dataset.data[index];
                    if (valor !== null && valor !== undefined) {
                        ctx.save();
                        ctx.font = 'bold 12px Arial';
                        ctx.fillStyle = '#000';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'bottom';
                        // Posición: x en el centro de la barra, y un poco arriba del tope
                        const x = bar.x;
                        const y = bar.y - 5;
                        ctx.fillText(valor, x, y);
                        ctx.restore();
                    }
                });
            });
        }
    }), []);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        animation: mostrarEtiquetas ? false : { duration: 1000 },
        plugins: {
            legend: {
                display: mostrarLeyenda,
                position: leyendaPosition,
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
                callbacks: {
                    label: tooltipLabel || ((context) => `${labelDataset}: ${context.formattedValue}`),
                    title: tooltipTitle || ((context) => context[0]?.label),
                },
            },
        },
        scales: {
            y: {
                beginAtZero,
                grid: { color: yGridColor },
                ticks: { font: { size: yTickFontSize } },
            },
            x: {
                grid: { display: xGridDisplay },
                ticks: { font: { size: xTickFontSize } },
            },
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
                <Bar data={chartData} options={options} plugins={[datalabelsPlugin]} redraw={mostrarEtiquetas} />
            </div>
        </div>
    );
}
