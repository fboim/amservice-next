'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import AppLayout from '@/components/AppLayout'

export default function EditPelanggan() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    nama_pelanggan: '',
    no_hp: '',
    alamat: '',
    email: '',
    catatan: ''
  })
  const [error, setError] = useState('')

  useEffect(() => {
    const token = sessionStorage.getItem('ams_token') || localStorage.getItem('ams_token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchPelanggan()
  }, [router])

  const fetchPelanggan = async () => {
    try {
      const res = await fetch(`/api/pelanggan/${params.id}`)
      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'Pelanggan tidak ditemukan')
        router.push('/pelanggan')
        return
      }

      setFormData({
        nama_pelanggan: data.pelanggan?.nama_pelanggan || '',
        no_hp: data.pelanggan?.no_hp || '',
        alamat: data.pelanggan?.alamat || '',
        email: data.pelanggan?.email || '',
        catatan: data.pelanggan?.catatan || ''
      })
    } catch (err) {
      alert('Terjadi kesalahan')
      router.push('/pelanggan')
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

    if (!formData.nama_pelanggan || !formData.no_hp) {
      setError('Nama dan No. HP wajib diisi')
      return
    }

    const normalizedHP = formData.no_hp.replace(/[\s-]/g, '')

    setSaving(true)

    try {
      const res = await fetch(`/api/pelanggan/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          no_hp: normalizedHP
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Gagal mengupdate pelanggan')
        return
      }

      alert('Pelanggan berhasil diupdate')
      router.push('/pelanggan')
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
                Nama Pelanggan <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                name="nama_pelanggan"
                value={formData.nama_pelanggan}
                onChange={handleChange}
                className="am-input"
                placeholder="Masukkan nama"
                required
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '.85rem', marginBottom: 6 }}>
                No. HP / WhatsApp <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                name="no_hp"
                value={formData.no_hp}
                onChange={handleChange}
                className="am-input"
                placeholder="08xxxxxxxxxx"
                required
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
                placeholder="Masukkan alamat (opsional)"
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '.85rem', marginBottom: 6 }}>
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="am-input"
                placeholder="email@example.com (opsional)"
              />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '.85rem', marginBottom: 6 }}>
                Catatan
              </label>
              <textarea
                name="catatan"
                value={formData.catatan}
                onChange={handleChange}
                className="am-input"
                placeholder="Catatan tentang pelanggan (opsional)"
                rows={3}
                style={{ resize: 'vertical' }}
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
              <Link href="/pelanggan" className="am-btn" style={{
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
          <Link href="/pelanggan" style={{
            color: '#64748b', textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center', gap: 8
          }}>
            <i className="bi bi-arrow-left" />
            Kembali ke Manajemen Pelanggan
          </Link>
        </div>
      </div>
    </AppLayout>
  )
}