import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORES_TORTA = ['#2433FF', '#9CC0FF'];

export default function GraficoPastel({
    datos = [],
    titulo = 'Proporción de contrataciones',
    height = 320,
    mostrarLeyenda = true,
    mostrarTitulo = true
}) {
    const chartData = {
        labels: datos.map(item => item.tipo),
        datasets: [{
            data: datos.map(item => item.cantidad ?? item.porcentaje ?? 0),
            backgroundColor: COLORES_TORTA,
            borderColor: '#fff',
            borderWidth: 2
        }]
    };
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: mostrarLeyenda,
                position: 'top',
                labels: { font: { size: 12 }, padding: 14 }
            },
            title: {
                display: mostrarTitulo,
                text: titulo,
                font: { size: 15, weight: 'bold' }
            },
            tooltip: {
                callbacks: {
                    label: (ctx) => `${ctx.label}: ${ctx.formattedValue} (${((ctx.raw / chartData.datasets[0].data.reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%)`
                }
            }
        }
    };
    if (!datos || datos.length === 0) {
        return <div className="grafico-container"><div className="grafico-sin-datos"><p>No hay datos disponibles para mostrar</p></div></div>;
    }
    return (
        <div className="grafico-container">
            <div className="grafico-wrapper" style={{ height }}>
                <Pie data={chartData} options={options} />
            </div>
        </div>
    );
}
