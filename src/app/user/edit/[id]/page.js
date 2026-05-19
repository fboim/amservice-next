'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import AppLayout from '@/components/AppLayout'

export default function EditUser() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    konfirmasi_password: '',
    role: 'teknisi'
  })
  const [error, setError] = useState('')

  useEffect(() => {
    const token = sessionStorage.getItem('ams_token') || localStorage.getItem('ams_token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchUser()
  }, [router])

  const fetchUser = async () => {
    try {
      const res = await fetch(`/api/user/${params.id}`)
      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'User tidak ditemukan')
        router.push('/user')
        return
      }

      setFormData({
        username: data.user?.username || '',
        password: '',
        konfirmasi_password: '',
        role: data.user?.role || 'teknisi'
      })
    } catch (err) {
      alert('Terjadi kesalahan')
      router.push('/user')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.username) {
      setError('Username wajib diisi')
      return
    }

    if (formData.password && formData.password.length < 6) {
      setError('Password minimal 6 karakter')
      return
    }

    if (formData.password !== formData.konfirmasi_password) {
      setError('Password tidak cocok')
      return
    }

    setSaving(true)

    try {
      const payload = { username: formData.username, role: formData.role }
      if (formData.password) {
        payload.password = formData.password
      }

      const res = await fetch(`/api/user/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Gagal mengupdate user')
        return
      }

      alert('User berhasil diupdate')
      router.push('/user')
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setSaving(false)
    }
  }

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
              <i className="bi bi-pencil" style={{ color: '#6366f1', marginRight: 8 }} />
              Edit User
            </h4>
            <p className="pg-subtitle">Edit data user</p>
          </div>
        </div>

        {/* Form */}
        <div className="section-card" style={{ maxWidth: 500 }}>
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{
                padding: '12px 16px', background: 'rgba(239,68,68,0.1)',
                border: '1px solid #ef4444', borderRadius: 8, marginBottom: '1.5rem',
                color: '#ef4444', fontSize: '.875rem'
              }}>
                <i className="bi bi-exclamation-circle" style={{ marginRight: 8 }} />
                {error}
              </div>
            )}

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '.85rem', marginBottom: 6 }}>
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="am-input"
                placeholder="Masukkan username"
                required
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '.85rem', marginBottom: 6 }}>
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="am-input"
                style={{ cursor: 'pointer' }}
              >
                <option value="teknisi">Teknisi</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '.85rem', marginBottom: 6 }}>
                Password Baru <span style={{ color: '#64748b', fontSize: '.75rem' }}>(kosongkan jika tidak diubah)</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="am-input"
                placeholder="Minimal 6 karakter"
              />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '.85rem', marginBottom: 6 }}>
                Konfirmasi Password <span style={{ color: '#64748b', fontSize: '.75rem' }}>(kosongkan jika tidak diubah)</span>
              </label>
              <input
                type="password"
                name="konfirmasi_password"
                value={formData.konfirmasi_password}
                onChange={handleChange}
                className="am-input"
                placeholder="Ulangi password baru"
              />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="submit"
                disabled={saving}
                className="am-btn am-btn-primary"
                style={{ flex: 1 }}
              >
                {saving ? (
                  <>
                    <span className="spinner" style={{ width: 16, height: 16, marginRight: 8 }} />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle" style={{ marginRight: 8 }} />
                    Simpan
                  </>
                )}
              </button>
              <Link href="/user" className="am-btn" style={{
                flex: 1, textAlign: 'center', background: '#334155', color: '#fff',
                textDecoration: 'none', display: 'inline-block', lineHeight: '38px'
              }}>
                Batal
              </Link>
            </div>
          </form>
        </div>

        {/* Back link */}
        <div style={{ marginTop: '2rem' }}>
          <Link href="/user" style={{
            color: '#64748b', textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center', gap: 8
          }}>
            <i className="bi bi-arrow-left" />
            Kembali ke Manajemen User
          </Link>
        </div>
      </div>
    </AppLayout>
  )
}