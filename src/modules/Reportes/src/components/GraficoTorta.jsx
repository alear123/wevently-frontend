import React, { useRef, useEffect, useMemo } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

/**
 * Gráfico de torta parametrizable.
 */
export default function GraficoTorta({
    datos = [],
    // Mapeo flexible
    getLabel = (item) => item.tipo ?? item.label ?? '',
    getValor = (item) => item.cantidad ?? item.porcentaje ?? 0,
    // Colores: permite un array arbitrario o función
    backgroundColors = ['#2433FF', '#9CC0FF', '#FFB347', '#ED2939', '#4DC3FF', '#B8E986', '#F05C7A'],
    borderColor = '#fff',
    borderWidth = 2,
    // Visual general
    labelDataset = '',
    height = 320,
    mostrarLeyenda = true,
    leyendaPosition = 'top',
    leyendaFontSize = 12,
    leyendaPadding = 14,
    mostrarTitulo = true,
    titulo = 'Proporción de contrataciones',
    tituloFontSize = 15,
    tituloFontWeight = 'bold',
    // Tooltips
    tooltipCallbacks = null,
    mostrarEtiquetas = false, // Nueva prop
}) {
    // Soporte para función o array para los colores
    const bgColorList = typeof backgroundColors === 'function'
        ? datos.map(backgroundColors)
        : datos.map((_, i) => backgroundColors[i % backgroundColors.length]);

    const chartData = {
        labels: datos.map(getLabel),
        datasets: [{
            label: labelDataset,
            data: datos.map(getValor),
            backgroundColor: bgColorList,
            borderColor,
            borderWidth,
        }],
    };

    // Ref para manejar el estado de mostrarEtiquetas dentro del plugin sin cierres obsoletos
    const mostrarEtiquetasRef = useRef(mostrarEtiquetas);
    useEffect(() => {
        mostrarEtiquetasRef.current = mostrarEtiquetas;
    }, [mostrarEtiquetas]);

    // Plugin personalizado para dibujar etiquetas
    const datalabelsPlugin = useMemo(() => ({
        id: 'customDatalabels',
        afterDatasetsDraw(chart) {
            if (!mostrarEtiquetasRef.current) return;
            const { ctx, data } = chart;
            chart.data.datasets.forEach((dataset, i) => {
                const meta = chart.getDatasetMeta(i);
                // Calcular total dinámicamente para porcentajes
                const total = dataset.data.reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0);

                meta.data.forEach((element, index) => {
                    // Solo dibujar si es visible
                    if (!element.hidden) {
                        const { x, y } = element.tooltipPosition();
                        const valor = dataset.data[index];
                        const label = data.labels[index];
                        const porcentaje = total > 0 ? ((valor / total) * 100).toFixed(1) + '%' : '';

                        ctx.save();
                        ctx.font = 'bold 12px Arial';
                        ctx.fillStyle = '#000'; // Color del texto
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';

                        // Ajuste de posición para que no se superpongan demasiado si son pequeños
                        // Una estrategia simple es escribirlo en la posición del tooltip (centro del arco)
                        ctx.fillText(`${label}`, x, y - 8);
                        ctx.fillText(`${valor} (${porcentaje})`, x, y + 8);
                        ctx.restore();
                    }
                });
            });
        }
    }), []);

    const total = chartData.datasets[0].data.reduce((a, b) => a + b, 0); // Mantener para tooltip si se usa

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        animation: mostrarEtiquetas ? false : { duration: 1000 },
        plugins: {
            legend: {
                display: mostrarLeyenda,
                position: leyendaPosition,
                labels: { font: { size: leyendaFontSize }, padding: leyendaPadding },
            },
            title: {
                display: mostrarTitulo,
                text: titulo,
                font: { size: tituloFontSize, weight: tituloFontWeight },
            },
            tooltip: {
                callbacks: tooltipCallbacks || {
                    label: (ctx) => {
                        const label = ctx.label || '';
                        const value = ctx.formattedValue || '';
                        const percent = total > 0 ? ` (${((ctx.raw / total) * 100).toFixed(1)}%)` : '';
                        return `${label}: ${value}${percent}`;
                    },
                },
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
                <Pie data={chartData} options={options} plugins={[datalabelsPlugin]} redraw={true} />
            </div>
        </div>
    );
}
