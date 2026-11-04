import React, { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const barLabelPlugin = {
  id: 'barLabel',
  afterDatasetsDraw(chart) {
    // Check if the plugin should be displayed based on options
    if (!chart.options.plugins.barLabel || !chart.options.plugins.barLabel.display) {
      return;
    }

    const { ctx, data } = chart;
    ctx.save();
    ctx.font = 'bold 14px sans-serif';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';

    chart.data.datasets.forEach((dataset, i) => {
      const meta = chart.getDatasetMeta(i);
      meta.data.forEach((bar, index) => {
        const value = dataset.data[index];
        ctx.fillText(value, bar.x, bar.y - 5);
      });
    });
    ctx.restore();
  }
};

export default function ServiciosChart({ data, showLabels = false }) {
  const [limit, setLimit] = useState(5);

  const chartData = useMemo(() => {
    if (!data) return { labels: [], datasets: [] };

    // Sort by quantity descending and take top N
    const sorted = [...data].sort((a, b) => b.cantidad - a.cantidad).slice(0, limit);

    return {
      labels: sorted.map(item => item.servicio),
      datasets: [
        {
          label: 'Cantidad de Solicitudes',
          data: sorted.map(item => item.cantidad),
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          borderColor: 'rgb(53, 162, 235)',
          borderWidth: 1,
        },
      ],
    };
  }, [data, limit]);

  const options = {
    responsive: true,
    animation: showLabels ? false : {},
    plugins: {
      barLabel: {
        display: showLabels
      },
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 16
          }
        }
      },
      title: {
        display: true,
        text: `Top ${limit} Servicios Más Solicitados`,
        font: {
          size: 20
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: {
            size: 16
          }
        }
      },
      x: {
        ticks: {
          font: {
            size: 18
          }
        }
      }
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="chart-container" style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
        <p>No hay datos para mostrar</p>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <div className="chart-controls" data-html2canvas-ignore="true" style={{ marginBottom: '10px', textAlign: 'right' }}>
        <label style={{ marginRight: '10px' }}>Mostrar:</label>
        <select 
          value={limit} 
          onChange={(e) => setLimit(Number(e.target.value))}
          style={{ padding: '5px', borderRadius: '5px', border: '1px solid #ccc' }}
        >
          <option value={5}>Top 5</option>
          <option value={10}>Top 10</option>
          <option value={15}>Top 15</option>
        </select>
      </div>
      <Bar options={options} data={chartData} plugins={[barLabelPlugin]} />
    </div>
  );
}
