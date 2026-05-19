'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'

export default function AppLayout({ children }) {
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState(null)
  const pathname = usePathname()

  useEffect(() => {
    const token = localStorage.getItem('ams_token') || sessionStorage.getItem('ams_token')
    if (!token) {
      router.push('/login')
      return
    }
    const userData = localStorage.getItem('ams_user') || sessionStorage.getItem('ams_user')
    if (userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (e) {
        console.error('Failed to parse user data')
      }
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('ams_token')
    localStorage.removeItem('ams_user')
    sessionStorage.removeItem('ams_token')
    sessionStorage.removeItem('ams_user')
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
    <div className="min-h-screen bg-[#07070f]">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <main
        className={`
          min-h-screen flex flex-col transition-all duration-300
          ${collapsed ? 'lg:ml-[72px]' : 'lg:ml-64'}
        `}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 bg-[#0f172a]/80 backdrop-blur-xl
          border-b border-white/5 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden w-10 h-10 rounded-xl bg-white/5 border border-white/10
                  flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10
                  transition-all"
              >
                <i className="bi bi-list text-xl" />
              </button>

              <div>
                <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                  {getPageTitle()}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  {new Date().toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/servis/tambah"
                className="hidden sm:flex items-center gap-2 px-4 py-2.5
                  bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl
                  font-semibold text-sm shadow-lg shadow-blue-500/25
                  hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all"
              >
                <i className="bi bi-plus-circle" />
                <span>Servis Baru</span>
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 sm:px-4 py-2.5
                  bg-white/5 border border-white/10 text-slate-400 rounded-xl
                  font-medium text-sm hover:bg-red-500/10 hover:border-red-500/20
                  hover:text-red-400 transition-all"
              >
                <i className="bi bi-box-arrow-right" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-6">
          {children}
        </div>
      </main>
    </div>
  )
}