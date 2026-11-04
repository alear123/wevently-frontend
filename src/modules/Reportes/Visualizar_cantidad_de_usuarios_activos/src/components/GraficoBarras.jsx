import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement,
    Title, Tooltip, Legend
} from 'chart.js';

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

export default function GraficoBarras({
    datos = [],
    titulo = '',
    labelDataset = 'Cantidad',
    backgroundColor = '#9CC0FF',
    borderColor = '#1a2899',
    height = 400,
    mostrarLeyenda = false,
    mostrarTitulo = true
}) {
    const chartData = {
        labels: datos.map(item => item.nombreMedio || item.label || ''),
        datasets: [{
            label: labelDataset,
            data: datos.map(item => item.cantidadVeces ?? item.cantidad ?? 0),
            backgroundColor,
            borderColor,
            borderWidth: 1,
            borderRadius: 4,
            borderSkipped: false
        }]
    };
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: mostrarLeyenda, position: 'top' },
            title: { display: mostrarTitulo, text: titulo, font: { size: 18, weight: 'bold' }, padding: 14 },
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
                    size: 15 // Aumentado tamaño cuerpo tooltip
                },
                callbacks: {
                    label: (context) => `${labelDataset}: ${context.formattedValue}`,
                    title: (context) => context[0]?.label
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(0,0,0,0.1)' },
                ticks: { font: { size: 19 } }
            },
            x: { grid: { display: false }, ticks: { font: { size: 19 } } }
        }
    };
    if (!datos || datos.length === 0) {
        return <div className="grafico-container"><div className="grafico-sin-datos"><p>No hay datos disponibles para mostrar</p></div></div>;
    }
    return (
        <div className="grafico-container">
            <div className="grafico-wrapper" style={{ height }}>
                <Bar data={chartData} options={options} />
            </div>
        </div>
    );
}