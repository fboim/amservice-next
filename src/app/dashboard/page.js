'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AppLayout from '@/components/AppLayout'

function StatCard({ icon, label, value, color, bgColor }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: bgColor }}>
        <i className={`bi ${icon}`} style={{ color }} />
      </div>
      <div className="stat-info">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
      </div>
      <div className="stat-accent" style={{ background: color }} />
    </div>
  )
}

export default function Dashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    antrean: 0, proses: 0, siap: 0, selesai: 0, omzet_hari: 0
  })
  const [servisTerbaru, setServisTerbaru] = useState([])
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = sessionStorage.getItem('ams_token') || localStorage.getItem('ams_token')
    const userData = sessionStorage.getItem('ams_user')

    if (!token) {
      router.push('/login')
      return
    }

    if (userData) {
      setUser(JSON.parse(userData))
    }

    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/dashboard')
      const data = await res.json()
      setStats(data)

      const servisRes = await fetch('/api/servis?limit=5')
      const servisData = await servisRes.json()
      setServisTerbaru(servisData.servis || [])
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

  if (loading) {
    return (
      <AppLayout>
        <div className="loading-state">
          <div className="loading-spinner" />
          <span>Memuat dashboard...</span>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="dashboard">
        {/* Welcome Section */}
        <div className="welcome-section">
          <div className="welcome-content">
            <h2>Selamat Datang, {user?.username || 'Admin'}</h2>
            <p>Berikut ringkasan aktivitas servis hari ini</p>
          </div>
          <div className="welcome-time">
            <i className="bi bi-clock" />
            {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <StatCard
            icon="bi-clock-history"
            label="Antrean"
            value={stats.antrean}
            color="#3b82f6"
            bgColor="rgba(59,130,246,0.12)"
          />
          <StatCard
            icon="bi-tools"
            label="Dikerjakan"
            value={stats.proses}
            color="#f59e0b"
            bgColor="rgba(245,158,11,0.12)"
          />
          <StatCard
            icon="bi-bag-check"
            label="Siap Diambil"
            value={stats.siap}
            color="#06b6d4"
            bgColor="rgba(6,182,212,0.12)"
          />
          <StatCard
            icon="bi-check-circle"
            label="Selesai"
            value={stats.selesai}
            color="#10b981"
            bgColor="rgba(16,185,129,0.12)"
          />
          <div className="stat-card stat-card-wide">
            <div className="stat-icon" style={{ background: 'rgba(139,92,246,0.12)' }}>
              <i className="bi bi-cash-stack" style={{ color: '#8b5cf6' }} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Omzet Hari Ini</span>
              <span className="stat-value stat-value-money">{formatRupiah(stats.omzet_hari)}</span>
            </div>
            <div className="stat-accent" style={{ background: '#8b5cf6' }} />
          </div>
        </div>

        {/* Main Content */}
        <div className="dashboard-content">
          {/* Servis Terbaru */}
          <div className="section-card">
            <div className="card-header">
              <div className="card-title">
                <i className="bi bi-list-ul" />
                Servis Terbaru
              </div>
              <Link href="/servis/data" className="card-link">
                Lihat Semua <i className="bi bi-arrow-right" />
              </Link>
            </div>
            <div className="card-body">
              {servisTerbaru.length > 0 ? (
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>No Servis</th>
                        <th>Pelanggan</th>
                        <th>Unit</th>
                        <th>Status</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {servisTerbaru.map((s, i) => (
                        <tr key={s.id}>
                          <td className="td-num">{i + 1}</td>
                          <td className="td-servis">{s.no_servis}</td>
                          <td>
                            <div className="td-name">{s.nama_pelanggan}</div>
                            <div className="td-phone">{s.no_hp || '-'}</div>
                          </td>
                          <td>{s.merk_hp} {s.tipe_hp}</td>
                          <td><span className={`badge ${getBadgeClass(s.status)}`}>{s.status}</span></td>
                          <td>
                            <Link href={`/servis/data/${s.id}`} className="btn-action">
                              <i className="bi bi-eye" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
                  <i className="bi bi-inbox" />
                  <span>Belum ada data servis</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <Link href="/servis/data" className="action-card">
              <div className="action-icon" style={{ background: 'rgba(59,130,246,0.12)' }}>
                <i className="bi bi-list-check" style={{ color: '#3b82f6' }} />
              </div>
              <span>Data Servis</span>
            </Link>
            <Link href="/sparepart" className="action-card">
              <div className="action-icon" style={{ background: 'rgba(16,185,129,0.12)' }}>
                <i className="bi bi-box-seam" style={{ color: '#10b981' }} />
              </div>
              <span>Sparepart</span>
            </Link>
            <Link href="/laporan" className="action-card">
              <div className="action-icon" style={{ background: 'rgba(139,92,246,0.12)' }}>
                <i className="bi bi-graph-up" style={{ color: '#8b5cf6' }} />
              </div>
              <span>Laporan</span>
            </Link>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .dashboard {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        /* Welcome */
        .welcome-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem 1.5rem;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
        }

        .welcome-content h2 {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 700;
          color: #f1f5f9;
        }

        .welcome-content p {
          margin: 4px 0 0;
          font-size: .8rem;
          color: #64748b;
        }

        .welcome-time {
          display: flex;
          align-items: center;
          gap: .5rem;
          padding: 8px 16px;
          background: rgba(59,130,246,0.1);
          border-radius: 999px;
          font-size: .85rem;
          font-weight: 600;
          color: #60a5fa;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }

        .stat-card {
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          padding: 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          position: relative;
          overflow: hidden;
          transition: all 0.3s;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        }

        .stat-card-wide {
          grid-column: span 1;
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .stat-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .stat-label {
          font-size: .7rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: .4px;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 800;
          color: #f1f5f9;
          line-height: 1;
        }

        .stat-value-money {
          font-size: 1.25rem;
        }

        .stat-accent {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
        }

        /* Content */
        .dashboard-content {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 1.5rem;
        }

        /* Section Card */
        .section-card {
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          overflow: hidden;
        }

        .card-header {
          padding: 1rem 1.25rem;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .card-title {
          display: flex;
          align-items: center;
          gap: .5rem;
          font-size: .9rem;
          font-weight: 700;
          color: #f1f5f9;
        }

        .card-title i {
          color: #3b82f6;
        }

        .card-link {
          display: flex;
          align-items: center;
          gap: .25rem;
          font-size: .8rem;
          color: #3b82f6;
          text-decoration: none;
          font-weight: 600;
          transition: gap 0.2s;
        }

        .card-link:hover {
          gap: .5rem;
        }

        .card-body {
          padding: 0;
        }

        /* Table */
        .table-responsive {
          overflow-x: auto;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
        }

        .data-table th {
          padding: 12px 16px;
          text-align: left;
          font-size: .7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .5px;
          color: #64748b;
          background: rgba(0,0,0,0.2);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .data-table td {
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          font-size: .85rem;
          color: #e2e8f0;
        }

        .data-table tr:hover td {
          background: rgba(255,255,255,0.02);
        }

        .td-num {
          color: #475569;
          font-size: .75rem !important;
        }

        .td-servis {
          font-family: monospace;
          font-size: .8rem !important;
          color: #64748b !important;
        }

        .td-name {
          font-weight: 600;
        }

        .td-phone {
          font-size: .7rem !important;
          color: #64748b !important;
          margin-top: 2px;
        }

        .btn-action {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: rgba(59,130,246,0.12);
          border-radius: 8px;
          color: #3b82f6;
          text-decoration: none;
          transition: all 0.2s;
        }

        .btn-action:hover {
          background: rgba(59,130,246,0.2);
        }

        /* Empty State */
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          color: #475569;
        }

        .empty-state i {
          font-size: 2.5rem;
          margin-bottom: .5rem;
          opacity: 0.3;
        }

        /* Quick Actions */
        .quick-actions {
          display: flex;
          flex-direction: column;
          gap: .75rem;
          min-width: 160px;
        }

        .action-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: .5rem;
          padding: 1.25rem;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          text-decoration: none;
          color: #e2e8f0;
          font-size: .8rem;
          font-weight: 600;
          transition: all 0.2s;
        }

        .action-card:hover {
          background: rgba(30,41,59,0.8);
          transform: translateY(-2px);
        }

        .action-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
        }

        /* Loading */
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          gap: 1rem;
          color: #64748b;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255,255,255,0.1);
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Badge */
        .badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: .7rem;
          font-weight: 600;
        }

        .badge-antrean { background: rgba(148,163,184,0.15); color: #94a3b8; }
        .badge-proses { background: rgba(245,158,11,0.15); color: #f59e0b; }
        .badge-siap { background: rgba(6,182,212,0.15); color: #06b6d4; }
        .badge-selesai { background: rgba(16,185,129,0.15); color: #10b981; }
        .badge-gagal { background: rgba(239,68,68,0.15); color: #ef4444; }

        /* Responsive */
        @media (max-width: 1200px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .dashboard-content {
            grid-template-columns: 1fr;
          }

          .quick-actions {
            flex-direction: row;
            min-width: auto;
          }

          .action-card {
            flex: 1;
          }
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .welcome-section {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .quick-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </AppLayout>
  )
}