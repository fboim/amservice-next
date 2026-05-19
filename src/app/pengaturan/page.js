'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AppLayout from '@/components/AppLayout'

export default function Pengaturan() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [formData, setFormData] = useState({
    nama_toko: '',
    no_wa: '',
    alamat: '',
    link_maps: '',
    snk_penerimaan: '',
    snk_garansi: ''
  })

  useEffect(() => {
    const token = sessionStorage.getItem('ams_token') || localStorage.getItem('ams_token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchPengaturan()
  }, [router])

  const fetchPengaturan = async () => {
    try {
      const res = await fetch('/api/pengaturan')
      const data = await res.json()

      if (data.pengaturan) {
        setFormData({
          nama_toko: data.pengaturan.nama_toko || '',
          no_wa: data.pengaturan.no_wa || '',
          alamat: data.pengaturan.alamat || '',
          link_maps: data.pengaturan.link_maps || '',
          snk_penerimaan: data.pengaturan.snk_penerimaan || '',
          snk_garansi: data.pengaturan.snk_garansi || ''
        })
      }
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      const res = await fetch('/api/pengaturan', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage(data.error || 'Gagal menyimpan')
        return
      }

      setMessage('Pengaturan berhasil disimpan!')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage('Terjadi kesalahan')
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
              <i className="bi bi-gear" style={{ color: '#64748b', marginRight: 8 }} />
              Pengaturan Toko
            </h4>
            <p className="pg-subtitle">Atur informasi toko dan syarat ketentuan</p>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div style={{
            padding: '12px 16px',
            background: message.includes('berhasil') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${message.includes('berhasil') ? '#10b981' : '#ef4444'}`,
            borderRadius: 8, marginBottom: '1.5rem',
            color: message.includes('berhasil') ? '#10b981' : '#ef4444',
            fontSize: '.875rem'
          }}>
            <i className={`bi ${message.includes('berhasil') ? 'bi-check-circle' : 'bi-exclamation-circle'}`} style={{ marginRight: 8 }} />
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Left Column */}
            <div className="section-card">
              <h5 style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
                <i className="bi bi-shop" style={{ marginRight: 8 }} />
                Informasi Toko
              </h5>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '.85rem', marginBottom: 6 }}>
                  Nama Toko
                </label>
                <input
                  type="text"
                  name="nama_toko"
                  value={formData.nama_toko}
                  onChange={handleChange}
                  className="am-input"
                  placeholder="AM SERVICE"
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '.85rem', marginBottom: 6 }}>
                  No. WhatsApp
                </label>
                <input
                  type="text"
                  name="no_wa"
                  value={formData.no_wa}
                  onChange={handleChange}
                  className="am-input"
                  placeholder="08xxxxxxxxxx"
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '.85rem', marginBottom: 6 }}>
                  Alamat
                </label>
                <textarea
                  name="alamat"
                  value={formData.alamat}
                  onChange={handleChange}
                  className="am-input"
                  rows={3}
                  placeholder="Jl. example No. 123, Kota"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '.85rem', marginBottom: 6 }}>
                  Link Google Maps
                </label>
                <input
                  type="url"
                  name="link_maps"
                  value={formData.link_maps}
                  onChange={handleChange}
                  className="am-input"
                  placeholder="https://maps.google.com/..."
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="section-card">
              <h5 style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
                <i className="bi bi-file-text" style={{ marginRight: 8 }} />
                Syarat & Ketentuan
              </h5>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '.85rem', marginBottom: 6 }}>
                  Syarat Penerimaan Unit
                </label>
                <textarea
                  name="snk_penerimaan"
                  value={formData.snk_penerimaan}
                  onChange={handleChange}
                  className="am-input"
                  rows={5}
                  placeholder="1. Pelanggan wajib menunjukkan nota...

2. dst..."
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '.85rem', marginBottom: 6 }}>
                  Syarat & Ketentuan Garansi
                </label>
                <textarea
                  name="snk_garansi"
                  value={formData.snk_garansi}
                  onChange={handleChange}
                  className="am-input"
                  rows={5}
                  placeholder="1. Garansi berlaku 7 hari...

2. dst..."
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button
              type="submit"
              disabled={saving}
              className="am-btn am-btn-primary"
            >
              {saving ? (
                <>
                  <span className="spinner" style={{ width: 16, height: 16, marginRight: 8 }} />
                  Menyimpan...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle" style={{ marginRight: 8 }} />
                  Simpan Pengaturan
                </>
              )}
            </button>
          </div>
        </form>

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