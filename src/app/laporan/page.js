'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
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
  }, [])

  const fetchLaporan = useCallback(async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('ams_token') || sessionStorage.getItem('ams_token')
      const params = new URLSearchParams({ type: period })
      if (period === 'bulanan') params.set('bulan', bulan)
      if (period === 'custom') {
        if (!customStart || !customEnd) {
          alert('Silakan pilih tanggal mulai dan selesai')
          setLoading(false)
          return
        }
        params.set('start', customStart)
        params.set('end', customEnd)
      }

      const res = await fetch(`/api/laporan?${params}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Authorization': `Bearer ${token}`
        }
      })
      const result = await res.json()
      setData(result)
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [period, bulan, customStart, customEnd])

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod)
    if (newPeriod === 'custom') {
      // Set default dates for custom range
      const today = new Date()
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
      setCustomStart(firstDay)
      setCustomEnd(today.toISOString().split('T')[0])
    }
  }

  const formatRupiah = (num) => {
    return 'Rp ' + (num || 0).toLocaleString('id-ID', { minimumFractionDigits: 0 })
  }

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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
          <div style={{ textAlign: 'center', color: 'var(--am-text-muted)' }}>
            <i className="bi bi-arrow-repeat" style={{ fontSize: '2rem', animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: '8px' }}>Memuat data...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      {/* Period Selector */}
      <div className="section-card" style={{ marginBottom: '20px', padding: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ color: 'var(--am-text-muted)', fontSize: '.8rem', fontWeight: 600 }}>Periode:</span>
          {['harian', 'mingguan', 'bulanan', 'custom'].map(p => (
            <button
              key={p}
              onClick={() => handlePeriodChange(p)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: period === p ? 'var(--am-primary)' : 'var(--am-surface-2)',
                color: period === p ? '#fff' : 'var(--am-text)',
                fontSize: '.8rem',
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
              className="am-input"
              style={{ maxWidth: 160, padding: '8px 12px' }}
            />
          )}

          {period === 'custom' && (
            <>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="am-input"
                style={{ maxWidth: 160, padding: '8px 12px' }}
              />
              <span style={{ color: 'var(--am-text-muted)' }}>s/d</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="am-input"
                style={{ maxWidth: 160, padding: '8px 12px' }}
              />
            </>
          )}

          <button
            onClick={fetchLaporan}
            className="am-btn am-btn-primary"
            style={{ padding: '8px 16px' }}
          >
            <i className="bi bi-eye" /> Tampilkan
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="dashboard-stats" style={{ marginBottom: '20px' }}>
        <div style={{
          background: 'var(--am-surface)', border: '1px solid var(--am-border)',
          borderRadius: '16px', padding: '16px', borderLeft: '4px solid #3b82f6',
          display: 'flex', alignItems: 'center', gap: '14px', boxShadow: 'var(--am-shadow)'
        }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px',
            background: 'rgba(59,130,246,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <i className="bi bi-receipt" style={{ fontSize: '1.2rem', color: '#3b82f6' }} />
          </div>
          <div>
            <div style={{ fontSize: '.65rem', fontWeight: '700', color: 'var(--am-text-muted)', textTransform: 'uppercase' }}>Total Servis</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>{data.stats.total}</div>
          </div>
        </div>

        <div style={{
          background: 'var(--am-surface)', border: '1px solid var(--am-border)',
          borderRadius: '16px', padding: '16px', borderLeft: '4px solid #94a3b8',
          display: 'flex', alignItems: 'center', gap: '14px', boxShadow: 'var(--am-shadow)'
        }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px',
            background: 'rgba(148,163,184,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <i className="bi bi-hourglass-split" style={{ fontSize: '1.2rem', color: '#94a3b8' }} />
          </div>
          <div>
            <div style={{ fontSize: '.65rem', fontWeight: '700', color: 'var(--am-text-muted)', textTransform: 'uppercase' }}>Antrean</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>{data.stats.antrean}</div>
          </div>
        </div>

        <div style={{
          background: 'var(--am-surface)', border: '1px solid var(--am-border)',
          borderRadius: '16px', padding: '16px', borderLeft: '4px solid #f59e0b',
          display: 'flex', alignItems: 'center', gap: '14px', boxShadow: 'var(--am-shadow)'
        }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px',
            background: 'rgba(245,158,11,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <i className="bi bi-tools" style={{ fontSize: '1.2rem', color: '#f59e0b' }} />
          </div>
          <div>
            <div style={{ fontSize: '.65rem', fontWeight: '700', color: 'var(--am-text-muted)', textTransform: 'uppercase' }}>Dikerjakan</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>{data.stats.proses}</div>
          </div>
        </div>

        <div style={{
          background: 'var(--am-surface)', border: '1px solid var(--am-border)',
          borderRadius: '16px', padding: '16px', borderLeft: '4px solid #06b6d4',
          display: 'flex', alignItems: 'center', gap: '14px', boxShadow: 'var(--am-shadow)'
        }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px',
            background: 'rgba(6,182,212,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <i className="bi bi-bag-check" style={{ fontSize: '1.2rem', color: '#06b6d4' }} />
          </div>
          <div>
            <div style={{ fontSize: '.65rem', fontWeight: '700', color: 'var(--am-text-muted)', textTransform: 'uppercase' }}>Siap</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>{data.stats.siap}</div>
          </div>
        </div>

        <div style={{
          background: 'var(--am-surface)', border: '1px solid var(--am-border)',
          borderRadius: '16px', padding: '16px', borderLeft: '4px solid #10b981',
          display: 'flex', alignItems: 'center', gap: '14px', boxShadow: 'var(--am-shadow)'
        }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px',
            background: 'rgba(16,185,129,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <i className="bi bi-check-circle" style={{ fontSize: '1.2rem', color: '#10b981' }} />
          </div>
          <div>
            <div style={{ fontSize: '.65rem', fontWeight: '700', color: 'var(--am-text-muted)', textTransform: 'uppercase' }}>Selesai</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>{data.stats.selesai}</div>
          </div>
        </div>

        <div style={{
          background: 'var(--am-surface)', border: '1px solid var(--am-border)',
          borderRadius: '16px', padding: '16px', borderLeft: '4px solid #ef4444',
          display: 'flex', alignItems: 'center', gap: '14px', boxShadow: 'var(--am-shadow)'
        }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px',
            background: 'rgba(239,68,68,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <i className="bi bi-x-circle" style={{ fontSize: '1.2rem', color: '#ef4444' }} />
          </div>
          <div>
            <div style={{ fontSize: '.65rem', fontWeight: '700', color: 'var(--am-text-muted)', textTransform: 'uppercase' }}>Gagal</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>{data.stats.gagal}</div>
          </div>
        </div>
      </div>

      {/* Omzet Card */}
      <div className="section-card" style={{ marginBottom: '20px', background: 'linear-gradient(135deg, rgba(139,92,246,.12) 0%, rgba(59,130,246,.12) 100%)', borderColor: '#8b5cf6' }}>
        <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--am-text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
              Total Omzet
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800 }}>
              {formatRupiah(data.omzet)}
            </div>
            <div style={{ fontSize: '.7rem', color: 'var(--am-text-muted)', marginTop: 4 }}>
              Periode: {data.period?.start || '-'} s/d {data.period?.end || '-'}
            </div>
          </div>
          <div style={{ fontSize: '3rem', opacity: 0.3 }}>
            <i className="bi bi-cash-stack" />
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="dashboard-two-col" style={{ marginBottom: '20px' }}>
        {/* Top Merk */}
        <div className="section-card">
          <div className="card-header">
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '.9rem', fontWeight: 600 }}>
              <i className="bi bi-trophy" style={{ color: '#f59e0b' }} />
              Top Merk HP
            </span>
          </div>
          <div style={{ padding: '12px 16px' }}>
            {data.byMerk.length > 0 ? (
              data.byMerk.map(([merk, stats], i) => (
                <div key={merk} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 0', borderBottom: i < data.byMerk.length - 1 ? '1px solid var(--am-border)' : 'none'
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '8px',
                    background: i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : i === 2 ? '#cd7f32' : 'var(--am-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '.75rem', fontWeight: 800, color: i < 3 ? '#0f172a' : 'var(--am-text-muted)'
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '.9rem' }}>{merk}</div>
                    <div style={{ fontSize: '.7rem', color: 'var(--am-text-muted)' }}>
                      {stats.count} servis - {formatRupiah(stats.omzet)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--am-text-muted)' }}>
                Tidak ada data
              </div>
            )}
          </div>
        </div>

        {/* Daily Trend */}
        <div className="section-card">
          <div className="card-header">
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '.9rem', fontWeight: 600 }}>
              <i className="bi bi-calendar-week" style={{ color: '#3b82f6' }} />
              Trend Harian
            </span>
          </div>
          <div style={{ padding: '8px 16px', maxHeight: 280, overflowY: 'auto' }}>
            {Object.keys(data.byDate).length > 0 ? (
              Object.entries(data.byDate)
                .sort((a, b) => new Date(b[0]) - new Date(a[0]))
                .map(([date, stats]) => (
                  <div key={date} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 0', borderBottom: '1px solid var(--am-border)'
                  }}>
                    <div style={{ fontSize: '.8rem', color: 'var(--am-text-muted)' }}>
                      {new Date(date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </div>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      <span style={{ fontSize: '.75rem', color: 'var(--am-text-muted)' }}>
                        {stats.count} servis
                      </span>
                      <span style={{ fontWeight: 600, fontSize: '.8rem', color: '#10b981' }}>
                        {formatRupiah(stats.omzet)}
                      </span>
                    </div>
                  </div>
                ))
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--am-text-muted)' }}>
                Tidak ada data
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Servis */}
      <div className="section-card">
        <div className="card-header">
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '.9rem', fontWeight: 600 }}>
            <i className="bi bi-list-ul" style={{ color: '#06b6d4' }} />
            Detail Servis
          </span>
          <span style={{ fontSize: '.75rem', color: 'var(--am-text-muted)' }}>
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
                    <td style={{ fontWeight: 600, color: '#3b82f6', fontSize: '.85rem' }}>{s.no_servis}</td>
                    <td style={{ fontSize: '.8rem', color: 'var(--am-text-muted)' }}>
                      {new Date(s.tanggal).toLocaleDateString('id-ID')}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '.85rem' }}>{s.nama_pelanggan}</div>
                      <div style={{ fontSize: '.7rem', color: 'var(--am-text-muted)' }}>{s.no_hp}</div>
                    </td>
                    <td style={{ fontSize: '.85rem' }}>{s.merk_hp} {s.tipe_hp}</td>
                    <td><span className={`badge-soft ${getBadgeClass(s.status)}`} style={{ fontSize: '.67rem' }}>{s.status}</span></td>
                    <td style={{ fontWeight: 600, fontSize: '.85rem' }}>{s.estimasi_biaya}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--am-text-muted)' }}>
            <i className="bi bi-inbox" style={{ fontSize: '2.5rem', display: 'block', marginBottom: '.5rem', opacity: 0.3 }} />
            Tidak ada data servis dalam periode ini
          </div>
        )}
      </div>
    </AppLayout>
  )
}