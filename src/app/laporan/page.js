'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AppLayout from '@/components/AppLayout'

export default function Laporan() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('harian')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [bulan, setBulan] = useState(new Date().toISOString().slice(0, 7))
  const [data, setData] = useState({
    stats: { total: 0, antrean: 0, proses: 0, siap: 0, selesai: 0, gagal: 0 },
    omzet: 0,
    servis: [],
    byDate: {},
    byMerk: []
  })

  useEffect(() => {
    const token = sessionStorage.getItem('ams_token') || localStorage.getItem('ams_token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchLaporan()
  }, [period, bulan, customStart, customEnd])

  const fetchLaporan = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ type: period })
      if (period === 'bulanan') params.set('bulan', bulan)
      if (period === 'custom') {
        params.set('start', customStart)
        params.set('end', customEnd)
      }

      const res = await fetch(`/api/laporan?${params}`)
      const result = await res.json()
      setData(result)
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatRupiah = (num) => {
    return 'Rp ' + (num || 0).toLocaleString('id-ID', { minimumFractionDigits: 0 })
  }

  const StatCard = ({ icon, label, value, color, bg }) => (
    <div className="stat-card" style={{ borderLeft: `3px solid ${color}` }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.1rem', background: bg, color
      }}>
        <i className={`bi ${icon}`} />
      </div>
      <div>
        <div style={{ fontSize: '.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
          {label}
        </div>
        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f1f5f9', lineHeight: 1.2 }}>
          {value}
        </div>
      </div>
    </div>
  )

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

  if (loading) {
    return (
      <AppLayout>
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="spinner" style={{ width: 40, height: 40 }} />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
    <div style={{ minHeight: '100vh', padding: '0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div className="pg-header">
          <div>
            <h4 className="pg-title">
              <i className="bi bi-graph-up" style={{ color: '#8b5cf6', marginRight: 8 }} />
              Laporan
            </h4>
            <p className="pg-subtitle">
              Periode: {data.period?.start} s/d {data.period?.end}
            </p>
          </div>
          <Link href="/dashboard" className="am-btn am-btn-secondary am-btn-sm">
            <i className="bi bi-arrow-left" />
            Kembali
          </Link>
        </div>

        {/* Period Selector */}
        <div className="section-card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ padding: '1rem', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ color: '#64748b', fontSize: '.8rem', fontWeight: 600 }}>Periode:</span>
            {['harian', 'mingguan', 'bulanan', 'custom'].map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 6,
                  border: 'none',
                  background: period === p ? '#3b82f6' : '#334155',
                  color: '#fff',
                  fontSize: '.75rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {p === 'harian' ? 'Hari Ini' : p === 'mingguan' ? 'Minggu Ini' : p === 'bulanan' ? 'Bulan Ini' : 'Custom'}
              </button>
            ))}

            {period === 'bulanan' && (
              <input
                type="month"
                value={bulan}
                onChange={(e) => setBulan(e.target.value)}
                style={{
                  padding: '6px 12px',
                  background: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: 6,
                  color: '#f1f5f9',
                  fontSize: '.8rem'
                }}
              />
            )}

            {period === 'custom' && (
              <>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  style={{
                    padding: '6px 12px',
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: 6,
                    color: '#f1f5f9',
                    fontSize: '.8rem'
                  }}
                />
                <span style={{ color: '#64748b' }}>s/d</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  style={{
                    padding: '6px 12px',
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: 6,
                    color: '#f1f5f9',
                    fontSize: '.8rem'
                  }}
                />
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <StatCard icon="bi-receipt" label="Total Servis" value={data.stats.total} color="#3b82f6" bg="rgba(59,130,246,.12)" />
          <StatCard icon="bi-hourglass-split" label="Antrean" value={data.stats.antrean} color="#94a3b8" bg="rgba(148,163,184,.12)" />
          <StatCard icon="bi-tools" label="Dikerjakan" value={data.stats.proses} color="#f59e0b" bg="rgba(245,158,11,.12)" />
          <StatCard icon="bi-bag-check" label="Siap Diambil" value={data.stats.siap} color="#06b6d4" bg="rgba(6,182,212,.12)" />
          <StatCard icon="bi-check-circle" label="Selesai" value={data.stats.selesai} color="#10b981" bg="rgba(16,185,129,.12)" />
          <StatCard icon="bi-x-circle" label="Gagal" value={data.stats.gagal} color="#ef4444" bg="rgba(239,68,68,.12)" />
        </div>

        {/* Omzet */}
        <div className="section-card" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(139,92,246,.15) 0%, rgba(59,130,246,.15) 100%)', borderColor: '#8b5cf6' }}>
          <div style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '.8rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 }}>
                Total Omzet
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f1f5f9' }}>
                {formatRupiah(data.omzet)}
              </div>
            </div>
            <div style={{ fontSize: '4rem', opacity: 0.3 }}>
              <i className="bi bi-cash-stack" />
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
          {/* Top Merk */}
          <div className="section-card">
            <div className="card-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.9rem', fontWeight: 600 }}>
                <i className="bi bi-trophy" style={{ color: '#f59e0b' }} />
                Top Merk HP
              </span>
            </div>
            <div style={{ padding: '1rem' }}>
              {data.byMerk.length > 0 ? (
                data.byMerk.map(([merk, stats], i) => (
                  <div key={merk} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 0',
                    borderBottom: i < data.byMerk.length - 1 ? '1px solid #334155' : 'none'
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 6,
                      background: i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : i === 2 ? '#cd7f32' : '#334155',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '.75rem', fontWeight: 800, color: i < 3 ? '#0f172a' : '#94a3b8'
                    }}>
                      {i + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '.9rem' }}>{merk}</div>
                      <div style={{ fontSize: '.7rem', color: '#64748b' }}>
                        {stats.count} servis - {formatRupiah(stats.omzet)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                  Tidak ada data
                </div>
              )}
            </div>
          </div>

          {/* Daily Trend */}
          <div className="section-card">
            <div className="card-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.9rem', fontWeight: 600 }}>
                <i className="bi bi-calendar-week" style={{ color: '#3b82f6' }} />
                Trend Harian
              </span>
            </div>
            <div style={{ padding: '1rem', maxHeight: 300, overflowY: 'auto' }}>
              {Object.keys(data.byDate).length > 0 ? (
                Object.entries(data.byDate)
                  .sort((a, b) => new Date(b[0]) - new Date(a[0]))
                  .map(([date, stats]) => (
                    <div key={date} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: '1px solid #334155'
                    }}>
                      <div style={{ fontSize: '.8rem', color: '#94a3b8' }}>
                        {new Date(date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </div>
                      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                        <span style={{ fontSize: '.75rem', color: '#64748b' }}>
                          {stats.count} servis
                        </span>
                        <span style={{ fontWeight: 600, fontSize: '.8rem', color: '#10b981' }}>
                          {formatRupiah(stats.omzet)}
                        </span>
                      </div>
                    </div>
                  ))
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                  Tidak ada data
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detail Servis */}
        <div className="section-card">
          <div className="card-header">
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.9rem', fontWeight: 600 }}>
              <i className="bi bi-list-ul" style={{ color: '#06b6d4' }} />
              Detail Servis
            </span>
            <span style={{ fontSize: '.75rem', color: '#64748b' }}>
              {data.servis.length} record
            </span>
          </div>
          {data.servis.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table className="am-table">
                <thead>
                  <tr>
                    <th>No Nota</th>
                    <th>Tanggal</th>
                    <th>Pelanggan</th>
                    <th>Unit HP</th>
                    <th>Status</th>
                    <th>Biaya</th>
                  </tr>
                </thead>
                <tbody>
                  {data.servis.map((s, i) => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 600, color: '#3b82f6' }}>{s.no_servis}</td>
                      <td style={{ fontSize: '.8rem', color: '#64748b' }}>
                        {new Date(s.tanggal).toLocaleDateString('id-ID')}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{s.nama_pelanggan}</div>
                        <div style={{ fontSize: '.7rem', color: '#64748b' }}>{s.no_hp}</div>
                      </td>
                      <td>{s.merk_hp} {s.tipe_hp}</td>
                      <td><span className={`badge ${getBadgeClass(s.status)}`}>{s.status}</span></td>
                      <td style={{ fontWeight: 600 }}>{s.estimasi_biaya}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
              <i className="bi bi-inbox" style={{ fontSize: '2.5rem', display: 'block', marginBottom: '.5rem', opacity: 0.3 }} />
              Tidak ada data servis dalam periode ini
            </div>
          )}
        </div>
      </div>
    </div>
    </AppLayout>
  )
}