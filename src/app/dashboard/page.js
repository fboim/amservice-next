'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AppLayout from '@/components/AppLayout'
import MonthlyChart from '@/components/MonthlyChart'
import StockWarning from '@/components/StockWarning'
import { formatRupiah } from '@/lib/utils'

// Stat Card Component
function StatCard({ icon, label, value, sub, color, bgClass }) {
  return (
    <div className="relative bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5
      hover:border-slate-600 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20
      transition-all duration-300 overflow-hidden group">
      {/* Glow effect */}
      <div
        className="absolute top-0 left-0 w-1 h-full transition-all duration-300"
        style={{ background: color }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative flex items-center gap-4">
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ background: `${color}20`, color }}
        >
          <i className={`bi ${icon}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">{label}</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">{value}</p>
          <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
        </div>
      </div>
    </div>
  )
}

// Revenue Card Component
function RevenueCard({ label, value, color, icon }) {
  return (
    <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-800/20 border border-slate-700/50
      rounded-2xl p-5 overflow-hidden">
      <div
        className="absolute inset-0 opacity-10"
        style={{ background: `linear-gradient(135deg, ${color}, transparent)` }}
      />
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}20`, color }}>
            <i className={`bi ${icon}`} />
          </div>
        </div>
        <p className="text-xl sm:text-2xl font-extrabold text-white truncate">{value}</p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [stats, setStats] = useState({
    antrean: 0,
    proses: 0,
    siap: 0,
    selesai: 0,
    omzet_hari: 0,
    omzet_bulan: 0,
    monthly_data: [],
  })
  const [servisTerbaru, setServisTerbaru] = useState([])

  useEffect(() => {
    const token = localStorage.getItem('ams_token') || sessionStorage.getItem('ams_token')
    if (!token) {
      router.push('/login')
      return
    }

    fetchDashboard()

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchDashboard(true)
    }, 30000)

    return () => clearInterval(interval)
  }, [router])

  const fetchDashboard = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true)
    }

    try {
      const [dashboardRes, servisRes] = await Promise.all([
        fetch('/api/dashboard'),
        fetch('/api/servis?limit=10'),
      ])

      const dashboardData = await dashboardRes.json()
      const servisData = await servisRes.json()

      setStats(dashboardData)
      setServisTerbaru(servisData.servis || [])
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const getBadgeClass = (status) => {
    const map = {
      'Antrean': 'bg-blue-500/15 text-blue-400',
      'Proses': 'bg-amber-500/15 text-amber-400',
      'Siap Diambil': 'bg-cyan-500/15 text-cyan-400',
      'Sudah Diambil': 'bg-emerald-500/15 text-emerald-400',
      'Tidak Bisa': 'bg-red-500/15 text-red-400',
    }
    return map[status] || 'bg-slate-500/15 text-slate-400'
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500">Memuat dashboard...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">
              {new Date().toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchDashboard(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10
                text-slate-400 rounded-xl text-sm font-medium hover:bg-white/10 hover:text-white
                transition-all disabled:opacity-50"
            >
              <i className={`bi bi-arrow-clockwise ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <Link
              href="/servis/tambah"
              className="flex items-center gap-2 px-4 py-2.5
                bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl
                text-sm font-semibold shadow-lg shadow-blue-500/25
                hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all"
            >
              <i className="bi bi-plus-circle" />
              <span>Servis Baru</span>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <StatCard
            icon="bi-person-plus-fill"
            label="Antrean"
            value={stats.antrean}
            sub="Unit hari ini"
            color="#3b82f6"
          />
          <StatCard
            icon="bi-tools"
            label="Dikerjakan"
            value={stats.proses}
            sub="Sedang diproses"
            color="#f59e0b"
          />
          <StatCard
            icon="bi-bag-check-fill"
            label="Siap Diambil"
            value={stats.siap}
            sub="Tunggu pelanggan"
            color="#06b6d4"
          />
          <StatCard
            icon="bi-check-circle-fill"
            label="Selesai"
            value={stats.selesai}
            sub="Diambil hari ini"
            color="#10b981"
          />
          <div className="col-span-2 lg:col-span-4 xl:col-span-1">
            <RevenueCard
              label="Omzet Hari Ini"
              value={formatRupiah(stats.omzet_hari)}
              color="#8b5cf6"
              icon="bi-cash-stack"
            />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Chart Section */}
          <div className="xl:col-span-2 bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <i className="bi bi-bar-chart text-blue-400" />
                Tren Unit Masuk
              </h2>
              <span className="text-xs text-slate-500">6 Bulan Terakhir</span>
            </div>
            <MonthlyChart data={stats.monthly_data} />
          </div>

          {/* Stock Warning Sidebar */}
          <div className="xl:col-span-1">
            <StockWarning />

            {/* Quick Omzet Monthly */}
            <div className="mt-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10
              border border-purple-500/20 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <i className="bi bi-calendar-month text-purple-400" />
                  Omzet Tahun Ini
                </span>
              </div>
              <p className="text-2xl font-extrabold text-white">
                {formatRupiah(stats.omzet_bulan)}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Total pendapatan tahun {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </div>

        {/* Servis Table */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <i className="bi bi-clock-history text-cyan-400" />
              Servis Terbaru
            </h2>
            <Link
              href="/servis/data"
              className="text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition-colors"
            >
              Lihat Semua
              <i className="bi bi-chevron-double-right" />
            </Link>
          </div>

          {servisTerbaru.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-900/50">
                    <th className="px-5 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">No</th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">No Servis</th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pelanggan</th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Unit HP</th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Biaya</th>
                    <th className="px-5 py-3 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {servisTerbaru.map((s, i) => (
                    <tr key={s.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3 text-sm text-slate-500">{i + 1}</td>
                      <td className="px-5 py-3 text-sm font-mono text-slate-400">{s.no_servis}</td>
                      <td className="px-5 py-3">
                        <div className="text-sm font-medium text-white">{s.nama_pelanggan}</div>
                        <div className="text-xs text-slate-500">{s.no_hp || '-'}</div>
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-300">
                        {s.merk_hp} {s.tipe_hp}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${getBadgeClass(s.status)}`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm font-semibold text-white">
                        {s.estimasi_biaya ? formatRupiah(s.estimasi_biaya) : '-'}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <Link
                          href={`/servis/edit/${s.id}`}
                          className="inline-flex items-center justify-center w-9 h-9
                            bg-blue-500/10 text-blue-400 rounded-lg
                            hover:bg-blue-500/20 hover:text-blue-300 transition-all"
                        >
                          <i className="bi bi-eye" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <i className="bi bi-inbox text-5xl mb-3 opacity-20" />
              <p className="text-sm">Belum ada data servis</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}