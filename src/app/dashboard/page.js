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

      {/* Status Cards - 4 Kolom */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '10px' }}>
        {[
          { label: 'Antrean', value: stats.antrean, sub: 'Unit hari ini', icon: 'bi-person-plus-fill', color: '#3b82f6', border: '#3b82f6' },
          { label: 'Dikerjakan', value: stats.proses, sub: 'Sedang diproses', icon: 'bi-tools', color: '#d97706', border: '#f59e0b' },
          { label: 'Siap Diambil', value: stats.siap, sub: 'Tunggu pelanggan', icon: 'bi-bag-check-fill', color: '#0891b2', border: '#06b6d4' },
          { label: 'Selesai', value: stats.selesai, sub: 'Diambil hari ini', icon: 'bi-check-circle-fill', color: '#059669', border: '#10b981' },
        ].map((card) => (
          <div
            key={card.label}
            id={`angka-${card.label.toLowerCase()}`}
            style={{
              background: surface, borderRadius: '10px', padding: '14px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              border: `1px solid ${border}`, borderLeft: `3px solid ${card.border}`,
              display: 'flex', alignItems: 'center', gap: '10px'
            }}
          >
            <div style={{
              width: '38px', height: '38px', borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `${card.color}15`, color: card.color, fontSize: '1rem', flexShrink: 0
            }}>
              <i className={`bi ${card.icon}`} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '.6rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '.4px', color: textMuted }}>
                {card.label}
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: '800', color: textMain, lineHeight: 1.2, margin: '2px 0' }}>
                {card.value}
              </div>
              <div style={{ fontSize: '.65rem', color: textMuted }}>{card.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Omzet Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '12px' }}>
        <div style={{
          background: surface, borderRadius: '10px', padding: '14px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          border: `1px solid ${border}`, borderLeft: '3px solid #8b5cf6',
          display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(139,92,246,0.12)', color: '#7c3aed', fontSize: '1rem'
          }}>
            <i className="bi bi-cash-stack" />
          </div>
          <div>
            <div style={{ fontSize: '.6rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '.4px', color: textMuted }}>
              Omzet Hari Ini
            </div>
            <div style={{ fontSize: '1rem', fontWeight: '800', color: textMain, lineHeight: 1.2, margin: '2px 0' }}>
              {safeFormatRupiah(stats.omzet_hari)}
            </div>
            <div style={{ fontSize: '.65rem', color: textMuted }}>
              {stats.selesai} transaksi selesai
            </div>
          </div>
        </div>
        <div style={{
          background: surface, borderRadius: '10px', padding: '14px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          border: `1px solid ${border}`, borderLeft: '3px solid #f43f5e',
          display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(244,63,94,0.12)', color: '#e11d48', fontSize: '1rem'
          }}>
            <i className="bi bi-graph-up-arrow" />
          </div>
          <div>
            <div style={{ fontSize: '.6rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '.4px', color: textMuted }}>
              Omzet Bulan Ini
            </div>
            <div style={{ fontSize: '1rem', fontWeight: '800', color: textMain, lineHeight: 1.2, margin: '2px 0' }}>
              {safeFormatRupiah(stats.omzet_bulan)}
            </div>
            <div style={{ fontSize: '.65rem', color: textMuted }}>
              {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      {/* Table & Sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '12px' }}>
        {/* Servis Table */}
        <div style={{
          background: surface, borderRadius: '10px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          border: `1px solid ${border}`, overflow: 'hidden'
        }}>
          <div style={{
            padding: '10px 14px',
            background: 'var(--am-surface-2)',
            borderBottom: `1px solid ${border}`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '.8rem', fontWeight: '600', color: textMain }}>
              <i className="bi bi-clock-history" style={{ color: '#3b82f6' }} /> Servis Terbaru
            </span>
            <Link href="/servis/data" style={{
              fontSize: '.7rem', color: '#3b82f6', fontWeight: '600',
              textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px'
            }}>
              Lihat Semua <i className="bi bi-arrow-right" />
            </Link>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.8rem' }}>
              <thead>
                <tr style={{ background: 'var(--am-surface-2)' }}>
                  <th style={{ padding: '6px 8px', fontSize: '.55rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '.3px', color: textMuted, borderBottom: `1px solid ${border}`, textAlign: 'center' }}>No</th>
                  <th style={{ padding: '6px 8px', fontSize: '.55rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '.3px', color: textMuted, borderBottom: `1px solid ${border}`, textAlign: 'left' }}>Pelanggan</th>
                  <th style={{ padding: '6px 8px', fontSize: '.55rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '.3px', color: textMuted, borderBottom: `1px solid ${border}`, textAlign: 'left' }}>Unit HP</th>
                  <th style={{ padding: '6px 8px', fontSize: '.55rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '.3px', color: textMuted, borderBottom: `1px solid ${border}`, textAlign: 'left' }}>Keluhan</th>
                  <th style={{ padding: '6px 8px', fontSize: '.55rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '.3px', color: textMuted, borderBottom: `1px solid ${border}`, textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '6px 8px', fontSize: '.55rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '.3px', color: textMuted, borderBottom: `1px solid ${border}`, textAlign: 'right' }}>Biaya</th>
                  <th style={{ padding: '6px 8px', fontSize: '.55rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '.3px', color: textMuted, borderBottom: `1px solid ${border}`, textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {servisTerbaru.length > 0 ? servisTerbaru.map((s, i) => (
                  <tr key={s.id} style={{ background: i % 2 === 0 ? 'var(--am-surface-2)' : 'transparent', borderBottom: `1px solid ${border}` }}>
                    <td style={{ padding: '6px 8px', textAlign: 'center', color: textMuted, fontWeight: '700', fontSize: '.75rem' }}>{i + 1}</td>
                    <td style={{ padding: '6px 8px', textAlign: 'left' }}>
                      <div style={{ fontWeight: '600', color: textMain, fontSize: '.8rem' }}>{s.nama_pelanggan}</div>
                      <div style={{ fontSize: '.6rem', color: textMuted }}>{s.no_servis}</div>
                    </td>
                    <td style={{ padding: '6px 8px', textAlign: 'left' }}>
                      <div style={{ fontWeight: '600', color: textMain, fontSize: '.8rem' }}>{s.merk_hp} {s.tipe_hp}</div>
                      <div style={{ fontSize: '.6rem', color: textMuted }}>
                        {new Date(s.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td style={{ padding: '6px 8px', textAlign: 'left', maxWidth: '140px', cursor: 'pointer' }}>
                      {s.keluhan ? (
                        <span
                          className="keluhan-cell"
                          style={{ color: '#3b82f6', textDecoration: 'underline dotted', textUnderlineOffset: '3px', fontSize: '.75rem' }}
                          onClick={() => setModalKeluhan({ hp: `${s.merk_hp} ${s.tipe_hp}`, nama: s.nama_pelanggan, keluhan: s.keluhan })}
                        >
                          {s.keluhan.length > 25 ? s.keluhan.substring(0, 25) + '…' : s.keluhan}
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
                    <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: '600', color: textMain, fontSize: '.8rem' }}>
                      {safeFormatRupiah(s.estimasi_biaya)}
                    </td>
                    <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
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

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignSelf: 'start' }}>
          {/* Stok Menipis */}
          <div style={{
            background: surface, borderRadius: '10px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            border: `1px solid ${border}`, overflow: 'hidden'
          }}>
            <div style={{
              padding: '10px 14px',
              background: 'var(--am-surface-2)',
              borderBottom: `1px solid ${border}`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '.8rem', fontWeight: '600', color: textMain }}>
                <i className="bi bi-exclamation-triangle-fill" style={{ color: '#ef4444' }} /> Stok Menipis
              </span>
              <span style={{
                background: '#ef4444', color: '#fff',
                fontSize: '.65rem', fontWeight: '700',
                padding: '2px 8px', borderRadius: '999px'
              }}>
                {lowStock.length}
              </span>
            </div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {lowStock.length > 0 ? lowStock.map((sp) => {
                const dotColor = sp.stok === 0 ? '#ef4444' : sp.stok <= 2 ? '#f97316' : '#f59e0b'
                return (
                  <li key={sp.id} style={{
                    padding: '8px 14px', borderBottom: `1px solid ${border}`,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flex: 1 }}>
                      <span style={{
                        width: '6px', height: '6px', borderRadius: '50%',
                        background: dotColor, flexShrink: 0
                      }} />
                      <span style={{ fontSize: '.75rem', color: textMain, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {sp.nama_sparepart}
                      </span>
                    </div>
                    <span style={{
                      background: dotColor, color: '#fff',
                      fontSize: '.6rem', fontWeight: '700',
                      padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', flexShrink: 0
                    }}>
                      {sp.stok}
                    </span>
                  </li>
                )
              }) : (
                <li style={{ padding: '16px', textAlign: 'center', color: textMuted, fontSize: '.75rem' }}>
                  <i className="bi bi-check-circle" style={{ color: '#059669', marginRight: '4px' }} /> Stok aman
                </li>
              )}
            </ul>
            <div style={{ padding: '10px' }}>
              <Link href="/sparepart" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                width: '100%', padding: '8px', borderRadius: '999px',
                border: `1px solid #ef4444`, color: '#ef4444',
                fontSize: '.7rem', fontWeight: '600', textDecoration: 'none'
              }}>
                <i className="bi bi-tag" /> Kelola Sparepart
              </Link>
            </div>
          </div>

          {/* Merk Populer */}
          <div style={{
            background: surface, borderRadius: '10px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            border: `1px solid ${border}`, overflow: 'hidden'
          }}>
            <div style={{
              padding: '10px 14px',
              background: 'var(--am-surface-2)',
              borderBottom: `1px solid ${border}`
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '.8rem', fontWeight: '600', color: textMain }}>
                <i className="bi bi-trophy-fill" style={{ color: '#f59e0b' }} /> Merk Populer
              </span>
            </div>
            <div>
              {stats.merk_populer && stats.merk_populer.length > 0 ? stats.merk_populer.slice(0, 5).map((merk, i) => {
                const colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#f59e0b', '#64748b']
                return (
                  <div key={i} style={{
                    padding: '8px 14px', borderBottom: `1px solid ${border}`,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '24px', height: '24px', borderRadius: '6px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: '800', fontSize: '.65rem',
                        background: `${colors[i]}20`, color: colors[i]
                      }}>
                        {i + 1}
                      </div>
                      <span style={{ fontWeight: '600', fontSize: '.8rem', color: textMain }}>{merk.merk_hp}</span>
                    </div>
                    <span style={{
                      background: `${colors[i]}20`, color: colors[i],
                      fontSize: '.6rem', fontWeight: '700',
                      padding: '2px 8px', borderRadius: '999px'
                    }}>
                      {merk.total}x
                    </span>
                  </div>
                )
              }) : (
                <div style={{ padding: '16px', textAlign: 'center', color: textMuted, fontSize: '.75rem' }}>
                  Belum ada data
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div style={{
        background: surface, borderRadius: '10px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        border: `1px solid ${border}`, overflow: 'hidden'
      }}>
        <div style={{
          padding: '10px 14px',
          background: 'var(--am-surface-2)',
          borderBottom: `1px solid ${border}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '.8rem', fontWeight: '600', color: textMain }}>
            <i className="bi bi-bar-chart-line" style={{ color: '#3b82f6' }} /> Statistik Unit Masuk {new Date().getFullYear()}
          </span>
          <span style={{ fontSize: '.7rem', color: textMuted }}>
            Total <strong style={{ color: textMain }}>{stats.total_tahun || 0}</strong> unit
          </span>
        </div>
        <div style={{ padding: '16px' }}>
          {chartData.length > 0 ? (
            <div style={{ height: '200px', position: 'relative' }}>
              <svg width="100%" height="200" viewBox={`0 0 ${chartData.length * 50 + 30} 200`} preserveAspectRatio="xMidYMid meet" style={{ overflow: 'visible' }}>
                {/* Grid lines */}
                {[0, 40, 80, 120, 160].map((y) => (
                  <line key={y} x1="20" y1={y + 10} x2={chartData.length * 50 + 20} y2={y + 10} stroke={border} strokeWidth="1" strokeDasharray="3,3" />
                ))}
                {chartData.map((month, i) => {
                  const x = 20 + i * 50 + 25
                  const barHeight = (month.value / maxVal) * 130
                  const y = 170 - barHeight
                  const isMax = month.value === maxVal
                  return (
                    <g key={i}>
                      <rect
                        x={x - 12} y={y} width="24" height={barHeight}
                        fill={isMax ? 'rgba(59,130,246,0.85)' : 'rgba(59,130,246,0.18)'}
                        stroke={isMax ? '#3b82f6' : 'rgba(59,130,246,0.35)'}
                        strokeWidth="1" rx="4"
                      />
                      <text x={x} y={y - 6} textAnchor="middle" fontSize="9" fontWeight="700" fill={textMain}>
                        {month.value}
                      </text>
                      <text x={x} y="186" textAnchor="middle" fontSize="8" fontWeight="600" fill={textMuted}>
                        {month.label}
                      </text>
                    </g>
                  )
                })}
                {/* Trend line */}
                {chartData.length > 1 && (() => {
                  const points = chartData.map((month, i) => {
                    const x = 20 + i * 50 + 25
                    const y = 170 - (month.value / maxVal) * 130
                    return `${x},${y}`
                  }).join(' ')
                  return (
                    <polyline points={points} fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4,3" strokeLinecap="round" strokeLinejoin="round" />
                  )
                })()}
              </svg>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px', color: textMuted }}>
              <i className="bi bi-bar-chart-line" style={{ fontSize: '1.5rem', opacity: 0.3 }} />
              <p style={{ margin: '6px 0 0', fontSize: '.8rem' }}>Belum ada data grafik</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}