'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Login() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    remember: false
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Login gagal')
      }

      // Save to localStorage
      if (formData.remember) {
        localStorage.setItem('ams_token', data.token)
      }
      sessionStorage.setItem('ams_token', data.token)
      sessionStorage.setItem('ams_user', JSON.stringify(data.user))

      router.push('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: '#07070f'
    }}>
      <div style={{
        width: '100%',
        maxWidth: 400,
        background: 'rgba(255,255,255,.04)',
        border: '1px solid rgba(255,255,255,.07)',
        borderRadius: 20,
        padding: '2.5rem'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 72, height: 72, margin: '0 auto 1rem',
            borderRadius: '50%',
            padding: 3,
            background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
            boxShadow: '0 0 0 6px rgba(59,130,246,.1)'
          }}>
            <img src="/logo_am.png" alt="Logo" style={{
              width: '100%', height: '100%',
              borderRadius: '50%', background: '#fff',
              objectFit: 'contain', padding: 8, display: 'block'
            }} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: 0 }}>AM SERVICE</h1>
          <p style={{ fontSize: '.875rem', color: '#64748b', marginTop: '.5rem' }}>Masuk ke dashboard</p>
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,.15)',
            border: '1px solid rgba(239,68,68,.3)',
            borderRadius: 10,
            padding: '12px 16px',
            marginBottom: '1rem',
            color: '#ef4444',
            fontSize: '.875rem'
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{
              display: 'block', fontSize: '.8rem', fontWeight: 600,
              color: '#94a3b8', marginBottom: '.5rem'
            }}>
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
              style={{ background: 'rgba(0,0,0,.3)', border: '1px solid #334155' }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block', fontSize: '.8rem', fontWeight: 600,
              color: '#94a3b8', marginBottom: '.5rem'
            }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="am-input"
              placeholder="Masukkan password"
              required
              style={{ background: 'rgba(0,0,0,.3)', border: '1px solid #334155' }}
            />
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: '.5rem',
            marginBottom: '1.5rem'
          }}>
            <input
              type="checkbox"
              name="remember"
              checked={formData.remember}
              onChange={handleChange}
              id="remember"
              style={{ width: 18, height: 18, cursor: 'pointer' }}
            />
            <label htmlFor="remember" style={{ fontSize: '.875rem', color: '#94a3b8', cursor: 'pointer' }}>
              Ingat saya
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? '#64748b' : 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
              border: 'none',
              borderRadius: 10,
              color: '#fff',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all .2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '.75rem'
            }}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: 20, height: 20 }} />
                Memproses...
              </>
            ) : (
              <>
                <i className="bi bi-box-arrow-in-right" />
                Masuk
              </>
            )}
          </button>
        </form>

        {/* Back link */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link href="/" style={{
            color: '#64748b',
            fontSize: '.875rem',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '.5rem'
          }}>
            <i className="bi bi-arrow-left" />
            Kembali ke beranda
          </Link>
        </div>
      </div>
    </div>
  )
}