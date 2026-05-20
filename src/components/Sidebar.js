'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useSidebar } from './SidebarContext'

// Menu items - matches PHP sidebar exactly
const menuItems = [
  { href: '/dashboard', icon: 'bi-speedometer2', label: 'Dashboard', roles: ['admin', 'teknisi', 'pengunjung'] },
  { href: '/servis/data', icon: 'bi-tools', label: 'Data Servis', roles: ['admin', 'teknisi', 'pengunjung'] },
  { href: '/sparepart', icon: 'bi-box-seam', label: 'Sparepart', roles: ['admin', 'teknisi', 'pengunjung'] },
  { href: '/pelanggan', icon: 'bi-person-lines-fill', label: 'Data Pelanggan', roles: ['admin', 'teknisi', 'pengunjung'] },
  { href: '/trash', icon: 'bi-clock-history', label: 'Riwayat Servis', roles: ['admin', 'teknisi', 'pengunjung'] },
]

// Admin-only menu items
const adminMenuItems = [
  { href: '/user', icon: 'bi-people', label: 'Manajemen User' },
  { href: '/laporan', icon: 'bi-file-earmark-bar-graph', label: 'Laporan Keuangan' },
  { href: '/pengaturan', icon: 'bi-gear-fill', label: 'Pengaturan Toko' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { mobileOpen, setMobileOpen, onMobileClose, onMobileOpen } = useSidebar()
  const [user, setUser] = useState(null)
  const [theme, setTheme] = useState('dark')

  // Load user data on mount and pathname change
  useEffect(() => {
    const userData = localStorage.getItem('ams_user') || sessionStorage.getItem('ams_user')
    if (userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (e) {
        console.error('Failed to parse user data')
        setUser(null)
      }
    } else {
      setUser(null)
    }
  }, [pathname])

  useEffect(() => {
    // Load theme from localStorage or system preference
    const savedTheme = localStorage.getItem('am_theme')
    if (savedTheme) {
      setTheme(savedTheme)
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(prefersDark ? 'dark' : 'light')
    }

    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Close mobile sidebar on route change
  useEffect(() => {
    if (mobileOpen) {
      setMobileOpen(false)
    }
  }, [pathname, mobileOpen, setMobileOpen])

  // Handle window resize - close mobile sidebar on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    // Also run on mount to set initial state
    handleResize()
    return () => window.removeEventListener('resize', handleResize)
  }, [setMobileOpen])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('am_theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  const handleLogout = () => {
    if (confirm('Yakin ingin keluar dari sistem?')) {
      localStorage.removeItem('ams_token')
      localStorage.removeItem('ams_user')
      sessionStorage.removeItem('ams_token')
      sessionStorage.removeItem('ams_user')
      window.location.href = '/login'
    }
  }

  const getRoleLabel = () => {
    if (!user) return 'Pengunjung'
    const roleMap = {
      admin: 'Admin',
      teknisi: 'Teknisi',
      pengunjung: 'Pengunjung',
    }
    return roleMap[user.role?.toLowerCase()] || 'Pengunjung'
  }

  const isActive = (href) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  const isAdmin = user?.role?.toLowerCase() === 'admin'

  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen)
  }

  return (
    <>
      {/* Mobile Topbar */}
      <div
        className="am-mobile-topbar"
        style={{ pointerEvents: 'auto' }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation()
            toggleMobileSidebar()
          }}
          style={{
            position: 'relative',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            color: 'rgba(255,255,255,.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '42px',
            height: '42px',
          }}
        >
          <i className={`bi ${mobileOpen ? 'bi-x-lg' : 'bi-list'}`} style={{ fontSize: '1.5rem', lineHeight: 1 }} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, justifyContent: 'center' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <img src="/logo_am.png" alt="Logo" style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#fff', objectFit: 'contain', padding: '4px' }} />
          </div>
          <span style={{ color: '#f1f5f9', fontWeight: '800', fontSize: '1rem', letterSpacing: '.06em' }}>
            AM SERVICE
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={toggleTheme}
            title="Ganti Tema"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              color: 'rgba(255,255,255,.75)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
            }}
          >
            <i className={`bi ${theme === 'dark' ? 'bi-moon-stars' : 'bi-sun'}`} style={{ fontSize: '1.1rem', lineHeight: 1 }} />
          </button>
          <button
            onClick={handleLogout}
            style={{
              background: '#ef4444',
              color: '#fff',
              fontSize: '.75rem',
              fontWeight: '700',
              padding: '8px 14px',
              borderRadius: '20px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(239,68,68,.3)',
            }}
          >
            <i className="bi bi-power" style={{ fontSize: '.9rem' }} />
            <span>Keluar</span>
          </button>
        </div>
      </div>

      {/* Sidebar Overlay (mobile) */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            display: 'block',
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.45)',
            zIndex: 35,
            backdropFilter: 'blur(1px)',
          }}
        />
      )}

      {/* Sidebar */}
      <aside className={`am-sidebar ${mobileOpen ? 'am-sidebar-open' : ''}`}>
        {/* Brand */}
        <div style={{ padding: '1.5rem 1rem 1.25rem', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,.07)' }}>
          <div style={{
            width: '60px',
            height: '60px',
            margin: '0 auto 10px',
            borderRadius: '50%',
            padding: '2px',
            background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
            boxShadow: '0 0 0 4px rgba(59,130,246,.12),0 0 20px rgba(99,102,241,.2)',
          }}>
            <img
              src="/logo_am.png"
              alt="Logo AM Service"
              style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#fff', objectFit: 'contain', padding: '8px', display: 'block' }}
              onError={(e) => { e.target.src = 'https://cdn-icons-png.flaticon.com/512/3563/3563395.png' }}
            />
          </div>
          <div style={{ color: '#f1f5f9', fontWeight: '700', fontSize: '.875rem', letterSpacing: '.06em' }}>AM SERVICE</div>
          <div style={{ color: 'rgba(255,255,255,.40)', fontSize: '.65rem', marginTop: '2px', letterSpacing: '.04em' }}>Jual Beli &amp; Servis HP</div>
        </div>

        {/* Nav Menu */}
        <nav style={{ flex: 1, minHeight: 0, padding: '.75rem 0', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onMobileClose}
                  className={`nav-link ${isActive(item.href) ? 'active' : ''}`}
                >
                  <i className={`bi ${item.icon}`} />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}

            {isAdmin && (
              <>
                {/* Admin Section */}
                <li>
                  <span className="am-nav-section">Admin Panel</span>
                </li>
                {adminMenuItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onMobileClose}
                      className={`nav-link ${isActive(item.href) ? 'active' : ''}`}
                    >
                      <i className={`bi ${item.icon}`} />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </>
            )}
          </ul>
        </nav>

        {/* Bottom Section */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,.07)', padding: '.6rem 0 .75rem', flexShrink: 0 }}>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            <li>
              <button onClick={toggleTheme} className="nav-link" style={{ width: '100%', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer' }}>
                <i className={`bi ${theme === 'dark' ? 'bi-moon-stars' : 'bi-sun'}`} />
                <span>Ganti Tema</span>
              </button>
            </li>
            <li>
              <Link href="/ganti_password" className="nav-link">
                <i className="bi bi-key" />
                <span>Ganti Password</span>
              </Link>
            </li>
            <li>
              <button onClick={handleLogout} className="nav-link nav-logout" style={{ width: '100%', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer' }}>
                <i className="bi bi-box-arrow-right" />
                <span>Logout ({user?.nama || 'User'})</span>
              </button>
            </li>
          </ul>

          {isAdmin && (
            <div style={{ padding: '6px 12px 0' }}>
              <Link
                href="/backup"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  width: '100%',
                  background: 'linear-gradient(135deg,#db2777,#be185d)',
                  color: '#fff',
                  fontSize: '.72rem',
                  fontWeight: '700',
                  padding: '7px 12px',
                  borderRadius: '999px',
                  textDecoration: 'none',
                  boxShadow: '0 2px 10px rgba(219,39,119,.25)',
                }}
              >
                <i className="bi bi-hdd-fill" /> Backup Data
              </Link>
            </div>
          )}

          {/* User info chip */}
          <div style={{ margin: '10px 12px 6px', padding: '8px 10px', background: 'rgba(255,255,255,.04)', borderRadius: '8px', border: '1px solid rgba(255,255,255,.07)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg,#3b82f6,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className="bi bi-person-fill" style={{ color: '#fff', fontSize: '.8rem' }} />
            </div>
            <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
              <div style={{ color: 'rgba(255,255,255,.85)', fontSize: '.75rem', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.nama || 'User'}
              </div>
              <div style={{ color: 'rgba(255,255,255,.35)', fontSize: '.62rem', textTransform: 'uppercase', letterSpacing: '.08em' }}>
                {getRoleLabel()}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Page Loader */}
      <div id="am-top-loader" />
    </>
  )
}