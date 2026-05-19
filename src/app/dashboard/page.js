'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AppLayout from '@/components/AppLayout'
import MonthlyChart from '@/components/MonthlyChart'
import { formatRupiah } from '@/lib/utils'

// Format date helper
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function Dashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
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

    fetchDashboard()
  }, [router])

  const fetchDashboard = async () => {
    try {
      const [dashRes, servisRes] = await Promise.all([
        fetch('/api/dashboard'),
        fetch('/api/servis?limit=10'),
      ])

      const dashData = await dashRes.json()
      const servisData = await servisRes.json()

      setStats(dashData)
      setServisTerbaru(servisData.servis || [])
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

  if (loading) {
    return (
      <AppLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div style={{ textAlign: 'center', color: 'var(--am-text-muted)' }}>
            <i className="bi bi-arrow-repeat" style={{ fontSize: '2rem', animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: '8px' }}>Memuat dashboard...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      {/* Stats Cards - 4 columns */}
      <div className="dash-row-4" style={{ marginBottom: '8px', marginTop: '4px' }}>
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
      <div className="dash-row-2" style={{ marginBottom: '20px' }}>
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
      <div className="dash-row-tb" style={{ marginBottom: '20px' }}>
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
                          {isAdmin && (
                            <button className="btn-act btn-act-red" title="Hapus">
                              <i className="bi bi-trash" />
                            </button>
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
      <div className="dash-row-bot">
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