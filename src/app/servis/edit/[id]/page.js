'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import AppLayout from '@/components/AppLayout'

export default function EditServis() {
  const router = useRouter()
  const params = useParams()
  const id = params.id

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    nama_pelanggan: '',
    no_hp: '',
    merk_hp: '',
    tipe_hp: '',
    keluhan: '',
    modal_sparepart: '',
    estimasi_biaya: '',
    status: 'Antrean',
    garansi: 'Tidak Ada',
  })

  useEffect(() => {
    const token = sessionStorage.getItem('ams_token') || localStorage.getItem('ams_token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchServis()
  }, [id])

  const fetchServis = async () => {
    try {
      const servisRes = await fetch(`/api/servis?id=${id}`)
      const servisData = await servisRes.json()

      if (servisData.error) throw new Error(servisData.error)

      const servis = servisData
      const tipeBersih = (servis.tipe_hp || '').replace(/-/g, '').trim()
      const modalBersih = servis.modal_sparepart ? String(servis.modal_sparepart).replace(/\D/g, '') : ''
      const estimasiBersih = servis.estimasi_biaya ? String(servis.estimasi_biaya).replace(/\D/g, '') : ''

      setForm({
        nama_pelanggan: servis.nama_pelanggan || '',
        no_hp: servis.no_hp || '',
        merk_hp: servis.merk_hp || '',
        tipe_hp: tipeBersih,
        keluhan: servis.keluhan || '',
        modal_sparepart: modalBersih,
        estimasi_biaya: estimasiBersih,
        status: servis.status || 'Antrean',
        garansi: servis.garansi || 'Tidak Ada',
      })
    } catch (err) {
      alert('Gagal memuat data: ' + err.message)
      router.push('/servis/data')
    } finally {
      setLoading(false)
    }
  }

  const fmt = (val) => {
    return String(val).replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleBiayaChange = (e) => {
    const raw = String(e.target.value).replace(/\D/g, '')
    setForm(prev => ({ ...prev, estimasi_biaya: raw }))
  }

  const handleModalChange = (e) => {
    const raw = String(e.target.value).replace(/\D/g, '')
    setForm(prev => ({ ...prev, modal_sparepart: raw }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch('/api/servis', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          ...form,
        })
      })

      const data = await res.json()

      if (data.error) throw new Error(data.error)

      router.push('/servis/data')
    } catch (err) {
      alert('Gagal menyimpan: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', color: 'var(--am-text-muted)' }}>
            <i className="bi bi-arrow-repeat" style={{ fontSize: '2rem', animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: '8px' }}>Memuat data...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
    <div className="page-wrapper">
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
          <Link href="/servis/data" className="am-btn am-btn-secondary am-btn-sm">
            <i className="bi bi-arrow-left" /> Kembali
          </Link>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Card 1: Pelanggan & Perangkat */}
          <div style={{ background: 'var(--am-card-bg)', border: '1px solid var(--am-border)', borderRadius: '8px', padding: '12px 16px', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontWeight: '600', fontSize: '0.875rem' }}>
              <i className="bi bi-person-badge" style={{ color: '#3b82f6' }} />
              <span>Pelanggan & Perangkat</span>
            </div>
            <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: '2fr 1fr' }}>
              <div>
                <label className="am-label">Nama Pelanggan</label>
                <input type="text" name="nama_pelanggan" value={form.nama_pelanggan} onChange={handleChange} className="am-input" required />
              </div>
              <div>
                <label className="am-label">No. HP</label>
                <input type="text" name="no_hp" value={form.no_hp} onChange={handleChange} className="am-input" />
              </div>
              <div>
                <label className="am-label">Merk HP</label>
                <input type="text" name="merk_hp" value={form.merk_hp} onChange={handleChange} className="am-input" required />
              </div>
              <div>
                <label className="am-label">Tipe HP</label>
                <input type="text" name="tipe_hp" value={form.tipe_hp} onChange={handleChange} className="am-input" />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="am-label">Keluhan</label>
                <textarea name="keluhan" value={form.keluhan} onChange={handleChange} className="am-input" rows={2} required />
              </div>
            </div>
          </div>

          {/* Card 2: Perbaikan & Biaya */}
          <div style={{ background: 'var(--am-card-bg)', border: '1px solid var(--am-border)', borderRadius: '8px', padding: '12px 16px', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontWeight: '600', fontSize: '0.875rem' }}>
              <i className="bi bi-tools" style={{ color: '#d97706' }} />
              <span>Perbaikan & Biaya</span>
            </div>
            <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: '1fr 1fr' }}>
              <div>
                <label className="am-label" style={{ color: '#dc2626' }}>Modal (Rp)</label>
                <input
                  type="text"
                  value={form.modal_sparepart ? fmt(form.modal_sparepart) : ''}
                  onChange={handleModalChange}
                  className="am-input"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="am-label" style={{ color: '#059669' }}>Total Biaya (Rp)</label>
                <input
                  type="text"
                  value={form.estimasi_biaya ? fmt(form.estimasi_biaya) : ''}
                  onChange={handleBiayaChange}
                  className="am-input"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="am-label">Status</label>
                <select name="status" value={form.status} onChange={handleChange} className="am-input">
                  {['Antrean', 'Proses', 'Siap Diambil', 'Sudah Diambil', 'Tidak Bisa'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="am-label">Garansi</label>
                <select name="garansi" value={form.garansi} onChange={handleChange} className="am-input">
                  {['Tidak Ada', '7 Hari', '14 Hari', '30 Hari'].map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 0' }}>
            <button type="submit" disabled={saving} className="am-btn am-btn-primary am-btn-pill">
              {saving ? <><i className="bi bi-arrow-repeat" style={{ animation: 'spin 1s linear infinite' }} /> Menyimpan...</> : <><i className="bi bi-save" /> Simpan</>}
            </button>
          </div>
        </form>
      </div>
    </div>
    </AppLayout>
  )
}