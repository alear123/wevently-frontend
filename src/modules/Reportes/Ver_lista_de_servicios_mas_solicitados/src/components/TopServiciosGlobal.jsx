import React, { useEffect, useState, useMemo } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { getTopServiciosGlobal } from '../../../src/api/reportesApi';

ChartJS.register(ArcElement, Tooltip, Legend);

const textCenterPlugin = {
  id: 'textCenter',
  afterDatasetsDraw(chart) {
    const { ctx, data } = chart;
    // Check if the plugin should be displayed based on options
    if (!chart.options.plugins.textCenter || !chart.options.plugins.textCenter.display) {
      return;
    }

    ctx.save();
    ctx.font = 'bold 12px sans-serif';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const meta = chart.getDatasetMeta(0);
    meta.data.forEach((element, index) => {
      // Get the center point of the slice
      const { x, y } = element.tooltipPosition();
      
      // Get value and calculate percentage
      const value = data.datasets[0].data[index];
      const total = meta.total;
      const percentage = Math.round((value / total) * 100) + '%';
      
      // Draw text
      ctx.fillText(`${value} (${percentage})`, x, y);
    });
    ctx.restore();
  }
};

export default function TopServiciosGlobal({ showLabels = false }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTopServiciosGlobal()
      .then(res => setData(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return { labels: [], datasets: [] };

    return {
      labels: data.map(item => item.servicio),
      datasets: [
        {
          label: 'Cantidad',
          data: data.map(item => item.cantidad),
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [data]);

  const options = {
    responsive: true,
    animation: showLabels ? false : {},
    plugins: {
      textCenter: {
        display: showLabels
      },
      legend: {
        position: 'right',
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            let value = context.raw;
            let total = context.chart._metasets[context.datasetIndex].total;
            let percentage = Math.round((value / total) * 100) + '%';
            return label + value + ' (' + percentage + ')';
          }
        }
      }
    },
  };

  if (loading) return <div>Cargando top servicios...</div>;

  const hasData = data && data.length > 0;

  return (
    <div className="card-reporte-global" style={{ width: '300px', height: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h3 style={{ fontSize: '1rem', marginBottom: '10px' }}>Top 3 Servicios (Global)</h3>
      <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {hasData ? (
          <Pie data={chartData} options={options} plugins={[textCenterPlugin]} />
        ) : (
          <p style={{ color: '#666', marginTop: 'auto', marginBottom: 'auto' }}>No hay datos para mostrar</p>
        )}
      </div>
    </div>
  );
}
