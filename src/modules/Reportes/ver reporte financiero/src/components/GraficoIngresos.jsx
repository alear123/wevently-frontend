// src/components/GraficoIngresos.jsx
import React, { forwardRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

/**
 * GraficoIngresos
 * - props:
 *    - labels: array de labels (ej: ['Enero', ...] or ['Q1', 'Q2', ...] or ['2022','2023'])
 *    - datasets: array de datasets compatibles con Chart.js
 *    - options: opciones adicionales (opcional)
 *
 * Se usa forwardRef para que el padre pueda acceder al elemento contenedor si lo necesita.
 */
const GraficoIngresos = forwardRef(({ labels = [], datasets = [], options = {} }, ref) => {
  const data = {
    labels,
    datasets,
  };

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Ingresos por período",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const value = context.raw ?? context.parsed?.y;
            if (typeof value === "number") {
              return `${context.dataset.label}: $${value.toLocaleString()}`;
            }
            return `${context.dataset.label}: ${value}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return `$${value.toLocaleString()}`;
          },
        },
      },
    },
  };

  return (
    <div style={{ width: "100%", height: 420 }} ref={ref}>
      <Bar data={data} options={{ ...defaultOptions, ...options }} />
    </div>
  );
});

export default GraficoIngresos;
