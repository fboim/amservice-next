'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AppLayout from '@/components/AppLayout'
import MonthlyChart from '@/components/MonthlyChart'
import { formatRupiah } from '@/lib/utils'
import { DashboardSkeleton } from '@/components/Skeleton'

export default function Dashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [initialLoad, setInitialLoad] = useState(true)
  const [stats, setStats] = useState({
    antrean: 0, proses: 0, siap: 0, selesai: 0, omzet_hari: 0, omzet_bulan: 0
  })
  const [servisTerbaru, setServisTerbaru] = useState([])
  const [stokMenipis, setStokMenipis] = useState([])
  const [merkPopuler, setMerkPopuler] = useState([])
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

    // Small delay for smooth transition
    const timer = setTimeout(() => {
      fetchDashboard()
    }, 100)

    return () => clearTimeout(timer)
  }, [router])

  const fetchDashboard = async () => {
    try {
      // Parallel fetch all data at once
      const [dashRes, servisRes, sparepartRes] = await Promise.all([
        fetch('/api/dashboard', {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        }),
        fetch('/api/servis?limit=10', {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        }),
        fetch('/api/sparepart?low=true&limit=5', {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        }),
      ])

      const [dashData, servisData, sparepartData] = await Promise.all([
        dashRes.json(),
        servisRes.json(),
        sparepartRes.json()
      ])

      setStats(dashData || {})
      setServisTerbaru(servisData.servis || [])
      setStokMenipis(sparepartData.sparepart || [])

      // Calculate merk populer from servis
      if (servisData.servis && servisData.servis.length > 0) {
        const merkCount = {}
        servisData.servis.forEach(s => {
          const merk = s.merk_hp || 'Lainnya'
          merkCount[merk] = (merkCount[merk] || 0) + 1
        })
        setMerkPopuler(
          Object.entries(merkCount)
            .map(([merk_hp, total]) => ({ merk_hp, total }))
            .sort((a, b) => b.total - a.total)
        )
      }
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      // Smooth fade out
      setTimeout(() => {
        setLoading(false)
        setInitialLoad(false)
      }, 300)
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
            <div style={{ fontSize: '.7rem', color: 'var(--am-text-muted)' }}>Unit hari ini</div>
          </div>
        </div>

        <div className="scard" style={{ borderLeft: '3px solid #f59e0b' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0, background: 'rgba(245,158,11,.12)', color: '#d97706' }}>
            <i className="bi bi-tools" />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '.68rem', fontWeight: '700', color: 'var(--am-text-muted)', textTransform: 'uppercase', letterSpacing: '.4px' }}>Dikerjakan</div>
            <div style={{ fontSize: '1.55rem', fontWeight: '800', color: 'var(--am-text)', lineHeight: 1, margin: '2px 0' }}>{stats.proses}</div>
            <div style={{ fontSize: '.7rem', color: 'var(--am-text-muted)' }}>Sedang diproses</div>
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
          <div className="table-wrapper">
            <table className="ds-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Pelanggan</th>
                  <th>Unit HP</th>
                  <th>Keluhan</th>
                  <th>Status</th>
                  <th>Biaya</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {servisTerbaru.length > 0 ? servisTerbaru.map((s, i) => {
                  const hp = formatNoWA(s.no_hp)
                  const wa_msg = `Halo *${s.nama_pelanggan}*, perangkat *${s.merk_hp} ${s.tipe_hp}* (nota: *${s.no_servis}*) statusnya: *${s.status.toUpperCase()}*\n\nhttps://amservice.web.id/cek_servis.php?no=${s.no_servis}`

                  return (
                    <tr key={s.id}>
                      <td style={{ color: 'var(--am-text-muted)', fontSize: '.75rem' }}>{i + 1}</td>
                      <td style={{ textAlign: 'left' }}>
                        <div style={{ lineHeight: 1.3 }}>
                          <div style={{ fontWeight: '600', color: 'var(--am-text)', fontSize: '.82rem' }}>{s.nama_pelanggan}</div>
                          <div style={{ fontSize: '.7rem', color: 'var(--am-text-muted)' }}>{s.no_servis}</div>
                        </div>
                      </td>
                      <td style={{ textAlign: 'left' }}>
                        <div style={{ lineHeight: 1.3 }}>
                          <div style={{ fontWeight: '600', color: 'var(--am-text)', fontSize: '.82rem' }}>{s.merk_hp} {s.tipe_hp}</div>
                          <div style={{ fontSize: '.7rem', color: 'var(--am-text-muted)' }}>{formatDate(s.tanggal)}</div>
                        </div>
                      </td>
                      <td style={{ textAlign: 'left', maxWidth: '160px' }}>
                        {s.keluhan ? (
                          <div style={{ fontSize: '.8rem', color: 'var(--am-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }} title={s.keluhan}>
                            {s.keluhan.length > 30 ? s.keluhan.slice(0, 30) + '...' : s.keluhan}
                          </div>
                        ) : (
                          <span style={{ fontSize: '.8rem', color: 'var(--am-text-muted)' }}>-</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge-soft ${getBadgeClass(s.status)}`}>{getBadgeText(s.status)}</span>
                      </td>
                      <td style={{ fontWeight: '600', color: 'var(--am-text)', fontSize: '.82rem' }}>
                        {s.estimasi_biaya ? formatRupiah(s.estimasi_biaya) : '-'}
                      </td>
                      <td>
                        <div className="btn-group-act">
                          {!isPengunjung && (
                            <>
                              <Link href={`/servis/edit/${s.id}`} className="btn-act btn-act-blue" title="Edit">
                                <i className="bi bi-pencil-square" />
                              </Link>
                              <a href={`https://wa.me/${hp}?text=${encodeURIComponent(wa_msg)}`} target="_blank" className="btn-act btn-act-green" title="Kirim WA">
                                <i className="bi bi-whatsapp" />
                              </a>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                }) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: 'var(--am-text-muted)' }}>
                      <i className="bi bi-inbox" style={{ fontSize: '2rem', opacity: 0.3 }} />
                      <p style={{ margin: '8px 0 0' }}>Belum ada data servis</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar Column - Stock Warning + Merk Populer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Stok Menipis Widget */}
          <div className="section-card">
            <div className="card-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '.75rem', fontWeight: '600', color: 'var(--am-text)' }}>
                <i className="bi bi-exclamation-triangle" style={{ color: '#f59e0b' }} /> Stok Menipis
              </span>
              {stokMenipis.length > 0 && (
                <span style={{ fontSize: '.65rem', color: 'var(--am-text-muted)' }}>{stokMenipis.length} item</span>
              )}
            </div>
            <div style={{ padding: '8px 0' }}>
              {stokMenipis.length > 0 ? stokMenipis.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px', borderBottom: '1px solid var(--am-border)' }}>
                  <span style={{ fontSize: '.8rem', color: 'var(--am-text)' }}>{item.nama_sparepart || item.nama}</span>
                  <span style={{
                    fontSize: '.68rem',
                    fontWeight: '700',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    background: item.stok === 0 ? 'rgba(239,68,68,.15)' : 'rgba(245,158,11,.15)',
                    color: item.stok === 0 ? '#dc2626' : '#d97706',
                  }}>
                    {item.stok}
                  </span>
                </div>
              )) : (
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--am-text-muted)', fontSize: '.8rem' }}>
                  <i className="bi bi-check-circle" style={{ color: '#10b981' }} /> Stok Aman
                </div>
              )}
            </div>
          </div>

          {/* Merk HP Populer */}
          <div className="section-card">
            <div className="card-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '.75rem', fontWeight: '600', color: 'var(--am-text)' }}>
                <i className="bi bi-phone" style={{ color: '#3b82f6' }} /> Merk Populer
              </span>
            </div>
            <div>
              {merkPopuler.length > 0 ? merkPopuler.map((merk, i) => (
                <div key={i} className="merk-item">
                  <span style={{ fontSize: '.8rem', color: 'var(--am-text)' }}>{merk.merk_hp}</span>
                  <span style={{ fontSize: '.7rem', fontWeight: '600', color: 'var(--am-text-muted)' }}>{merk.total}x</span>
                </div>
              )) : (
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--am-text-muted)', fontSize: '.8rem' }}>
                  Belum ada data
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Chart + Popular Brands */}
      <div className="dash-row-bot fade-in">
        {/* Monthly Chart */}
        <div className="section-card">
          <div className="card-header">
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '.875rem', fontWeight: '600', color: 'var(--am-text)' }}>
              <i className="bi bi-bar-chart" style={{ color: '#3b82f6' }} /> Grafik Servis
            </span>
            <span style={{ fontSize: '.65rem', color: 'var(--am-text-muted)' }}>{new Date().getFullYear()}</span>
          </div>
          <div style={{ padding: '16px' }}>
            <div style={{ height: '220px' }}>
              <MonthlyChart data={stats.monthly_data} />
            </div>
          </div>
        </div>

        {/* Popular Brands Stats */}
        <div className="section-card">
          <div className="card-header">
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '.875rem', fontWeight: '600', color: 'var(--am-text)' }}>
              <i className="bi bi-trophy" style={{ color: '#f59e0b' }} /> Brand Stats
            </span>
          </div>
          <div style={{ padding: '8px 0' }}>
            {merkPopuler.length > 0 ? merkPopuler.slice(0, 5).map((merk, i) => {
              const maxTotal = Math.max(...merkPopuler.map(m => m.total))
              const percentage = (merk.total / maxTotal) * 100

              return (
                <div key={i} style={{ padding: '10px 16px', borderBottom: '1px solid var(--am-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '.8rem', fontWeight: '600', color: 'var(--am-text)' }}>{merk.merk_hp}</span>
                    <span style={{ fontSize: '.7rem', color: 'var(--am-text-muted)' }}>{merk.total} unit</span>
                  </div>
                  <div style={{ height: '4px', background: 'var(--am-border)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${percentage}%`, background: 'linear-gradient(90deg, #3b82f6, #6366f1)', borderRadius: '2px' }} />
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
    </AppLayout>
  )
}