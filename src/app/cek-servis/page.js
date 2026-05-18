'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function CekServis() {
  const [searchMode, setSearchMode] = useState('nota') // 'nota' or 'hp'
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const params = searchMode === 'nota' ? `no=${query}` : `hp=${query}`
      const res = await fetch(`/api/cek-servis?${params}`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error)
      }

      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const map = {
      'Antrean': { bg: 'rgba(148,163,184,.15)', color: '#94a3b8', text: 'Antrean' },
      'Proses': { bg: 'rgba(245,158,11,.15)', color: '#f59e0b', text: 'Dikerjakan' },
      'Siap Diambil': { bg: 'rgba(6,182,212,.15)', color: '#06b6d4', text: 'Siap Diambil' },
      'Sudah Diambil': { bg: 'rgba(16,185,129,.15)', color: '#10b981', text: 'Selesai' },
      'Tidak Bisa': { bg: 'rgba(239,68,68,.15)', color: '#ef4444', text: 'Tidak Bisa' }
    }
    return map[status] || map['Antrean']
  }

  return (
    <div style={{ minHeight: '100vh', background: '#07070f', padding: '2rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <Link href="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          color: '#64748b', textDecoration: 'none', fontSize: '.875rem'
        }}>
          <i className="bi bi-arrow-left" />
          Kembali
        </Link>

        <div style={{ marginTop: '1.5rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', margin: 0 }}>
            Cek Status Servis
          </h1>
          <p style={{ color: '#64748b', marginTop: '.5rem' }}>
            Masukkan nomor nota atau nomor HP
          </p>
        </div>
      </div>

      {/* Search Form */}
      <div style={{
        maxWidth: 500, margin: '0 auto',
        background: 'rgba(255,255,255,.04)',
        border: '1px solid rgba(255,255,255,.07)',
        borderRadius: 16, padding: '1.5rem'
      }}>
        {/* Mode Toggle */}
        <div style={{
          display: 'flex', gap: 8, marginBottom: '1.5rem',
          background: 'rgba(0,0,0,.3)', borderRadius: 10, padding: 4
        }}>
          <button
            onClick={() => { setSearchMode('nota'); setResult(null); setError('') }}
            style={{
              flex: 1, padding: '10px 16px', borderRadius: 8,
              background: searchMode === 'nota' ? '#3b82f6' : 'transparent',
              color: searchMode === 'nota' ? '#fff' : '#64748b',
              border: 'none', cursor: 'pointer', fontWeight: 600
            }}
          >
            <i className="bi bi-receipt" style={{ marginRight: 6 }} />
            Nomor Nota
          </button>
          <button
            onClick={() => { setSearchMode('hp'); setResult(null); setError('') }}
            style={{
              flex: 1, padding: '10px 16px', borderRadius: 8,
              background: searchMode === 'hp' ? '#3b82f6' : 'transparent',
              color: searchMode === 'hp' ? '#fff' : '#64748b',
              border: 'none', cursor: 'pointer', fontWeight: 600
            }}
          >
            <i className="bi bi-phone" style={{ marginRight: 6 }} />
            Nomor HP
          </button>
        </div>

        {/* Input */}
        <form onSubmit={handleSearch}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchMode === 'nota' ? 'Contoh: AM-2605-001' : 'Contoh: 081234567890'}
            className="am-input"
            style={{
              background: 'rgba(0,0,0,.3)',
              border: '1px solid #334155',
              fontSize: '1rem',
              padding: '14px 16px',
              marginBottom: '1rem'
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? '#64748b' : '#3b82f6',
              border: 'none', borderRadius: 10,
              color: '#fff', fontWeight: 700, fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
            }}
          >
            {loading ? (
              <>
                <div className="spinner" />
                Mencari...
              </>
            ) : (
              <>
                <i className="bi bi-search" />
                Cari
              </>
            )}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div style={{
            marginTop: '1rem', padding: '12px 16px',
            background: 'rgba(239,68,68,.15)', borderRadius: 10,
            color: '#ef4444', fontSize: '.875rem', textAlign: 'center'
          }}>
            <i className="bi bi-exclamation-triangle" style={{ marginRight: 6 }} />
            {error}
          </div>
        )}

        {/* Result - Single */}
        {result && result.no_servis && (
          <div style={{ marginTop: '1.5rem' }}>
            <div style={{
              background: 'rgba(16,185,129,.1)',
              border: '1px solid rgba(16,185,129,.3)',
              borderRadius: 12, padding: '1.25rem',
              textAlign: 'center'
            }}>
              <div style={{
                width: 60, height: 60, borderRadius: '50%',
                background: getStatusBadge(result.status).bg,
                margin: '0 auto 1rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <i className="bi bi-check-circle-fill" style={{
                  fontSize: '1.75rem',
                  color: getStatusBadge(result.status).color
                }} />
              </div>

              <span className="badge" style={{
                display: 'inline-block',
                background: getStatusBadge(result.status).bg,
                color: getStatusBadge(result.status).color
              }}>
                {getStatusBadge(result.status).text}
              </span>

              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: '1rem 0' }}>
                {result.no_servis}
              </h2>
            </div>

            {/* Detail */}
            <div style={{
              marginTop: '1rem',
              display: 'grid', gap: '1rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #334155' }}>
                <span style={{ color: '#64748b' }}>Nama</span>
                <span style={{ fontWeight: 600 }}>{result.nama}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #334155' }}>
                <span style={{ color: '#64748b' }}>Unit</span>
                <span style={{ fontWeight: 600 }}>{result.unit}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #334155' }}>
                <span style={{ color: '#64748b' }}>Tanggal Masuk</span>
                <span style={{ fontWeight: 600 }}>{result.tanggal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #334155' }}>
                <span style={{ color: '#64748b' }}>Biaya</span>
                <span style={{ fontWeight: 700, color: '#10b981' }}>{result.biaya}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
                <span style={{ color: '#64748b' }}>Garansi</span>
                <span style={{ fontWeight: 600 }}>{result.garansi}</span>
              </div>
            </div>

            {result.siap_diambil && (
              <a
                href={`https://wa.me/6281234567890?text=Halo%20saya%20ingin%20ambil%20servis%20${result.no_servis}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block', marginTop: '1.5rem',
                  padding: '14px', borderRadius: 10,
                  background: '#22c55e', color: '#fff',
                  textDecoration: 'none', fontWeight: 700,
                  textAlign: 'center'
                }}
              >
                <i className="bi bi-whatsapp" style={{ marginRight: 8 }} />
                Hubungi untuk Pengambilan
              </a>
            )}
          </div>
        )}

        {/* Result - List (by HP) */}
        {result && result.data && (
          <div style={{ marginTop: '1.5rem' }}>
            <p style={{ color: '#64748b', marginBottom: '1rem' }}>
              Ditemukan {result.total} riwayat servis
            </p>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {result.data.map((s, i) => (
                <div key={i} style={{
                  padding: '1rem', borderRadius: 10,
                  background: 'rgba(0,0,0,.3)',
                  border: '1px solid #334155'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.5rem' }}>
                    <span style={{ fontWeight: 700, color: '#3b82f6' }}>{s.no_servis}</span>
                    <span className="badge" style={{
                      background: getStatusBadge(s.status).bg,
                      color: getStatusBadge(s.status).color
                    }}>
                      {getStatusBadge(s.status).text}
                    </span>
                  </div>
                  <div style={{ fontSize: '.875rem', color: '#94a3b8' }}>
                    {s.unit} · {s.tanggal}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}