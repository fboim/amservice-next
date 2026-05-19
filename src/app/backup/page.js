'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AppLayout from '@/components/AppLayout'

export default function BackupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [tables, setTables] = useState([])
  const [stats, setStats] = useState({})
  const [lastBackup, setLastBackup] = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = sessionStorage.getItem('ams_token') || localStorage.getItem('ams_token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchStats()
  }, [router])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/backup')
      const data = await res.json()

      if (data.success) {
        const tableStats = {}
        for (const [name, records] of Object.entries(data.data)) {
          if (Array.isArray(records)) {
            tableStats[name] = records.length
          }
        }
        setStats(tableStats)
        setTables(Object.keys(tableStats))
        setLastBackup(data.timestamp)
      }
    } catch (err) {
      setMessage('Gagal mengambil data statistik')
    } finally {
      setLoadingData(false)
    }
  }

  const handleBackupJSON = async () => {
    setLoading(true)
    setMessage('')

    try {
      const res = await fetch('/api/backup?format=json')
      const data = await res.json()

      if (data.success) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `backup_amservice_${new Date().toISOString().split('T')[0]}.json`
        a.click()
        URL.revokeObjectURL(url)
        setMessage('Backup JSON berhasil di-download!')
      }
    } catch (err) {
      setMessage('Gagal membuat backup')
    } finally {
      setLoading(false)
    }
  }

  const handleBackupCSV = async () => {
    setLoading(true)
    setMessage('')

    try {
      const res = await fetch('/api/backup?table=servis&format=csv')
      const text = await res.text()

      const blob = new Blob([text], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `backup_servis_${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
      setMessage('Backup CSV berhasil di-download!')
    } catch (err) {
      setMessage('Gagal membuat backup CSV')
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <AppLayout>
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="spinner" style={{ width: 40, height: 40 }} />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div style={{ minHeight: '100vh', padding: '0' }}>
        {/* Header */}
        <div className="pg-header">
          <div>
            <h4 className="pg-title">
              <i className="bi bi-cloud-arrow-up" style={{ color: '#3b82f6', marginRight: 8 }} />
              Backup Database
            </h4>
            <p className="pg-subtitle">Download backup data Servis, Pelanggan, Sparepart</p>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div style={{
            padding: '12px 16px', background: message.includes('berhasil') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${message.includes('berhasil') ? '#10b981' : '#ef4444'}`,
            borderRadius: 8, marginBottom: '1.5rem', color: message.includes('berhasil') ? '#10b981' : '#ef4444',
            fontSize: '.875rem'
          }}>
            <i className={`bi ${message.includes('berhasil') ? 'bi-check-circle' : 'bi-exclamation-circle'}`} style={{ marginRight: 8 }} />
            {message}
          </div>
        )}

        {/* Stats */}
        <div className="section-card" style={{ marginBottom: '1.5rem' }}>
          <h5 style={{ color: '#94a3b8', marginBottom: '1rem', fontSize: '.9rem' }}>
            <i className="bi bi-database" style={{ marginRight: 8 }} />
            Statistik Data
          </h5>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
            {tables.map(table => (
              <div key={table} style={{
                background: '#1e293b', padding: '1rem', borderRadius: 12,
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#3b82f6' }}>
                  {stats[table] || 0}
                </div>
                <div style={{ fontSize: '.75rem', color: '#64748b', textTransform: 'uppercase', marginTop: 4 }}>
                  {table}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Backup Options */}
        <div className="section-card">
          <h5 style={{ color: '#94a3b8', marginBottom: '1rem', fontSize: '.9rem' }}>
            <i className="bi bi-download" style={{ marginRight: 8 }} />
            Download Backup
          </h5>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <div style={{
              background: '#1e293b', padding: '1.5rem', borderRadius: 12,
              border: '1px solid rgba(59,130,246,0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <i className="bi bi-filetype-json" style={{ color: '#fff', fontSize: '1.5rem' }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#fff' }}>Backup JSON</div>
                  <div style={{ fontSize: '.75rem', color: '#64748b' }}>Semua tabel</div>
                </div>
              </div>
              <button
                onClick={handleBackupJSON}
                disabled={loading}
                className="am-btn am-btn-primary"
                style={{ width: '100%' }}
              >
                {loading ? (
                  <>
                    <span className="spinner" style={{ width: 16, height: 16, marginRight: 8 }} />
                    Memproses...
                  </>
                ) : (
                  <>
                    <i className="bi bi-download" style={{ marginRight: 8 }} />
                    Download JSON
                  </>
                )}
              </button>
            </div>

            <div style={{
              background: '#1e293b', padding: '1.5rem', borderRadius: 12,
              border: '1px solid rgba(16,185,129,0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <i className="bi bi-file-earmark-excel" style={{ color: '#fff', fontSize: '1.5rem' }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#fff' }}>Backup CSV</div>
                  <div style={{ fontSize: '.75rem', color: '#64748b' }}>Servis only</div>
                </div>
              </div>
              <button
                onClick={handleBackupCSV}
                disabled={loading}
                className="am-btn"
                style={{ width: '100%', background: '#10b981', color: '#fff' }}
              >
                {loading ? (
                  <>
                    <span className="spinner" style={{ width: 16, height: 16, marginRight: 8 }} />
                    Memproses...
                  </>
                ) : (
                  <>
                    <i className="bi bi-download" style={{ marginRight: 8 }} />
                    Download CSV
                  </>
                )}
              </button>
            </div>
          </div>

          {lastBackup && (
            <div style={{ marginTop: '1.5rem', fontSize: '.75rem', color: '#64748b', textAlign: 'center' }}>
              Last backup: {new Date(lastBackup).toLocaleString('id-ID')}
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{
          background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
          borderRadius: 12, padding: '1rem', marginTop: '1.5rem', color: '#94a3b8', fontSize: '.85rem'
        }}>
          <i className="bi bi-info-circle" style={{ marginRight: 8, color: '#3b82f6' }} />
          Backup JSON berisi semua tabel database (admin, servis, sparepart, pelanggan).
          Backup CSV hanya berisi data servis dalam format spreadsheet.
        </div>

        {/* Back link */}
        <div style={{ marginTop: '2rem' }}>
          <Link href="/dashboard" style={{
            color: '#64748b', textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center', gap: 8
          }}>
            <i className="bi bi-arrow-left" />
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    </AppLayout>
  )
}