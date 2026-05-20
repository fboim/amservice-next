'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import AppLayout from '@/components/AppLayout'

export default function EditSparepart() {
  const router = useRouter()
  const params = useParams()
  const id = params.id

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    nama_sparepart: '',
    stok: '',
    harga: '',
    supplier: '',
    lokasi: '',
  })

  useEffect(() => {
    const token = sessionStorage.getItem('ams_token') || localStorage.getItem('ams_token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchData()
  }, [id, router])

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/sparepart?id=${id}`)
      const data = await res.json()

      if (data.error) throw new Error(data.error)

      const sp = data.sparepart
      setForm({
        nama_sparepart: sp.nama_sparepart || '',
        stok: sp.stok || 0,
        harga: sp.harga || 0,
        supplier: sp.supplier || '',
        lokasi: sp.lokasi || '',
      })
    } catch (err) {
      alert('Gagal memuat data: ' + err.message)
      router.push('/sparepart')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch(`/api/sparepart?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama_sparepart: form.nama_sparepart,
          stok: parseInt(form.stok) || 0,
          harga: parseInt(form.harga) || 0,
          supplier: form.supplier,
          lokasi: form.lokasi,
        })
      })

      const data = await res.json()

      if (data.error) throw new Error(data.error)

      router.push('/sparepart')
    } catch (err) {
      alert('Gagal menyimpan: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Yakin hapus sparepart ini?')) return

    try {
      const res = await fetch(`/api/sparepart?id=${id}`, { method: 'DELETE' })
      const data = await res.json()

      if (data.error) throw new Error(data.error)

      router.push('/sparepart')
    } catch (err) {
      alert('Gagal menghapus: ' + err.message)
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
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        {/* Header */}
        <div className="pg-header" style={{ marginBottom: '1.5rem' }}>
          <div>
            <h4 className="pg-title">
              <i className="bi bi-pencil" style={{ color: '#3b82f6', marginRight: 8 }} />
              Edit Sparepart
            </h4>
            <p className="pg-subtitle">Edit data sparepart</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleDelete}
              className="am-btn am-btn-secondary am-btn-sm"
              style={{ background: '#ef4444', borderColor: '#ef4444' }}
            >
              <i className="bi bi-trash" />
              Hapus
            </button>
            <a href="/sparepart" className="am-btn am-btn-secondary am-btn-sm">
              <i className="bi bi-arrow-left" />
              Kembali
            </a>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="section-card" style={{ marginBottom: '1rem' }}>
            <div style={{ padding: '1.5rem', display: 'grid', gap: '1rem' }}>
              <div>
                <label className="am-label">Nama Sparepart</label>
                <input
                  type="text"
                  name="nama_sparepart"
                  value={form.nama_sparepart}
                  onChange={handleChange}
                  className="am-input"
                  required
                  placeholder="Contoh: LCD iPhone 11"
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="am-label">Stok</label>
                  <input
                    type="number"
                    name="stok"
                    value={form.stok}
                    onChange={handleChange}
                    className="am-input"
                    min="0"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="am-label">Harga (Rp)</label>
                  <input
                    type="number"
                    name="harga"
                    value={form.harga}
                    onChange={handleChange}
                    className="am-input"
                    min="0"
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="am-label">Supplier</label>
                <input
                  type="text"
                  name="supplier"
                  value={form.supplier}
                  onChange={handleChange}
                  className="am-input"
                  placeholder="Nama supplier (opsional)"
                />
              </div>
              <div>
                <label className="am-label">Lokasi Penyimpanan</label>
                <input
                  type="text"
                  name="lokasi"
                  value={form.lokasi}
                  onChange={handleChange}
                  className="am-input"
                  placeholder="Contoh: Rak A1 (opsional)"
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <a href="/sparepart" className="am-btn am-btn-secondary am-btn-pill">
              Batal
            </a>
            <button
              type="submit"
              disabled={saving}
              className="am-btn am-btn-primary am-btn-pill"
            >
              {saving ? (
                <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Menyimpan...</>
              ) : (
                <><i className="bi bi-check-circle" /> Simpan</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
    </AppLayout>
  )
}