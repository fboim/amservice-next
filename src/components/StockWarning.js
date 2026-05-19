'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function StockWarning() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLowStock()
  }, [])

  const fetchLowStock = async () => {
    try {
      const res = await fetch('/api/sparepart?low=true')
      const data = await res.json()
      setItems(data.sparepart || [])
    } catch (err) {
      console.error('Failed to fetch low stock:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStockColor = (stock) => {
    if (stock === 0) return 'bg-red-500/20 text-red-400'
    if (stock <= 2) return 'bg-orange-500/20 text-orange-400'
    return 'bg-yellow-500/20 text-yellow-400'
  }

  const getStockIcon = (stock) => {
    if (stock === 0) return 'bi-exclamation-octagon-fill'
    if (stock <= 2) return 'bi-exclamation-triangle-fill'
    return 'bi-exclamation-circle-fill'
  }

  if (loading) {
    return (
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 bg-slate-700 rounded animate-pulse" />
          <div className="w-24 h-4 bg-slate-700 rounded animate-pulse" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-slate-700/50 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
        <div className="flex items-center gap-2 text-emerald-400">
          <i className="bi bi-check-circle-fill" />
          <span className="text-sm font-medium">Stok Aman</span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Semua sparepart dalam kondisi cukup
        </p>
      </div>
    )
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <i className="bi bi-exclamation-triangle-fill text-amber-400" />
          <span className="text-sm font-semibold text-white">Stok Menipis</span>
        </div>
        <span className="text-xs text-slate-500">{items.length} item</span>
      </div>

      <div className="space-y-2">
        {items.slice(0, 5).map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <i className={`bi ${getStockIcon(item.stok)} text-xs ${getStockColor(item.stok)}`} />
              <span className="text-sm text-slate-300 truncate">{item.nama}</span>
            </div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getStockColor(item.stok)}`}>
              {item.stok}
            </span>
          </div>
        ))}
      </div>

      {items.length > 5 && (
        <Link
          href="/sparepart"
          className="flex items-center justify-center gap-1 mt-3 text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          <span>Lihat semua ({items.length})</span>
          <i className="bi bi-chevron-right" />
        </Link>
      )}
    </div>
  )
}