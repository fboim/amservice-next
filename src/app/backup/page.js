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
      <style jsx global>{`
        .fade-in {
          animation: fadeIn 0.4s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .section-card {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>

      <div className="page-wrapper">
        {/* Message */}
        {message && (
          <div className="fade-in" style={{
            padding: '12px 16px', background: message.includes('berhasil') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${message.includes('berhasil') ? '#10b981' : '#ef4444'}`,
            borderRadius: '12px', marginBottom: '20px', color: message.includes('berhasil') ? '#10b981' : '#ef4444',
            fontSize: '.875rem'
          }}>
            <i className={`bi ${message.includes('berhasil') ? 'bi-check-circle' : 'bi-exclamation-circle'}`} style={{ marginRight: 8 }} />
            {message}
          </div>
        )}

        {/* Stats */}
        <div className="section-card fade-in" style={{ marginBottom: '20px' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--am-border)', background: 'var(--am-surface-2)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '.9rem', fontWeight: 600 }}>
              <i className="bi bi-database" style={{ color: '#3b82f6' }} />
              Statistik Data
            </span>
          </div>
          <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
            {tables.map(table => (
              <div key={table} style={{
                background: 'var(--am-surface-2)', padding: '16px', borderRadius: '12px',
                textAlign: 'center', border: '1px solid var(--am-border)'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#3b82f6' }}>
                  {stats[table] || 0}
                </div>
                <div style={{ fontSize: '.75rem', color: 'var(--am-text-muted)', textTransform: 'uppercase', marginTop: 4 }}>
                  {table}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Backup Options */}
        <div className="section-card fade-in" style={{ marginBottom: '20px' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--am-border)', background: 'var(--am-surface-2)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '.9rem', fontWeight: 600 }}>
              <i className="bi bi-download" style={{ color: '#10b981' }} />
              Download Backup
            </span>
          </div>
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div style={{
                background: 'var(--am-surface-2)', padding: '24px', borderRadius: '16px',
                border: '1px solid var(--am-border)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: '16px' }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: '14px',
                    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <i className="bi bi-filetype-json" style={{ color: '#fff', fontSize: '1.5rem' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>Backup JSON</div>
                    <div style={{ fontSize: '.75rem', color: 'var(--am-text-muted)' }}>Semua tabel</div>
                  </div>
                </div>
                <button
                  onClick={handleBackupJSON}
                  disabled={loading}
                  className="am-btn am-btn-primary"
                  style={{ width: '100%', padding: '12px' }}
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
                background: 'var(--am-surface-2)', padding: '24px', borderRadius: '16px',
                border: '1px solid var(--am-border)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: '16px' }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: '14px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <i className="bi bi-file-earmark-excel" style={{ color: '#fff', fontSize: '1.5rem' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>Backup CSV</div>
                    <div style={{ fontSize: '.75rem', color: 'var(--am-text-muted)' }}>Servis only</div>
                  </div>
                </div>
                <button
                  onClick={handleBackupCSV}
                  disabled={loading}
                  className="am-btn"
                  style={{ width: '100%', padding: '12px', background: '#10b981', color: '#fff' }}
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
              <div style={{ marginTop: '20px', fontSize: '.75rem', color: 'var(--am-text-muted)', textAlign: 'center' }}>
                <i className="bi bi-clock" style={{ marginRight: 4 }} />
                Last backup: {new Date(lastBackup).toLocaleString('id-ID')}
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="fade-in" style={{
          background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)',
          borderRadius: '12px', padding: '16px', color: 'var(--am-text-muted)', fontSize: '.85rem'
        }}>
          <i className="bi bi-info-circle" style={{ marginRight: 8, color: '#3b82f6' }} />
          Backup JSON berisi semua tabel database (admin, servis, sparepart, pelanggan).
          Backup CSV hanya berisi data servis dalam format spreadsheet.
        </div>
      </div>
    </AppLayout>
  )
}