'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function DataServis() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [servis, setServis] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    const token = sessionStorage.getItem('ams_token') || localStorage.getItem('ams_token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchServis()
  }, [page, search, statusFilter])

  const fetchServis = async () => {
    try {
      const params = new URLSearchParams({ page, limit: 12, search })
      if (statusFilter) params.set('status', statusFilter)
      const res = await fetch(`/api/servis?${params}`)
      const data = await res.json()
      setServis(data.servis || [])
      setTotal(data.total || 0)
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(total / 12)

  const getBadgeClass = (status) => {
    const map = {
      'Antrean': 'badge-antrean',
      'Proses': 'badge-proses',
      'Siap Diambil': 'badge-siap',
      'Sudah Diambil': 'badge-selesai',
      'Tidak Bisa': 'badge-gagal'
    }
    return map[status] || 'badge-antrean'
  }

  const formatRupiah = (str) => {
    const num = parseInt((str || '0').replace(/\D/g, ''))
    return 'Rp ' + num.toLocaleString('id-ID')
  }

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
            <i className="bi bi-list-check" style={{ color: '#3b82f6', marginRight: 8 }} />
            Data Servis
          </h4>
          <p className="pg-subtitle">Total: {total} record</p>
        </div>
        <Link href="/servis/tambah" className="am-btn am-btn-primary am-btn-pill am-btn-sm">
          <i className="bi bi-plus-circle" />
          Servis Baru
        </Link>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          placeholder="Cari no nota, nama, atau merk HP..."
          className="am-input"
          style={{ maxWidth: 350 }}
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="am-input"
          style={{ maxWidth: 200 }}
        >
          <option value="">Semua Status</option>
          <option value="Antrean">Antrean</option>
          <option value="Proses">Proses</option>
          <option value="Siap Diambil">Siap Diambil</option>
          <option value="Sudah Diambil">Selesai</option>
          <option value="Tidak Bisa">Tidak Bisa</option>
        </select>
      </div>

      {/* Table */}
      <div className="section-card">
        {servis.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="am-table">
              <thead>
                <tr>
                  <th>No Nota</th>
                  <th>Tanggal</th>
                  <th>Pelanggan</th>
                  <th>Unit HP</th>
                  <th>Keluhan</th>
                  <th>Status</th>
                  <th>Biaya</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {servis.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600, color: '#3b82f6' }}>{s.no_servis}</td>
                    <td style={{ fontSize: '.8rem', color: '#64748b' }}>
                      {new Date(s.tanggal).toLocaleDateString('id-ID')}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{s.nama_pelanggan}</div>
                      <div style={{ fontSize: '.7rem', color: '#64748b' }}>{s.no_hp}</div>
                    </td>
                    <td>{s.merk_hp} {s.tipe_hp}</td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.keluhan || '-'}
                    </td>
                    <td><span className={`badge ${getBadgeClass(s.status)}`}>{s.status}</span></td>
                    <td style={{ fontWeight: 600 }}>{formatRupiah(s.estimasi_biaya)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Link href={`/servis/edit/${s.id}`} style={{
                          padding: '4px 8px', borderRadius: 5,
                          background: 'transparent', border: '1px solid #3b82f6',
                          color: '#3b82f6', fontSize: '.7rem', textDecoration: 'none'
                        }}>
                          <i className="bi bi-pencil" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <i className="bi bi-inbox" style={{ fontSize: '2.5rem', display: 'block', marginBottom: '.5rem', opacity: 0.3 }} />
            Tidak ada data servis
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: '1.5rem' }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="am-btn am-btn-secondary">
            ← Prev
          </button>
          <span style={{ padding: '10px 16px', color: '#94a3b8' }}>
            Halaman {page} dari {totalPages}
          </span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="am-btn am-btn-secondary">
            Next →
          </button>
        </div>
      )}

      {/* Back link */}
      <div style={{ marginTop: '2rem' }}>
        <Link href="/dashboard" style={{ color: '#64748b', textDecoration: 'none' }}>
          ← Kembali ke Dashboard
        </Link>
      </div>
    </div>
  )
}