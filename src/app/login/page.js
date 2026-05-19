'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Login() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
    <div className="login-page">
      {/* Animated background */}
      <div className="login-bg">
        <div className="login-gradient login-gradient-1" />
        <div className="login-gradient login-gradient-2" />
        <div className="login-gradient login-gradient-3" />
        <div className="login-grid" />
      </div>

      {/* Floating particles */}
      <div className="login-particles">
        {[...Array(8)].map((_, i) => (
          <div key={i} className={`login-particle login-particle-${i + 1}`} />
        ))}
      </div>

      {/* Login Card */}
      <div className="login-card">
        {/* Logo & Header */}
        <div className="login-header">
          <div className="login-logo-wrapper">
            <div className="login-logo-glow" />
            <div className="login-logo">
              <img src="/logo_am.png" alt="AM Service" />
            </div>
          </div>
          <div className="login-badge">
            <span className="login-badge-dot" />
            Staff Portal
          </div>
          <h1 className="login-title">AM SERVICE</h1>
          <p className="login-subtitle">Masuk ke dashboard manajemen</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="login-error">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label className="login-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="login-input"
              placeholder="Ketik username Anda"
              required
              autoComplete="username"
            />
          </div>

          <div className="login-field">
            <label className="login-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Password
            </label>
            <div className="login-password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="login-input login-input-password"
                placeholder="Ketik password Anda"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Sembunyikan' : 'Tampilkan'}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="login-remember">
            <label className="login-checkbox-label">
              <input
                type="checkbox"
                name="remember"
                checked={formData.remember}
                onChange={handleChange}
                className="login-checkbox"
              />
              <span className="login-checkbox-custom" />
              <span>Ingat saya</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="login-submit"
          >
            {loading ? (
              <>
                <span className="login-spinner" />
                Memproses...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
                Masuk
              </>
            )}
          </button>
        </form>

        {/* Back link */}
        <div className="login-footer">
          <Link href="/" className="login-back">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Kembali ke beranda
          </Link>
        </div>
      </div>

      <style jsx global>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          position: relative;
          overflow: hidden;
        }

        /* Background */
        .login-bg {
          position: fixed;
          inset: 0;
          z-index: 0;
          background: #07070f;
        }

        .login-gradient {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.4;
        }

        .login-gradient-1 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%);
          top: -150px;
          left: -100px;
        }

        .login-gradient-2 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%);
          bottom: -100px;
          right: -50px;
        }

        .login-gradient-3 {
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .login-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        /* Particles */
        .login-particles {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 1;
        }

        .login-particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: rgba(59, 130, 246, 0.5);
          border-radius: 50%;
          animation: loginFloat 20s ease-in-out infinite;
        }

        .login-particle-1 { top: 15%; left: 10%; animation-delay: 0s; }
        .login-particle-2 { top: 40%; left: 85%; animation-delay: 3s; background: rgba(99, 102, 241, 0.5); }
        .login-particle-3 { top: 70%; left: 25%; animation-delay: 6s; }
        .login-particle-4 { top: 25%; left: 70%; animation-delay: 9s; background: rgba(16, 185, 129, 0.5); }
        .login-particle-5 { top: 80%; left: 60%; animation-delay: 12s; }
        .login-particle-6 { top: 50%; left: 40%; animation-delay: 15s; background: rgba(167, 139, 250, 0.5); }
        .login-particle-7 { top: 10%; left: 50%; animation-delay: 2s; }
        .login-particle-8 { top: 90%; left: 15%; animation-delay: 8s; background: rgba(59, 130, 246, 0.5); }

        @keyframes loginFloat {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.5; }
          50% { transform: translateY(-30px) scale(1.5); opacity: 1; }
        }

        /* Login Card */
        .login-card {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 420px;
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2.5rem 2rem;
          animation: loginCardIn 0.6s ease-out;
        }

        @keyframes loginCardIn {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* Header */
        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .login-logo-wrapper {
          position: relative;
          width: 80px;
          height: 80px;
          margin: 0 auto 1rem;
        }

        .login-logo-glow {
          position: absolute;
          inset: -15px;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.4), rgba(99, 102, 241, 0.4));
          border-radius: 50%;
          filter: blur(20px);
          animation: loginPulse 3s ease-in-out infinite;
        }

        @keyframes loginPulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }

        .login-logo {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          padding: 4px;
          background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15), 0 8px 32px rgba(99, 102, 241, 0.3);
        }

        .login-logo img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: #fff;
          object-fit: contain;
          padding: 10px;
        }

        .login-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: .7rem;
          font-weight: 700;
          letter-spacing: .1em;
          text-transform: uppercase;
          color: #60a5fa;
          padding: 6px 14px;
          background: rgba(59, 130, 246, 0.1);
          border-radius: 999px;
          border: 1px solid rgba(59, 130, 246, 0.2);
          margin-bottom: 1rem;
        }

        .login-badge-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.6);
          animation: loginPulseDot 2s ease-in-out infinite;
        }

        @keyframes loginPulseDot {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.6); }
          50% { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
        }

        .login-title {
          font-size: 1.75rem;
          font-weight: 900;
          letter-spacing: -.02em;
          color: #fff;
          margin: 0 0 .5rem;
        }

        .login-subtitle {
          font-size: .85rem;
          color: #64748b;
          margin: 0;
        }

        /* Error */
        .login-error {
          display: flex;
          align-items: center;
          gap: .75rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 12px;
          padding: 14px 16px;
          margin-bottom: 1.5rem;
          color: #ef4444;
          font-size: .85rem;
          font-weight: 500;
          animation: loginShake 0.4s ease-out;
        }

        @keyframes loginShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        /* Form */
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .login-field {
          display: flex;
          flex-direction: column;
          gap: .5rem;
        }

        .login-label {
          display: flex;
          align-items: center;
          gap: .5rem;
          font-size: .8rem;
          font-weight: 600;
          color: #94a3b8;
        }

        .login-input {
          width: 100%;
          padding: 14px 16px;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: #fff;
          font-size: .9rem;
          transition: all 0.2s;
        }

        .login-input:focus {
          outline: none;
          border-color: rgba(59, 130, 246, 0.5);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }

        .login-input::placeholder {
          color: #475569;
        }

        .login-password-wrapper {
          position: relative;
        }

        .login-input-password {
          padding-right: 50px;
        }

        .login-password-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }

        .login-password-toggle:hover {
          color: #94a3b8;
        }

        /* Remember */
        .login-remember {
          display: flex;
          align-items: center;
        }

        .login-checkbox-label {
          display: flex;
          align-items: center;
          gap: .75rem;
          cursor: pointer;
          font-size: .85rem;
          color: #94a3b8;
          user-select: none;
        }

        .login-checkbox {
          display: none;
        }

        .login-checkbox-custom {
          width: 20px;
          height: 20px;
          border: 2px solid #334155;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          position: relative;
        }

        .login-checkbox-custom::after {
          content: '';
          width: 10px;
          height: 6px;
          border: 2px solid transparent;
          border-top: none;
          border-right: none;
          transform: rotate(-45deg) translateY(-1px);
          transition: all 0.2s;
        }

        .login-checkbox:checked + .login-checkbox-custom {
          background: #3b82f6;
          border-color: #3b82f6;
        }

        .login-checkbox:checked + .login-checkbox-custom::after {
          border-color: #fff;
        }

        /* Submit */
        .login-submit {
          width: 100%;
          padding: 14px 24px;
          background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
          border: none;
          border-radius: 12px;
          color: #fff;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: .75rem;
          transition: all 0.2s;
          margin-top: .5rem;
        }

        .login-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
        }

        .login-submit:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .login-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: loginSpin 0.8s linear infinite;
        }

        @keyframes loginSpin {
          to { transform: rotate(360deg); }
        }

        /* Footer */
        .login-footer {
          text-align: center;
          margin-top: 1.75rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .login-back {
          display: inline-flex;
          align-items: center;
          gap: .5rem;
          color: #64748b;
          font-size: .85rem;
          text-decoration: none;
          transition: all 0.2s;
          padding: 8px 16px;
          border-radius: 8px;
        }

        .login-back:hover {
          color: #94a3b8;
          background: rgba(255, 255, 255, 0.05);
        }

        /* Responsive */
        @media (max-width: 480px) {
          .login-card {
            padding: 2rem 1.5rem;
            border-radius: 20px;
          }

          .login-logo-wrapper {
            width: 64px;
            height: 64px;
          }

          .login-title {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  )
}