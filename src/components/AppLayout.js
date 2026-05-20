'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'
import { useSidebar } from './SidebarContext'

function SidebarWrapper({ children }) {
  const { mobileOpen, onMobileClose, onMobileOpen } = useSidebar()
  const [user, setUser] = useState(null)
  const [isChecking, setIsChecking] = useState(true)
  const pathname = usePathname()
  const router = useRouter()

  // Check auth on mount and pathname change
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
        console.error('Failed to parse user data')
        setUser(null)
      }
    }
    setIsChecking(false)
  }, [pathname, router])

  if (isChecking) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <i className="bi bi-arrow-repeat" style={{ fontSize: '2rem', animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }

  const handleLogout = () => {
    if (confirm('Yakin ingin keluar dari sistem?')) {
      localStorage.removeItem('ams_token')
      localStorage.removeItem('ams_user')
      sessionStorage.removeItem('ams_token')
      sessionStorage.removeItem('ams_user')
      router.push('/login')
    }
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
    if (page.includes('riwayat')) return 'Riwayat Servis'
    if (page.includes('user')) return 'Manajemen User'
    if (page.includes('laporan')) return 'Laporan Keuangan'
    if (page.includes('pengaturan')) return 'Pengaturan Toko'
    if (page.includes('backup')) return 'Backup Data'
    if (page.includes('ganti_password')) return 'Ganti Password'
    return 'AM SERVICE'
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
          <div>
            <h4 style={{ fontWeight: '800', fontSize: '1.15rem', color: 'var(--am-text)', margin: '0 0 2px' }}>
              {getPageTitle()}
            </h4>
            <p style={{ fontSize: '.8rem', color: 'var(--am-text-muted)', margin: 0 }}>
              <i className="bi bi-calendar3" style={{ marginRight: '4px' }} />
              {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              &nbsp;·&nbsp; Halo, <strong style={{ color: 'var(--am-text)' }}>{user?.nama || 'User'}</strong>
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '.72rem',
              fontWeight: '700',
              color: 'var(--am-text-muted)',
              background: 'var(--am-surface-2)',
              border: '1px solid var(--am-border)',
              padding: '4px 10px',
              borderRadius: '999px'
            }}>
              <i className="bi bi-person-fill" />
              {getRoleLabel().toUpperCase()}
            </span>
            <Link
              href="/servis/tambah"
              className="am-btn am-btn-primary am-btn-pill am-btn-sm"
              style={{ boxShadow: '0 2px 10px rgba(59,130,246,.25)' }}
            >
              <i className="bi bi-plus-circle" /> Servis Baru
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