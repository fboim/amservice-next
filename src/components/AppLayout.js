'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const menuItems = [
  { href: '/dashboard', icon: 'bi-grid-1x2', label: 'Dashboard' },
  { href: '/servis/data', icon: 'bi-list-check', label: 'Data Servis' },
  { href: '/servis/tambah', icon: 'bi-plus-circle', label: 'Servis Baru' },
  { href: '/pelanggan', icon: 'bi-people', label: 'Pelanggan' },
  { href: '/sparepart', icon: 'bi-box-seam', label: 'Sparepart' },
  { href: '/testimoni', icon: 'bi-star', label: 'Testimoni' },
  { href: '/laporan', icon: 'bi-graph-up', label: 'Laporan' },
  { href: '/user', icon: 'bi-shield', label: 'User' },
  { href: '/pengaturan', icon: 'bi-gear', label: 'Pengaturan' },
]

function Sidebar({ collapsed, onToggle }) {
  const pathname = usePathname()

  const isActive = (href) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <img src="/logo_am.png" alt="AM Service" />
        </div>
        {!collapsed && (
          <div className="sidebar-brand">
            <span className="sidebar-brand-name">AM SERVICE</span>
            <span className="sidebar-brand-sub">Repair Center</span>
          </div>
        )}
      </div>

      {/* Toggle */}
      <button className="sidebar-toggle" onClick={onToggle}>
        <i className={`bi ${collapsed ? 'bi-chevron-right' : 'bi-chevron-left'}`} />
      </button>

      {/* Menu */}
      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`sidebar-link ${isActive(item.href) ? 'active' : ''}`}
              >
                <i className={`bi ${item.icon}`} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        {!collapsed && <span>v1.0.0</span>}
      </div>

      <style jsx>{`
        .sidebar {
          position: fixed;
          left: 0;
          top: 0;
          width: 260px;
          height: 100vh;
          background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
          display: flex;
          flex-direction: column;
          z-index: 100;
          transition: width 0.3s ease;
          border-right: 1px solid rgba(255,255,255,0.05);
        }

        .sidebar-collapsed {
          width: 72px;
        }

        .sidebar-header {
          padding: 1.25rem;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          gap: 0.75rem;
          min-height: 72px;
        }

        .sidebar-logo {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          padding: 2px;
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          flex-shrink: 0;
        }

        .sidebar-logo img {
          width: 100%;
          height: 100%;
          border-radius: 8px;
          background: #fff;
          object-fit: contain;
          padding: 4px;
        }

        .sidebar-brand {
          display: flex;
          flex-direction: column;
        }

        .sidebar-brand-name {
          font-size: 1rem;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.02em;
        }

        .sidebar-brand-sub {
          font-size: .65rem;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .sidebar-toggle {
          position: absolute;
          right: -12px;
          top: 22px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #334155;
          border: 2px solid #475569;
          color: #94a3b8;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: .7rem;
          z-index: 101;
          transition: all 0.2s;
        }

        .sidebar-toggle:hover {
          background: #3b82f6;
          border-color: #3b82f6;
          color: #fff;
        }

        .sidebar-nav {
          flex: 1;
          padding: 1rem 0.75rem;
          overflow-y: auto;
        }

        .sidebar-nav ul {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .sidebar-nav li {
          margin-bottom: 0.25rem;
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: 10px;
          color: #94a3b8;
          text-decoration: none;
          transition: all 0.2s;
          font-weight: 500;
          font-size: .9rem;
        }

        .sidebar-collapsed .sidebar-link {
          justify-content: center;
          padding: 0.75rem;
        }

        .sidebar-link:hover {
          background: rgba(255,255,255,0.05);
          color: #fff;
        }

        .sidebar-link.active {
          background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
          color: #fff;
          font-weight: 600;
        }

        .sidebar-link i {
          font-size: 1.1rem;
          width: 20px;
          text-align: center;
        }

        .sidebar-footer {
          padding: 1rem;
          border-top: 1px solid rgba(255,255,255,0.06);
          font-size: .7rem;
          color: #475569;
          text-align: center;
        }

        @media (max-width: 768px) {
          .sidebar {
            transform: translateX(-100%);
          }

          .sidebar.mobile-open {
            transform: translateX(0);
          }
        }
      `}</style>
    </aside>
  )
}

export default function AppLayout({ children }) {
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [user, setUser] = useState(null)
  const pathname = usePathname()

  useEffect(() => {
    const token = sessionStorage.getItem('ams_token') || localStorage.getItem('ams_token')
    if (!token) {
      router.push('/login')
      return
    }
    const userData = sessionStorage.getItem('ams_user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    sessionStorage.removeItem('ams_token')
    sessionStorage.removeItem('ams_user')
    localStorage.removeItem('ams_token')
    router.push('/login')
  }

  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Dashboard'
    if (pathname.startsWith('/servis/data')) return 'Data Servis'
    if (pathname.startsWith('/servis/tambah')) return 'Servis Baru'
    if (pathname.startsWith('/servis/edit')) return 'Edit Servis'
    if (pathname.startsWith('/servis/')) return 'Detail Servis'
    if (pathname.startsWith('/pelanggan')) return 'Pelanggan'
    if (pathname.startsWith('/sparepart')) return 'Sparepart'
    if (pathname.startsWith('/testimoni')) return 'Testimoni'
    if (pathname.startsWith('/laporan')) return 'Laporan'
    if (pathname.startsWith('/user')) return 'Manajemen User'
    if (pathname.startsWith('/pengaturan')) return 'Pengaturan'
    if (pathname.startsWith('/trash')) return 'Riwayat Servis'
    if (pathname.startsWith('/blast')) return 'WA Blast'
    if (pathname.startsWith('/backup')) return 'Backup Data'
    return 'AM Service'
  }

  return (
    <div className="app-layout">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      <main className={`main-content ${collapsed ? 'main-collapsed' : ''}`}>
        {/* Header */}
        <header className="header">
          <div className="header-left">
            <h1 className="header-title">{getPageTitle()}</h1>
            <p className="header-date">
              {new Date().toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>
          <div className="header-right">
            <Link href="/servis/tambah" className="btn-primary">
              <i className="bi bi-plus-circle" />
              Servis Baru
            </Link>
            <button className="btn-logout" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right" />
              Logout
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="content">
          {children}
        </div>
      </main>

      <style jsx global>{`
        .app-layout {
          min-height: 100vh;
          background: #07070f;
        }

        .main-content {
          margin-left: 260px;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          transition: margin-left 0.3s ease;
        }

        .main-collapsed {
          margin-left: 72px;
        }

        .header {
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(10px);
          padding: 1rem 1.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .header-left {
          display: flex;
          flex-direction: column;
        }

        .header-title {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 800;
          color: #f1f5f9;
          letter-spacing: -0.02em;
        }

        .header-date {
          margin: 4px 0 0;
          font-size: .75rem;
          color: #64748b;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .btn-primary {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          color: #fff;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          font-size: .875rem;
          transition: all 0.2s;
        }

        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }

        .btn-logout {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: transparent;
          border: 1px solid #334155;
          border-radius: 8px;
          color: #94a3b8;
          cursor: pointer;
          font-size: .875rem;
          transition: all 0.2s;
        }

        .btn-logout:hover {
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.3);
          color: #ef4444;
        }

        .content {
          flex: 1;
          padding: 1.5rem;
        }

        @media (max-width: 768px) {
          .main-content {
            margin-left: 0;
          }

          .main-collapsed {
            margin-left: 0;
          }

          .header {
            padding: 1rem;
          }

          .header-title {
            font-size: 1.1rem;
          }

          .btn-primary span {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}