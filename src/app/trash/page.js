'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AppLayout from '@/components/AppLayout'

export default function TrashPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [trash, setTrash] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [actionId, setActionId] = useState(null)
  const [actionType, setActionType] = useState(null)

  useEffect(() => {
    const token = sessionStorage.getItem('ams_token') || localStorage.getItem('ams_token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchTrash()
  }, [page, search])

  const fetchTrash = async () => {
    try {
      const params = new URLSearchParams({ page, limit: 15, search })
      const res = await fetch(`/api/trash?${params}`)
      const data = await res.json()
      setTrash(data.trash || [])
      setTotal(data.total || 0)
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async (id) => {
    if (!confirm('Restore servis ini ke data aktif?')) return

    try {
      const res = await fetch('/api/trash', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'restore' })
      })
      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'Gagal restore servis')
        return
      }

      alert('Servis berhasil direstore')
      fetchTrash()
    } catch (err) {
      alert('Terjadi kesalahan')
    }
    setActionId(null)
    setActionType(null)
  }

  const handlePermanentDelete = async (id) => {
    if (!confirm('HAPUS PERMANEN? Data tidak bisa dikembalikan lagi!')) return
    if (!confirm('Serius? Klik OK untuk hapus permanen')) return

    try {
      const res = await fetch('/api/trash', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'permanent_delete' })
      })
      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'Gagal menghapus')
        return
      }

      alert('Servis dihapus permanen')
      fetchTrash()
    } catch (err) {
      alert('Terjadi kesalahan')
    }
    setActionId(null)
    setActionType(null)
  }

  const getStatusBadge = (status) => {
    const colors = {
      'Antrean': '#f59e0b',
      'Proses': '#3b82f6',
      'Selesai': '#10b981',
      'Diambil': '#6366f1',
      'Batal': '#ef4444'
    }
    return (
      <span style={{
        padding: '4px 10px', borderRadius: '999px', fontSize: '.7rem',
        fontWeight: 600, background: colors[status] || '#64748b', color: '#fff'
      }}>
        {status}
      </span>
    )
  }

  const totalPages = Math.ceil(total / 15)

  if (loading) {
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
              <i className="bi bi-trash3" style={{ color: '#ef4444', marginRight: 8 }} />
              Riwayat Servis (Trash)
            </h4>
            <p className="pg-subtitle">Total: {total} item di trash</p>
          </div>
          <Link href="/servis/data" className="am-btn am-btn-secondary am-btn-pill am-btn-sm">
            <i className="bi bi-arrow-left" />
            Kembali ke Data Servis
          </Link>
        </div>

        {/* Search */}
        <div style={{ marginBottom: '1.5rem' }}>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Cari no. servis, nama, atau merk..."
            className="am-input"
            style={{ maxWidth: 400 }}
          />
        </div>

        {/* Table */}
        <div className="section-card">
          {trash.length > 0 ? (
            <table className="am-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>No. Servis</th>
                  <th>Tanggal Hapus</th>
                  <th>Customer</th>
                  <th>HP</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {trash.map((item, i) => (
                  <tr key={item.id} style={{ opacity: 0.7 }}>
                    <td style={{ color: '#64748b', fontSize: '.75rem', fontWeight: 700 }}>
                      {(page - 1) * 15 + i + 1}
                    </td>
                    <td style={{ fontWeight: 700, color: '#ef4444' }}>{item.no_servis}</td>
                    <td style={{ color: '#64748b', fontSize: '.85rem' }}>
                      {item.deleted_at ? new Date(item.deleted_at).toLocaleDateString('id-ID', {
                        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      }) : '-'}
                    </td>
                    <td>{item.nama_pelanggan || '-'}</td>
                    <td style={{ color: '#64748b', fontSize: '.85rem' }}>
                      {item.merk_hp} {item.tipe_hp}
                    </td>
                    <td>{getStatusBadge(item.status)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => handleRestore(item.id)}
                          style={{
                            padding: '6px 12px', borderRadius: 6,
                            background: '#10b981', border: 'none',
                            color: '#fff', fontSize: '.75rem', cursor: 'pointer'
                          }}
                          title="Restore"
                        >
                          <i className="bi bi-arrow-counterclockwise" />
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(item.id)}
                          style={{
                            padding: '6px 12px', borderRadius: 6,
                            background: 'transparent', border: '1px solid #ef4444',
                            color: '#ef4444', fontSize: '.75rem', cursor: 'pointer'
                          }}
                          title="Hapus Permanen"
                        >
                          <i className="bi bi-x-circle" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
              <i className="bi bi-trash3" style={{ fontSize: '2.5rem', display: 'block', marginBottom: '.5rem', opacity: 0.3 }} />
              {search ? 'Data tidak ditemukan' : 'Trash kosong'}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: '1.5rem' }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                padding: '8px 16px', borderRadius: 8,
                background: page === 1 ? '#334155' : '#3b82f6',
                color: '#fff', border: 'none', cursor: page === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              ← Prev
            </button>
            <span style={{ padding: '8px 16px', color: '#94a3b8' }}>
              Halaman {page} dari {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{
                padding: '8px 16px', borderRadius: 8,
                background: page === totalPages ? '#334155' : '#3b82f6',
                color: '#fff', border: 'none', cursor: page === totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              Next →
            </button>
          </div>
        )}

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