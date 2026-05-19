'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AppLayout from '@/components/AppLayout'

function StatCard({ icon, label, value, color }) {
  return (
    <div className="scard">
      <div className="scard-icon" style={{ background: `${color}15`, color }}>
        <i className={`bi ${icon}`} />
      </div>
      <div className="scard-info">
        <span className="scard-label">{label}</span>
        <span className="scard-value">{value}</span>
      </div>
    </div>
  )
}

function RevenueCard({ label, value, icon, color, sub }) {
  return (
    <div className="rcard">
      <div className="rcard-icon" style={{ background: `${color}15`, color }}>
        <i className={`bi ${icon}`} />
      </div>
      <div className="rcard-info">
        <span className="rcard-label">{label}</span>
        <span className="rcard-value">{value}</span>
        {sub && <span className="rcard-sub">{sub}</span>}
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
  const [stokMenipis, setStokMenipis] = useState([])
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

      const servisRes = await fetch('/api/servis?limit=8')
      const servisData = await servisRes.json()
      setServisTerbaru(servisData.servis || [])

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
        <div className="loading-box">
          <div className="spinner" />
          <span>Memuat data...</span>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="dashboard">
        {/* Header Row */}
        <div className="dash-header">
          <div>
            <h2>Dashboard</h2>
            <p>Selamat datang, {user?.username || 'Admin'}!</p>
          </div>
          <div className="dash-date">
            <i className="bi bi-calendar3" />
            {new Date().toLocaleDateString('id-ID', {
              weekday: 'long', day: 'numeric', month: 'short', year: 'numeric'
            })}
          </div>
        </div>

        {/* Stats Row - 4 cards */}
        <div className="dash-row-4">
          <StatCard icon="bi-clock-history" label="Antrean" value={stats.antrean} color="#3b82f6" />
          <StatCard icon="bi-tools" label="Dikerjakan" value={stats.proses} color="#f59e0b" />
          <StatCard icon="bi-bag-check" label="Siap Diambil" value={stats.siap} color="#06b6d4" />
          <StatCard icon="bi-check-circle" label="Selesai" value={stats.selesai} color="#10b981" />
        </div>

        {/* Revenue Row - 2 cards */}
        <div className="dash-row-2">
          <RevenueCard
            icon="bi-cash-stack"
            label="Omzet Hari Ini"
            value={formatRupiah(stats.omzet_hari)}
            color="#8b5cf6"
            sub={`${stats.selesai || 0} servis`}
          />
          <RevenueCard
            icon="bi-graph-up"
            label="Omzet Bulan Ini"
            value={formatRupiah(stats.omzet_bulan || 0)}
            color="#ec4899"
            sub={new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
          />
        </div>

        {/* Main Content - Table + Sidebar */}
        <div className="dash-row-tb">
          {/* Servis Table */}
          <div className="section-card">
            <div className="section-header">
              <div className="section-title">
                <i className="bi bi-list-ul" />
                Servis Terbaru
              </div>
              <Link href="/servis/data" className="section-link">
                Lihat Semua <i className="bi bi-chevron-right" />
              </Link>
            </div>
            <div className="section-body">
              {servisTerbaru.length > 0 ? (
                <div className="table-wrap">
                  <table className="am-table">
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>No Servis</th>
                        <th>Pelanggan</th>
                        <th>Unit</th>
                        <th>Status</th>
                        <th>Biaya</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {servisTerbaru.map((s, i) => (
                        <tr key={s.id}>
                          <td className="txt-muted">{i + 1}</td>
                          <td className="txt-code">{s.no_servis}</td>
                          <td>
                            <div className="fw-600">{s.nama_pelanggan}</div>
                            <div className="txt-sm txt-muted">{s.no_hp || '-'}</div>
                          </td>
                          <td>{s.merk_hp} {s.tipe_hp}</td>
                          <td><span className={`badge ${getBadgeClass(s.status)}`}>{s.status}</span></td>
                          <td className="fw-600">{s.estimasi_biaya ? `Rp ${Number(s.estimasi_biaya).toLocaleString('id-ID')}` : '-'}</td>
                          <td>
                            <div className="btn-group">
                              <Link href={`/servis/data/${s.id}`} className="btn-act btn-act-blue" title="Detail">
                                <i className="bi bi-eye" />
                              </Link>
                              <Link href={`/servis/edit/${s.id}`} className="btn-act btn-act-dark" title="Edit">
                                <i className="bi bi-pencil" />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-box">
                  <i className="bi bi-inbox" />
                  <span>Belum ada data servis</span>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Stok Menipis */}
          <div className="sidebar-card">
            <div className="section-header">
              <div className="section-title">
                <i className="bi bi-exclamation-triangle" style={{ color: '#f59e0b' }} />
                Stok Menipis
              </div>
            </div>
            <div className="section-body">
              {stokMenipis.length > 0 ? (
                <div className="stok-list">
                  {stokMenipis.map((item) => (
                    <div key={item.id} className="stok-item">
                      <div className="stok-info">
                        <span className="stok-nama">{item.nama}</span>
                        <span className="stok-stok">{item.stok} unit</span>
                      </div>
                      <Link href="/sparepart" className="btn-act btn-act-dark btn-act-sm">
                        <i className="bi bi-arrow-right" />
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-box empty-sm">
                  <i className="bi bi-check-circle" style={{ color: '#10b981' }} />
                  <span>Stok aman</span>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="quick-links">
              <Link href="/servis/tambah" className="quick-btn">
                <i className="bi bi-plus-circle" />
                Servis Baru
              </Link>
              <Link href="/sparepart" className="quick-btn">
                <i className="bi bi-box-seam" />
                Sparepart
              </Link>
              <Link href="/laporan" className="quick-btn">
                <i className="bi bi-graph-up" />
                Laporan
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .dashboard {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        /* Header */
        .dash-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .dash-header h2 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--am-text);
        }

        .dash-header p {
          margin: 4px 0 0;
          font-size: .8rem;
          color: var(--am-text-muted);
        }

        .dash-date {
          display: flex;
          align-items: center;
          gap: .5rem;
          padding: 8px 14px;
          background: var(--am-surface);
          border: 1px solid var(--am-border);
          border-radius: 8px;
          font-size: .8rem;
          color: var(--am-text-muted);
        }

        /* Stats Row 4 */
        .dash-row-4 {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }

        .scard {
          background: var(--am-surface);
          border: 1px solid var(--am-border);
          border-radius: 12px;
          padding: 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: all 0.2s;
        }

        .scard:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.2);
        }

        .scard-icon {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .scard-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .scard-label {
          font-size: .7rem;
          font-weight: 600;
          color: var(--am-text-muted);
          text-transform: uppercase;
          letter-spacing: .3px;
        }

        .scard-value {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--am-text);
          line-height: 1;
        }

        /* Revenue Row 2 */
        .dash-row-2 {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .rcard {
          background: var(--am-surface);
          border: 1px solid var(--am-border);
          border-radius: 12px;
          padding: 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: all 0.2s;
        }

        .rcard:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.2);
        }

        .rcard-icon {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .rcard-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .rcard-label {
          font-size: .7rem;
          font-weight: 600;
          color: var(--am-text-muted);
          text-transform: uppercase;
        }

        .rcard-value {
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--am-text);
          line-height: 1.2;
        }

        .rcard-sub {
          font-size: .7rem;
          color: var(--am-text-muted);
        }

        /* Main Content Row */
        .dash-row-tb {
          display: grid;
          grid-template-columns: 1fr 280px;
          gap: 1.25rem;
        }

        /* Section Card */
        .section-card {
          background: var(--am-surface);
          border: 1px solid var(--am-border);
          border-radius: 12px;
          overflow: hidden;
        }

        .section-header {
          padding: 1rem 1.25rem;
          border-bottom: 1px solid var(--am-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: .5rem;
          font-size: .9rem;
          font-weight: 700;
          color: var(--am-text);
        }

        .section-title i {
          color: var(--am-primary);
        }

        .section-link {
          display: flex;
          align-items: center;
          gap: .25rem;
          font-size: .8rem;
          color: var(--am-primary);
          text-decoration: none;
          font-weight: 600;
          transition: gap 0.2s;
        }

        .section-link:hover {
          gap: .5rem;
        }

        .section-body {
          padding: 0;
        }

        /* Table */
        .table-wrap {
          overflow-x: auto;
        }

        .am-table {
          width: 100%;
          border-collapse: collapse;
        }

        .am-table th {
          padding: 10px 14px;
          text-align: left;
          font-size: .7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .4px;
          color: var(--am-text-muted);
          background: var(--am-bg);
          border-bottom: 1px solid var(--am-border);
        }

        .am-table td {
          padding: 10px 14px;
          border-bottom: 1px solid var(--am-border);
          font-size: .85rem;
          color: var(--am-text);
        }

        .am-table tr:hover td {
          background: rgba(255,255,255,0.02);
        }

        .txt-muted { color: var(--am-text-muted); font-size: .75rem; }
        .txt-code { font-family: monospace; font-size: .8rem !important; color: var(--am-text-muted) !important; }
        .txt-sm { font-size: .7rem; }
        .fw-600 { font-weight: 600; }

        /* Badge */
        .badge {
          display: inline-flex;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: .7rem;
          font-weight: 600;
        }

        .badge-queue { background: rgba(59,130,246,0.15); color: #3b82f6; }
        .badge-proc { background: rgba(245,158,11,0.15); color: #f59e0b; }
        .badge-ready { background: rgba(6,182,212,0.15); color: #06b6d4; }
        .badge-done { background: rgba(16,185,129,0.15); color: #10b981; }
        .badge-fail { background: rgba(239,68,68,0.15); color: #ef4444; }

        /* Button Group */
        .btn-group {
          display: flex;
          gap: .5rem;
        }

        .btn-act {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          transition: all 0.2s;
          text-decoration: none;
        }

        .btn-act-sm {
          width: 28px;
          height: 28px;
          font-size: .75rem;
        }

        .btn-act-blue {
          background: rgba(59,130,246,0.15);
          color: #3b82f6;
        }

        .btn-act-blue:hover {
          background: rgba(59,130,246,0.25);
        }

        .btn-act-dark {
          background: var(--am-bg);
          color: var(--am-text-muted);
          border: 1px solid var(--am-border);
        }

        .btn-act-dark:hover {
          background: var(--am-border);
          color: var(--am-text);
        }

        .btn-act-red {
          background: rgba(239,68,68,0.15);
          color: #ef4444;
        }

        .btn-act-red:hover {
          background: rgba(239,68,68,0.25);
        }

        /* Empty */
        .empty-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          color: var(--am-text-muted);
          gap: .5rem;
        }

        .empty-box i {
          font-size: 2rem;
          opacity: 0.3;
        }

        .empty-sm {
          padding: 2rem;
        }

        .empty-sm i {
          font-size: 1.5rem;
        }

        /* Sidebar Card */
        .sidebar-card {
          background: var(--am-surface);
          border: 1px solid var(--am-border);
          border-radius: 12px;
          display: flex;
          flex-direction: column;
        }

        /* Stok List */
        .stok-list {
          padding: .75rem;
          display: flex;
          flex-direction: column;
          gap: .5rem;
        }

        .stok-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: .75rem;
          background: var(--am-bg);
          border-radius: 8px;
          border: 1px solid var(--am-border);
        }

        .stok-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .stok-nama {
          font-size: .8rem;
          font-weight: 600;
          color: var(--am-text);
        }

        .stok-stok {
          font-size: .7rem;
          color: #f59e0b;
          font-weight: 600;
        }

        /* Quick Links */
        .quick-links {
          padding: 1rem;
          border-top: 1px solid var(--am-border);
          display: flex;
          flex-direction: column;
          gap: .5rem;
          margin-top: auto;
        }

        .quick-btn {
          display: flex;
          align-items: center;
          gap: .75rem;
          padding: .75rem 1rem;
          background: var(--am-bg);
          border: 1px solid var(--am-border);
          border-radius: 8px;
          color: var(--am-text);
          text-decoration: none;
          font-size: .85rem;
          font-weight: 500;
          transition: all 0.2s;
        }

        .quick-btn:hover {
          background: var(--am-border);
          border-color: var(--am-primary);
          color: var(--am-primary);
        }

        .quick-btn i {
          font-size: 1rem;
          color: var(--am-primary);
        }

        /* Loading */
        .loading-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          gap: 1rem;
          color: var(--am-text-muted);
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--am-border);
          border-top-color: var(--am-primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Responsive */
        @media (max-width: 1200px) {
          .dash-row-tb {
            grid-template-columns: 1fr;
          }

          .sidebar-card {
            order: -1;
          }
        }

        @media (max-width: 900px) {
          .dash-row-4 {
            grid-template-columns: repeat(2, 1fr);
          }

          .dash-row-2 {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
          .dash-row-4 {
            grid-template-columns: 1fr;
          }

          .dash-header {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </AppLayout>
  )
}