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
      <style jsx global>{`
        .fade-in {
          animation: fadeIn 0.4s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .section-card {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>

      <div className="page-wrapper">
        {/* Message */}
        {message && (
          <div className="fade-in" style={{
            padding: '12px 16px',
            background: message.includes('berhasil') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${message.includes('berhasil') ? '#10b981' : '#ef4444'}`,
            borderRadius: '12px', marginBottom: '20px',
            color: message.includes('berhasil') ? '#10b981' : '#ef4444',
            fontSize: '.875rem'
          }}>
            <i className={`bi ${message.includes('berhasil') ? 'bi-check-circle' : 'bi-exclamation-circle'}`} style={{ marginRight: 8 }} />
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="dashboard-two-col fade-in" style={{ marginBottom: '20px' }}>
            {/* Left Column */}
            <div className="section-card">
              <div className="card-header">
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="bi bi-shop" style={{ color: '#3b82f6' }} />
                  Informasi Toko
                </span>
              </div>
              <div style={{ padding: '20px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <label className="am-label">Nama Toko</label>
                  <input
                    type="text"
                    name="nama_toko"
                    value={formData.nama_toko}
                    onChange={handleChange}
                    className="am-input"
                    placeholder="AM SERVICE"
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label className="am-label">No. WhatsApp</label>
                  <input
                    type="text"
                    name="no_wa"
                    value={formData.no_wa}
                    onChange={handleChange}
                    className="am-input"
                    placeholder="08xxxxxxxxxx"
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label className="am-label">Alamat</label>
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

                <div style={{ marginBottom: 0 }}>
                  <label className="am-label">Link Google Maps</label>
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
            </div>

            {/* Right Column */}
            <div className="section-card">
              <div className="card-header">
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="bi bi-file-text" style={{ color: '#f59e0b' }} />
                  Syarat & Ketentuan
                </span>
              </div>
              <div style={{ padding: '20px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <label className="am-label">Syarat Penerimaan Unit</label>
                  <textarea
                    name="snk_penerimaan"
                    value={formData.snk_penerimaan}
                    onChange={handleChange}
                    className="am-input"
                    rows={5}
                    placeholder="1. Pelanggan wajib menunjukkan nota..."
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div style={{ marginBottom: 0 }}>
                  <label className="am-label">Syarat & Ketentuan Garansi</label>
                  <textarea
                    name="snk_garansi"
                    value={formData.snk_garansi}
                    onChange={handleChange}
                    className="am-input"
                    rows={5}
                    placeholder="1. Garansi berlaku 7 hari..."
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={saving}
              className="am-btn am-btn-primary"
              style={{ padding: '12px 24px' }}
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
      </div>
    </AppLayout>
  )
}