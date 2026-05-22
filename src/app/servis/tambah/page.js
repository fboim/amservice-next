'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AppLayout from '@/components/AppLayout'

export default function TambahServis() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
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
  }, [])

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
    setLoading(true)

    try {
      const res = await fetch('/api/servis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form })
      })

      const data = await res.json()
      if (data.error) throw new Error(data.error)

      router.push('/servis/data')
    } catch (err) {
      alert('Gagal menyimpan: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout>
    <div className="page-wrapper">
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
          <Link href="/servis/data" className="am-btn am-btn-secondary am-btn-sm">
            <i className="bi bi-arrow-left" /> Kembali
          </Link>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '8px', gridTemplateColumns: '2fr 1fr' }}>
            <div>
              <label className="am-label">Nama Pelanggan</label>
              <input type="text" name="nama_pelanggan" value={form.nama_pelanggan} onChange={handleChange} className="am-input" required placeholder="Nama pelanggan" />
            </div>
            <div>
              <label className="am-label">No. HP</label>
              <input type="text" name="no_hp" value={form.no_hp} onChange={handleChange} className="am-input" placeholder="08xxxxxxxx" />
            </div>
          </div>

          <div style={{ display: 'grid', gap: '8px', gridTemplateColumns: '1fr 1fr', marginTop: '8px' }}>
            <div>
              <label className="am-label">Merk HP</label>
              <input type="text" name="merk_hp" value={form.merk_hp} onChange={handleChange} className="am-input" required placeholder="Samsung, iPhone" />
            </div>
            <div>
              <label className="am-label">Tipe HP</label>
              <input type="text" name="tipe_hp" value={form.tipe_hp} onChange={handleChange} className="am-input" placeholder="Galaxy S23" />
            </div>
          </div>

          <div style={{ marginTop: '8px' }}>
            <label className="am-label">Keluhan</label>
            <textarea name="keluhan" value={form.keluhan} onChange={handleChange} className="am-input" rows={2} placeholder="Deskripsikan keluhan" />
          </div>

          <div style={{ display: 'grid', gap: '8px', gridTemplateColumns: '1fr 1fr', marginTop: '8px' }}>
            <div>
              <label className="am-label" style={{ color: '#dc2626' }}>Modal (Rp)</label>
              <input type="text" value={form.modal_sparepart ? fmt(form.modal_sparepart) : ''} onChange={handleModalChange} className="am-input" placeholder="0" />
            </div>
            <div>
              <label className="am-label" style={{ color: '#059669' }}>Total Biaya (Rp)</label>
              <input type="text" value={form.estimasi_biaya ? fmt(form.estimasi_biaya) : ''} onChange={handleBiayaChange} className="am-input" placeholder="0" />
            </div>
          </div>

          <div style={{ display: 'grid', gap: '8px', gridTemplateColumns: '1fr 1fr', marginTop: '8px' }}>
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

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button type="submit" disabled={loading} className="am-btn am-btn-primary am-btn-pill">
              {loading ? <><i className="bi bi-arrow-repeat" style={{ animation: 'spin 1s linear infinite' }} /> Menyimpan...</> : <><i className="bi bi-save" /> Simpan</>}
            </button>
          </div>
        </form>
      </div>
    </div>
    </AppLayout>
  )
}