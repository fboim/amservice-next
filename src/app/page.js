'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

// Services catalog data
const services = [
  { name: 'Service LCD/Display', price: 'Mulai 150rb', color: '#3b82f6' },
  { name: 'Ganti Baterai', price: 'Mulai 100rb', color: '#10b981' },
  { name: 'Service Mesin', price: 'Mulai 100rb', color: '#f59e0b' },
  { name: 'Service Ringan', price: 'Mulai 20rb', color: '#8b5cf6' },
  { name: 'Flash / Upgrade', price: 'Mulai 50rb', color: '#ec4899' },
  { name: 'Ganti IC', price: 'Mulai 150rb', color: '#06b6d4' },
]

// Static fallback testimonials (shown when API fails)
const fallbackTestimonials = [
  {
    name: 'Budi Santoso',
    text: 'Pelayanan sangat memuaskan! HP saya yang rusak layar bisa like new lagi.',
    rating: 5,
    date: 'Baru saja'
  },
]

export default function Home() {
  const [loaded, setLoaded] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  const [testimonials, setTestimonials] = useState(fallbackTestimonials)
  const [searchInput, setSearchInput] = useState('')
  const [searchResult, setSearchResult] = useState(null)
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    setLoaded(true)
    // Check saved theme preference
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark')
    }
    // Fetch testimonials from API
    fetchTestimonials()
  }, [])

  const toggleTheme = () => {
    const newTheme = !darkMode
    setDarkMode(newTheme)
    localStorage.setItem('theme', newTheme ? 'dark' : 'light')
  }

  const handleCekServis = async (e) => {
    e.preventDefault()
    if (!searchInput.trim()) return

    setSearching(true)
    setSearchResult(null)
    try {
      const res = await fetch(`/api/servis?no_servis=${encodeURIComponent(searchInput)}`)
      const data = await res.json()
      if (data && (data.no_servis || data.not_found)) {
        setSearchResult(data)
      } else {
        setSearchResult({ not_found: true })
      }
    } catch (error) {
      setSearchResult({ error: true })
    } finally {
      setSearching(false)
    }
  }

  const startScan = () => {
    // For now, show instruction - actual QR scanning would need a library
    alert('Fitur scan QR dalam pengembangan. Silakan ketik nomor nota manual.')
  }

  const clearSearch = () => {
    setSearchInput('')
    setSearchResult(null)
  }

  const fetchTestimonials = async () => {
    try {
      const res = await fetch('/api/testimonials')
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        setTestimonials(data.map(t => ({
          ...t,
          date: new Date(t.created_at).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric'
          })
        })))
      }
    } catch (error) {
      console.log('Using fallback testimonials')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: darkMode ? '#07070f' : '#f8fafc',
      position: 'relative',
      overflow: 'hidden',
      transition: 'background 0.3s ease'
    }}>
      {/* Animated background */}
      {darkMode && (
        <>
          <div style={{
            position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
            background: `
              radial-gradient(ellipse 80% 60% at 20% 10%, rgba(59,130,246,.2) 0%, transparent 50%),
              radial-gradient(ellipse 70% 50% at 80% 85%, rgba(99,102,241,.18) 0%, transparent 50%),
              radial-gradient(ellipse 60% 40% at 50% 100%, rgba(16,185,129,.1) 0%, transparent 50%)
            `,
          }} />
          <div className="particles">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`particle particle-${i + 1}`} />
            ))}
          </div>
          <div style={{
            position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
            backgroundImage: 'radial-gradient(rgba(255,255,255,.03) 1px, transparent 1px)',
            backgroundSize: '32px 32px'
          }} />
        </>
      )}

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/6285647227779?text=Halo%20AM%20Service%2C%20saya%20ingin%20konsultasi%20servis%20HP"
        target="_blank"
        rel="noopener noreferrer"
        className="wa-float-btn"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 100,
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: '#25D366',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(37, 211, 102, 0.4)',
          transition: 'all 0.3s ease',
          animation: 'waPulse 2s ease-in-out infinite',
        }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 1,
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center',
        padding: '2rem 1rem 6rem',
        gap: 0
      }}>
        {/* Hero Section */}
        <div style={{
          width: '100%', maxWidth: 500,
          textAlign: 'center',
          marginBottom: '2rem',
          paddingTop: '1rem',
          animation: loaded ? 'fadeInUp 0.8s ease-out' : 'none',
          opacity: loaded ? 1 : 0
        }}>
          {/* Header row: Logo and Badge centered together */}
          <div className="hero-header-center">
            <div style={{
              position: 'relative',
              display: 'inline-block'
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

            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              fontSize: 12, fontWeight: 700, letterSpacing: '.15em',
              textTransform: 'uppercase', color: '#60a5fa',
              padding: '6px 14px',
              background: 'rgba(59,130,246,.1)',
              borderRadius: 999,
              border: '1px solid rgba(59,130,246,.2)',
              marginTop: '1rem'
            }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: '#22c55e',
                boxShadow: '0 0 0 0 rgba(34,197,94,.6)',
                animation: 'pulseDot 2s ease-in-out infinite'
              }} />
              Servis Online
            </div>
          </div>

          <h1 style={{
            fontSize: 'clamp(2rem, 7vw, 3.5rem)',
            fontWeight: 900, letterSpacing: '-.03em', lineHeight: 1.05,
            color: darkMode ? '#fff' : '#1e293b', marginBottom: '.6rem'
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
            fontSize: '.92rem', color: darkMode ? '#64748b' : '#64748b', lineHeight: 1.7,
            maxWidth: 340, margin: '0 auto',
            fontWeight: 500
          }}>
            Solusi cepat & terpercaya untuk perbaikan smartphone dan gadget Anda
          </p>
        </div>

        {/* Cek Status Servis - Inline Card */}
        <div style={{
          width: '100%', maxWidth: 500,
          animation: loaded ? 'fadeInUp 0.8s .15s ease-out both' : 'none',
          opacity: loaded ? 1 : 0
        }}>
          <div className="cek-servis-inline-card">
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              marginBottom: '1rem'
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: 'rgba(59,130,246,.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
              </div>
              <h3 style={{
                fontSize: '.9rem', fontWeight: 700,
                color: '#e2e8f0', margin: 0
              }}>
                Cek Status Servis
              </h3>
            </div>

            {/* Search Form */}
            <form onSubmit={handleCekServis} style={{
              display: 'flex', gap: '0.5rem', flexWrap: 'wrap'
            }}>
              <input
                type="text"
                placeholder="Ketik nomor servis..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="cek-servis-input"
              />
              <button
                type="submit"
                className="cek-servis-btn-primary"
                disabled={searching}
              >
                {searching ? '...' : 'Cari'}
              </button>
              <button
                type="button"
                onClick={startScan}
                className="cek-servis-btn-qr"
                title="Scan QR Code"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"/>
                  <rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/>
                </svg>
              </button>
              {searchInput && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="cek-servis-btn-clear"
                  title="Clear"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              )}
            </form>

            {/* Results - Show only when has result */}
            {searchResult && (
              <div style={{
                marginTop: '1rem',
                padding: '1rem',
                background: searchResult.not_found || searchResult.error
                  ? 'rgba(239,68,68,.1)'
                  : 'rgba(16,185,129,.1)',
                borderRadius: 12,
                border: `1px solid ${searchResult.not_found || searchResult.error ? 'rgba(239,68,68,.3)' : 'rgba(16,185,129,.3)'}`
              }}>
                {searchResult.not_found ? (
                  <div style={{ textAlign: 'center' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" style={{ margin: '0 auto 0.5rem' }}>
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="15" y1="9" x2="9" y2="15"/>
                      <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                    <p style={{ color: '#ef4444', margin: 0, fontSize: '.85rem' }}>Nota tidak ditemukan</p>
                  </div>
                ) : searchResult.error ? (
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ color: '#ef4444', margin: 0, fontSize: '.85rem' }}>Terjadi kesalahan</p>
                  </div>
                ) : (
                  <div>
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: '1rem', gap: 10
                    }}>
                      <span style={{
                        padding: '6px 16px', borderRadius: 999,
                        fontSize: '.85rem', fontWeight: 700,
                        background: searchResult.status === 'TIDAK BISA'
                          ? 'rgba(239,68,68,.2)'
                          : searchResult.status === 'ANTRIAN'
                          ? 'rgba(148,163,184,.2)'
                          : searchResult.status === 'DIPROSES'
                          ? 'rgba(245,158,11,.2)'
                          : searchResult.status === 'SIAP DIAMBIL'
                          ? 'rgba(59,130,246,.2)'
                          : searchResult.status === 'SUDAH DIAMBIL'
                          ? 'rgba(16,185,129,.2)'
                          : 'rgba(148,163,184,.2)',
                        color: searchResult.status === 'TIDAK BISA'
                          ? '#ef4444'
                          : searchResult.status === 'ANTRIAN'
                          ? '#94a3b8'
                          : searchResult.status === 'DIPROSES'
                          ? '#f59e0b'
                          : searchResult.status === 'SIAP DIAMBIL'
                          ? '#3b82f6'
                          : searchResult.status === 'SUDAH DIAMBIL'
                          ? '#10b981'
                          : '#94a3b8'
                      }}>
                        {searchResult.status || 'DIPROSES'}
                      </span>
                    </div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: 12,
                      fontSize: '.8rem'
                    }}>
                      <div style={{
                        background: 'rgba(255,255,255,.03)',
                        padding: '10px 12px',
                        borderRadius: 10,
                        textAlign: 'center'
                      }}>
                        <span style={{ color: '#64748b', fontSize: '.7rem', display: 'block' }}>Tanggal</span>
                        <p style={{ margin: '4px 0 0', color: '#fff', fontWeight: 600, fontSize: '.85rem' }}>
                          {searchResult.tanggal ? new Date(searchResult.tanggal).toLocaleDateString('id-ID') : '-'}
                        </p>
                      </div>
                      <div style={{
                        background: 'rgba(255,255,255,.03)',
                        padding: '10px 12px',
                        borderRadius: 10,
                        textAlign: 'center'
                      }}>
                        <span style={{ color: '#64748b', fontSize: '.7rem', display: 'block' }}>Nama</span>
                        <p style={{ margin: '4px 0 0', color: '#e2e8f0', fontSize: '.85rem' }}>
                          {searchResult.nama_pelanggan || '-'}
                        </p>
                      </div>
                      <div style={{
                        background: 'rgba(255,255,255,.03)',
                        padding: '10px 12px',
                        borderRadius: 10,
                        textAlign: 'center'
                      }}>
                        <span style={{ color: '#64748b', fontSize: '.7rem', display: 'block' }}>No HP</span>
                        <p style={{ margin: '4px 0 0', color: '#e2e8f0', fontSize: '.85rem' }}>
                          {searchResult.no_hp || '-'}
                        </p>
                      </div>
                      <div style={{
                        background: 'rgba(255,255,255,.03)',
                        padding: '10px 12px',
                        borderRadius: 10,
                        textAlign: 'center'
                      }}>
                        <span style={{ color: '#64748b', fontSize: '.7rem', display: 'block' }}>Merk HP</span>
                        <p style={{ margin: '4px 0 0', color: '#e2e8f0', fontSize: '.85rem' }}>
                          {searchResult.merk_hp || '-'}
                        </p>
                      </div>
                      <div style={{
                        background: 'rgba(255,255,255,.03)',
                        padding: '10px 12px',
                        borderRadius: 10,
                        textAlign: 'center'
                      }}>
                        <span style={{ color: '#64748b', fontSize: '.7rem', display: 'block' }}>Estimasi</span>
                        <p style={{ margin: '4px 0 0', color: '#e2e8f0', fontSize: '.85rem' }}>
                          {searchResult.estimasi_biaya ? `Rp ${Number(searchResult.estimasi_biaya).toLocaleString('id-ID')}` : '-'}
                        </p>
                      </div>
                      <div style={{
                        background: 'rgba(255,255,255,.03)',
                        padding: '10px 12px',
                        borderRadius: 10,
                        textAlign: 'center'
                      }}>
                        <span style={{ color: '#64748b', fontSize: '.7rem', display: 'block' }}>Keluhan</span>
                        <p style={{ margin: '4px 0 0', color: '#e2e8f0', fontSize: '.85rem' }}>
                          {searchResult.keluhan || '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Services Section */}
        <div style={{
          width: '100%', maxWidth: 500,
          marginTop: '2.5rem',
          animation: loaded ? 'fadeInUp 0.8s .25s ease-out both' : 'none',
          opacity: loaded ? 1 : 0
        }}>
          <div className="section-header">
            <h2 style={{
              fontSize: '1.1rem',
              fontWeight: 800,
              color: darkMode ? '#fff' : '#1e293b',
              marginBottom: '.35rem'
            }}>
              Layanan Kami
            </h2>
            <p style={{
              fontSize: '.8rem',
              color: darkMode ? '#64748b' : '#64748b',
              margin: 0
            }}>
              Harga bervariasi sesuai tipe & kerusakan
            </p>
          </div>

          <div className="services-grid">
            {services.map((service, index) => (
              <div key={index} className="service-card">
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: `${service.color}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 12
                }}>
                  {index === 0 && (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={service.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                      <line x1="12" y1="18" x2="12.01" y2="18"/>
                    </svg>
                  )}
                  {index === 1 && (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={service.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="6" width="18" height="12" rx="2" ry="2"/>
                      <line x1="23" y1="10" x2="23" y2="14"/>
                    </svg>
                  )}
                  {index === 2 && (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={service.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                    </svg>
                  )}
                  {index === 3 && (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={service.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                    </svg>
                  )}
                  {index === 4 && (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={service.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="16 16 12 12 8 16"/>
                      <line x1="12" y1="12" x2="12" y2="21"/>
                      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                    </svg>
                  )}
                  {index === 5 && (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={service.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                      <line x1="12" y1="22.08" x2="12" y2="12"/>
                    </svg>
                  )}
                </div>
                <h4 style={{
                  fontSize: '.82rem',
                  fontWeight: 700,
                  color: darkMode ? '#e2e8f0' : '#1e293b',
                  margin: '0 0 4px'
                }}>
                  {service.name}
                </h4>
                <p style={{
                  fontSize: '.72rem',
                  color: service.color,
                  fontWeight: 600,
                  margin: 0
                }}>
                  {service.price}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials Section */}
        <div style={{
          width: '100%', maxWidth: 500,
          marginTop: '2.5rem',
          animation: loaded ? 'fadeInUp 0.8s .35s ease-out both' : 'none',
          opacity: loaded ? 1 : 0
        }}>
          <div className="section-header">
            <h2 style={{
              fontSize: '1.1rem',
              fontWeight: 800,
              color: darkMode ? '#fff' : '#1e293b',
              marginBottom: '.35rem'
            }}>
              Testimoni Pelanggan
            </h2>
            <p style={{
              fontSize: '.8rem',
              color: darkMode ? '#64748b' : '#64748b',
              margin: 0
            }}>
              Apa kata mereka tentang layanan kami
            </p>
          </div>

          <div className="testimonials-scroll">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  marginBottom: 12
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '.9rem'
                  }}>
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h4 style={{
                      fontSize: '.85rem', fontWeight: 700,
                      color: darkMode ? '#e2e8f0' : '#1e293b',
                      margin: 0
                    }}>
                      {testimonial.name}
                    </h4>
                    <p style={{
                      fontSize: '.65rem', color: '#64748b',
                      margin: '2px 0 0'
                    }}>
                      {testimonial.date}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 2, marginBottom: 8 }}>
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i < testimonial.rating ? '#fbbf24' : '#334155'}>
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </div>
                <p style={{
                  fontSize: '.8rem',
                  color: darkMode ? '#94a3b8' : '#64748b',
                  lineHeight: 1.6,
                  margin: 0
                }}>
                  "{testimonial.text}"
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Map Section */}
        <div style={{
          width: '100%', maxWidth: 500,
          marginTop: '2.5rem',
          animation: loaded ? 'fadeInUp 0.8s .45s ease-out both' : 'none',
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
                  <h4 style={{ fontSize: '.85rem', fontWeight: 700, color: darkMode ? '#e2e8f0' : '#1e293b', margin: 0 }}>Lokasi Toko</h4>
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

            </div>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: 'auto',
          paddingTop: '2.5rem',
          textAlign: 'center',
          animation: loaded ? 'fadeInUp 0.8s .55s ease-out both' : 'none',
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

        @keyframes waPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

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

        .theme-toggle {
          cursor: pointer;
        }

        .theme-toggle:hover {
          transform: scale(1.1);
        }

        .wa-float-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 30px rgba(37, 211, 102, 0.5);
        }

        /* Hero Header Center */
        .hero-header-center {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 1.5rem;
          width: 100%;
        }

        /* Section Header */
        .section-header {
          text-align: center;
          margin-bottom: 1.25rem;
        }

        /* Services Grid */
        .services-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: .875rem;
        }

        .service-card {
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 16px;
          padding: 1rem;
          text-align: center;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .service-card:hover {
          background: rgba(255,255,255,.08);
          transform: translateY(-2px);
        }

        /* Testimonials Scroll */
        .testimonials-scroll {
          display: flex;
          gap: 1rem;
          overflow-x: auto;
          padding-bottom: 1rem;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
        }

        .testimonials-scroll::-webkit-scrollbar {
          height: 4px;
        }

        .testimonials-scroll::-webkit-scrollbar-track {
          background: rgba(255,255,255,.05);
          border-radius: 4px;
        }

        .testimonials-scroll::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,.2);
          border-radius: 4px;
        }

        .testimonial-card {
          min-width: 280px;
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 16px;
          padding: 1.25rem;
          scroll-snap-align: start;
          transition: all 0.3s ease;
        }

        .testimonial-card:hover {
          background: rgba(255,255,255,.08);
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

        /* Cek Servis Inline Card */
        .cek-servis-inline-card {
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 16px;
          padding: 1.25rem;
          transition: all 0.3s ease;
        }

        .cek-servis-input {
          flex: 1;
          min-width: 0;
          padding: 10px 14px;
          background: rgba(255,255,255,.05);
          border: 1px solid rgba(255,255,255,.1);
          border-radius: 10px;
          color: #fff;
          font-size: .85rem;
          outline: none;
          transition: all 0.2s;
        }

        .cek-servis-input:focus {
          border-color: rgba(59,130,246,.5);
          box-shadow: 0 0 0 3px rgba(59,130,246,.1);
        }

        .cek-servis-btn-primary {
          padding: 10px 16px;
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          border: none;
          border-radius: 10px;
          color: #fff;
          font-weight: 600;
          font-size: .85rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .cek-servis-btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59,130,246,.3);
        }

        .cek-servis-btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .cek-servis-btn-qr {
          padding: 10px 14px;
          background: rgba(16,185,129,.15);
          border: 1px solid rgba(16,185,129,.3);
          border-radius: 10px;
          color: #10b981;
          cursor: pointer;
          display: flex;
          align-items: center;
          flex-shrink: 0;
          transition: all 0.2s;
        }

        .cek-servis-btn-qr:hover {
          background: rgba(16,185,129,.25);
        }

        .cek-servis-btn-clear {
          padding: 10px 12px;
          background: rgba(239,68,68,.15);
          border: 1px solid rgba(239,68,68,.3);
          border-radius: 10px;
          color: #ef4444;
          cursor: pointer;
          display: flex;
          align-items: center;
          flex-shrink: 0;
          transition: all 0.2s;
        }

        .cek-servis-btn-clear:hover {
          background: rgba(239,68,68,.25);
        }

        /* Mobile Responsive */
        @media (max-width: 480px) {
          .cek-servis-inline-card {
            padding: 1rem;
          }
          .cek-servis-inline-card form {
            flex-direction: column;
          }
          .cek-servis-input {
            width: 100%;
          }
          .cek-servis-btn-primary,
          .cek-servis-btn-qr,
          .cek-servis-btn-clear {
            width: 100%;
            justify-content: center;
          }
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
          .services-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .service-card {
            padding: .875rem .75rem;
          }
          .testimonial-card {
            min-width: 260px;
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