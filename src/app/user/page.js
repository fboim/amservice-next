'use client'

import { useState, useEffect } from 'react'
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
    fetchUsers()
  }, [page, search])

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams({ page, limit: 10, search })
      const res = await fetch(`/api/user?${params}`)
      const data = await res.json()
      setUsers(data.users || [])
      setTotal(data.total || 0)
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

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
    const style = styles[role] || { bg: '#64748b', color: '#fff' }
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
              <i className="bi bi-people" style={{ color: '#6366f1', marginRight: 8 }} />
              Manajemen User
            </h4>
            <p className="pg-subtitle">Total: {total} user</p>
          </div>
          <Link href="/user/tambah" className="am-btn am-btn-primary am-btn-pill am-btn-sm">
            <i className="bi bi-person-plus" />
            Tambah User
          </Link>
        </div>

        {/* Search */}
        <div style={{ marginBottom: '1.5rem' }}>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Cari username..."
            className="am-input"
            style={{ maxWidth: 400 }}
          />
        </div>

        {/* Table */}
        <div className="section-card">
          {users.length > 0 ? (
            <table className="am-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Tanggal Dibuat</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, i) => (
                  <tr key={user.id}>
                    <td style={{ color: '#64748b', fontSize: '.75rem', fontWeight: 700 }}>
                      {(page - 1) * 10 + i + 1}
                    </td>
                    <td style={{ fontWeight: 600 }}>{user.username}</td>
                    <td>{getRoleBadge(user.role)}</td>
                    <td style={{ color: '#64748b', fontSize: '.85rem' }}>
                      {new Date(user.created_at).toLocaleDateString('id-ID', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Link href={`/user/edit/${user.id}`} style={{
                          padding: '6px 12px', borderRadius: 6,
                          background: 'transparent', border: '1px solid #3b82f6',
                          color: '#3b82f6', fontSize: '.75rem', textDecoration: 'none'
                        }}>
                          <i className="bi bi-pencil" />
                        </Link>
                        <button
                          onClick={() => setDeleteId(user.id)}
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
              {search ? 'User tidak ditemukan' : 'Belum ada data user'}
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
                Apakah Anda yakin ingin menghapus user ini? Tindakan ini tidak dapat dibatalkan.
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