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
    teknisi: '',
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

      setForm({
        nama_pelanggan: servis.nama_pelanggan || '',
        no_hp: servis.no_hp || '',
        merk_hp: servis.merk_hp || '',
        tipe_hp: servis.tipe_hp || '',
        keluhan: servis.keluhan || '',
        modal_sparepart: servis.modal_sparepart || '',
        estimasi_biaya: servis.estimasi_biaya || '',
        status: servis.status || 'Antrean',
        garansi: servis.garansi || 'Tidak Ada',
        teknisi: servis.teknisi || '',
      })
    } catch (err) {
      alert('Gagal memuat data: ' + err.message)
      router.push('/servis/data')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const formatNumber = (value) => {
    const num = parseInt(value.replace(/\D/g, '')) || 0
    return num.toLocaleString('id-ID')
  }

  const parseNumber = (value) => {
    return parseInt(value.replace(/\D/g, '')) || 0
  }

  const handleBiayaChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '')
    setForm(prev => ({ ...prev, estimasi_biaya: raw }))
  }

  const handleModalChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '')
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
        {/* Back Button */}
        <div style={{ marginBottom: '1rem' }}>
          <Link href="/servis/data" className="am-btn am-btn-secondary am-btn-sm">
            <i className="bi bi-arrow-left" /> Kembali
          </Link>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Data Pelanggan */}
          <div className="section-card" style={{ marginBottom: '1rem' }}>
            <div className="card-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="bi bi-person" style={{ color: '#3b82f6' }} />
                Data Pelanggan
              </span>
            </div>
            <div style={{ padding: '1.5rem', display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="am-label">Nama Pelanggan</label>
                <input
                  type="text"
                  name="nama_pelanggan"
                  value={form.nama_pelanggan}
                  onChange={handleChange}
                  className="am-input"
                  required
                />
              </div>
              <div>
                <label className="am-label">Nomor HP</label>
                <input
                  type="tel"
                  name="no_hp"
                  value={form.no_hp}
                  onChange={handleChange}
                  className="am-input"
                />
              </div>
              <div>
                <label className="am-label">Teknisi</label>
                <input
                  type="text"
                  name="teknisi"
                  value={form.teknisi}
                  onChange={handleChange}
                  className="am-input"
                  placeholder="Nama teknisi"
                />
              </div>
            </div>
          </div>

          {/* Data HP */}
          <div className="section-card" style={{ marginBottom: '1rem' }}>
            <div className="card-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="bi bi-phone" style={{ color: '#06b6d4' }} />
                Data HP
              </span>
            </div>
            <div style={{ padding: '1.5rem', display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
              <div>
                <label className="am-label">Merk HP</label>
                <input
                  type="text"
                  name="merk_hp"
                  value={form.merk_hp}
                  onChange={handleChange}
                  className="am-input"
                  required
                />
              </div>
              <div>
                <label className="am-label">Tipe HP</label>
                <input
                  type="text"
                  name="tipe_hp"
                  value={form.tipe_hp}
                  onChange={handleChange}
                  className="am-input"
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="am-label">Keluhan / Kerusakan</label>
                <textarea
                  name="keluhan"
                  value={form.keluhan}
                  onChange={handleChange}
                  className="am-input"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Biaya & Status */}
          <div className="section-card" style={{ marginBottom: '1rem' }}>
            <div className="card-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="bi bi-currency-dollar" style={{ color: '#f59e0b' }} />
                Biaya & Status
              </span>
            </div>
            <div style={{ padding: '1.5rem', display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
              <div>
                <label className="am-label">Modal Sparepart (Rp)</label>
                <input
                  type="text"
                  name="modal_sparepart"
                  value={form.modal_sparepart ? formatNumber(form.modal_sparepart) : ''}
                  onChange={handleModalChange}
                  className="am-input"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="am-label">Total Biaya Servis (Rp)</label>
                <input
                  type="text"
                  name="estimasi_biaya"
                  value={form.estimasi_biaya ? formatNumber(form.estimasi_biaya) : ''}
                  onChange={handleBiayaChange}
                  className="am-input"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="am-label">Status</label>
                <select name="status" value={form.status} onChange={handleChange} className="am-input">
                  <option value="Antrean">Antrean</option>
                  <option value="Proses">Proses</option>
                  <option value="Siap Diambil">Siap Diambil</option>
                  <option value="Sudah Diambil">Selesai</option>
                  <option value="Tidak Bisa">Tidak Bisa</option>
                </select>
              </div>
              <div>
                <label className="am-label">Garansi</label>
                <select name="garansi" value={form.garansi} onChange={handleChange} className="am-input">
                  <option value="Tidak Ada">Tidak Ada</option>
                  <option value="7 Hari">7 Hari</option>
                  <option value="14 Hari">14 Hari</option>
                  <option value="30 Hari">30 Hari</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="section-card" style={{ marginBottom: '1.5rem', background: 'rgba(59, 130, 246, 0.1)', borderColor: '#3b82f6' }}>
            <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
              <button
                type="submit"
                disabled={saving}
                className="am-btn am-btn-primary am-btn-pill"
                style={{ padding: '12px 32px', fontSize: '1rem' }}
              >
                {saving ? (
                  <><i className="bi bi-arrow-repeat" style={{ animation: 'spin 1s linear infinite' }} /> Menyimpan...</>
                ) : (
                  <><i className="bi bi-check-circle" /> Simpan Perubahan</>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
    </AppLayout>
  )
}