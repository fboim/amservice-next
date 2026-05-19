'use client'

import { useEffect, useRef } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export default function MonthlyChart({ data = [] }) {
  const chartData = {
    labels: data.map((d) => d.label),
    datasets: [
      {
        type: 'bar',
        label: 'Unit Masuk',
        data: data.map((d) => d.value),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: '#3b82f6',
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false,
        yAxisID: 'y',
      },
      {
        type: 'line',
        label: 'Trend',
        data: data.map((d) => d.value),
        borderColor: '#f59e0b',
        borderWidth: 2,
        pointBackgroundColor: '#f59e0b',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.3,
        fill: false,
        yAxisID: 'y',
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          color: '#94a3b8',
          font: {
            family: 'Plus Jakarta Sans, sans-serif',
            size: 11,
          },
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        titleFont: {
          family: 'Plus Jakarta Sans, sans-serif',
          size: 13,
          weight: '600',
        },
        bodyFont: {
          family: 'Plus Jakarta Sans, sans-serif',
          size: 12,
        },
        displayColors: true,
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || ''
            if (label) {
              label += ': '
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y + ' unit'
            }
            return label
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#64748b',
          font: {
            family: 'Plus Jakarta Sans, sans-serif',
            size: 11,
          },
        },
        border: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#64748b',
          font: {
            family: 'Plus Jakarta Sans, sans-serif',
            size: 11,
          },
          stepSize: 5,
        },
        border: {
          display: false,
        },
      },
    },
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-slate-500">
        <div className="text-center">
          <i className="bi bi-bar-chart text-4xl mb-2 opacity-20" />
          <p className="text-sm">Belum ada data untuk ditampilkan</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-64">
      <Bar data={chartData} options={options} />
    </div>
  )
}