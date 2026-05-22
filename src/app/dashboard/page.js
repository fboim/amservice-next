'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AppLayout from '@/components/AppLayout'
import { formatRupiah } from '@/lib/utils'

export default function Dashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ antrean: 0, proses: 0, siap: 0, selesai: 0, omzet_hari: 0, omzet_bulan: 0, merk_populer: [], total_tahun: 0 })
  const [servisTerbaru, setServisTerbaru] = useState([])
  const [lowStock, setLowStock] = useState([])
  const [user, setUser] = useState(null)
  const [modalKeluhan, setModalKeluhan] = useState(null)
  const [openDropdown, setOpenDropdown] = useState(null)
  const [isDark, setIsDark] = useState(false)
  const dropdownRefs = useRef({})

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setIsDark(savedTheme === 'dark' || (!savedTheme && systemDark))

    const token = localStorage.getItem('ams_token') || sessionStorage.getItem('ams_token')
    const userData = localStorage.getItem('ams_user') || sessionStorage.getItem('ams_user')

    if (!token) {
      router.push('/login')
      return
    }

    if (userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (e) {
        console.error('Failed to parse user')
      }
    }

    fetchDashboard()
  }, [router])

  useEffect(() => {
    const handleClickOutside = (e) => {
      Object.values(dropdownRefs.current).forEach(ref => {
        if (ref && !ref.contains(e.target)) {
          setOpenDropdown(null)
        }
      })
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchDashboard = async () => {
    try {
      const [dashRes, servisRes, lowStockRes] = await Promise.all([
        fetch('/api/dashboard', { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } }),
        fetch('/api/servis?limit=10', { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } }),
        fetch('/api/sparepart?low=true&limit=10', { cache: 'no-store' }),
      ])

      const [dashData, servisData, lowStockData] = await Promise.all([
        dashRes.json(),
        servisRes.json(),
        lowStockRes.json(),
      ])

      setStats(dashData || {})
      setServisTerbaru(servisData.servis || [])
      setLowStock(lowStockData.sparepart || [])
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const isAdmin = user?.role?.toLowerCase() === 'admin'
  const isPengunjung = user?.role?.toLowerCase() === 'pengunjung'

  const statusBadge = (status) => {
    const classes = {
      'Antrean': 'badge-antrean',
      'Proses': 'badge-proses',
      'Siap Diambil': 'badge-siap',
      'Sudah Diambil': 'badge-selesai',
      'Tidak Bisa': 'badge-gagal'
    }
    return classes[status] || 'badge-antrean'
  }

  const statusText = (status) => {
    const map = {
      'Antrean': 'Antrean',
      'Proses': 'Proses',
      'Siap Diambil': 'Siap',
      'Sudah Diambil': 'Selesai',
      'Tidak Bisa': 'Gagal'
    }
    return map[status] || status
  }

  const handleDelete = async (id) => {
    if (!confirm('Yakin hapus servis ini?')) return
    try {
      const res = await fetch(`/api/servis?id=${id}`, { method: 'DELETE' })
      if (res.ok) fetchDashboard()
    } catch (err) {
      console.error('Delete error:', err)
    }
  }

  const getWhatsAppUrl = (servis) => {
    const noHp = servis.no_hp?.replace(/\D/g, '') || ''
    const phone = noHp.startsWith('0') ? '62' + noHp : noHp.startsWith('62') ? noHp : '62' + noHp
    return `https://wa.me/${phone}`
  }

  if (loading) {
    return (
      <AppLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
          <div style={{ textAlign: 'center', color: 'var(--am-text-muted)' }}>
            <i className="bi bi-arrow-repeat" style={{ fontSize: '2rem', animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: '8px' }}>Memuat...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  const surface = 'var(--am-surface)'
  const border = 'var(--am-border)'
  const bg = 'var(--am-bg)'
  const textMain = 'var(--am-text)'
  const textMuted = 'var(--am-text-muted)'

  // Safe formatRupiah wrapper to prevent crashes
  const safeFormatRupiah = (value) => {
    try {
      return formatRupiah(value)
    } catch (e) {
      return 'Rp 0'
    }
  }

  // Prepare chart data - all 12 months
  const chartData = stats.monthly_data || []
  const maxVal = Math.max(...chartData.map(m => m.value || 0), 1)

  return (
    <AppLayout>
      {/* Modal Keluhan */}
      {modalKeluhan && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setModalKeluhan(null)}
        >
          <div
            style={{
              background: surface, borderRadius: '12px', padding: '20px', maxWidth: '500px',
              width: '90%', boxShadow: '0 20px 50px rgba(0,0,0,0.25)', border: `1px solid ${border}`
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <div style={{ fontWeight: '700', fontSize: '1rem', color: textMain }}>{modalKeluhan.hp}</div>
                <div style={{ fontSize: '.8rem', color: textMuted, marginTop: '2px' }}>{modalKeluhan.nama}</div>
              </div>
              <button
                onClick={() => setModalKeluhan(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', color: textMuted, cursor: 'pointer', lineHeight: 1 }}
              >
                ×
              </button>
            </div>
            <div style={{
              background: 'var(--am-surface-2)',
              borderRadius: '8px', padding: '14px',
              border: `1px solid ${border}`
            }}>
              <div style={{ fontSize: '.65rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '.5px', color: textMuted, marginBottom: '6px' }}>
                Keluhan
              </div>
              <div style={{ fontSize: '.85rem', lineHeight: 1.6, color: textMain, whiteSpace: 'pre-wrap' }}>
                {modalKeluhan.keluhan}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Cards - 4 Kolom -> 2 on mobile */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
        {[
          { label: 'Antrean', value: stats.antrean, sub: 'Unit hari ini', icon: 'bi-person-plus-fill', color: '#3b82f6', border: '#3b82f6' },
          { label: 'Dikerjakan', value: stats.proses, sub: 'Sedang diproses', icon: 'bi-tools', color: '#d97706', border: '#f59e0b' },
          { label: 'Siap Diambil', value: stats.siap, sub: 'Tunggu pelanggan', icon: 'bi-bag-check-fill', color: '#0891b2', border: '#06b6d4' },
          { label: 'Selesai', value: stats.selesai, sub: 'Diambil hari ini', icon: 'bi-check-circle-fill', color: '#059669', border: '#10b981' },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-gray-200 dark:border-slate-700 border-l-4 flex items-center gap-2"
            style={{ borderLeftColor: card.border }}
          >
            <div style={{
              width: '32px', height: '32px', borderRadius: '6px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `${card.color}15`, color: card.color, fontSize: '0.875rem', flexShrink: 0
            }}>
              <i className={`bi ${card.icon}`} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {card.label}
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight">
                {card.value}
              </div>
              <div className="text-[10px] text-gray-400 dark:text-gray-500">{card.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Omzet Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-gray-200 dark:border-slate-700 border-l-4 border-l-purple-500 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <i className="bi bi-cash-stack text-base" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Omzet Hari Ini
            </div>
            <div className="text-base font-bold text-gray-900 dark:text-gray-100 leading-tight">
              {safeFormatRupiah(stats.omzet_hari)}
            </div>
            <div className="text-[10px] text-gray-400 dark:text-gray-500">
              {stats.selesai} transaksi selesai
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-gray-200 dark:border-slate-700 border-l-4 border-l-rose-500 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <i className="bi bi-graph-up-arrow text-base" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Omzet Bulan Ini
            </div>
            <div className="text-base font-bold text-gray-900 dark:text-gray-100 leading-tight">
              {safeFormatRupiah(stats.omzet_bulan)}
            </div>
            <div className="text-[10px] text-gray-400 dark:text-gray-500">
              {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      {/* Servis Table - Full Width */}
      <div className="mb-3">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="p-3 bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
            <span className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
              <i className="bi bi-clock-history text-blue-500" /> Servis Terbaru
            </span>
            <Link href="/servis/data" className="text-xs text-blue-500 font-semibold flex items-center gap-1 no-underline">
              Lihat Semua <i className="bi bi-arrow-right" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="dark:bg-slate-800 bg-gray-100">
                  <th className="p-2 text-center text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-slate-700">No</th>
                  <th className="p-2 text-left text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-slate-700">Pelanggan</th>
                  <th className="p-2 text-left text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-slate-700 hidden md:table-cell">Unit HP</th>
                  <th className="p-2 text-left text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-slate-700">Keluhan</th>
                  <th className="p-2 text-center text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-slate-700">Status</th>
                  <th className="p-2 text-right text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-slate-700 hidden sm:table-cell">Biaya</th>
                  <th className="p-2 text-center text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-slate-700">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {servisTerbaru.length > 0 ? servisTerbaru.map((s, i) => (
                  <tr key={s.id} className={`border-b border-gray-200 dark:border-slate-700 ${i % 2 === 0 ? 'bg-gray-50 dark:bg-slate-800/50' : ''}`}>
                    <td className="p-2 text-center font-bold text-gray-400 dark:text-gray-500">{i + 1}</td>
                    <td className="p-2 text-left">
                      <div className="font-semibold text-gray-900 dark:text-gray-100 text-xs">{s.nama_pelanggan}</div>
                      <div className="text-[10px] text-gray-400 dark:text-gray-500">{s.no_servis}</div>
                    </td>
                    <td className="p-2 text-left hidden md:table-cell">
                      <div className="font-semibold text-gray-900 dark:text-gray-100 text-xs">{s.merk_hp} {s.tipe_hp}</div>
                      <div className="text-[10px] text-gray-400 dark:text-gray-500">
                        {new Date(s.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                      </div>
                    </td>
                    <td className="p-2 text-left max-w-[100px]">
                      {s.keluhan ? (
                        <span
                          className="text-blue-500 dark:text-blue-400 underline decoration-dotted underline-offset-2 text-xs cursor-pointer"
                          onClick={() => setModalKeluhan({ hp: `${s.merk_hp} ${s.tipe_hp}`, nama: s.nama_pelanggan, keluhan: s.keluhan })}
                        >
                          {s.keluhan.length > 20 ? s.keluhan.substring(0, 20) + '…' : s.keluhan}
                        </span>
                      ) : (
                        <span style={{ color: textMuted, fontSize: '.75rem' }}>-</span>
                      )}
                    </td>
                    <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                      <span className={`badge-soft ${statusBadge(s.status)}`} style={{
                        display: 'inline-flex', alignItems: 'center',
                        padding: '2px 6px', borderRadius: '999px',
                        fontSize: '.6rem', fontWeight: '700'
                      }}>
                        {statusText(s.status)}
                      </span>
                    </td>
                    <td className="p-2 text-right font-semibold text-gray-900 dark:text-gray-100 text-xs hidden sm:table-cell">
                      {safeFormatRupiah(s.estimasi_biaya)}
                    </td>
                    <td className="p-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {!isPengunjung && (
                          <Link href={`/servis/edit/${s.id}`} className="btn-act btn-act-blue" title="Edit">
                            <i className="bi bi-pencil-square" />
                          </Link>
                        )}
                        <div style={{ position: 'relative' }} ref={el => dropdownRefs.current[s.id] = el}>
                          <button
                            className="btn-act btn-act-dark"
                            onClick={() => setOpenDropdown(openDropdown === s.id ? null : s.id)}
                          >
                            <i className="bi bi-chevron-down" style={{ fontSize: '.7rem' }} />
                          </button>
                          {openDropdown === s.id && (
                            <div style={{
                              position: 'absolute', right: 0, top: '100%', marginTop: '4px',
                              background: surface, border: `1px solid ${border}`,
                              borderRadius: '8px', boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                              minWidth: '160px', zIndex: 100, overflow: 'hidden'
                            }}>
                              <Link href={`/nota/${s.id}`} target="_blank" style={{
                                display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px',
                                fontSize: '.75rem', color: textMain, textDecoration: 'none',
                                borderBottom: `1px solid ${border}`
                              }}>
                                <i className="bi bi-receipt" style={{ color: '#059669' }} /> Nota Offline
                              </Link>
                              <Link href={`/nota/${s.id}/penerimaan`} target="_blank" style={{
                                display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px',
                                fontSize: '.75rem', color: textMain, textDecoration: 'none',
                                borderBottom: `1px solid ${border}`
                              }}>
                                <i className="bi bi-qr-code" style={{ color: '#2563eb' }} /> QR Code
                              </Link>
                              <Link href={`/nota/${s.id}/garansi`} target="_blank" style={{
                                display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px',
                                fontSize: '.75rem', color: textMain, textDecoration: 'none',
                                borderBottom: `1px solid ${border}`
                              }}>
                                <i className="bi bi-shield-check" style={{ color: '#f59e0b' }} /> Nota Garansi
                              </Link>
                              <Link href={`/nota/${s.id}/label`} target="_blank" style={{
                                display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px',
                                fontSize: '.75rem', color: textMain, textDecoration: 'none',
                                borderBottom: `1px solid ${border}`
                              }}>
                                <i className="bi bi-tag" style={{ color: '#8b5cf6' }} /> Label
                              </Link>
                              <div style={{ height: '1px', background: border }} />
                              <a href={`/nota/${s.id}/penerimaan?pdf=1`} target="_blank" style={{
                                display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px',
                                fontSize: '.75rem', color: '#0ea5e9', textDecoration: 'none'
                              }}>
                                <i className="bi bi-download" /> PDF Penerimaan
                              </a>
                            </div>
                          )}
                        </div>
                        <a href={getWhatsAppUrl(s)} target="_blank" className="btn-act btn-act-green" title="WhatsApp">
                          <i className="bi bi-whatsapp" />
                        </a>
                        {isAdmin && (
                          <button onClick={() => handleDelete(s.id)} className="btn-act btn-act-red" title="Hapus">
                            <i className="bi bi-trash" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: textMuted }}>
                      <i className="bi bi-inbox" style={{ fontSize: '1.5rem', display: 'block', marginBottom: '6px', opacity: 0.3 }} />
                      Belum ada data servis
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom Section: Merk Populer + Chart */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
        {/* Merk Populer */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="p-3 bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700">
            <span className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
              <i className="bi bi-trophy-fill text-amber-500" /> Merk Populer
            </span>
          </div>
          <div className="p-2">
            {stats.merk_populer && stats.merk_populer.length > 0 ? stats.merk_populer.slice(0, 5).map((merk, i) => {
              const colors = ['blue', 'purple', 'cyan', 'amber', 'gray']
              const maxCount = stats.merk_populer[0]?.total || 1
              const width = (merk.total / maxCount) * 100
              return (
                <div key={i} className="mb-2 last:mb-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-xs text-gray-900 dark:text-gray-100">{merk.merk_hp}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-${colors[i]}-100 dark:bg-${colors[i]}-900/30 text-${colors[i]}-600 dark:text-${colors[i]}-400`}>
                      {merk.total}x
                    </span>
                  </div>
                  <div className="h-1 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full bg-${colors[i]}-500`} style={{ width: `${width}%` }} />
                  </div>
                </div>
              )
            }) : (
              <div className="p-4 text-center text-gray-400 dark:text-gray-500 text-sm">
                Belum ada data
              </div>
            )}
          </div>
        </div>

        {/* Chart - Omzet per Bulan */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden md:col-span-2">
          <div className="p-3 bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
            <span className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
              <i className="bi bi-graph-up text-purple-500" /> Omzet per Bulan
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              Total <strong className="text-gray-700 dark:text-gray-200">{stats.total_tahun || 0}</strong> servis
            </span>
          </div>
          <div className="p-3">
            {chartData.length > 0 ? (
              <div className="relative h-24">
                <svg width="100%" height="96" viewBox={`0 0 ${chartData.length * 40 + 16} 96`} style={{ overflow: 'visible' }}>
                  {/* Grid lines */}
                  {[16, 40, 64].map((y) => (
                    <line key={y} x1="8" y1={y} x2={chartData.length * 40 + 8} y2={y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="2,2" />
                  ))}
                  {/* Bars */}
                  {chartData.map((month, i) => {
                    const x = 12 + i * 40
                    const barH = maxVal > 0 ? (month.value / maxVal) * 64 : 0
                    const y = 80 - barH
                    return (
                      <g key={i}>
                        <rect x={x} y={y} width="16" height={barH} fill="rgba(59,130,246,0.2)" stroke="#3b82f6" strokeWidth="1" rx="2" />
                        <text x={x + 8} y="92" textAnchor="middle" fontSize="7" fill="#9ca3af" fontWeight="600">{month.label}</text>
                        <text x={x + 8} y={y - 3} textAnchor="middle" fontSize="8" fill="#1f2937" fontWeight="700">{month.value}</text>
                      </g>
                    )
                  })}
                  {/* Line */}
                  {chartData.length > 1 && (
                    <polyline
                      points={chartData.map((month, i) => {
                        const x = 12 + i * 40 + 8
                        const barH = maxVal > 0 ? (month.value / maxVal) * 64 : 0
                        const y = 80 - barH
                        return `${x},${y}`
                      }).join(' ')}
                      fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    />
                  )}
                  {/* Dots */}
                  {chartData.map((month, i) => {
                    const x = 12 + i * 40 + 8
                    const barH = maxVal > 0 ? (month.value / maxVal) * 64 : 0
                    const y = 80 - barH
                    return (
                      <circle key={i} cx={x} cy={y} r="3" fill="#f59e0b" stroke="white" strokeWidth="1.5" />
                    )
                  })}
                </svg>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400">
                <i className="bi bi-bar-chart-line text-2xl opacity-30" />
                <p className="text-xs mt-1">Belum ada data</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}