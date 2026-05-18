'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

function StatCard({ icon, label, value, color, bg }) {
  return (
    <div className="stat-card" style={{ borderLeft: `3px solid ${color}` }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.2rem',
        background: bg, color
      }}>
        <i className={`bi ${icon}`} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.4px' }}>
          {label}
        </div>
        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f1f5f9', lineHeight: 1, margin: '4px 0' }}>
          {value}
        </div>
        <div style={{ fontSize: '.75rem', color: '#64748b' }}></div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ antrean: 0, proses: 0, siap: 0, selesai: 0, omzet_hari: 0 })
  const [servisTerbaru, setServisTerbaru] = useState([])
  const [stokMenipis, setStokMenipis] = useState([])
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Check auth
    const token = sessionStorage.getItem('ams_token') || localStorage.getItem('ams_token')
    const userData = sessionStorage.getItem('ams_user')

    if (!token) {
      router.push('/login')
      return
    }

    if (userData) {
      setUser(JSON.parse(userData))
    }

    // Fetch dashboard data
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/dashboard')
      const data = await res.json()
      setStats(data)

      // Fetch servis terbaru
      const servisRes = await fetch('/api/servis?limit=5')
      const servisData = await servisRes.json()
      setServisTerbaru(servisData.servis || [])

      // Fetch stok menipis
      const stokRes = await fetch('/api/sparepart?low=true')
      const stokData = await stokRes.json()
      setStokMenipis(stokData.sparepart || [])
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatRupiah = (num) => {
    if (num === undefined || num === null) return 'Rp 0'
    return 'Rp ' + Number(num).toLocaleString('id-ID', { minimumFractionDigits: 0 })
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

  const handleLogout = () => {
    sessionStorage.removeItem('ams_token')
    sessionStorage.removeItem('ams_user')
    localStorage.removeItem('ams_token')
    router.push('/')
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ width: 40, height: 40, margin: '0 auto 1rem' }} />
          <p style={{ color: '#64748b' }}>Memuat...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', padding: '1.5rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f1f5f9', margin: 0 }}>
            Dashboard
          </h1>
          <p style={{ fontSize: '.875rem', color: '#64748b', margin: '4px 0 0' }}>
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link href="/servis/tambah" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '10px 20px', borderRadius: 999,
            background: '#3b82f6', color: '#fff',
            fontWeight: 600, fontSize: '.875rem', textDecoration: 'none',
            boxShadow: '0 2px 10px rgba(59,130,246,.25)'
          }}>
            <i className="bi bi-plus-circle" />
            Servis Baru
          </Link>
          <button onClick={handleLogout} style={{
            padding: '10px 16px', borderRadius: 8,
            background: '#334155', color: '#94a3b8',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6
          }}>
            <i className="bi bi-box-arrow-right" />
            Logout
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <StatCard icon="bi-person-plus-fill" label="Antrean" value={stats.antrean} color="#3b82f6" bg="rgba(59,130,246,.12)" />
        <StatCard icon="bi-tools" label="Dikerjakan" value={stats.proses} color="#f59e0b" bg="rgba(245,158,11,.12)" />
        <StatCard icon="bi-bag-check-fill" label="Siap Diambil" value={stats.siap} color="#06b6d4" bg="rgba(6,182,212,.12)" />
        <StatCard icon="bi-check-circle-fill" label="Selesai" value={stats.selesai} color="#10b981" bg="rgba(16,185,129,.12)" />
      </div>

      {/* Omzet */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div className="stat-card" style={{ borderLeft: '3px solid #8b5cf6' }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem', background: 'rgba(139,92,246,.12)', color: '#7c3aed'
          }}>
            <i className="bi bi-cash-stack" />
          </div>
          <div>
            <div style={{ fontSize: '.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Omzet Hari Ini
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f1f5f9' }}>
              {formatRupiah(stats.omzet_hari)}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        {/* Servis Terbaru */}
        <div className="section-card">
          <div className="card-header">
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.9rem', fontWeight: 600 }}>
              <i className="bi bi-clock-history" style={{ color: '#3b82f6' }} />
              Servis Terbaru
            </span>
            <Link href="/servis" style={{
              fontSize: '.8rem', color: '#3b82f6', textDecoration: 'none', fontWeight: 600
            }}>
              Lihat Semua →
            </Link>
          </div>
          {servisTerbaru.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table className="am-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Pelanggan</th>
                    <th>Unit HP</th>
                    <th>Status</th>
                    <th>Biaya</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {servisTerbaru.map((s, i) => (
                    <tr key={s.id}>
                      <td style={{ color: '#64748b', fontSize: '.75rem' }}>{i + 1}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{s.nama_pelanggan}</div>
                        <div style={{ fontSize: '.7rem', color: '#64748b' }}>{s.no_servis}</div>
                      </td>
                      <td>{s.merk_hp} {s.tipe_hp}</td>
                      <td><span className={`badge ${getBadgeClass(s.status)}`}>{s.status}</span></td>
                      <td style={{ fontWeight: 600 }}>{s.estimasi_biaya}</td>
                      <td>
                        <Link href={`/servis/${s.id}`} style={{
                          color: '#3b82f6', textDecoration: 'none', fontSize: '.8rem'
                        }}>
                          Detail →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
              <i className="bi bi-inbox" style={{ fontSize: '2.5rem', display: 'block', marginBottom: '.5rem', opacity: 0.3 }} />
              Belum ada data servis
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem', marginTop: '1.5rem'
      }}>
        <Link href="/servis" style={{
          padding: '1rem', borderRadius: 12,
          background: '#1e293b', border: '1px solid #334155',
          textDecoration: 'none', color: '#f1f5f9', textAlign: 'center'
        }}>
          <i className="bi bi-list-check" style={{ fontSize: '1.5rem', display: 'block', marginBottom: '.5rem', color: '#3b82f6' }} />
          <span style={{ fontWeight: 600 }}>Data Servis</span>
        </Link>
        <Link href="/sparepart" style={{
          padding: '1rem', borderRadius: 12,
          background: '#1e293b', border: '1px solid #334155',
          textDecoration: 'none', color: '#f1f5f9', textAlign: 'center'
        }}>
          <i className="bi bi-box-seam" style={{ fontSize: '1.5rem', display: 'block', marginBottom: '.5rem', color: '#10b981' }} />
          <span style={{ fontWeight: 600 }}>Sparepart</span>
        </Link>
        <Link href="/laporan" style={{
          padding: '1rem', borderRadius: 12,
          background: '#1e293b', border: '1px solid #334155',
          textDecoration: 'none', color: '#f1f5f9', textAlign: 'center'
        }}>
          <i className="bi bi-graph-up" style={{ fontSize: '1.5rem', display: 'block', marginBottom: '.5rem', color: '#8b5cf6' }} />
          <span style={{ fontWeight: 600 }}>Laporan</span>
        </Link>
        <Link href="/pengaturan" style={{
          padding: '1rem', borderRadius: 12,
          background: '#1e293b', border: '1px solid #334155',
          textDecoration: 'none', color: '#f1f5f9', textAlign: 'center'
        }}>
          <i className="bi bi-gear" style={{ fontSize: '1.5rem', display: 'block', marginBottom: '.5rem', color: '#64748b' }} />
          <span style={{ fontWeight: 600 }}>Pengaturan</span>
        </Link>
      </div>
    </div>
  )
}