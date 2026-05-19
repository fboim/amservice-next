'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AppLayout from '@/components/AppLayout'

function StatCard({ icon, label, value, color }) {
  return (
    <div className="stat-card" style={{ '--accent': color }}>
      <div className="stat-glow" style={{ background: color }} />
      <div className="stat-icon-wrap" style={{ background: `${color}20`, color }}>
        <i className={`bi ${icon}`} />
      </div>
      <div className="stat-content">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    antrean: 0, proses: 0, siap: 0, selesai: 0, omzet_hari: 0, omzet_bulan: 0
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

      const servisRes = await fetch('/api/servis?limit=6')
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
      'Antrean': 'badge-queue',
      'Proses': 'badge-proc',
      'Siap Diambil': 'badge-ready',
      'Sudah Diambil': 'badge-done',
      'Tidak Bisa': 'badge-fail'
    }
    return map[status] || 'badge-queue'
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="loading-center">
          <div className="loading-spinner" />
          <span>Memuat dashboard...</span>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="dashboard-wrap">
        {/* Page Title */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">
              {new Date().toLocaleDateString('id-ID', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
              })}
            </p>
          </div>
          <Link href="/servis/tambah" className="btn-new">
            <i className="bi bi-plus-lg" />
            Servis Baru
          </Link>
        </div>

        {/* Stats Grid - 5 cards in a row */}
        <div className="stats-grid">
          <StatCard icon="bi-clock-fill" label="Antrean" value={stats.antrean} color="#3b82f6" />
          <StatCard icon="bi-tools" label="Dikerjakan" value={stats.proses} color="#f59e0b" />
          <StatCard icon="bi-bag-check-fill" label="Siap Diambil" value={stats.siap} color="#06b6d4" />
          <StatCard icon="bi-check-circle-fill" label="Selesai" value={stats.selesai} color="#10b981" />
          <div className="stat-card stat-card-revenue" style={{ '--accent': '#8b5cf6' }}>
            <div className="stat-glow" style={{ background: '#8b5cf6' }} />
            <div className="stat-icon-wrap" style={{ background: 'rgba(139,92,246,0.2)', color: '#8b5cf6' }}>
              <i className="bi bi-cash-stack" />
            </div>
            <div className="stat-content">
              <span className="stat-label">Omzet Hari Ini</span>
              <span className="stat-value stat-value-sm">{formatRupiah(stats.omzet_hari)}</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="content-grid">
          {/* Servis Table */}
          <div className="card">
            <div className="card-head">
              <h3 className="card-title">
                <i className="bi bi-clock-history" />
                Servis Terbaru
              </h3>
              <Link href="/servis/data" className="card-link">
                Lihat Semua <i className="bi bi-chevron-double-right" />
              </Link>
            </div>
            <div className="card-body">
              {servisTerbaru.length > 0 ? (
                <div className="table-scroll">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>No Servis</th>
                        <th>Pelanggan</th>
                        <th>Unit HP</th>
                        <th>Status</th>
                        <th>Biaya</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {servisTerbaru.map((s, i) => (
                        <tr key={s.id}>
                          <td className="col-num">{i + 1}</td>
                          <td className="col-code">{s.no_servis}</td>
                          <td className="col-name">
                            <div className="name-main">{s.nama_pelanggan}</div>
                            <div className="name-sub">{s.no_hp || '-'}</div>
                          </td>
                          <td>{s.merk_hp} {s.tipe_hp}</td>
                          <td><span className={`badge ${getBadgeClass(s.status)}`}>{s.status}</span></td>
                          <td className="col-cost">
                            {s.estimasi_biaya ? `Rp ${Number(s.estimasi_biaya).toLocaleString('id-ID')}` : '-'}
                          </td>
                          <td className="col-action">
                            <Link href={`/servis/data/${s.id}`} className="btn-view">
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
          <div className="quick-panel">
            <h3 className="panel-title">Menu Cepat</h3>
            <div className="quick-grid">
              <Link href="/servis/data" className="quick-item">
                <div className="quick-icon" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>
                  <i className="bi bi-list-check" />
                </div>
                <span>Data Servis</span>
              </Link>
              <Link href="/sparepart" className="quick-item">
                <div className="quick-icon" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                  <i className="bi bi-box-seam" />
                </div>
                <span>Sparepart</span>
              </Link>
              <Link href="/laporan" className="quick-item">
                <div className="quick-icon" style={{ background: 'rgba(139,92,246,0.15)', color: '#8b5cf6' }}>
                  <i className="bi bi-graph-up" />
                </div>
                <span>Laporan</span>
              </Link>
              <Link href="/pelanggan" className="quick-item">
                <div className="quick-icon" style={{ background: 'rgba(236,72,153,0.15)', color: '#ec4899' }}>
                  <i className="bi bi-people" />
                </div>
                <span>Pelanggan</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .dashboard-wrap {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        /* Page Header */
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .page-title {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--am-text);
        }

        .page-subtitle {
          margin: 4px 0 0;
          font-size: .85rem;
          color: var(--am-text-muted);
        }

        .btn-new {
          display: flex;
          align-items: center;
          gap: .5rem;
          padding: 10px 20px;
          background: linear-gradient(135deg, var(--am-primary), #6366f1);
          color: white;
          border-radius: 10px;
          text-decoration: none;
          font-weight: 600;
          font-size: .875rem;
          transition: all 0.2s;
        }

        .btn-new:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1rem;
        }

        .stat-card {
          position: relative;
          background: var(--am-surface);
          border: 1px solid var(--am-border);
          border-radius: 14px;
          padding: 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          overflow: hidden;
          transition: all 0.25s ease;
        }

        .stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.25);
          border-color: var(--accent);
        }

        .stat-glow {
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          opacity: 0.8;
        }

        .stat-icon-wrap {
          width: 52px;
          height: 52px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
          flex-shrink: 0;
          z-index: 1;
        }

        .stat-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
          z-index: 1;
        }

        .stat-label {
          font-size: .65rem;
          font-weight: 700;
          color: var(--am-text-muted);
          text-transform: uppercase;
          letter-spacing: .5px;
        }

        .stat-value {
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--am-text);
          line-height: 1;
        }

        .stat-value-sm {
          font-size: 1.1rem;
        }

        .stat-card-revenue {
          background: linear-gradient(135deg, rgba(139,92,246,0.1), transparent);
        }

        /* Content Grid */
        .content-grid {
          display: grid;
          grid-template-columns: 1fr 260px;
          gap: 1.5rem;
        }

        /* Card */
        .card {
          background: var(--am-surface);
          border: 1px solid var(--am-border);
          border-radius: 14px;
          overflow: hidden;
        }

        .card-head {
          padding: 1rem 1.25rem;
          border-bottom: 1px solid var(--am-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .card-title {
          display: flex;
          align-items: center;
          gap: .5rem;
          margin: 0;
          font-size: .95rem;
          font-weight: 700;
          color: var(--am-text);
        }

        .card-title i {
          color: var(--am-primary);
        }

        .card-link {
          display: flex;
          align-items: center;
          gap: .25rem;
          font-size: .8rem;
          color: var(--am-primary);
          text-decoration: none;
          font-weight: 600;
        }

        .card-link:hover {
          text-decoration: underline;
        }

        .card-body {
          padding: 0;
        }

        /* Table */
        .table-scroll {
          overflow-x: auto;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
        }

        .data-table th {
          padding: 12px 16px;
          text-align: left;
          font-size: .65rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .5px;
          color: var(--am-text-muted);
          background: var(--am-bg);
          border-bottom: 1px solid var(--am-border);
        }

        .data-table td {
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.03);
          font-size: .85rem;
          color: var(--am-text);
        }

        .data-table tr:hover td {
          background: rgba(255,255,255,0.02);
        }

        .col-num {
          width: 40px;
          color: var(--am-text-muted) !important;
          font-size: .75rem !important;
        }

        .col-code {
          font-family: 'SF Mono', 'Fira Code', monospace;
          font-size: .8rem !important;
          color: var(--am-text-muted) !important;
        }

        .col-name .name-main {
          font-weight: 600;
        }

        .col-name .name-sub {
          font-size: .7rem;
          color: var(--am-text-muted);
          margin-top: 2px;
        }

        .col-cost {
          font-weight: 600;
        }

        .col-action {
          width: 50px;
        }

        .btn-view {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          background: var(--am-bg);
          border: 1px solid var(--am-border);
          border-radius: 8px;
          color: var(--am-text-muted);
          text-decoration: none;
          transition: all 0.2s;
        }

        .btn-view:hover {
          background: var(--am-primary);
          border-color: var(--am-primary);
          color: white;
        }

        /* Badge */
        .badge {
          display: inline-flex;
          padding: 5px 12px;
          border-radius: 999px;
          font-size: .7rem;
          font-weight: 700;
        }

        .badge-queue { background: rgba(59,130,246,0.15); color: #3b82f6; }
        .badge-proc { background: rgba(245,158,11,0.15); color: #f59e0b; }
        .badge-ready { background: rgba(6,182,212,0.15); color: #06b6d4; }
        .badge-done { background: rgba(16,185,129,0.15); color: #10b981; }
        .badge-fail { background: rgba(239,68,68,0.15); color: #ef4444; }

        /* Empty State */
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3.5rem;
          color: var(--am-text-muted);
          gap: .75rem;
        }

        .empty-state i {
          font-size: 3rem;
          opacity: 0.2;
        }

        /* Quick Panel */
        .quick-panel {
          background: var(--am-surface);
          border: 1px solid var(--am-border);
          border-radius: 14px;
          padding: 1.25rem;
          height: fit-content;
        }

        .panel-title {
          margin: 0 0 1rem;
          font-size: .9rem;
          font-weight: 700;
          color: var(--am-text);
        }

        .quick-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: .75rem;
        }

        .quick-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: .5rem;
          padding: 1rem;
          background: var(--am-bg);
          border: 1px solid var(--am-border);
          border-radius: 12px;
          text-decoration: none;
          color: var(--am-text);
          font-size: .8rem;
          font-weight: 600;
          transition: all 0.2s;
        }

        .quick-item:hover {
          border-color: var(--am-primary);
          transform: translateY(-2px);
        }

        .quick-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
        }

        /* Loading */
        .loading-center {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          gap: 1rem;
          color: var(--am-text-muted);
        }

        .loading-spinner {
          width: 44px;
          height: 44px;
          border: 3px solid var(--am-border);
          border-top-color: var(--am-primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Responsive */
        @media (max-width: 1400px) {
          .stats-grid {
            grid-template-columns: repeat(3, 1fr);
          }

          .content-grid {
            grid-template-columns: 1fr;
          }

          .quick-panel {
            order: -1;
          }

          .quick-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        @media (max-width: 900px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 600px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .btn-new {
            width: 100%;
            justify-content: center;
          }

          .quick-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </AppLayout>
  )
}