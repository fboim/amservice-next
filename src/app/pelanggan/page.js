'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AppLayout from '@/components/AppLayout'

export default function PelangganManagement() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [pelanggan, setPelanggan] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState(null)

  useEffect(() => {
    const token = sessionStorage.getItem('ams_token') || localStorage.getItem('ams_token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchPelanggan()
  }, [page, search])

  const fetchPelanggan = async () => {
    try {
      const params = new URLSearchParams({ page, limit: 15, search })
      const res = await fetch(`/api/pelanggan?${params}`)
      const data = await res.json()
      setPelanggan(data.pelanggan || [])
      setTotal(data.total || 0)
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus pelanggan ini?')) return

    try {
      const res = await fetch(`/api/pelanggan/${id}`, { method: 'DELETE' })
      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'Gagal menghapus pelanggan')
        return
      }

      alert('Pelanggan berhasil dihapus')
      fetchPelanggan()
    } catch (err) {
      alert('Terjadi kesalahan')
    }
    setDeleteId(null)
  }

  const formatHP = (hp) => {
    if (!hp) return '-'
    if (hp.startsWith('0')) return hp
    if (hp.startsWith('62')) return '0' + hp.substring(2)
    return hp
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
              <i className="bi bi-people" style={{ color: '#10b981', marginRight: 8 }} />
              Manajemen Pelanggan
            </h4>
            <p className="pg-subtitle">Total: {total} pelanggan</p>
          </div>
          <Link href="/pelanggan/tambah" className="am-btn am-btn-primary am-btn-pill am-btn-sm">
            <i className="bi bi-person-plus" />
            Tambah Pelanggan
          </Link>
        </div>

        {/* Search */}
        <div style={{ marginBottom: '1.5rem' }}>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Cari nama atau No. HP..."
            className="am-input"
            style={{ maxWidth: 400 }}
          />
        </div>

        {/* Table */}
        <div className="section-card">
          {pelanggan.length > 0 ? (
            <table className="am-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama</th>
                  <th>No. HP</th>
                  <th>Alamat</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pelanggan.map((p, i) => (
                  <tr key={p.id}>
                    <td style={{ color: '#64748b', fontSize: '.75rem', fontWeight: 700 }}>
                      {(page - 1) * 15 + i + 1}
                    </td>
                    <td style={{ fontWeight: 600 }}>{p.nama_pelanggan}</td>
                    <td>
                      <a href={`https://wa.me/${p.no_hp?.replace(/^0/, '62')}`} target="_blank" rel="noopener noreferrer" style={{ color: '#10b981', textDecoration: 'none' }}>
                        {p.no_hp} <i className="bi bi-whatsapp" style={{ fontSize: '0.9rem' }} />
                      </a>
                    </td>
                    <td style={{ color: '#64748b', fontSize: '.85rem' }}>{p.alamat || '-'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Link href={`/pelanggan/edit/${p.id}`} style={{
                          padding: '6px 12px', borderRadius: 6,
                          background: 'transparent', border: '1px solid #3b82f6',
                          color: '#3b82f6', fontSize: '.75rem', textDecoration: 'none'
                        }}>
                          <i className="bi bi-pencil" />
                        </Link>
                        <button
                          onClick={() => setDeleteId(p.id)}
                          style={{
                            padding: '6px 12px', borderRadius: 6,
                            background: 'transparent', border: '1px solid #ef4444',
                            color: '#ef4444', fontSize: '.75rem', cursor: 'pointer'
                          }}
                        >
                          <i className="bi bi-trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
              <i className="bi bi-people" style={{ fontSize: '2.5rem', display: 'block', marginBottom: '.5rem', opacity: 0.3 }} />
              {search ? 'Pelanggan tidak ditemukan' : 'Belum ada data pelanggan'}
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

        {/* Delete Modal */}
        {deleteId && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 200
          }}>
            <div style={{
              background: '#1e293b', padding: '2rem', borderRadius: 16,
              maxWidth: 400, width: '90%'
            }}>
              <h4 style={{ color: '#fff', marginBottom: '1rem' }}>
                <i className="bi bi-exclamation-triangle" style={{ color: '#ef4444', marginRight: 8 }} />
                Konfirmasi Hapus
              </h4>
              <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
                Apakah Anda yakin ingin menghapus pelanggan ini?
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setDeleteId(null)}
                  style={{
                    padding: '10px 20px', borderRadius: 8, background: '#334155',
                    color: '#fff', border: 'none', cursor: 'pointer'
                  }}
                >
                  Batal
                </button>
                <button
                  onClick={() => handleDelete(deleteId)}
                  style={{
                    padding: '10px 20px', borderRadius: 8, background: '#ef4444',
                    color: '#fff', border: 'none', cursor: 'pointer'
                  }}
                >
                  Hapus
                </button>
              </div>
            </div>
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