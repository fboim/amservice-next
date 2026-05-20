'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function GantiPassword() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [passwordLama, setPasswordLama] = useState('')
  const [passwordBaru, setPasswordBaru] = useState('')
  const [konfirmasi, setKonfirmasi] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('ams_token') || sessionStorage.getItem('ams_token')
    const userData = localStorage.getItem('ams_user') || sessionStorage.getItem('ams_user')

    if (!token) {
      router.push('/login')
      return
    }

    if (userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (e) {
        console.error('Failed to parse user')
      }
    }
    setLoading(false)
  }, [router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!passwordLama || !passwordBaru || !konfirmasi) {
      setError('Semua field harus diisi')
      return
    }

    if (passwordBaru !== konfirmasi) {
      setError('Password baru dan konfirmasi tidak cocok')
      return
    }

    if (passwordBaru.length < 6) {
      setError('Password minimal 6 karakter')
      return
    }

    try {
      const token = localStorage.getItem('ams_token') || sessionStorage.getItem('ams_token')
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          passwordLama,
          passwordBaru
        })
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess('Password berhasil diubah')
        setPasswordLama('')
        setPasswordBaru('')
        setKonfirmasi('')
      } else {
        setError(data.error || 'Gagal mengubah password')
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--am-text-muted)' }}>
          <i className="bi bi-arrow-repeat" style={{ fontSize: '2rem', animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '8px' }}>Memuat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="section-card" style={{ maxWidth: '500px', margin: '0 auto' }}>
      <div className="card-header">
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i className="bi bi-key-fill" style={{ color: '#3b82f6' }} />
          Ganti Password
        </span>
      </div>

      <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
        {error && (
          <div style={{ padding: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#ef4444', marginBottom: '16px', fontSize: '0.875rem' }}>
            <i className="bi bi-exclamation-circle" /> {error}
          </div>
        )}

        {success && (
          <div style={{ padding: '12px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', color: '#10b981', marginBottom: '16px', fontSize: '0.875rem' }}>
            <i className="bi bi-check-circle" /> {success}
          </div>
        )}

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: '500', color: 'var(--am-text)' }}>
            Password Lama
          </label>
          <input
            type="password"
            value={passwordLama}
            onChange={(e) => setPasswordLama(e.target.value)}
            className="am-input"
            placeholder="Masukkan password lama"
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: '500', color: 'var(--am-text)' }}>
            Password Baru
          </label>
          <input
            type="password"
            value={passwordBaru}
            onChange={(e) => setPasswordBaru(e.target.value)}
            className="am-input"
            placeholder="Masukkan password baru (min. 6 karakter)"
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: '500', color: 'var(--am-text)' }}>
            Konfirmasi Password Baru
          </label>
          <input
            type="password"
            value={konfirmasi}
            onChange={(e) => setKonfirmasi(e.target.value)}
            className="am-input"
            placeholder="Ulangi password baru"
            style={{ width: '100%' }}
          />
        </div>

        <button type="submit" className="am-btn am-btn-primary" style={{ width: '100%' }}>
          <i className="bi bi-check-lg" /> Simpan Password Baru
        </button>
      </form>
    </div>
  )
}