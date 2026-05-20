'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'
import { useSidebar } from './SidebarContext'

// Simple cache for stats
let statsCache = {
  data: { antrean: 0, proses: 0, siap: 0, selesai: 0 },
  timestamp: 0
}
const CACHE_DURATION = 30000 // 30 seconds

function SidebarWrapper({ children }) {
  const { mobileOpen, onMobileClose, onMobileOpen } = useSidebar()
  const [user, setUser] = useState(null)
  const [isChecking, setIsChecking] = useState(true)
  const [stats, setStats] = useState({ antrean: 0, proses: 0, siap: 0, selesai: 0 })
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('ams_token') || sessionStorage.getItem('ams_token')
    if (!token) {
      router.push('/login')
      setIsChecking(false)
      return
    }
    const userData = localStorage.getItem('ams_user') || sessionStorage.getItem('ams_user')
    if (userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (e) {
        setUser(null)
      }
    }
    setIsChecking(false)

    // Check cache first
    const now = Date.now()
    if (now - statsCache.timestamp < CACHE_DURATION) {
      setStats(statsCache.data)
      return
    }

    // Fetch fresh stats
    fetch('/api/dashboard', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        const newStats = {
          antrean: data.antrean || 0,
          proses: data.proses || 0,
          siap: data.siap || 0,
          selesai: data.selesai || 0
        }
        statsCache = { data: newStats, timestamp: now }
        setStats(newStats)
      })
      .catch(() => {})
  }, [pathname, router])

  if (isChecking) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <i className="bi bi-arrow-repeat" style={{ fontSize: '2rem', animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }

  const getRoleLabel = () => {
    if (!user) return 'Pengunjung'
    return user.role?.toLowerCase() === 'admin' ? 'Admin' :
           user.role?.toLowerCase() === 'teknisi' ? 'Teknisi' : 'Pengunjung'
  }

  const getPageTitle = () => {
    const page = pathname.split('/').pop() || 'dashboard'

    if (page.includes('dashboard')) return 'Dashboard'
    if (page.includes('data_servis')) return 'Data Servis'
    if (page.includes('tambah') || page.includes('edit')) return 'Servis'
    if (page.includes('pelanggan')) return 'Data Pelanggan'
    if (page.includes('sparepart')) return 'Sparepart'
    if (page.includes('riwayat') || page.includes('trash')) return 'Riwayat Servis'
    if (page.includes('user')) return 'Manajemen User'
    if (page.includes('laporan')) return 'Laporan Keuangan'
    if (page.includes('pengaturan')) return 'Pengaturan Toko'
    if (page.includes('backup')) return 'Backup Data'
    if (page.includes('ganti_password')) return 'Ganti Password'
    if (page.includes('testimoni')) return 'Testimoni'
    return 'AM SERVICE'
  }

  const getPageIcon = () => {
    const page = pathname.split('/').pop() || 'dashboard'

    if (page.includes('dashboard')) return 'bi-grid-1x2'
    if (page.includes('data_servis')) return 'bi-tools'
    if (page.includes('tambah')) return 'bi-plus-circle'
    if (page.includes('edit')) return 'bi-pencil-square'
    if (page.includes('pelanggan')) return 'bi-people'
    if (page.includes('sparepart')) return 'bi-box-seam'
    if (page.includes('riwayat') || page.includes('trash')) return 'bi-clock-history'
    if (page.includes('user')) return 'bi-person-gear'
    if (page.includes('laporan')) return 'bi-graph-up'
    if (page.includes('pengaturan')) return 'bi-gear'
    if (page.includes('backup')) return 'bi-hdd'
    if (page.includes('ganti_password')) return 'bi-key'
    if (page.includes('testimoni')) return 'bi-chat-quote'
    return 'bi-grid-1x2'
  }

  return (
    <>
      <Sidebar
        collapsed={false}
        onToggle={() => {}}
        mobileOpen={mobileOpen}
        onMobileClose={onMobileClose}
        onMobileOpen={onMobileOpen}
      />

      <div className="am-main">
        <div className="header-bar">
          {/* Left - Page Title & User Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Page Icon */}
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--am-primary), #6366f1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(59,130,246,.35)',
              flexShrink: 0
            }}>
              <i className={`bi ${getPageIcon()}`} style={{ color: '#fff', fontSize: '1.15rem' }} />
            </div>
            <div>
              <h4 style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--am-text)', margin: '0 0 2px' }}>
                {getPageTitle()}
              </h4>
              <p style={{ fontSize: '.72rem', color: 'var(--am-text-muted)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <i className="bi bi-calendar3" style={{ fontSize: '.65rem' }} />
                <span>{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                <span style={{ color: 'var(--am-border)' }}>|</span>
                <span>Halo, <strong style={{ color: 'var(--am-primary)', fontWeight: '700' }}>{user?.nama || 'User'}</strong></span>
              </p>
            </div>
          </div>

          {/* Right - Actions */}
          <div className="header-actions">
            {/* Quick Stats Pills */}
            <div className="header-stats">
              <span className="stat-pill stat-antrean" title="Antrean">
                <i className="bi bi-hourglass-split" />
                <span>{stats.antrean}</span>
              </span>
              <span className="stat-pill stat-proses" title="Dikerjakan">
                <i className="bi bi-tools" />
                <span>{stats.proses}</span>
              </span>
              <span className="stat-pill stat-siap" title="Siap">
                <i className="bi bi-bag-check" />
                <span>{stats.siap}</span>
              </span>
            </div>

            {/* Role Badge */}
            <span className="role-badge">
              <i className="bi bi-shield-fill" />
              {getRoleLabel().toUpperCase()}
            </span>

            {/* New Service Button */}
            <Link
              href="/servis/tambah"
              className="am-btn am-btn-primary am-btn-pill am-btn-sm"
              style={{
                boxShadow: '0 4px 16px rgba(59,130,246,.35)'
              }}
            >
              <i className="bi bi-plus-circle-fill" /> Servis Baru
            </Link>
          </div>
        </div>

        {/* Stats Mobile Bar */}
        <div className="header-stats-mobile">
          <span className="stat-pill stat-antrean"><i className="bi bi-hourglass-split" /> {stats.antrean}</span>
          <span className="stat-pill stat-proses"><i className="bi bi-tools" /> {stats.proses}</span>
          <span className="stat-pill stat-siap"><i className="bi bi-bag-check" /> {stats.siap}</span>
          <span className="stat-pill stat-selesai"><i className="bi bi-check-circle-fill" /> {stats.selesai}</span>
        </div>

        {children}
      </div>
    </>
  )
}

export default function AppLayout({ children }) {
  return <SidebarWrapper>{children}</SidebarWrapper>
}