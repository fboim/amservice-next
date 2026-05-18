'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Sparepart() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [sparepart, setSparepart] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const token = sessionStorage.getItem('ams_token') || localStorage.getItem('ams_token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchSparepart()
  }, [page, search])

  const fetchSparepart = async () => {
    try {
      const params = new URLSearchParams({ page, limit: 12, search })
      const res = await fetch(`/api/sparepart?${params}`)
      const data = await res.json()
      setSparepart(data.sparepart || [])
      setTotal(data.total || 0)
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(total / 12)

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', padding: '1.5rem' }}>
      {/* Header */}
      <div className="pg-header">
        <div>
          <h4 className="pg-title">
            <i className="bi bi-box-seam" style={{ color: '#3b82f6', marginRight: 8 }} />
            Data Sparepart
          </h4>
          <p className="pg-subtitle">Total: {total} item</p>
        </div>
        <Link href="/sparepart/tambah" className="am-btn am-btn-primary am-btn-pill am-btn-sm">
          <i className="bi bi-plus-circle" />
          Tambah Sparepart
        </Link>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          placeholder="Cari sparepart..."
          className="am-input"
          style={{ maxWidth: 400 }}
        />
      </div>

      {/* Table */}
      <div className="section-card">
        {sparepart.length > 0 ? (
          <table className="am-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Sparepart</th>
                <th>Stok</th>
                <th>Harga</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {sparepart.map((sp, i) => (
                <tr key={sp.id}>
                  <td style={{ color: '#64748b', fontSize: '.75rem', fontWeight: 700 }}>{i + 1}</td>
                  <td style={{ fontWeight: 600, textTransform: 'uppercase' }}>{sp.nama_sparepart}</td>
                  <td>
                    <span className={`badge ${sp.stok <= 5 ? 'badge-proses' : 'badge-selesai'}`}>
                      {sp.stok} pcs
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: '#ef4444' }}>
                    Rp {parseInt(sp.harga).toLocaleString('id-ID')}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Link href={`/sparepart/edit/${sp.id}`} style={{
                        padding: '6px 12px', borderRadius: 6,
                        background: 'transparent', border: '1px solid #3b82f6',
                        color: '#3b82f6', fontSize: '.75rem', textDecoration: 'none'
                      }}>
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <i className="bi bi-inbox" style={{ fontSize: '2.5rem', display: 'block', marginBottom: '.5rem', opacity: 0.3 }} />
            Tidak ada data sparepart
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
  )
}