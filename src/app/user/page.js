'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AppLayout from '@/components/AppLayout'

export default function UserManagement() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])
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
  }, [router])

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 10 })
      if (search) params.set('search', search)
      const res = await fetch(`/api/user?${params}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      })
      const data = await res.json()
      setUsers(data.users || [])
      setTotal(data.total || 0)
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus user ini?')) return

    try {
      const res = await fetch(`/api/user/${id}`, { method: 'DELETE' })
      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'Gagal menghapus user')
        return
      }

      alert('User berhasil dihapus')
      fetchUsers()
    } catch (err) {
      alert('Terjadi kesalahan')
    }
    setDeleteId(null)
  }

  const getRoleBadge = (role) => {
    const styles = {
      admin: { bg: '#6366f1', color: '#fff' },
      teknisi: { bg: '#10b981', color: '#fff' },
    }
    const style = styles[role?.toLowerCase()] || { bg: '#64748b', color: '#fff' }
    return (
      <span style={{
        padding: '4px 10px',
        borderRadius: '999px',
        fontSize: '.7rem',
        fontWeight: 600,
        background: style.bg,
        color: style.color,
        textTransform: 'uppercase'
      }}>
        {role}
      </span>
    )
  }

  const totalPages = Math.ceil(total / 10)

  if (loading) {
    return (
      <AppLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
          <div style={{ textAlign: 'center', color: 'var(--am-text-muted)' }}>
            <i className="bi bi-arrow-repeat" style={{ fontSize: '2rem', animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: '8px' }}>Memuat...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      {/* Search */}
      <div className="section-card" style={{ marginBottom: '20px', padding: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Cari username..."
            className="am-input"
            style={{ maxWidth: 350, flex: 1 }}
          />
          <button
            onClick={() => { setPage(1); fetchUsers() }}
            className="am-btn am-btn-primary"
            style={{ padding: '10px 16px' }}
          >
            <i className="bi bi-search" /> Cari
          </button>
          <Link href="/user/tambah" className="am-btn am-btn-primary am-btn-pill" style={{ boxShadow: '0 2px 10px rgba(59,130,246,.25)' }}>
            <i className="bi bi-person-plus" /> Tambah
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="section-card" style={{ overflow: 'hidden' }}>
        {users.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="am-table">
              <thead>
                <tr>
                  <th style={{ width: '50px', textAlign: 'center' }}>#</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Tanggal Dibuat</th>
                  <th style={{ width: '100px', textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, i) => (
                  <tr key={user.id}>
                    <td style={{ textAlign: 'center', fontSize: '.75rem', color: 'var(--am-text-muted)', fontWeight: 700 }}>
                      {(page - 1) * 10 + i + 1}
                    </td>
                    <td style={{ fontWeight: 600 }}>{user.username}</td>
                    <td>{getRoleBadge(user.role)}</td>
                    <td style={{ color: 'var(--am-text-muted)', fontSize: '.8rem' }}>
                      {new Date(user.created_at).toLocaleDateString('id-ID', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                        <Link href={`/user/edit/${user.id}`} className="btn-act btn-act-blue" title="Edit">
                          <i className="bi bi-pencil" />
                        </Link>
                        <button
                          onClick={() => setDeleteId(user.id)}
                          className="btn-act btn-act-red"
                          title="Hapus"
                        >
                          <i className="bi bi-trash" />
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
            <i className="bi bi-people" style={{ fontSize: '2.5rem', display: 'block', marginBottom: '.5rem', opacity: 0.3 }} />
            {search ? 'User tidak ditemukan' : 'Belum ada data user'}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ padding: '16px', borderTop: '1px solid var(--am-border)', display: 'flex', justifyContent: 'center', gap: '4px' }}>
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
                <span key={p}>
                  {idx > 0 && arr[idx - 1] !== p - 1 && <span style={{ padding: '8px 4px', color: 'var(--am-text-muted)' }}>...</span>}
                  <button
                    onClick={() => setPage(p)}
                    className={`am-btn ${page === p ? 'am-btn-primary' : 'am-btn-secondary'}`}
                    style={{ padding: '8px 14px', fontSize: '.875rem', minWidth: '40px' }}
                  >
                    {p}
                  </button>
                </span>
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

      {/* Delete Modal */}
      {deleteId && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 200
        }}>
          <div style={{
            background: 'var(--am-surface)', padding: '2rem', borderRadius: '16px',
            maxWidth: 400, width: '90%', border: '1px solid var(--am-border)'
          }}>
            <h4 style={{ color: 'var(--am-text)', marginBottom: '1rem', fontWeight: '700' }}>
              <i className="bi bi-exclamation-triangle" style={{ color: '#ef4444', marginRight: 8 }} />
              Konfirmasi Hapus
            </h4>
            <p style={{ color: 'var(--am-text-muted)', marginBottom: '1.5rem' }}>
              Apakah Anda yakin ingin menghapus user ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => setDeleteId(null)} className="am-btn am-btn-secondary">
                Batal
              </button>
              <button onClick={() => handleDelete(deleteId)} className="am-btn" style={{ background: '#ef4444', color: '#fff' }}>
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}