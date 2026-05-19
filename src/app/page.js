'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Home() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(true)
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#07070f', position: 'relative', overflow: 'hidden' }}>
      {/* Animated background */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: `
          radial-gradient(ellipse 80% 60% at 20% 10%, rgba(59,130,246,.2) 0%, transparent 50%),
          radial-gradient(ellipse 70% 50% at 80% 85%, rgba(99,102,241,.18) 0%, transparent 50%),
          radial-gradient(ellipse 60% 40% at 50% 100%, rgba(16,185,129,.1) 0%, transparent 50%)
        `,
      }} />

      {/* Floating particles */}
      <div className="particles">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`particle particle-${i + 1}`} />
        ))}
      </div>

      {/* Dot grid */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(rgba(255,255,255,.03) 1px, transparent 1px)',
        backgroundSize: '32px 32px'
      }} />

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 1,
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center',
        padding: '2rem 1rem 2rem',
        gap: 0
      }}>
        {/* Hero Section */}
        <div style={{
          textAlign: 'center',
          marginBottom: '2rem',
          paddingTop: '1rem',
          animation: loaded ? 'fadeInUp 0.8s ease-out' : 'none',
          opacity: loaded ? 1 : 0
        }}>
          {/* Logo with glow effect */}
          <div style={{
            position: 'relative',
            display: 'inline-block',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              position: 'absolute', inset: '-10px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(59,130,246,.3), rgba(99,102,241,.3))',
              filter: 'blur(20px)',
              animation: 'pulseGlow 3s ease-in-out infinite'
            }} />
            <div style={{
              width: 88, height: 88,
              margin: '0 auto',
              borderRadius: '50%',
              padding: 3,
              background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
              boxShadow: '0 0 0 6px rgba(59,130,246,.15), 0 8px 32px rgba(99,102,241,.3)',
              position: 'relative',
              zIndex: 1
            }}>
              <img src="/logo_am.png" alt="Logo" style={{
                width: '100%', height: '100%',
                borderRadius: '50%',
                background: '#fff',
                objectFit: 'contain',
                padding: 8, display: 'block'
              }} />
            </div>
          </div>

          {/* Status badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            fontSize: 12, fontWeight: 700, letterSpacing: '.15em',
            textTransform: 'uppercase', color: '#60a5fa',
            marginBottom: '1.25rem',
            padding: '6px 14px',
            background: 'rgba(59,130,246,.1)',
            borderRadius: 999,
            border: '1px solid rgba(59,130,246,.2)'
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: '#22c55e',
              boxShadow: '0 0 0 0 rgba(34,197,94,.6)',
              animation: 'pulseDot 2s ease-in-out infinite'
            }} />
            Servis Online
          </div>

          <h1 style={{
            fontSize: 'clamp(2rem, 7vw, 3.5rem)',
            fontWeight: 900, letterSpacing: '-.03em', lineHeight: 1.05,
            color: '#fff', marginBottom: '.6rem'
          }}>
            AM SERVICE
            <span style={{
              display: 'block',
              background: 'linear-gradient(90deg, #60a5fa 0%, #a78bfa 50%, #60a5fa 100%)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              animation: 'shimmer 3s linear infinite'
            }}>
              Repair Center
            </span>
          </h1>

          <p style={{
            fontSize: '.92rem', color: '#64748b', lineHeight: 1.7,
            maxWidth: 340, margin: '0 auto',
            fontWeight: 500
          }}>
            Solusi cepat & terpercaya untuk perbaikan smartphone dan gadget Anda
          </p>
        </div>

        {/* Action Cards */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem',
          width: '100%', maxWidth: 420,
          animation: loaded ? 'fadeInUp 0.8s .15s ease-out both' : 'none',
          opacity: loaded ? 1 : 0
        }}>
          <Link href="/cek-servis" className="action-card" style={{
            '--hover-color': 'rgba(59,130,246,.15)'
          }}>
            <div className="action-icon" style={{
              background: 'rgba(59,130,246,.15)',
              color: '#60a5fa'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
            <h3>Cek Status Servis</h3>
            <p>Pantau progres via nomor nota atau scan QR</p>
          </Link>

          <a href="https://wa.me/6281234567890?text=Halo%20AM%20Service%2C%20saya%20ingin%20konsultasi%20servis%20HP" target="_blank" rel="noopener noreferrer" className="action-card" style={{
            '--hover-color': 'rgba(16,185,129,.15)'
          }}>
            <div className="action-icon" style={{
              background: 'rgba(16,185,129,.15)',
              color: '#34d399'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>
            <h3>Hubungi via WA</h3>
            <p>Konsultasi langsung via WhatsApp resmi</p>
          </a>
        </div>

        {/* Map Section */}
        <div style={{
          width: '100%', maxWidth: 500,
          marginTop: '2rem',
          animation: loaded ? 'fadeInUp 0.8s .3s ease-out both' : 'none',
          opacity: loaded ? 1 : 0
        }}>
          <div className="map-container">
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: '1rem', padding: '0 .25rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'rgba(239,68,68,.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#ef4444'
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <div>
                  <h4 style={{ fontSize: '.85rem', fontWeight: 700, color: '#e2e8f0', margin: 0 }}>Lokasi Toko</h4>
                  <p style={{ fontSize: '.7rem', color: '#64748b', margin: '2px 0 0' }}>AM Service Kulon Progo</p>
                </div>
              </div>
              <a href="https://maps.app.goo.gl/guMs3ZtSFCjt5TJb8" target="_blank" rel="noopener noreferrer" className="map-link">
                Buka di Maps
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </a>
            </div>

            <div style={{
              width: '100%',
              borderRadius: 16,
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,.08)',
              boxShadow: '0 8px 32px rgba(0,0,0,.3)'
            }}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3952.576765656847!2d110.14314!3d-7.895063!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7afdf184adb42d%3A0x8dbf1eed34d2516c!2sSERVICE%20HP%20KULON%20PROGO%20%7C%20AM%20SERVICE!5e0!3m2!1sen!2sid!4v1700000000000!5m2!1sen!2sid"
                width="100%"
                height="200"
                style={{ border: 0, display: 'block' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <div style={{
              display: 'flex', gap: '1rem', marginTop: '1rem',
              padding: '0 .25rem'
            }}>
              <div className="info-chip">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                <span>Buka Setiap Hari</span>
              </div>
              <div className="info-chip">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <span>0812-3456-7890</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: 'auto',
          paddingTop: '2.5rem',
          textAlign: 'center',
          animation: loaded ? 'fadeInUp 0.8s .45s ease-out both' : 'none',
          opacity: loaded ? 1 : 0
        }}>
          <Link href="/login" className="staff-link">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Area Staf
          </Link>
          <p style={{
            fontSize: '.68rem', color: '#334155',
            marginTop: '1.25rem'
          }}>
            © {new Date().getFullYear()} <strong style={{ color: '#475569' }}>AM SERVICE</strong> • Kulon Progo
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulseGlow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }

        @keyframes pulseDot {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,.6); }
          50% { box-shadow: 0 0 0 8px rgba(34,197,94,0); }
        }

        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        /* Particles */
        .particles {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }

        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: rgba(59,130,246,.4);
          border-radius: 50%;
          animation: float 15s ease-in-out infinite;
        }

        .particle-1 { top: 20%; left: 10%; animation-delay: 0s; }
        .particle-2 { top: 60%; left: 85%; animation-delay: 2s; background: rgba(99,102,241,.4); }
        .particle-3 { top: 80%; left: 20%; animation-delay: 4s; }
        .particle-4 { top: 30%; left: 75%; animation-delay: 6s; background: rgba(16,185,129,.4); }
        .particle-5 { top: 50%; left: 50%; animation-delay: 8s; }
        .particle-6 { top: 15%; left: 60%; animation-delay: 10s; background: rgba(167,139,250,.4); }

        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: .4; }
          25% { transform: translateY(-20px) rotate(90deg); opacity: .8; }
          50% { transform: translateY(-40px) rotate(180deg); opacity: .4; }
          75% { transform: translateY(-20px) rotate(270deg); opacity: .8; }
        }

        /* Action Cards */
        .action-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 1.5rem 1.25rem;
          border-radius: 20px;
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.08);
          text-decoration: none;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .action-card:hover {
          background: var(--hover-color);
          border-color: rgba(255,255,255,.15);
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0,0,0,.3);
        }

        .action-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
          transition: transform 0.3s ease;
        }

        .action-card:hover .action-icon {
          transform: scale(1.1);
        }

        .action-card h3 {
          font-size: .88rem;
          font-weight: 700;
          color: #e2e8f0;
          margin: 0 0 .35rem;
        }

        .action-card p {
          font-size: .72rem;
          color: #64748b;
          margin: 0;
          line-height: 1.5;
        }

        /* Map container */
        .map-container {
          background: rgba(255,255,255,.03);
          border: 1px solid rgba(255,255,255,.06);
          border-radius: 24px;
          padding: 1.5rem;
        }

        .map-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: .72rem;
          font-weight: 600;
          color: #3b82f6;
          text-decoration: none;
          padding: 6px 12px;
          background: rgba(59,130,246,.1);
          border-radius: 8px;
          transition: all 0.2s;
        }

        .map-link:hover {
          background: rgba(59,130,246,.2);
          transform: translateX(2px);
        }

        /* Info chips */
        .info-chip {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: rgba(255,255,255,.04);
          border-radius: 10px;
          font-size: .72rem;
          color: #94a3b8;
          font-weight: 500;
        }

        /* Staff link */
        .staff-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: .7rem;
          font-weight: 600;
          color: #475569;
          background: rgba(255,255,255,.03);
          border: 1px solid rgba(255,255,255,.06);
          padding: 8px 16px;
          border-radius: 999px;
          text-decoration: none;
          transition: all 0.2s;
        }

        .staff-link:hover {
          color: #64748b;
          background: rgba(255,255,255,.06);
          transform: translateY(-1px);
        }

        /* Responsive */
        @media (max-width: 480px) {
          .action-card {
            padding: 1.25rem 1rem;
          }
          .action-icon {
            width: 48px;
            height: 48px;
          }
          .map-container {
            padding: 1rem;
          }
        }

        @media (min-width: 768px) {
          .action-card {
            padding: 1.75rem 1.5rem;
          }
          .action-icon {
            width: 64px;
            height: 64px;
          }
        }
      `}</style>
    </div>
  )
}