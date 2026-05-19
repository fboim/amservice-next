'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

// Menu items by role
const menuItems = {
  admin: [
    { href: '/dashboard', icon: 'bi-grid-1x2', label: 'Dashboard' },
    { href: '/servis/data', icon: 'bi-list-check', label: 'Data Servis' },
    { href: '/servis/tambah', icon: 'bi-plus-circle', label: 'Servis Baru' },
    { href: '/pelanggan', icon: 'bi-people', label: 'Pelanggan' },
    { href: '/sparepart', icon: 'bi-box-seam', label: 'Sparepart' },
    { href: '/testimoni', icon: 'bi-star', label: 'Testimoni' },
    { href: '/laporan', icon: 'bi-graph-up', label: 'Laporan' },
    { href: '/user', icon: 'bi-shield', label: 'User' },
    { href: '/pengaturan', icon: 'bi-gear', label: 'Pengaturan' },
    { href: '/backup', icon: 'bi-archive', label: 'Backup' },
  ],
  teknisi: [
    { href: '/dashboard', icon: 'bi-grid-1x2', label: 'Dashboard' },
    { href: '/servis/data', icon: 'bi-list-check', label: 'Data Servis' },
    { href: '/servis/tambah', icon: 'bi-plus-circle', label: 'Servis Baru' },
    { href: '/sparepart', icon: 'bi-box-seam', label: 'Sparepart' },
  ],
  pengunjung: [
    { href: '/dashboard', icon: 'bi-grid-1x2', label: 'Dashboard' },
  ],
}

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const pathname = usePathname()
  const [theme, setTheme] = useState('dark')
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Load theme
    const savedTheme = localStorage.getItem('ams_theme') || 'dark'
    setTheme(savedTheme)
    document.documentElement.classList.toggle('dark', savedTheme === 'dark')

    // Load user
    const userData = localStorage.getItem('ams_user')
    if (userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (e) {
        console.error('Failed to parse user data')
      }
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('ams_theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  const getMenuItems = () => {
    if (!user) return menuItems.pengunjung
    const role = user.role?.toLowerCase()
    return menuItems[role] || menuItems.pengunjung
  }

  const isActive = (href) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const getRoleBadge = () => {
    if (!user) return null
    const roleMap = {
      admin: { label: 'Admin', class: 'bg-purple-500/20 text-purple-400' },
      teknisi: { label: 'Teknisi', class: 'bg-blue-500/20 text-blue-400' },
      pengunjung: { label: 'Pengunjung', class: 'bg-gray-500/20 text-gray-400' },
    }
    const role = user.role?.toLowerCase()
    const badge = roleMap[role]
    if (!badge) return null
    return (
      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${badge.class}`}>
        {badge.label}
      </span>
    )
  }

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-screen w-64 bg-[#1e293b] border-r border-white/5
          flex flex-col z-50 transition-transform duration-300
          ${collapsed ? 'lg:w-[72px]' : 'lg:w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="px-4 py-5 border-b border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5 flex-shrink-0">
            <div className="w-full h-full bg-white rounded-[10px] p-1">
              <img src="/logo_am.png" alt="AM Service" className="w-full h-full object-contain" />
            </div>
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-white font-extrabold text-sm tracking-tight truncate">
                AM SERVICE
              </span>
              <span className="text-slate-500 text-[10px] uppercase tracking-widest">
                Repair Center
              </span>
            </div>
          )}
        </div>

        {/* Toggle - Desktop */}
        <button
          className="hidden lg:flex absolute -right-3 top-[72px] w-6 h-6 rounded-full
            bg-slate-700 border-2 border-slate-600 text-slate-400 items-center justify-center
            text-xs hover:bg-blue-500 hover:border-blue-500 hover:text-white transition-all z-10"
          onClick={onToggle}
        >
          <i className={`bi ${collapsed ? 'bi-chevron-right' : 'bi-chevron-left'}`} />
        </button>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          <ul className="space-y-1">
            {getMenuItems().map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onMobileClose}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl
                    text-sm font-medium transition-all duration-200
                    ${isActive(item.href)
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }
                    ${collapsed ? 'lg:justify-center lg:px-2' : ''}
                  `}
                >
                  <i className={`bi ${item.icon} text-lg w-5 text-center flex-shrink-0`} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/5 space-y-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
              text-slate-400 hover:bg-white/5 hover:text-white transition-all duration-200"
          >
            <i className={`bi ${theme === 'dark' ? 'bi-sun' : 'bi-moon'} text-lg w-5 text-center`} />
            {!collapsed && (
              <span className="text-sm font-medium">
                {theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
              </span>
            )}
          </button>

          {/* User Profile */}
          {!collapsed && user && (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600
                flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {user.nama?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.nama || 'User'}</p>
                {getRoleBadge()}
              </div>
            </div>
          )}

          {/* Version */}
          {!collapsed && (
            <p className="text-center text-[11px] text-slate-600 pt-1">
              AM Service v1.0.0
            </p>
          )}
        </div>
      </aside>
    </>
  )
}