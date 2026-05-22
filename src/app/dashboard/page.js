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
  const [selectedKeluhan, setSelectedKeluhan] = useState(null)
  const [openPrintId, setOpenPrintId] = useState(null)
  const [openWaId, setOpenWaId] = useState(null)
  const printRefs = useRef({})
  const waRefs = useRef({})

  useEffect(() => {
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
      Object.values(printRefs.current).forEach(ref => {
        if (ref && !ref.contains(e.target)) setOpenPrintId(null)
      })
      Object.values(waRefs.current).forEach(ref => {
        if (ref && !ref.contains(e.target)) setOpenWaId(null)
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

  const getBadgeClass = (status) => {
    const map = {
      'Antrean': 'badge-antrean',
      'Proses': 'badge-proses',
      'Siap Diambil': 'badge-siap',
      'Sudah Diambil': 'badge-selesai',
      'Tidak Bisa': 'badge-gagal'
    }
    return map[status] || 'badge-antrean'
  }

  const getBadgeText = (status) => {
    const map = {
      'Antrean': 'Antrean',
      'Proses': 'Dikerjakan',
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

  const getNotifStatusText = (servis) => {
    const statusMsg = {
      'Antrean': 'Sedang antre',
      'Proses': 'Sedang dikerjakan',
      'Siap Diambil': 'Sudah siap diambil',
      'Sudah Diambil': 'Sudah diambil',
    }
    const msg = statusMsg[servis.status] || servis.status
    return `Halo ${servis.nama_pelanggan}, servis ${servis.merk_hp} ${servis.tipe_hp} Anda: ${msg}. No Servis: ${servis.no_servis}`
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

  const chartData = stats.monthly_data || []
  const totalServis = chartData.reduce((sum, m) => sum + m.value, 0)

  return (
    <AppLayout>
      {/* Modal for Keluhan Detail */}
      {selectedKeluhan && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '16px'
        }} onClick={() => setSelectedKeluhan(null)}>
          <div style={{
            background: 'var(--am-surface)', borderRadius: '12px', padding: '20px', maxWidth: '500px',
            width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontWeight: '700', color: 'var(--am-text)' }}>Detail Keluhan</span>
              <button onClick={() => setSelectedKeluhan(null)} style={{
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--am-text-muted)',
                fontSize: '1.2rem', padding: '4px'
              }}>
                <i className="bi bi-x-lg" />
              </button>
            </div>
            <div style={{
              background: 'var(--am-bg)', borderRadius: '8px', padding: '16px', fontSize: '.875rem',
              color: 'var(--am-text)', lineHeight: '1.6', whiteSpace: 'pre-wrap'
            }}>
              {selectedKeluhan}
            </div>
          </div>
        </div>
      )}

      {/* Header with date and user info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ fontSize: '.8rem', color: 'var(--am-text-muted)' }}>
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '.8rem', fontWeight: '600', color: 'var(--am-text)' }}>{user.username}</span>
            <span style={{
              fontSize: '.65rem', padding: '2px 8px', borderRadius: '999px',
              background: isAdmin ? 'rgba(139,92,246,.15)' : 'rgba(59,130,246,.15)',
              color: isAdmin ? '#7c3aed' : '#2563eb', fontWeight: '700', textTransform: 'uppercase'
            }}>
              {user.role}
            </span>
          </div>
        )}
      </div>

      {/* Status Cards - 4 columns tight gap */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '8px' }}>
        {[
          { label: 'Antrean', value: stats.antrean, sub: 'Unit hari ini', icon: 'bi-person-plus-fill', color: '#64748b', bg: 'rgba(148,163,184,.15)' },
          { label: 'Dikerjakan', value: stats.proses, sub: 'Sedang proses', icon: 'bi-tools', color: '#d97706', bg: 'rgba(245,158,11,.15)' },
          { label: 'Siap Diambil', value: stats.siap, sub: 'Tunggu pelanggan', icon: 'bi-bag-check-fill', color: '#0891b2', bg: 'rgba(6,182,212,.15)' },
          { label: 'Selesai', value: stats.selesai, sub: 'Diambil hari ini', icon: 'bi-check-circle-fill', color: '#059669', bg: 'rgba(16,185,129,.15)' },
        ].map((card) => (
          <div key={card.label} style={{
            background: 'var(--am-surface)', border: '1px solid var(--am-border)',
            borderRadius: '10px', borderLeft: `3px solid ${card.color}`,
            padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '12px'
          }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: card.bg, color: card.color, fontSize: '1rem', flexShrink: 0 }}>
              <i className={`bi ${card.icon}`} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '.62rem', fontWeight: '700', color: 'var(--am-text-muted)', textTransform: 'uppercase', letterSpacing: '.3px' }}>{card.label}</div>
              <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--am-text)', lineHeight: 1 }}>{card.value}</div>
              <div style={{ fontSize: '.65rem', color: 'var(--am-text-muted)' }}>{card.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Omzet Cards - 2 columns tight gap */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '8px' }}>
        <div style={{ background: 'var(--am-surface)', border: '1px solid var(--am-border)', borderRadius: '10px', borderLeft: '3px solid #8b5cf6', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(139,92,246,.15)', color: '#7c3aed', fontSize: '1rem', flexShrink: 0 }}>
            <i className="bi bi-cash-stack" />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '.62rem', fontWeight: '700', color: 'var(--am-text-muted)', textTransform: 'uppercase', letterSpacing: '.3px' }}>Omzet Hari Ini</div>
            <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--am-text)', lineHeight: 1 }}>{formatRupiah(stats.omzet_hari)}</div>
            <div style={{ fontSize: '.65rem', color: 'var(--am-text-muted)' }}>{stats.selesai} transaksi selesai</div>
          </div>
        </div>
        <div style={{ background: 'var(--am-surface)', border: '1px solid var(--am-border)', borderRadius: '10px', borderLeft: '3px solid #f43f5e', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(244,63,94,.15)', color: '#e11d48', fontSize: '1rem', flexShrink: 0 }}>
            <i className="bi bi-graph-up-arrow" />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '.62rem', fontWeight: '700', color: 'var(--am-text-muted)', textTransform: 'uppercase', letterSpacing: '.3px' }}>Omzet Bulan Ini</div>
            <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--am-text)', lineHeight: 1 }}>{formatRupiah(stats.omzet_bulan)}</div>
            <div style={{ fontSize: '.65rem', color: 'var(--am-text-muted)' }}>{new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</div>
          </div>
        </div>
      </div>

      {/* Servis Table + Sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px', marginBottom: '8px' }}>
        {/* Servis Table */}
        <div style={{ background: 'var(--am-surface)', border: '1px solid var(--am-border)', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--am-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '.8rem', fontWeight: '600', color: 'var(--am-text)' }}>
              <i className="bi bi-clock-history" style={{ color: '#3b82f6' }} /> Servis Terbaru
            </span>
            <Link href="/servis/data" style={{ fontSize: '.72rem', color: 'var(--am-primary)', textDecoration: 'none', fontWeight: '600' }}>
              Lihat Semua <i className="bi bi-arrow-right" />
            </Link>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
              <thead>
                <tr>
                  <th style={{ padding: '6px 10px', fontSize: '.6rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '.3px', color: 'var(--am-text-muted)', borderBottom: '1px solid var(--am-border)', textAlign: 'center', background: 'var(--am-bg)' }}>#</th>
                  <th style={{ padding: '6px 10px', fontSize: '.6rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '.3px', color: 'var(--am-text-muted)', borderBottom: '1px solid var(--am-border)', textAlign: 'left', background: 'var(--am-bg)' }}>Pelanggan</th>
                  <th style={{ padding: '6px 10px', fontSize: '.6rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '.3px', color: 'var(--am-text-muted)', borderBottom: '1px solid var(--am-border)', textAlign: 'left', background: 'var(--am-bg)' }}>Unit HP</th>
                  <th style={{ padding: '6px 10px', fontSize: '.6rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '.3px', color: 'var(--am-text-muted)', borderBottom: '1px solid var(--am-border)', textAlign: 'left', background: 'var(--am-bg)' }}>Keluhan</th>
                  <th style={{ padding: '6px 10px', fontSize: '.6rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '.3px', color: 'var(--am-text-muted)', borderBottom: '1px solid var(--am-border)', textAlign: 'center', background: 'var(--am-bg)' }}>Status</th>
                  <th style={{ padding: '6px 10px', fontSize: '.6rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '.3px', color: 'var(--am-text-muted)', borderBottom: '1px solid var(--am-border)', textAlign: 'right', background: 'var(--am-bg)' }}>Biaya</th>
                  <th style={{ padding: '6px 10px', fontSize: '.6rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '.3px', color: 'var(--am-text-muted)', borderBottom: '1px solid var(--am-border)', textAlign: 'center', background: 'var(--am-bg)' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {servisTerbaru.length > 0 ? servisTerbaru.map((s, i) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--am-border)' }}>
                    <td style={{ padding: '8px 10px', fontSize: '.75rem', color: 'var(--am-text-muted)', textAlign: 'center', fontWeight: '700' }}>{i + 1}</td>
                    <td style={{ padding: '8px 10px', fontSize: '.75rem', textAlign: 'left' }}>
                      <div style={{ fontWeight: '600' }}>{s.nama_pelanggan}</div>
                      <div style={{ fontSize: '.65rem', color: 'var(--am-text-muted)' }}>{s.no_servis}</div>
                    </td>
                    <td style={{ padding: '8px 10px', fontSize: '.75rem', textAlign: 'left' }}>
                      <div>{s.merk_hp} {s.tipe_hp}</div>
                    </td>
                    <td style={{ padding: '8px 10px', fontSize: '.72rem', textAlign: 'left', cursor: 'pointer' }} onClick={() => setSelectedKeluhan(s.keluhan)}>
                      <div style={{ color: 'var(--am-text)', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.keluhan}</div>
                      <div style={{ fontSize: '.6rem', color: 'var(--am-primary)' }}><i className="bi bi-cursor-text" /> detail</div>
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                      <span className={`badge-soft ${getBadgeClass(s.status)}`} style={{ fontSize: '.62rem', fontWeight: '700', padding: '2px 7px', borderRadius: '999px' }}>
                        {getBadgeText(s.status)}
                      </span>
                    </td>
                    <td style={{ padding: '8px 10px', fontSize: '.75rem', textAlign: 'right', fontWeight: '600' }}>{formatRupiah(s.estimasi_biaya)}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '2px', justifyContent: 'center', alignItems: 'center' }}>
                        {!isPengunjung && (
                          <Link href={`/servis/edit/${s.id}`} className="btn-act btn-act-blue" title="Edit" style={{ padding: '4px 6px' }}>
                            <i className="bi bi-pencil-square" />
                          </Link>
                        )}
                        <div style={{ position: 'relative' }} ref={el => printRefs.current[s.id] = el}>
                          <button
                            className="btn-act btn-act-dark"
                            title="Cetak"
                            style={{ padding: '4px 6px', color: '#fff', background: '#1f2937', border: '1px solid #374151' }}
                            onClick={() => setOpenPrintId(openPrintId === s.id ? null : s.id)}
                          >
                            <i className="bi bi-printer" />
                          </button>
                          {openPrintId === s.id && (
                            <div style={{
                              position: 'absolute', right: 0, top: '100%', marginTop: '4px',
                              background: 'var(--am-surface)', border: '1px solid var(--am-border)',
                              borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                              minWidth: '160px', zIndex: 100, overflow: 'hidden'
                            }}>
                              <Link href={`/nota/${s.id}`} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', fontSize: '.75rem', color: 'var(--am-text)', textDecoration: 'none', borderBottom: '1px solid var(--am-border)' }}>
                                <i className="bi bi-receipt" style={{ color: '#059669' }} /> Nota
                              </Link>
                              <Link href={`/nota/${s.id}/penerimaan`} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', fontSize: '.75rem', color: 'var(--am-text)', textDecoration: 'none', borderBottom: '1px solid var(--am-border)' }}>
                                <i className="bi bi-qr-code" style={{ color: '#2563eb' }} /> QR Code
                              </Link>
                              <Link href={`/nota/${s.id}/garansi`} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', fontSize: '.75rem', color: 'var(--am-text)', textDecoration: 'none', borderBottom: '1px solid var(--am-border)' }}>
                                <i className="bi bi-shield-check" style={{ color: '#f59e0b' }} /> Nota Garansi
                              </Link>
                              <Link href={`/nota/${s.id}/label`} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', fontSize: '.75rem', color: 'var(--am-text)', textDecoration: 'none', borderBottom: '1px solid var(--am-border)' }}>
                                <i className="bi bi-tag" style={{ color: '#8b5cf6' }} /> Label
                              </Link>
                              <a href={`/nota/${s.id}/penerimaan?pdf=1`} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', fontSize: '.75rem', color: 'var(--am-text)', textDecoration: 'none', borderBottom: '1px solid var(--am-border)' }}>
                                <i className="bi bi-file-earmark-pdf" style={{ color: '#ef4444' }} /> PDF Nota
                              </a>
                              <a href={`/nota/${s.id}/garansi?pdf=1`} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', fontSize: '.75rem', color: 'var(--am-text)', textDecoration: 'none' }}>
                                <i className="bi bi-file-earmark-pdf" style={{ color: '#dc2626' }} /> PDF Garansi
                              </a>
                            </div>
                          )}
                        </div>
                        <div style={{ position: 'relative' }} ref={el => waRefs.current[s.id] = el}>
                          <button
                            className="btn-act"
                            title="WhatsApp"
                            style={{ padding: '4px 6px', color: '#25d366', background: 'rgba(37,211,102,.1)', border: '1px solid rgba(37,211,102,.3)' }}
                            onClick={() => setOpenWaId(openWaId === s.id ? null : s.id)}
                          >
                            <i className="bi bi-whatsapp" />
                          </button>
                          {openWaId === s.id && (
                            <div style={{
                              position: 'absolute', right: 0, top: '100%', marginTop: '4px',
                              background: 'var(--am-surface)', border: '1px solid var(--am-border)',
                              borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                              minWidth: '180px', zIndex: 100, overflow: 'hidden'
                            }}>
                              <a href={getWhatsAppUrl(s)} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', fontSize: '.75rem', color: 'var(--am-text)', textDecoration: 'none', borderBottom: '1px solid var(--am-border)' }}>
                                <i className="bi bi-chat-left-text" style={{ color: '#25d366' }} /> Notif Status
                              </a>
                              <a href={`${getWhatsAppUrl(s)}?text=${encodeURIComponent(getNotifStatusText(s))}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', fontSize: '.75rem', color: 'var(--am-text)', textDecoration: 'none' }}>
                                <i className="bi bi-send" style={{ color: '#25d366' }} /> Kirim Status
                              </a>
                            </div>
                          )}
                        </div>
                        {isAdmin && (
                          <button onClick={() => handleDelete(s.id)} className="btn-act btn-act-red" title="Hapus" style={{ padding: '4px 6px' }}>
                            <i className="bi bi-trash" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: 'var(--am-text-muted)' }}>
                      <i className="bi bi-inbox" style={{ fontSize: '1.2rem', display: 'block', marginBottom: '6px', opacity: 0.3 }} />
                      Belum ada data servis
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar: Merk Populer + Low Stock */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignSelf: 'start' }}>
          {/* Low Stock Alert */}
          <div style={{ background: 'var(--am-surface)', border: '1px solid var(--am-border)', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--am-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '.78rem', fontWeight: '600', color: 'var(--am-text)' }}>
                <i className="bi bi-exclamation-triangle-fill" style={{ color: '#ef4444' }} />Stok Rendah
              </span>
              <span style={{ fontSize: '.6rem', color: 'var(--am-text-muted)' }}>≤5 unit</span>
            </div>
            <div>
              {lowStock.length > 0 ? lowStock.map((sp, i) => (
                <div key={sp.id} style={{ padding: '6px 14px', borderBottom: '1px solid var(--am-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '.72rem', fontWeight: '500', color: 'var(--am-text)' }}>{sp.nama_sparepart}</span>
                  <span style={{
                    fontSize: '.6rem', fontWeight: '800', padding: '2px 6px', borderRadius: '4px',
                    background: sp.stok <= 2 ? 'rgba(239,68,68,.15)' : 'rgba(245,158,11,.15)',
                    color: sp.stok <= 2 ? '#dc2626' : '#d97706'
                  }}>
                    {sp.stok}
                  </span>
                </div>
              )) : (
                <div style={{ padding: '12px', textAlign: 'center', color: 'var(--am-text-muted)', fontSize: '.72rem' }}>
                  <i className="bi bi-check-circle" style={{ color: '#059669', marginRight: '4px' }} />Stok aman
                </div>
              )}
            </div>
          </div>

          {/* Merk Populer */}
          <div style={{ background: 'var(--am-surface)', border: '1px solid var(--am-border)', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--am-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '.78rem', fontWeight: '600', color: 'var(--am-text)' }}>
                <i className="bi bi-trophy-fill" style={{ color: '#f59e0b' }} />Merk Populer
              </span>
              <span style={{ fontSize: '.6rem', color: 'var(--am-text-muted)' }}>All Time</span>
            </div>
            <div>
              {stats.merk_populer && stats.merk_populer.length > 0 ? stats.merk_populer.slice(0, 5).map((merk, i) => {
                const maxTotal = Math.max(...stats.merk_populer.map(m => m.total), 1)
                const pct = (merk.total / maxTotal) * 100
                return (
                  <div key={i} style={{ padding: '6px 14px', borderBottom: '1px solid var(--am-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                      <span style={{ fontSize: '.72rem', fontWeight: '600' }}>{merk.merk_hp}</span>
                      <span style={{ fontSize: '.65rem', color: 'var(--am-text-muted)' }}>{merk.total}x</span>
                    </div>
                    <div style={{ height: '3px', background: 'var(--am-border)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #3b82f6, #6366f1)', borderRadius: '2px' }} />
                    </div>
                  </div>
                )
              }) : (
                <div style={{ padding: '12px', textAlign: 'center', color: 'var(--am-text-muted)', fontSize: '.72rem' }}>
                  Belum ada data
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chart - Bar Chart with Trend Line */}
      <div style={{ background: 'var(--am-surface)', border: '1px solid var(--am-border)', borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--am-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '.8rem', fontWeight: '600', color: 'var(--am-text)' }}>
            <i className="bi bi-bar-chart-line" style={{ color: '#3b82f6' }} /> Statistik Unit Masuk {new Date().getFullYear()}
          </span>
          <span style={{ fontSize: '.72rem', color: 'var(--am-text-muted)' }}>
            Total <strong style={{ color: 'var(--am-text)' }}>{stats.total_tahun || totalServis}</strong> unit
          </span>
        </div>
        <div style={{ padding: '14px' }}>
          {chartData.length > 0 ? (
            <div style={{ height: '160px', position: 'relative' }}>
              <svg width="100%" height="160" viewBox={`0 0 ${chartData.length * 55 + 30} 160`} preserveAspectRatio="xMidYMid meet" style={{ overflow: 'visible' }}>
                {/* Grid lines */}
                {[0, 40, 80, 120].map((y) => (
                  <line key={y} x1="25" y1={y + 10} x2={chartData.length * 55 + 25} y2={y + 10} stroke="var(--am-border)" strokeWidth="1" strokeDasharray="3,3" />
                ))}
                {chartData.map((month, i) => {
                  const maxVal = Math.max(...chartData.map(m => m.value), 1)
                  const x = 25 + i * 55 + 27
                  const barHeight = (month.value / maxVal) * 110
                  const y = 130 - barHeight
                  return (
                    <g key={i}>
                      {/* Bar */}
                      <rect x={x - 12} y={y} width="24" height={barHeight} fill="rgba(59,130,246,.2)" rx="3" />
                      <rect x={x - 12} y={y} width="24" height={barHeight} fill="#3b82f6" rx="3" opacity="0.8" />
                      {/* Value on top */}
                      <text x={x} y={y - 5} textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--am-text)">{month.value}</text>
                      {/* Month label */}
                      <text x={x} y="148" textAnchor="middle" fontSize="8" fontWeight="600" fill="var(--am-text-muted)">{month.label}</text>
                    </g>
                  )
                })}
                {/* Trend line */}
                {chartData.length > 1 && (() => {
                  const maxVal = Math.max(...chartData.map(m => m.value), 1)
                  const points = chartData.map((month, i) => {
                    const x = 25 + i * 55 + 27
                    const y = 130 - (month.value / maxVal) * 110
                    return `${x},${y}`
                  }).join(' ')
                  return (
                    <polyline points={points} fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  )
                })()}
              </svg>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--am-text-muted)' }}>
              <i className="bi bi-bar-chart-line" style={{ fontSize: '1.5rem', opacity: 0.3 }} />
              <p style={{ margin: '6px 0 0', fontSize: '.8rem' }}>Belum ada data grafik</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}