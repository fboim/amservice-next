'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AppLayout from '@/components/AppLayout'
import { formatRupiah } from '@/lib/utils'
import { DashboardSkeleton } from '@/components/Skeleton'

export default function Dashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [initialLoad, setInitialLoad] = useState(true)
  const [stats, setStats] = useState({
    antrean: 0, proses: 0, siap: 0, selesai: 0, omzet_hari: 0, omzet_bulan: 0, merk_populer: []
  })
  const [servisTerbaru, setServisTerbaru] = useState([])
  const [user, setUser] = useState(null)

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

    const timer = setTimeout(() => {
      fetchDashboard()
    }, 100)

    return () => clearTimeout(timer)
  }, [router])

  const fetchDashboard = async () => {
    try {
      const [dashRes, servisRes] = await Promise.all([
        fetch('/api/dashboard', { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } }),
        fetch('/api/servis?limit=10', { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } }),
      ])

      const [dashData, servisData] = await Promise.all([
        dashRes.json(),
        servisRes.json()
      ])

      setStats(dashData || {})
      setServisTerbaru(servisData.servis || [])
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setTimeout(() => {
        setLoading(false)
        setInitialLoad(false)
      }, 300)
    }
  }

  useEffect(() => {
    if (!loading && !initialLoad && servisTerbaru.length > 0) {
      initDropdowns()
    }
  }, [loading, initialLoad, servisTerbaru])

  const initDropdowns = () => {
    setTimeout(() => {
      document.querySelectorAll('.print-btn').forEach(function(btn) {
        btn.onclick = function(e) {
          e.stopPropagation()
          const dropdown = btn.nextElementSibling
          if (dropdown) {
            const isVisible = dropdown.style.display === 'block'
            document.querySelectorAll('.print-dropdown').forEach(d => d.style.display = 'none')
            if (!isVisible) {
              dropdown.style.display = 'block'
            }
          }
        }
      })

      document.querySelectorAll('.wa-drop-btn').forEach(function(btn) {
        btn.onclick = function(e) {
          e.stopPropagation()
          const dropdown = btn.nextElementSibling
          if (dropdown) {
            const isVisible = dropdown.style.display === 'block'
            document.querySelectorAll('.wa-dropdown').forEach(d => d.style.display = 'none')
            if (!isVisible) {
              dropdown.style.display = 'block'
            }
          }
        }
      })

      document.onclick = function() {
        document.querySelectorAll('.print-dropdown, .wa-dropdown').forEach(d => d.style.display = 'none')
      }
    }, 100)
  }

  const isAdmin = user?.role?.toLowerCase() === 'admin'
  const isPengunjung = user?.role?.toLowerCase() === 'pengunjung'

  const getBadgeClass = (status) => {
    const map = {
      'Antrean': 'badge-antrean',
      'Proses': 'badge-proses',
      'Siap Diambil': 'badge-siap',
      'Sudah Diambil': 'badge-selesai',
      'Tidak Bisa': 'badge-gagal',
    }
    return map[status] || 'badge-antrean'
  }

  const getBadgeText = (status) => {
    const map = {
      'Antrean': 'Antrean',
      'Proses': 'Proses',
      'Siap Diambil': 'Siap',
      'Sudah Diambil': 'Selesai',
      'Tidak Bisa': 'Gagal',
    }
    return map[status] || status
  }

  const formatNoWA = (no) => {
    if (!no) return ''
    const clean = no.replace(/[^0-9]/g, '')
    if (clean.startsWith('0')) return '62' + clean.slice(1)
    return clean
  }

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus servis ini?')) return
    try {
      const res = await fetch(`/api/servis?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchDashboard()
      }
    } catch (err) {
      console.error('Delete error:', err)
    }
  }

  // Calculate chart data
  const chartData = stats.monthly_data || []
  const maxVal = Math.max(...chartData.map(m => m.value), 1)
  const totalServis = chartData.reduce((sum, m) => sum + m.value, 0)
  const avgServis = chartData.length > 0 ? Math.round(totalServis / chartData.length) : 0

  if (initialLoad || loading) {
    return (
      <AppLayout>
        <DashboardSkeleton />
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      {/* Stats Row - 4 columns with icons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        <div style={{
          background: 'var(--am-surface)',
          border: '1px solid var(--am-border)',
          borderRadius: '12px',
          padding: '16px',
          borderLeft: '3px solid #94a3b8',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(148,163,184,.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <i className="bi bi-hourglass-split" style={{ fontSize: '1.3rem', color: '#94a3b8' }} />
          </div>
          <div>
            <div style={{ fontSize: '.6rem', fontWeight: '700', color: 'var(--am-text-muted)', textTransform: 'uppercase', letterSpacing: '.5px' }}>Antrean</div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--am-text)', lineHeight: 1.2 }}>{stats.antrean}</div>
          </div>
        </div>

        <div style={{
          background: 'var(--am-surface)',
          border: '1px solid var(--am-border)',
          borderRadius: '12px',
          padding: '16px',
          borderLeft: '3px solid #f59e0b',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(245,158,11,.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <i className="bi bi-tools" style={{ fontSize: '1.3rem', color: '#f59e0b' }} />
          </div>
          <div>
            <div style={{ fontSize: '.6rem', fontWeight: '700', color: 'var(--am-text-muted)', textTransform: 'uppercase', letterSpacing: '.5px' }}>Dikerjakan</div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--am-text)', lineHeight: 1.2 }}>{stats.proses}</div>
          </div>
        </div>

        <div style={{
          background: 'var(--am-surface)',
          border: '1px solid var(--am-border)',
          borderRadius: '12px',
          padding: '16px',
          borderLeft: '3px solid #06b6d4',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(6,182,212,.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <i className="bi bi-bag-check" style={{ fontSize: '1.3rem', color: '#06b6d4' }} />
          </div>
          <div>
            <div style={{ fontSize: '.6rem', fontWeight: '700', color: 'var(--am-text-muted)', textTransform: 'uppercase', letterSpacing: '.5px' }}>Siap Ambil</div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--am-text)', lineHeight: 1.2 }}>{stats.siap}</div>
          </div>
        </div>

        <div style={{
          background: 'var(--am-surface)',
          border: '1px solid var(--am-border)',
          borderRadius: '12px',
          padding: '16px',
          borderLeft: '3px solid #10b981',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(16,185,129,.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <i className="bi bi-check-circle-fill" style={{ fontSize: '1.3rem', color: '#10b981' }} />
          </div>
          <div>
            <div style={{ fontSize: '.6rem', fontWeight: '700', color: 'var(--am-text-muted)', textTransform: 'uppercase', letterSpacing: '.5px' }}>Selesai</div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--am-text)', lineHeight: 1.2 }}>{stats.selesai}</div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '20px' }}>
        {/* Left - Servis Terbaru */}
        <div style={{
          background: 'var(--am-surface)',
          border: '1px solid var(--am-border)',
          borderRadius: '12px',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--am-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '.875rem', fontWeight: '600', color: 'var(--am-text)' }}>
              <i className="bi bi-clock-history" style={{ color: '#3b82f6', marginRight: '8px' }} />Servis Terbaru
            </span>
            <Link href="/servis/data" style={{ fontSize: '.75rem', color: 'var(--am-primary)', textDecoration: 'none', fontWeight: '600' }}>
              Lihat Semua <i className="bi bi-arrow-right" />
            </Link>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '10px 12px', fontSize: '.7rem', fontWeight: '700', color: 'var(--am-text-muted)', borderBottom: '1px solid var(--am-border)', textAlign: 'left' }}>No</th>
                  <th style={{ padding: '10px 12px', fontSize: '.7rem', fontWeight: '700', color: 'var(--am-text-muted)', borderBottom: '1px solid var(--am-border)', textAlign: 'left' }}>Kode / Tgl</th>
                  <th style={{ padding: '10px 12px', fontSize: '.7rem', fontWeight: '700', color: 'var(--am-text-muted)', borderBottom: '1px solid var(--am-border)', textAlign: 'left' }}>Pelanggan & Unit</th>
                  <th style={{ padding: '10px 12px', fontSize: '.7rem', fontWeight: '700', color: 'var(--am-text-muted)', borderBottom: '1px solid var(--am-border)', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '10px 12px', fontSize: '.7rem', fontWeight: '700', color: 'var(--am-text-muted)', borderBottom: '1px solid var(--am-border)', textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {servisTerbaru.length > 0 ? servisTerbaru.map((s, i) => {
                  const hp = formatNoWA(s.no_hp)
                  const wa_msg = `Halo *${s.nama_pelanggan}*, perangkat *${s.merk_hp} ${s.tipe_hp}* (nota: *${s.no_servis}*) statusnya: *${s.status.toUpperCase()}*\n\nhttps://amservice.web.id/cek_servis.php?no=${s.no_servis}`
                  return (
                    <tr key={s.id} style={{ borderBottom: '1px solid var(--am-border)' }}>
                      <td style={{ padding: '12px', fontSize: '.75rem', color: 'var(--am-text-muted)', fontWeight: '700', textAlign: 'center' }}>{i + 1}</td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: '700', color: '#3b82f6', fontSize: '.79rem' }}>{s.no_servis}</div>
                        <div style={{ fontSize: '.68rem', color: 'var(--am-text-muted)' }}>
                          {new Date(s.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: '600', color: 'var(--am-text)', fontSize: '.8rem' }}>{s.nama_pelanggan}</div>
                        <div style={{ fontSize: '.68rem', color: 'var(--am-text-muted)' }}>{s.merk_hp} {s.tipe_hp}</div>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <span className={`badge-soft ${getBadgeClass(s.status)}`} style={{ fontSize: '.65rem' }}>
                          {getBadgeText(s.status)}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div className="btn-group-act">
                          {!isPengunjung && (
                            <>
                              <Link href={`/servis/edit/${s.id}`} className="btn-act btn-act-blue" title="Edit">
                                <i className="bi bi-pencil-square" />
                              </Link>
                              <div style={{ position: 'relative' }}>
                                <button type="button" className="btn-act btn-act-dark print-btn" title="Cetak">
                                  <i className="bi bi-printer" />
                                </button>
                                <div className="print-dropdown" style={{ display: 'none', position: 'absolute', right: 0, top: 'calc(100% + 4px)', zIndex: 50, width: '130px', background: 'var(--am-surface)', border: '1px solid var(--am-border)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,.15)', overflow: 'hidden' }}>
                                  <Link href={`/nota/${s.id}/penerimaan`} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', fontSize: '.7rem', color: 'var(--am-text)', textDecoration: 'none' }}>
                                    <i className="bi bi-receipt-cutoff" style={{ color: 'var(--am-text-muted)', width: '12px' }} />Nota
                                  </Link>
                                  <Link href={`/nota/${s.id}`} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', fontSize: '.7rem', color: 'var(--am-text)', textDecoration: 'none' }}>
                                    <i className="bi bi-qr-code" style={{ color: 'var(--am-text-muted)', width: '12px' }} />QR Code
                                  </Link>
                                  <Link href={`/nota/${s.id}/garansi`} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', fontSize: '.7rem', color: 'var(--am-text)', textDecoration: 'none' }}>
                                    <i className="bi bi-shield-check" style={{ color: 'var(--am-text-muted)', width: '12px' }} />Garansi
                                  </Link>
                                </div>
                              </div>
                              <div style={{ position: 'relative' }}>
                                <button type="button" className="btn-act btn-act-green wa-drop-btn" title="WA">
                                  <i className="bi bi-whatsapp" />
                                </button>
                                <div className="wa-dropdown print-dropdown" style={{ display: 'none', position: 'absolute', right: 0, top: 'calc(100% + 4px)', zIndex: 50, width: '140px', background: 'var(--am-surface)', border: '1px solid var(--am-border)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,.15)', overflow: 'hidden' }}>
                                  <a href={`https://wa.me/${hp}?text=${encodeURIComponent(wa_msg)}`} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', fontSize: '.7rem', color: 'var(--am-text)', textDecoration: 'none' }}>
                                    <i className="bi bi-chat-dots" style={{ color: 'var(--am-text-muted)', width: '12px' }} />Notif Status
                                  </a>
                                </div>
                              </div>
                            </>
                          )}
                          {isAdmin && (
                            <button onClick={() => handleDelete(s.id)} className="btn-act btn-act-red" title="Hapus">
                              <i className="bi bi-trash" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                }) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--am-text-muted)' }}>
                      <i className="bi bi-inbox" style={{ fontSize: '1.5rem', opacity: 0.3 }} />
                      <p style={{ margin: '8px 0 0', fontSize: '.85rem' }}>Belum ada data servis</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right - Info Cards (right aligned) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Omzet Hari Ini */}
          <div style={{
            background: 'var(--am-surface)',
            border: '1px solid var(--am-border)',
            borderRadius: '12px',
            padding: '16px',
            borderLeft: '3px solid #8b5cf6',
            textAlign: 'right'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-end' }}>
              <div>
                <div style={{ fontSize: '.6rem', fontWeight: '700', color: 'var(--am-text-muted)', textTransform: 'uppercase', letterSpacing: '.5px' }}>Omzet Hari Ini</div>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--am-text)' }}>{formatRupiah(stats.omzet_hari)}</div>
                <div style={{ fontSize: '.68rem', color: 'var(--am-text-muted)', marginTop: '4px' }}>{stats.selesai} transaksi</div>
              </div>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: 'rgba(139,92,246,.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <i className="bi bi-cash-stack" style={{ fontSize: '1.2rem', color: '#8b5cf6' }} />
              </div>
            </div>
          </div>

          {/* Omzet Bulan Ini */}
          <div style={{
            background: 'var(--am-surface)',
            border: '1px solid var(--am-border)',
            borderRadius: '12px',
            padding: '16px',
            borderLeft: '3px solid #f43f5e',
            textAlign: 'right'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-end' }}>
              <div>
                <div style={{ fontSize: '.6rem', fontWeight: '700', color: 'var(--am-text-muted)', textTransform: 'uppercase', letterSpacing: '.5px' }}>Omzet Bulan Ini</div>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--am-text)' }}>{formatRupiah(stats.omzet_bulan)}</div>
                <div style={{ fontSize: '.68rem', color: 'var(--am-text-muted)', marginTop: '4px' }}>
                  {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                </div>
              </div>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: 'rgba(244,63,94,.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <i className="bi bi-graph-up-arrow" style={{ fontSize: '1.2rem', color: '#f43f5e' }} />
              </div>
            </div>
          </div>

          {/* Merk Populer */}
          <div style={{
            background: 'var(--am-surface)',
            border: '1px solid var(--am-border)',
            borderRadius: '12px',
            overflow: 'hidden',
            flex: 1
          }}>
            <div style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--am-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '.75rem', fontWeight: '600', color: 'var(--am-text)' }}>
                <i className="bi bi-trophy-fill" style={{ color: '#f59e0b', marginRight: '6px' }} />Merk Populer
              </span>
              <span style={{ fontSize: '.65rem', color: 'var(--am-text-muted)' }}>All Time</span>
            </div>
            <div style={{ padding: '8px 0', maxHeight: '240px', overflowY: 'auto' }}>
              {stats.merk_populer && stats.merk_populer.length > 0 ? stats.merk_populer.map((merk, i) => {
                const maxTotal = Math.max(...stats.merk_populer.map(m => m.total), 1)
                const pct = (merk.total / maxTotal) * 100
                return (
                  <div key={i} style={{ padding: '8px 16px', borderBottom: '1px solid var(--am-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '.8rem', fontWeight: '600', color: 'var(--am-text)' }}>{merk.merk_hp}</span>
                      <span style={{ fontSize: '.7rem', color: 'var(--am-text-muted)' }}>{merk.total}x</span>
                    </div>
                    <div style={{ height: '3px', background: 'var(--am-border)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #3b82f6, #6366f1)', borderRadius: '2px' }} />
                    </div>
                  </div>
                )
              }) : (
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--am-text-muted)', fontSize: '.8rem' }}>
                  Belum ada data
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grafik Servis - Enhanced with stats */}
      <div style={{
        background: 'var(--am-surface)',
        border: '1px solid var(--am-border)',
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--am-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '.875rem', fontWeight: '600', color: 'var(--am-text)' }}>
            <i className="bi bi-bar-chart-fill" style={{ color: '#3b82f6', marginRight: '8px' }} />Grafik Servis
          </span>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span style={{ fontSize: '.65rem', color: 'var(--am-text-muted)' }}>
              Total: <strong style={{ color: 'var(--am-text)' }}>{totalServis}</strong>
            </span>
            <span style={{ fontSize: '.65rem', color: 'var(--am-text-muted)' }}>
              Rata-rata: <strong style={{ color: '#3b82f6' }}>{avgServis}/bln</strong>
            </span>
          </div>
        </div>
        <div style={{ padding: '24px 20px' }}>
          {/* Chart Area */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-around',
            gap: '16px',
            height: '200px',
            marginBottom: '20px'
          }}>
            {chartData.map((month, i) => {
              const heightPct = (month.value / maxVal) * 100
              const isHighest = month.value === maxVal && month.value > 0
              return (
                <div key={i} style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  height: '100%',
                  position: 'relative'
                }}>
                  {/* Value on top */}
                  <div style={{
                    fontSize: '.7rem',
                    fontWeight: '700',
                    color: isHighest ? '#3b82f6' : 'var(--am-text-muted)',
                    marginBottom: '8px',
                    minHeight: '20px'
                  }}>
                    {month.value}
                  </div>
                  {/* Bar with gradient */}
                  <div style={{
                    width: '100%',
                    maxWidth: '60px',
                    height: `${heightPct}%`,
                    minHeight: month.value > 0 ? '8px' : '4px',
                    background: month.value > 0
                      ? `linear-gradient(180deg, ${isHighest ? '#3b82f6' : '#60a5fa'} 0%, ${isHighest ? '#2563eb' : '#93c5fd'} 100%)`
                      : 'rgba(255,255,255,0.08)',
                    borderRadius: '8px 8px 4px 4px',
                    boxShadow: isHighest ? '0 4px 16px rgba(59,130,246,0.4)' : 'none',
                    transition: 'all 0.4s ease',
                    position: 'relative'
                  }}>
                    {/* Shine effect */}
                    {month.value > 0 && (
                      <div style={{
                        position: 'absolute',
                        top: '4px',
                        left: '4px',
                        right: '4px',
                        height: '6px',
                        background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 100%)',
                        borderRadius: '4px 4px 0 0'
                      }} />
                    )}
                  </div>
                  {/* Month label */}
                  <div style={{
                    fontSize: '.65rem',
                    color: 'var(--am-text-muted)',
                    fontWeight: '600',
                    marginTop: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '.5px'
                  }}>
                    {month.label}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Stats Footer */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '32px',
            paddingTop: '16px',
            borderTop: '1px solid var(--am-border)'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '.6rem', color: 'var(--am-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Total Servis</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--am-text)' }}>{totalServis}</div>
            </div>
            <div style={{ width: '1px', background: 'var(--am-border)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '.6rem', color: 'var(--am-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Rata-rata/Bulan</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#3b82f6' }}>{avgServis}</div>
            </div>
            <div style={{ width: '1px', background: 'var(--am-border)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '.6rem', color: 'var(--am-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Bulan Tertinggi</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#10b981' }}>
                {chartData.length > 0 ? chartData.reduce((a, b) => a.value > b.value ? a : b).label : '-'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}