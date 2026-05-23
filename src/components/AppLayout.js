'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'
import { useSidebar } from './SidebarContext'

// Simple cache for stats - client-side only
function SidebarWrapper({ children }) {
  const { mobileOpen, onMobileClose, onMobileOpen } = useSidebar()
  const [user, setUser] = useState(null)
  const [isChecking, setIsChecking] = useState(true)
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
  }, [pathname, router])

  if (isChecking) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--am-bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <i className="bi bi-arrow-repeat" style={{ fontSize: '2rem', animation: 'spin 0.8s linear infinite', color: 'var(--am-primary)' }} />
        </div>
      </div>
    )
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
        {/* Desktop Header */}
        <div className="header-bar">
          {/* Left - Page Title & User Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Page Icon */}
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, var(--am-primary), #6366f1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <i className={`bi ${getPageIcon()}`} style={{ color: '#fff', fontSize: '0.9rem' }} />
            </div>
            <div>
              <h4 style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--am-text)', margin: '0' }}>
                {getPageTitle()}
              </h4>
            </div>
          </div>

          {/* Right - Actions */}
          <div className="header-actions">
            {/* New Service Button */}
            <Link href="/servis/tambah" className="am-btn am-btn-primary am-btn-pill am-btn-sm">
              <i className="bi bi-plus-circle-fill" /> Servis Baru
            </Link>
          </div>
        </div>

        {children}
      </div>
    </>
  )
}

export default function AppLayout({ children }) {
  return <SidebarWrapper>{children}</SidebarWrapper>
}