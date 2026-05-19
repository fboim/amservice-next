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
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo-wrap">
        <div className="sidebar-logo">
          <img src="/logo_am.png" alt="AM Service" />
        </div>
        {!collapsed && (
          <div className="sidebar-brand">
            <span className="brand-name">AM SERVICE</span>
            <span className="brand-sub">Repair Center</span>
          </div>
        )}
      </div>

      {/* Toggle */}
      <button className="sidebar-toggle" onClick={onToggle}>
        <i className={`bi ${collapsed ? 'bi-chevron-right' : 'bi-chevron-left'}`} />
      </button>

      {/* Nav */}
      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`nav-link ${isActive(item.href) ? 'active' : ''}`}
              >
                <i className={`bi ${item.icon}`} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="sidebar-footer">
          <span>v1.0.0</span>
        </div>
      )}

      <style jsx>{`
        .sidebar {
          position: fixed;
          left: 0;
          top: 0;
          width: 250px;
          height: 100vh;
          background: var(--am-surface);
          border-right: 1px solid var(--am-border);
          display: flex;
          flex-direction: column;
          z-index: 100;
          transition: width 0.2s ease;
        }

        .sidebar.collapsed {
          width: 64px;
        }

        .sidebar-logo-wrap {
          padding: 1.25rem;
          border-bottom: 1px solid var(--am-border);
          display: flex;
          align-items: center;
          gap: 0.75rem;
          min-height: 72px;
        }

        .sidebar-logo {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          overflow: hidden;
          flex-shrink: 0;
          background: linear-gradient(135deg, var(--am-primary), #6366f1);
          padding: 2px;
        }

        .sidebar-logo img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          border-radius: 8px;
          background: #fff;
        }

        .sidebar-brand {
          display: flex;
          flex-direction: column;
        }

        .brand-name {
          font-size: .95rem;
          font-weight: 800;
          color: var(--am-text);
          letter-spacing: -0.01em;
        }

        .brand-sub {
          font-size: .6rem;
          color: var(--am-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .sidebar-toggle {
          position: absolute;
          right: -12px;
          top: 24px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--am-surface);
          border: 2px solid var(--am-border);
          color: var(--am-text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: .7rem;
          z-index: 101;
          transition: all 0.2s;
        }

        .sidebar-toggle:hover {
          background: var(--am-primary);
          border-color: var(--am-primary);
          color: white;
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

        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.7rem 1rem;
          border-radius: 8px;
          color: var(--am-text-muted);
          text-decoration: none;
          transition: all 0.15s;
          font-size: .875rem;
          font-weight: 500;
        }

        .sidebar.collapsed .nav-link {
          justify-content: center;
          padding: 0.7rem;
        }

        .nav-link:hover {
          background: var(--am-bg);
          color: var(--am-text);
        }

        .nav-link.active {
          background: linear-gradient(135deg, var(--am-primary), #6366f1);
          color: white;
          font-weight: 600;
        }

        .nav-link i {
          font-size: 1.1rem;
          width: 20px;
          text-align: center;
        }

        .sidebar-footer {
          padding: 1rem;
          border-top: 1px solid var(--am-border);
          text-align: center;
          font-size: .7rem;
          color: var(--am-text-muted);
        }
      `}</style>
    </aside>
  )
}