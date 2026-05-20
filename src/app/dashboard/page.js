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

  // Initialize dropdown handlers after data loads
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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
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

  if (initialLoad || loading) {
    return (
      <AppLayout>
        <DashboardSkeleton />
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <style jsx global>{`
        .fade-in {
          animation: fadeIn 0.4s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .scard {
          animation: fadeIn 0.4s ease-out;
          animation-fill-mode: both;
        }
        .scard:nth-child(1) { animation-delay: 0ms; }
        .scard:nth-child(2) { animation-delay: 50ms; }
        .scard:nth-child(3) { animation-delay: 100ms; }
        .scard:nth-child(4) { animation-delay: 150ms; }
      `}</style>

      {/* Stats Cards - 4 columns */}
      <div className="dash-row-4 fade-in" style={{ marginBottom: '8px', marginTop: '4px' }}>
        <div className="scard" style={{ borderLeft: '3px solid #3b82f6' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0, background: 'rgba(59,130,246,.12)', color: '#3b82f6' }}>
            <i className="bi bi-person-plus-fill" />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '.68rem', fontWeight: '700', color: 'var(--am-text-muted)', textTransform: 'uppercase', letterSpacing: '.4px' }}>Antrean</div>
            <div style={{ fontSize: '1.55rem', fontWeight: '800', color: 'var(--am-text)', lineHeight: 1, margin: '2px 0' }}>{stats.antrean}</div>
            <div style={{ fontSize: '.7rem', color: 'var(--am-text-muted)' }}>Unit antre</div>
          </div>
        </div>

        <div className="scard" style={{ borderLeft: '3px solid #f59e0b' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0, background: 'rgba(245,158,11,.12)', color: '#d97706' }}>
            <i className="bi bi-tools" />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '.68rem', fontWeight: '700', color: 'var(--am-text-muted)', textTransform: 'uppercase', letterSpacing: '.4px' }}>Dikerjakan</div>
            <div style={{ fontSize: '1.55rem', fontWeight: '800', color: 'var(--am-text)', lineHeight: 1, margin: '2px 0' }}>{stats.proses}</div>
            <div style={{ fontSize: '.7rem', color: 'var(--am-text-muted)' }}>Sedang proses</div>
          </div>
        </div>

        <div className="scard" style={{ borderLeft: '3px solid #06b6d4' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0, background: 'rgba(6,182,212,.12)', color: '#0891b2' }}>
            <i className="bi bi-bag-check-fill" />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '.68rem', fontWeight: '700', color: 'var(--am-text-muted)', textTransform: 'uppercase', letterSpacing: '.4px' }}>Siap Diambil</div>
            <div style={{ fontSize: '1.55rem', fontWeight: '800', color: 'var(--am-text)', lineHeight: 1, margin: '2px 0' }}>{stats.siap}</div>
            <div style={{ fontSize: '.7rem', color: 'var(--am-text-muted)' }}>Tunggu pelanggan</div>
          </div>
        </div>

        <div className="scard" style={{ borderLeft: '3px solid #10b981' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0, background: 'rgba(16,185,129,.12)', color: '#059669' }}>
            <i className="bi bi-check-circle-fill" />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '.68rem', fontWeight: '700', color: 'var(--am-text-muted)', textTransform: 'uppercase', letterSpacing: '.4px' }}>Selesai</div>
            <div style={{ fontSize: '1.55rem', fontWeight: '800', color: 'var(--am-text)', lineHeight: 1, margin: '2px 0' }}>{stats.selesai}</div>
            <div style={{ fontSize: '.7rem', color: 'var(--am-text-muted)' }}>Diambil hari ini</div>
          </div>
        </div>
      </div>

      {/* Omzet Cards - 2 columns */}
      <div className="dash-row-2 fade-in" style={{ marginBottom: '20px' }}>
        <div className="scard" style={{ borderLeft: '3px solid #8b5cf6' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0, background: 'rgba(139,92,246,.12)', color: '#7c3aed' }}>
            <i className="bi bi-cash-stack" />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '.68rem', fontWeight: '700', color: 'var(--am-text-muted)', textTransform: 'uppercase', letterSpacing: '.4px' }}>Omzet Hari Ini</div>
            <div style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--am-text)', lineHeight: 1, margin: '2px 0' }}>{formatRupiah(stats.omzet_hari)}</div>
            <div style={{ fontSize: '.7rem', color: 'var(--am-text-muted)' }}>{stats.selesai} transaksi selesai</div>
          </div>
        </div>

        <div className="scard" style={{ borderLeft: '3px solid #f43f5e' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0, background: 'rgba(244,63,94,.12)', color: '#e11d48' }}>
            <i className="bi bi-graph-up-arrow" />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '.68rem', fontWeight: '700', color: 'var(--am-text-muted)', textTransform: 'uppercase', letterSpacing: '.4px' }}>Omzet Bulan Ini</div>
            <div style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--am-text)', lineHeight: 1, margin: '2px 0' }}>{formatRupiah(stats.omzet_bulan)}</div>
            <div style={{ fontSize: '.7rem', color: 'var(--am-text-muted)' }}>{new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</div>
          </div>
        </div>
      </div>

      {/* Table + Sidebar */}
      <div className="dash-row-tb fade-in" style={{ marginBottom: '20px' }}>
        {/* Servis Table */}
        <div className="section-card">
          <div className="card-header">
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '.875rem', fontWeight: '600', color: 'var(--am-text)' }}>
              <i className="bi bi-clock-history" style={{ color: '#3b82f6' }} /> Servis Terbaru
            </span>
            <Link
              href="/servis/data"
              style={{ fontSize: '.75rem', color: 'var(--am-primary)', textDecoration: 'none', fontWeight: '600' }}
            >
              Lihat Semua <i className="bi bi-arrow-right" />
            </Link>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ width: '28px', textAlign: 'center', padding: '10px 8px', fontSize: '.7rem', fontWeight: '700', color: 'var(--am-text-muted)', borderBottom: '1px solid var(--am-border)', whiteSpace: 'nowrap' }}>#</th>
                  <th style={{ padding: '10px 8px', fontSize: '.7rem', fontWeight: '700', color: 'var(--am-text-muted)', borderBottom: '1px solid var(--am-border)', textAlign: 'left', whiteSpace: 'nowrap' }}>Kode / Tgl</th>
                  <th style={{ padding: '10px 8px', fontSize: '.7rem', fontWeight: '700', color: 'var(--am-text-muted)', borderBottom: '1px solid var(--am-border)', textAlign: 'center', whiteSpace: 'nowrap' }}>Pelanggan & Unit</th>
                  <th style={{ width: '68px', textAlign: 'center', padding: '10px 8px', fontSize: '.7rem', fontWeight: '700', color: 'var(--am-text-muted)', borderBottom: '1px solid var(--am-border)', whiteSpace: 'nowrap' }}>Status</th>
                  <th style={{ width: '110px', textAlign: 'center', padding: '10px 8px', fontSize: '.7rem', fontWeight: '700', color: 'var(--am-text-muted)', borderBottom: '1px solid var(--am-border)', whiteSpace: 'nowrap' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {servisTerbaru.length > 0 ? servisTerbaru.map((s, i) => {
                  const hp = formatNoWA(s.no_hp)
                  const wa_msg = `Halo *${s.nama_pelanggan}*, perangkat *${s.merk_hp} ${s.tipe_hp}* (nota: *${s.no_servis}*) statusnya: *${s.status.toUpperCase()}*\n\nhttps://amservice.web.id/cek_servis.php?no=${s.no_servis}`

                  return (
                    <tr key={s.id} style={{ borderBottom: '1px solid var(--am-border)' }}>
                      <td style={{ textAlign: 'center', fontSize: '.75rem', color: 'var(--am-text-muted)', fontWeight: '700', padding: '12px 8px' }}>
                        {i + 1}
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <div style={{ fontWeight: '700', color: '#3b82f6', fontSize: '.79rem' }}>{s.no_servis}</div>
                        <div style={{ fontSize: '.7rem', color: 'var(--am-text-muted)' }}>
                          {new Date(s.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </div>
                      </td>
                      <td style={{ textAlign: 'center', padding: '12px 8px' }}>
                        <div style={{ fontWeight: '600', color: 'var(--am-text)', fontSize: '.8rem', lineHeight: 1.3 }}>
                          {s.nama_pelanggan}
                        </div>
                        <div style={{ fontSize: '.7rem', color: 'var(--am-text-muted)' }}>{s.merk_hp} {s.tipe_hp}</div>
                        {s.keluhan && (
                          <div style={{ fontSize: '.68rem', color: 'var(--am-text-muted)', fontStyle: 'italic', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={s.keluhan}>
                            {s.keluhan.length > 25 ? s.keluhan.slice(0, 25) + '…' : s.keluhan}
                          </div>
                        )}
                      </td>
                      <td style={{ textAlign: 'center', padding: '12px 8px' }}>
                        <span className={`badge-soft ${getBadgeClass(s.status)}`} style={{ fontSize: '.67rem' }}>
                          {getBadgeText(s.status)}
                        </span>
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <div className="btn-group-act">
                          {!isPengunjung && (
                            <>
                              <Link href={`/servis/edit/${s.id}`} className="btn-act btn-act-blue" title="Edit">
                                <i className="bi bi-pencil-square" />
                              </Link>
                              {/* Print Dropdown */}
                              <div style={{ position: 'relative' }}>
                                <button type="button" className="btn-act btn-act-dark print-btn" title="Cetak">
                                  <i className="bi bi-printer" />
                                  <i className="bi bi-chevron-down" style={{ fontSize: '5px', marginLeft: '1px' }} />
                                </button>
                                <div className="print-dropdown" style={{ display: 'none', position: 'absolute', right: 0, top: 'calc(100% + 4px)', zIndex: 50, width: '148px', background: 'var(--am-surface)', border: '1px solid var(--am-border)', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,.15)', overflow: 'hidden' }}>
                                  <Link href={`/nota/${s.id}/penerimaan`} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '7px 10px', fontSize: '.76rem', color: 'var(--am-text)', textDecoration: 'none' }}>
                                    <i className="bi bi-receipt-cutoff" style={{ color: 'var(--am-text-muted)', width: '13px', textAlign: 'center' }} />Nota Offline
                                  </Link>
                                  <Link href={`/nota/${s.id}`} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '7px 10px', fontSize: '.76rem', color: 'var(--am-text)', textDecoration: 'none' }}>
                                    <i className="bi bi-qr-code" style={{ color: 'var(--am-text-muted)', width: '13px', textAlign: 'center' }} />QR Code
                                  </Link>
                                  <Link href={`/nota/${s.id}/garansi`} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '7px 10px', fontSize: '.76rem', color: 'var(--am-text)', textDecoration: 'none' }}>
                                    <i className="bi bi-shield-check" style={{ color: 'var(--am-text-muted)', width: '13px', textAlign: 'center' }} />Nota Garansi
                                  </Link>
                                  <Link href={`/nota/${s.id}/label`} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '7px 10px', fontSize: '.76rem', color: 'var(--am-text)', textDecoration: 'none' }}>
                                    <i className="bi bi-tag-fill" style={{ color: 'var(--am-text-muted)', width: '13px', textAlign: 'center' }} />Label
                                  </Link>
                                </div>
                              </div>
                              {/* WA Dropdown */}
                              <div style={{ position: 'relative' }}>
                                <button type="button" className="btn-act btn-act-green wa-drop-btn" title="Kirim WA">
                                  <i className="bi bi-whatsapp" />
                                  <i className="bi bi-chevron-down" style={{ fontSize: '5px', marginLeft: '1px' }} />
                                </button>
                                <div className="wa-dropdown print-dropdown" style={{ display: 'none', position: 'absolute', right: 0, top: 'calc(100% + 4px)', zIndex: 60, width: '172px', background: 'var(--am-surface)', border: '1px solid var(--am-border)', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,.15)', overflow: 'hidden' }}>
                                  <a href={`https://wa.me/${hp}?text=${encodeURIComponent(wa_msg)}`} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '7px 10px', fontSize: '.76rem', color: 'var(--am-text)', textDecoration: 'none' }}>
                                    <i className="bi bi-chat-dots" style={{ color: 'var(--am-text-muted)', width: '13px', textAlign: 'center' }} />Notif Status
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
                    <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--am-text-muted)' }}>
                      <i className="bi bi-inbox" style={{ fontSize: '2rem', opacity: 0.3 }} />
                      <p style={{ margin: '8px 0 0' }}>Belum ada data servis</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar Column - Merk Populer only */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Merk HP Populer */}
          <div className="section-card">
            <div className="card-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '.75rem', fontWeight: '600', color: 'var(--am-text)' }}>
                <i className="bi bi-trophy" style={{ color: '#f59e0b' }} /> Merk Populer
              </span>
              <span style={{ fontSize: '.65rem', color: 'var(--am-text-muted)' }}>All Time</span>
            </div>
            <div style={{ padding: '8px 0' }}>
              {stats.merk_populer && stats.merk_populer.length > 0 ? stats.merk_populer.slice(0, 6).map((merk, i) => {
                const maxTotal = Math.max(...stats.merk_populer.map(m => m.total), 1)
                const pct = (merk.total / maxTotal) * 100
                return (
                  <div key={i} style={{ padding: '8px 16px', borderBottom: '1px solid var(--am-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '.8rem', fontWeight: '600', color: 'var(--am-text)' }}>{merk.merk_hp}</span>
                      <span style={{ fontSize: '.7rem', color: 'var(--am-text-muted)' }}>{merk.total}x</span>
                    </div>
                    <div style={{ height: '3px', background: 'var(--am-border)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #3b82f6, #6366f1)', borderRadius: '2px', transition: 'width 0.5s ease' }} />
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

      {/* Bottom Section - Chart only */}
      <div className="dash-row-bot fade-in">
        {/* Monthly Chart */}
        <div className="section-card">
          <div className="card-header">
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '.875rem', fontWeight: '600', color: 'var(--am-text)' }}>
              <i className="bi bi-bar-chart-fill" style={{ color: '#3b82f6' }} /> Grafik Servis
            </span>
            <span style={{ fontSize: '.65rem', color: 'var(--am-text-muted)' }}>6 Bulan Terakhir - {new Date().getFullYear()}</span>
          </div>
          <div style={{ padding: '16px' }}>
            {/* Simple bar chart */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-around',
              gap: '8px',
              height: '200px',
              padding: '0 8px'
            }}>
              {stats.monthly_data && stats.monthly_data.map((month, i) => {
                const maxVal = Math.max(...(stats.monthly_data || []).map(m => m.value), 1)
                const heightPct = (month.value / maxVal) * 100
                return (
                  <div key={i} style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '100%'
                  }}>
                    {/* Value label on top */}
                    <div style={{
                      fontSize: '.65rem',
                      fontWeight: '700',
                      color: 'var(--am-text)',
                      marginBottom: '4px',
                      minHeight: '16px'
                    }}>
                      {month.value}
                    </div>
                    {/* Bar */}
                    <div style={{
                      width: '100%',
                      height: `${heightPct}%`,
                      minHeight: month.value > 0 ? '4px' : '2px',
                      background: month.value > 0
                        ? 'linear-gradient(180deg, #3b82f6, #6366f1)'
                        : 'rgba(255,255,255,0.1)',
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.5s ease',
                      boxShadow: month.value > 0 ? '0 2px 8px rgba(59,130,246,0.4)' : 'none'
                    }} />
                    {/* Month label */}
                    <div style={{
                      fontSize: '.6rem',
                      color: 'var(--am-text-muted)',
                      fontWeight: '600',
                      marginTop: '6px',
                      textTransform: 'uppercase'
                    }}>
                      {month.label}
                    </div>
                  </div>
                )
              })}
            </div>
            {/* Total */}
            <div style={{
              textAlign: 'center',
              marginTop: '12px',
              paddingTop: '12px',
              borderTop: '1px solid var(--am-border)',
              fontSize: '.75rem',
              color: 'var(--am-text-muted)'
            }}>
              Total Servis 6 Bulan: <strong style={{ color: 'var(--am-text)', fontSize: '1rem' }}>
                {stats.monthly_data?.reduce((sum, m) => sum + m.value, 0) || 0}
              </strong>
            </div>
          </div>
        </div>

        {/* Right side - Empty or can be used for other info */}
        <div className="section-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '280px' }}>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <i className="bi bi-graph-up" style={{ fontSize: '3rem', color: 'var(--am-text-muted)', opacity: 0.3 }} />
            <p style={{ color: 'var(--am-text-muted)', fontSize: '.85rem', marginTop: '12px' }}>
              Data statistik tambahan<br />dapat ditampilkan di sini
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}