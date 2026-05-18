'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: '#07070f', position: 'relative', overflow: 'hidden' }}>
      {/* Background glow */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: `
          radial-gradient(ellipse 70% 50% at 20% 15%, rgba(59,130,246,.18) 0%, transparent 60%),
          radial-gradient(ellipse 60% 55% at 80% 80%, rgba(99,102,241,.14) 0%, transparent 60%),
          radial-gradient(ellipse 50% 40% at 50% 110%, rgba(16,185,129,.09) 0%, transparent 55%)
        `,
        animation: 'glowShift 10s ease-in-out infinite alternate'
      }} />

      {/* Dot grid */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(rgba(255,255,255,.045) 1px, transparent 1px)',
        backgroundSize: '28px 28px'
      }} />

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 1,
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '3rem 1.5rem 2rem', gap: 0
      }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem', animation: 'riseIn .65s cubic-bezier(.22,1,.36,1) both' }}>
          <div style={{
            width: 92, height: 92, margin: '0 auto 1.5rem',
            borderRadius: '50%',
            padding: 3,
            background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
            boxShadow: '0 0 0 8px rgba(59,130,246,.1), 0 0 32px rgba(99,102,241,.25)'
          }}>
            <img src="/logo_am.png" alt="Logo" style={{
              width: '100%', height: '100%',
              borderRadius: '50%',
              background: '#fff',
              objectFit: 'contain',
              padding: 10, display: 'block'
            }} />
          </div>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            fontSize: 13, fontWeight: 700, letterSpacing: '.22em',
            textTransform: 'uppercase', color: '#60a5fa',
            marginBottom: '1rem'
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: '#22c55e',
              boxShadow: '0 0 0 0 rgba(34,197,94,.5)',
              animation: 'pulse 2s ease-in-out infinite'
            }} />
            Servis Online
          </div>

          <h1 style={{
            fontSize: 'clamp(1.9rem, 6.5vw, 3.25rem)',
            fontWeight: 900, letterSpacing: '-.025em', lineHeight: 1.1,
            color: '#fff', marginBottom: '.75rem'
          }}>
            AM SERVICE<br />
            <span style={{
              background: 'linear-gradient(90deg, #60a5fa 0%, #a78bfa 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>
              Repair Center
            </span>
          </h1>

          <p style={{
            fontSize: '.88rem', color: '#64748b', lineHeight: 1.75,
            maxWidth: 320, margin: '0 auto'
          }}>
            Solusi cepat & terpercaya untuk perbaikan smartphone dan gadget Anda
          </p>
        </div>

        {/* Cards */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.875rem',
          width: '100%', maxWidth: 400, animation: 'riseIn .65s .14s cubic-bezier(.22,1,.36,1) both'
        }}>
          <Link href="/cek-servis" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            textAlign: 'center', padding: '1.6rem 1.2rem 1.4rem',
            borderRadius: 20,
            background: 'rgba(255,255,255,.04)',
            border: '1px solid rgba(255,255,255,.07)',
            textDecoration: 'none',
            transition: 'transform .22s ease, border-color .22s ease, box-shadow .22s ease'
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.4rem', marginBottom: '.9rem',
              background: 'rgba(59,130,246,.14)', color: '#60a5fa'
            }}>
              <i className="bi bi-search" />
            </div>
            <h3 style={{ fontSize: '.82rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '.35rem' }}>Cek Status Servis</h3>
            <p style={{ fontSize: '.71rem', color: '#475569', lineHeight: 1.65 }}>Pantau progres via nomor nota atau scan QR</p>
          </Link>

          <a href="https://wa.me/6281234567890?text=Halo%20AM%20Service%2C%20saya%20ingin%20konsultasi%20servis%20HP" target="_blank" rel="noopener noreferrer" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            textAlign: 'center', padding: '1.6rem 1.2rem 1.4rem',
            borderRadius: 20,
            background: 'rgba(255,255,255,.04)',
            border: '1px solid rgba(255,255,255,.07)',
            textDecoration: 'none',
            transition: 'transform .22s ease, border-color .22s ease, box-shadow .22s ease'
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.4rem', marginBottom: '.9rem',
              background: 'rgba(16,185,129,.14)', color: '#34d399'
            }}>
              <i className="bi bi-whatsapp" />
            </div>
            <h3 style={{ fontSize: '.82rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '.35rem' }}>Hubungi Teknisi</h3>
            <p style={{ fontSize: '.71rem', color: '#475569', lineHeight: 1.65 }}>Konsultasi langsung via WhatsApp resmi kami</p>
          </a>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '2.25rem', textAlign: 'center', animation: 'riseIn .65s .28s cubic-bezier(.22,1,.36,1) both' }}>
          <p style={{ fontSize: '.7rem', color: '#1e293b', marginBottom: '.65rem' }}>
            © {new Date().getFullYear()} <strong style={{ color: '#334155' }}>AM SERVICE</strong>
          </p>
          <Link href="/login" style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            fontSize: '.68rem', fontWeight: 600, letterSpacing: '.04em',
            color: '#334155',
            background: 'rgba(255,255,255,.03)',
            border: '1px solid rgba(255,255,255,.07)',
            padding: '.38rem .9rem',
            borderRadius: 999,
            textDecoration: 'none',
            transition: 'all .2s'
          }}>
            <i className="bi bi-lock-fill" /> Area Staf
          </Link>
        </div>
      </div>

      <style jsx global>{`
        @keyframes glowShift {
          from { opacity: 1; }
          to { opacity: 0.75; transform: scale(1.04) translateY(-1%); }
        }
        @keyframes riseIn {
          from { opacity: 0; transform: translateY(28px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,.5); }
          50% { box-shadow: 0 0 0 6px rgba(34,197,94,0); }
        }
      `}</style>
    </div>
  )
}