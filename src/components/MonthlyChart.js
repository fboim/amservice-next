'use client'

import { useEffect, useRef } from 'react'

export default function MonthlyChart({ data = [] }) {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current || !data || data.length === 0) return

    const ctx = canvasRef.current.getContext('2d')

    // Destroy existing chart
    if (chartRef.current) {
      chartRef.current.destroy()
    }

    // Prepare data
    const labels = data.map(d => d.label)
    const values = data.map(d => d.value)
    const maxValue = Math.max(...values, 1)

    // Chart.js-like bar chart implementation using canvas
    const chart = {
      ctx,
      data: { labels, values, maxValue },
      destroyed: false,
      destroy() {
        this.destroyed = true
        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d')
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        }
      },
      draw() {
        const { ctx, data } = this
        const canvas = canvasRef.current
        const width = canvas.width
        const height = canvas.height

        const padding = { top: 20, right: 20, bottom: 40, left: 40 }
        const chartWidth = width - padding.left - padding.right
        const chartHeight = height - padding.top - padding.bottom

        const barWidth = chartWidth / data.labels.length * 0.6
        const barGap = chartWidth / data.labels.length * 0.4

        // Clear canvas
        ctx.clearRect(0, 0, width, height)

        // Draw grid lines
        ctx.strokeStyle = 'rgba(255,255,255,0.05)'
        ctx.lineWidth = 1
        for (let i = 0; i <= 4; i++) {
          const y = padding.top + (chartHeight / 4) * i
          ctx.beginPath()
          ctx.moveTo(padding.left, y)
          ctx.lineTo(width - padding.right, y)
          ctx.stroke()
        }

        // Draw bars
        data.values.forEach((value, index) => {
          const barHeight = (value / data.maxValue) * chartHeight
          const x = padding.left + index * (barWidth + barGap) + barGap / 2
          const y = padding.top + chartHeight - barHeight

          // Bar gradient
          const gradient = ctx.createLinearGradient(x, y, x, y + barHeight)
          gradient.addColorStop(0, '#3b82f6')
          gradient.addColorStop(1, '#2563eb')

          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0])
          ctx.fill()

          // Value label on top
          ctx.fillStyle = '#f1f5f9'
          ctx.font = '11px Plus Jakarta Sans'
          ctx.textAlign = 'center'
          ctx.fillText(value, x + barWidth / 2, y - 8)

          // X-axis label
          ctx.fillStyle = '#64748b'
          ctx.font = '11px Plus Jakarta Sans'
          ctx.fillText(data.labels[index], x + barWidth / 2, height - padding.bottom + 16)
        })
      }
    }

    chartRef.current = chart
    chart.draw()

    // Handle resize
    const handleResize = () => {
      if (chartRef.current && !chartRef.current.destroyed) {
        if (canvasRef.current) {
          const container = canvasRef.current.parentElement
          canvasRef.current.width = container.clientWidth
          canvasRef.current.height = container.clientHeight
          chartRef.current.draw()
        }
      }
    }

    // Initial resize
    handleResize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (chartRef.current && !chartRef.current.destroyed) {
        chartRef.current.destroy()
      }
    }
  }, [data])

  if (!data || data.length === 0) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--am-text-muted)' }}>
        <div style={{ textAlign: 'center' }}>
          <i className="bi bi-bar-chart" style={{ fontSize: '3rem', opacity: 0.3 }} />
          <p style={{ fontSize: '.8rem', marginTop: '8px' }}>Belum ada data</p>
        </div>
      </div>
    )
  }

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%' }}
    />
  )
}