'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Sidebar from './Sidebar'

export default function AppLayout({ children }) {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

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

  const currentPage = typeof window !== 'undefined' ? window.location.pathname : ''

  const getPageTitle = () => {
    const path = typeof window !== 'undefined' ? window.location.pathname : ''
    if (path === '/dashboard') return 'Dashboard'
    if (path.startsWith('/servis/data')) return 'Data Servis'
    if (path.startsWith('/servis/tambah')) return 'Servis Baru'
    if (path.startsWith('/servis/edit')) return 'Edit Servis'
    if (path.startsWith('/sparepart')) return 'Sparepart'
    if (path.startsWith('/laporan')) return 'Laporan'
    if (path.startsWith('/pengaturan')) return 'Pengaturan'
    return 'AM Service'
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f172a' }}>
      <Sidebar />
      <main style={{
        flex: 1,
        marginLeft: '260px',
        transition: 'margin-left 0.3s ease',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <header style={{
          background: '#1e293b',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 50
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f1f5f9' }}>
              {getPageTitle()}
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: '.75rem', color: '#64748b' }}>
              {new Date().toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Quick Add */}
            <a
              href="/servis/tambah"
              style={{
                padding: '8px 16px',
                background: '#3b82f6',
                color: '#fff',
                borderRadius: 8,
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <i className="bi bi-plus-circle" />
              Servis Baru
            </a>
            {/* User Menu */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={handleLogout}
                style={{
                  padding: '8px 12px',
                  background: 'transparent',
                  border: '1px solid #334155',
                  borderRadius: 8,
                  color: '#94a3b8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '.875rem'
                }}
              >
                <i className="bi bi-box-arrow-right" />
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div style={{ flex: 1, padding: '1.5rem' }}>
          {children}
        </div>

        {/* Footer */}
        <footer style={{
          padding: '1rem 1.5rem',
          background: '#1e293b',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          textAlign: 'center',
          fontSize: '.75rem',
          color: '#64748b'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            <span>AM Service Repair Center</span>
            <span>|</span>
            <span>Jl. Contoh No. 123, Kota</span>
            <span>|</span>
            <span>Telp: 0812-3456-7890</span>
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            &copy; {new Date().getFullYear()} AM Service. All rights reserved.
          </div>
        </footer>
      </main>
    </div>
  )
}