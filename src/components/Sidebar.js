'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export default function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const menuItems = [
    { href: '/dashboard', icon: 'bi-grid-1x2', label: 'Dashboard' },
    { href: '/servis/data', icon: 'bi-list-check', label: 'Data Servis' },
    { href: '/servis/tambah', icon: 'bi-plus-circle', label: 'Servis Baru' },
    { href: '/pelanggan', icon: 'bi-people', label: 'Pelanggan' },
    { href: '/trash', icon: 'bi-trash3', label: 'Riwayat' },
    { href: '/sparepart', icon: 'bi-box-seam', label: 'Sparepart' },
    { href: '/testimoni', icon: 'bi-star', label: 'Testimoni' },
    { href: '/laporan', icon: 'bi-graph-up', label: 'Laporan' },
    { href: '/blast', icon: 'bi-whatsapp', label: 'WA Blast' },
    { href: '/backup', icon: 'bi-cloud-arrow-up', label: 'Backup' },
    { href: '/user', icon: 'bi-shield', label: 'Manajemen User' },
    { href: '/pengaturan', icon: 'bi-gear', label: 'Pengaturan' },
  ]

  const isActive = (href) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <aside style={{
      width: collapsed ? '70px' : '260px',
      minHeight: '100vh',
      background: '#1e293b',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.3s ease',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 100,
      boxShadow: '2px 0 10px rgba(0,0,0,0.1)'
    }}>
      {/* Logo */}
      <div style={{
        padding: '1.25rem',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        minHeight: '70px'
      }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <i className="bi bi-phone" style={{ color: '#fff', fontSize: '1.2rem' }} />
        </div>
        {!collapsed && (
          <div>
            <div style={{ fontWeight: 800, color: '#fff', fontSize: '1.1rem' }}>AM SERVICE</div>
            <div style={{ fontSize: '.7rem', color: '#64748b' }}>Repair Center</div>
          </div>
        )}
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          position: 'absolute',
          right: -12,
          top: 24,
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: '#334155',
          border: '2px solid #475569',
          color: '#94a3b8',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.7rem',
          zIndex: 101
        }}
      >
        <i className={`bi ${collapsed ? 'bi-chevron-right' : 'bi-chevron-left'}`} />
      </button>

      {/* Menu */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem', overflowY: 'auto' }}>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {menuItems.map((item) => (
            <li key={item.href} style={{ marginBottom: '0.25rem' }}>
              <Link
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: collapsed ? '0.75rem' : '0.75rem 1rem',
                  borderRadius: 10,
                  textDecoration: 'none',
                  color: isActive(item.href) ? '#fff' : '#94a3b8',
                  background: isActive(item.href) ? 'linear-gradient(135deg, #3b82f6, #6366f1)' : 'transparent',
                  transition: 'all 0.2s',
                  fontWeight: isActive(item.href) ? 600 : 500,
                  fontSize: '0.9rem',
                  justifyContent: collapsed ? 'center' : 'flex-start'
                }}
                onMouseEnter={(e) => {
                  if (!isActive(item.href)) {
                    e.target.style.background = 'rgba(255,255,255,0.05)'
                    e.target.style.color = '#fff'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(item.href)) {
                    e.target.style.background = 'transparent'
                    e.target.style.color = '#94a3b8'
                  }
                }}
              >
                <i className={`bi ${item.icon}`} style={{ fontSize: '1.1rem', flexShrink: 0 }} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div style={{
          padding: '1rem',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          fontSize: '.7rem',
          color: '#64748b',
          textAlign: 'center'
        }}>
          v1.0.0
        </div>
      )}
    </aside>
  )
}
