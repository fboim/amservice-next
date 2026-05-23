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
      if (openDropdown === null) return
      const ref = dropdownRefs.current[openDropdown]
      if (ref && ref.contains(e.target)) return
      setOpenDropdown(null)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openDropdown])

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
            style={{
              background: 'var(--am-surface)',
              borderRadius: 'var(--am-radius)',
              padding: '12px',
              border: '1px solid var(--am-border)',
              borderLeft: `3px solid ${card.border}`,
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <div style={{
              width: '32px', height: '32px', borderRadius: '6px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `${card.color}15`, color: card.color, fontSize: '0.875rem', flexShrink: 0
            }}>
              <i className={`bi ${card.icon}`} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--am-text-muted)' }}>
                {card.label}
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--am-text)', lineHeight: 1.2, margin: '2px 0' }}>
                {card.value}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--am-text-muted)' }}>{card.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Omzet Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
        <div style={{
          background: 'var(--am-surface)',
          borderRadius: 'var(--am-radius)',
          padding: '12px',
          border: '1px solid var(--am-border)',
          borderLeft: '3px solid #8b5cf6',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(139,92,246,0.12)', color: '#7c3aed', fontSize: '1rem'
          }}>
            <i className="bi bi-cash-stack" />
          </div>
          <div>
            <div style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--am-text-muted)' }}>
              Omzet Hari Ini
            </div>
            <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--am-text)', lineHeight: 1.2, margin: '2px 0' }}>
              {safeFormatRupiah(stats.omzet_hari)}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--am-text-muted)' }}>
              {stats.selesai} transaksi selesai
            </div>
          </div>
        </div>
        <div style={{
          background: 'var(--am-surface)',
          borderRadius: 'var(--am-radius)',
          padding: '12px',
          border: '1px solid var(--am-border)',
          borderLeft: '3px solid #f43f5e',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(244,63,94,0.12)', color: '#e11d48', fontSize: '1rem'
          }}>
            <i className="bi bi-graph-up-arrow" />
          </div>
          <div>
            <div style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--am-text-muted)' }}>
              Omzet Bulan Ini
            </div>
            <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--am-text)', lineHeight: 1.2, margin: '2px 0' }}>
              {safeFormatRupiah(stats.omzet_bulan)}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--am-text-muted)' }}>
              {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      {/* Servis Table - Full Width */}
      <div className="mb-3">
        <div style={{
          background: 'var(--am-surface)',
          borderRadius: 'var(--am-radius)',
          border: '1px solid var(--am-border)',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '10px 14px',
            background: 'var(--am-surface-2)',
            borderBottom: '1px solid var(--am-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '.8rem', fontWeight: '600', color: 'var(--am-text)' }}>
              <i className="bi bi-clock-history" style={{ color: '#3b82f6' }} /> Servis Terbaru
            </span>
            <Link href="/servis/data" style={{ fontSize: '.7rem', color: '#3b82f6', fontWeight: '600', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Lihat Semua <i className="bi bi-arrow-right" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ background: 'var(--am-surface-2)' }}>
                  <th style={{ padding: '8px', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--am-text-muted)', borderBottom: '1px solid var(--am-border)', textAlign: 'center' }}>No</th>
                  <th style={{ padding: '8px', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--am-text-muted)', borderBottom: '1px solid var(--am-border)', textAlign: 'left' }}>Pelanggan</th>
                  <th style={{ padding: '8px', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--am-text-muted)', borderBottom: '1px solid var(--am-border)', textAlign: 'left' }} className="hidden md:table-cell">Unit HP</th>
                  <th style={{ padding: '8px', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--am-text-muted)', borderBottom: '1px solid var(--am-border)', textAlign: 'left' }}>Keluhan</th>
                  <th style={{ padding: '8px', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--am-text-muted)', borderBottom: '1px solid var(--am-border)', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '8px', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--am-text-muted)', borderBottom: '1px solid var(--am-border)', textAlign: 'right' }} className="hidden sm:table-cell">Biaya</th>
                  <th style={{ padding: '8px', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--am-text-muted)', borderBottom: '1px solid var(--am-border)', textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {servisTerbaru.length > 0 ? servisTerbaru.map((s, i) => (
                  <tr key={s.id} style={{ background: i % 2 === 0 ? 'var(--am-surface-2)' : 'transparent', borderBottom: '1px solid var(--am-border)' }}>
                    <td style={{ padding: '8px', textAlign: 'center', fontWeight: '700', color: 'var(--am-text-muted)' }}>{i + 1}</td>
                    <td style={{ padding: '8px', textAlign: 'left' }}>
                      <div style={{ fontWeight: '600', color: 'var(--am-text)', fontSize: '.8rem' }}>{s.nama_pelanggan}</div>
                      <div style={{ fontSize: '10px', color: 'var(--am-text-muted)' }}>{s.no_servis}</div>
                    </td>
                    <td style={{ padding: '8px', textAlign: 'left' }} className="hidden md:table-cell">
                      <div style={{ fontWeight: '600', color: 'var(--am-text)', fontSize: '.8rem' }}>{s.merk_hp} {s.tipe_hp}</div>
                      <div style={{ fontSize: '10px', color: 'var(--am-text-muted)' }}>
                        {new Date(s.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                      </div>
                    </td>
                    <td style={{ padding: '8px', textAlign: 'left', maxWidth: '120px' }}>
                      {s.keluhan ? (
                        <span
                          style={{ color: '#3b82f6', textDecoration: 'underline dotted', textUnderlineOffset: '3px', fontSize: '.75rem', cursor: 'pointer' }}
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
                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: '600', color: 'var(--am-text)' }} className="hidden sm:table-cell">
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
                              <Link href={`/nota/${s.id}/label`} target="_blank" style={{
                                display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px',
                                fontSize: '.75rem', color: textMain, textDecoration: 'none',
                                borderBottom: `1px solid ${border}`
                              }}>
                                <i className="bi bi-tag" style={{ color: '#8b5cf6' }} /> Label
                              </Link>
                              <Link href={`/nota/${s.id}/penerimaan`} target="_blank" style={{
                                display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px',
                                fontSize: '.75rem', color: textMain, textDecoration: 'none',
                                borderBottom: `1px solid ${border}`
                              }}>
                                <i className="bi bi-qr-code" style={{ color: '#2563eb' }} /> Nota Penerimaan
                              </Link>
                              <Link href={`/nota/${s.id}/garansi`} target="_blank" style={{
                                display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px',
                                fontSize: '.75rem', color: textMain, textDecoration: 'none'
                              }}>
                                <i className="bi bi-shield-check" style={{ color: '#f59e0b' }} /> Nota Garansi
                              </Link>
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
        <div style={{
          background: 'var(--am-surface)',
          borderRadius: 'var(--am-radius)',
          border: '1px solid var(--am-border)',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '10px 14px',
            background: 'var(--am-surface-2)',
            borderBottom: '1px solid var(--am-border)'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '.8rem', fontWeight: '600', color: 'var(--am-text)' }}>
              <i className="bi bi-trophy-fill" style={{ color: '#f59e0b' }} /> Merk Populer
            </span>
          </div>
          <div style={{ padding: '8px 0' }}>
            {stats.merk_populer && stats.merk_populer.length > 0 ? stats.merk_populer.slice(0, 5).map((merk, i) => {
              const colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#f59e0b', '#64748b']
              const maxCount = stats.merk_populer[0]?.total || 1
              const width = (merk.total / maxCount) * 100
              return (
                <div key={i} style={{ padding: '6px 14px', borderBottom: i < 4 ? '1px solid var(--am-border)' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '600', fontSize: '.75rem', color: 'var(--am-text)' }}>{merk.merk_hp}</span>
                    <span style={{
                      background: `${colors[i]}20`, color: colors[i],
                      fontSize: '10px', fontWeight: '700',
                      padding: '2px 8px', borderRadius: '999px'
                    }}>
                      {merk.total}x
                    </span>
                  </div>
                  <div style={{ height: '4px', background: 'var(--am-border)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${width}%`, height: '100%', background: colors[i], borderRadius: '2px' }} />
                  </div>
                </div>
              )
            }) : (
              <div style={{ padding: '16px', textAlign: 'center', color: 'var(--am-text-muted)', fontSize: '.75rem' }}>
                Belum ada data
              </div>
            )}
          </div>
        </div>

        {/* Chart - Omzet per Bulan */}
        <div style={{
          background: 'var(--am-surface)',
          borderRadius: 'var(--am-radius)',
          border: '1px solid var(--am-border)',
          overflow: 'hidden',
          gridColumn: 'span 1'
        }} className="md:col-span-2">
          <div style={{
            padding: '10px 14px',
            background: 'var(--am-surface-2)',
            borderBottom: '1px solid var(--am-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '.8rem', fontWeight: '600', color: 'var(--am-text)' }}>
              <i className="bi bi-graph-up" style={{ color: '#8b5cf6' }} /> Omzet per Bulan
            </span>
            <span style={{ fontSize: '.7rem', color: 'var(--am-text-muted)' }}>
              Total <strong style={{ color: 'var(--am-text)' }}>{stats.total_tahun || 0}</strong> servis
            </span>
          </div>
          <div style={{ padding: '12px', minHeight: '140px' }}>
            {chartData.length > 0 ? (
              <div style={{ position: 'relative', width: '100%', height: '140px' }}>
                <svg width="100%" height="140" viewBox={`0 0 500 140`} preserveAspectRatio="xMidYMid meet" style={{ overflow: 'visible' }}>
                  {/* Grid lines */}
                  {[25, 60, 95].map((y) => (
                    <line key={y} x1="30" y1={y} x2="490" y2={y} stroke="var(--am-border)" strokeWidth="1" strokeDasharray="2,2" />
                  ))}
                  {/* Bars */}
                  {chartData.map((month, i) => {
                    const x = 38 + i * 38
                    const barH = maxVal > 0 ? (month.value / maxVal) * 85 : 0
                    const y = 120 - barH
                    return (
                      <g key={i}>
                        <rect x={x} y={y} width="20" height={barH} fill="rgba(59,130,246,0.25)" stroke="#3b82f6" strokeWidth="1" rx="2" />
                        <text x={x + 10} y="135" textAnchor="middle" fontSize="8" fill="var(--am-text-muted)" fontWeight="600">{month.label}</text>
                        <text x={x + 10} y={y - 5} textAnchor="middle" fontSize="10" fill="var(--am-text)" fontWeight="700">{month.value}</text>
                      </g>
                    )
                  })}
                  {/* Line */}
                  {chartData.length > 1 && (
                    <polyline
                      points={chartData.map((month, i) => {
                        const x = 38 + i * 38 + 10
                        const barH = maxVal > 0 ? (month.value / maxVal) * 85 : 0
                        const y = 120 - barH
                        return `${x},${y}`
                      }).join(' ')}
                      fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                    />
                  )}
                  {/* Dots */}
                  {chartData.map((month, i) => {
                    const x = 38 + i * 38 + 10
                    const barH = maxVal > 0 ? (month.value / maxVal) * 85 : 0
                    const y = 120 - barH
                    return (
                      <circle key={i} cx={x} cy={y} r="4" fill="#f59e0b" stroke="var(--am-surface)" strokeWidth="2" />
                    )
                  })}
                </svg>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--am-text-muted)' }}>
                <i className="bi bi-bar-chart-line" style={{ fontSize: '1.25rem', opacity: 0.3 }} />
                <p style={{ margin: '4px 0 0', fontSize: '.75rem' }}>Belum ada data</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}