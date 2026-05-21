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
        {/* Header */}
        <div className="pg-header fade-in">
          <div>
            <h4 className="pg-title">
              <i className="bi bi-trash3" style={{ color: '#ef4444', marginRight: 8 }} />
              Riwayat Servis (Trash)
            </h4>
            <p className="pg-subtitle">
              Data servis yang dihapus &mdash; {total.toLocaleString('id-ID')} item
            </p>
          </div>
          <Link href="/servis/data" className="am-btn am-btn-secondary am-btn-pill am-btn-sm">
            <i className="bi bi-arrow-left" />
            Kembali
          </Link>
        </div>

        {/* Search */}
        <div className="search-section fade-in">
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
        <div className="section-card fade-in" style={{ marginBottom: '16px', overflow: 'hidden' }}>
          {trash.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table className="am-table">
                <thead>
                  <tr>
                    <th style={{ width: '50px', textAlign: 'center' }}>#</th>
                    <th>No. Servis</th>
                    <th>Tanggal Hapus</th>
                    <th>Customer</th>
                    <th>HP</th>
                    <th style={{ width: '80px', textAlign: 'center' }}>Status</th>
                    <th style={{ width: '110px', textAlign: 'center' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {trash.map((item, i) => (
                    <tr key={item.id} style={{ opacity: 0.7 }}>
                      <td style={{ textAlign: 'center', fontSize: '.75rem', color: 'var(--am-text-muted)', fontWeight: 700 }}>
                        {(page - 1) * 15 + i + 1}
                      </td>
                      <td style={{ fontWeight: 700, color: '#ef4444', fontSize: '.85rem' }}>{item.no_servis}</td>
                      <td style={{ color: 'var(--am-text-muted)', fontSize: '.8rem' }}>
                        {item.deleted_at ? new Date(item.deleted_at).toLocaleDateString('id-ID', {
                          day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        }) : '-'}
                      </td>
                      <td style={{ fontSize: '.85rem' }}>{item.nama_pelanggan || '-'}</td>
                      <td style={{ color: 'var(--am-text-muted)', fontSize: '.8rem' }}>
                        {item.merk_hp} {item.tipe_hp}
                      </td>
                      <td style={{ textAlign: 'center' }}>{getStatusBadge(item.status)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                          <button
                            onClick={() => handleRestore(item.id)}
                            className="btn-act btn-act-green"
                            title="Restore"
                          >
                            <i className="bi bi-arrow-counterclockwise" />
                          </button>
                          <button
                            onClick={() => handlePermanentDelete(item.id)}
                            className="btn-act btn-act-red"
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
            </div>
          ) : (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--am-text-muted)' }}>
              <i className="bi bi-trash3" style={{ fontSize: '2.5rem', display: 'block', marginBottom: '.5rem', opacity: 0.3 }} />
              {search ? 'Data tidak ditemukan' : 'Trash kosong'}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '16px' }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="am-btn am-btn-secondary"
              style={{ padding: '8px 14px', fontSize: '.875rem' }}
            >
              <i className="bi bi-chevron-left" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
              .map((p, idx, arr) => (
                <>
                  {idx > 0 && arr[idx - 1] !== p - 1 && <span style={{ padding: '8px 12px', color: 'var(--am-text-muted)' }}>…</span>}
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`am-btn ${page === p ? 'am-btn-primary' : 'am-btn-secondary'}`}
                    style={{ padding: '8px 14px', fontSize: '.875rem', minWidth: '40px' }}
                  >
                    {p}
                  </button>
                </>
              ))
            }
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="am-btn am-btn-secondary"
              style={{ padding: '8px 14px', fontSize: '.875rem' }}
            >
              <i className="bi bi-chevron-right" />
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  )
}