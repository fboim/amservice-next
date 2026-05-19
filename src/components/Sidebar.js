'use client'

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

export default function Sidebar({ collapsed, onToggle }) {
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
      `}</style>
    </aside>
  )
}
