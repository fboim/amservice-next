'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import AppLayout from '@/components/AppLayout'

export default function EditServis() {
  const router = useRouter()
  const params = useParams()
  const id = params.id

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sendingWA, setSendingWA] = useState(false)
  const [sparepartList, setSparepartList] = useState([])
  const [form, setForm] = useState({
    nama_pelanggan: '',
    no_hp: '',
    merk_hp: '',
    tipe_hp: '',
    keluhan: '',
    estimasi_biaya: '',
    status: 'Antrean',
    teknisi: '',
    catatan: '',
    sparepart_digunakan: [],
  })

  useEffect(() => {
    const token = sessionStorage.getItem('ams_token') || localStorage.getItem('ams_token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchData()
  }, [id])

  const fetchData = async () => {
    try {
      // Fetch servis
      const servisRes = await fetch(`/api/servis?id=${id}`)
      const servisData = await servisRes.json()

      if (servisData.error) throw new Error(servisData.error)

      // API returns data directly for single item, not wrapped in {servis: ...}
      const servis = servisData

      // Parse sparepart if exists
      let sparepartParsed = []
      try {
        sparepartParsed = JSON.parse(servis.sparepart_json || '[]')
      } catch (e) {}

      setForm({
        nama_pelanggan: servis.nama_pelanggan || '',
        no_hp: servis.no_hp || '',
        merk_hp: servis.merk_hp || '',
        tipe_hp: servis.tipe_hp || '',
        keluhan: servis.keluhan || '',
        estimasi_biaya: servis.estimasi_biaya || '',
        status: servis.status || 'Antrean',
        teknisi: servis.teknisi || '',
        catatan: servis.catatan || '',
        sparepart_digunakan: sparepartParsed,
      })

      // Fetch sparepart list
      const sparepartRes = await fetch('/api/sparepart')
      const sparepartData = await sparepartRes.json()
      setSparepartList(sparepartData.sparepart || [])
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

  const toggleSparepart = (sp) => {
    setForm(prev => {
      const exists = prev.sparepart_digunakan.find(s => s.id === sp.id)
      if (exists) {
        return {
          ...prev,
          sparepart_digunakan: prev.sparepart_digunakan.filter(s => s.id !== sp.id)
        }
      }
      return {
        ...prev,
        sparepart_digunakan: [...prev.sparepart_digunakan, { ...sp, qty: 1 }]
      }
    })
  }

  const updateSparepartQty = (spId, qty) => {
    setForm(prev => ({
      ...prev,
      sparepart_digunakan: prev.sparepart_digunakan.map(sp =>
        sp.id === spId ? { ...sp, qty: parseInt(qty) || 1 } : sp
      )
    }))
  }

  const removeSparepart = (spId) => {
    setForm(prev => ({
      ...prev,
      sparepart_digunakan: prev.sparepart_digunakan.filter(sp => sp.id !== spId)
    }))
  }

  const calculateTotal = () => {
    const sparepartTotal = form.sparepart_digunakan.reduce((sum, sp) => {
      return sum + (parseInt(sp.harga) * sp.qty)
    }, 0)
    const biayaStr = String(form.estimasi_biaya || '0')
    const biayaLain = parseInt(biayaStr.replace(/\D/g, '')) || 0
    return sparepartTotal + biayaLain
  }

  const formatRupiah = (num) => {
    return 'Rp ' + num.toLocaleString('id-ID')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const totalBiaya = calculateTotal()

      const res = await fetch('/api/servis', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          ...form,
          estimasi_biaya: formatRupiah(totalBiaya),
          sparepart_json: JSON.stringify(form.sparepart_digunakan),
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

  const handleDelete = async () => {
    if (!confirm('Yakin hapus servis ini?')) return

    try {
      const res = await fetch(`/api/servis?id=${id}`, { method: 'DELETE' })
      const data = await res.json()

      if (data.error) throw new Error(data.error)

      router.push('/servis/data')
    } catch (err) {
      alert('Gagal menghapus: ' + err.message)
    }
  }

  const handleSendWA = async (waType = 'status') => {
    setSendingWA(true)
    try {
      const res = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, type: waType })
      })
      const data = await res.json()

      if (data.note) {
        // Show message for manual sending
        const confirmed = confirm(`API WhatsApp belum aktif. Salin pesan berikut?\n\n${data.message}`)
        if (confirmed) {
          navigator.clipboard.writeText(data.message)
          alert('Pesan berhasil disalin!')
        }
      } else if (data.success) {
        alert('Notifikasi WhatsApp berhasil dikirim!')
      } else {
        alert('Gagal mengirim: ' + (data.error || 'Unknown error'))
      }
    } catch (err) {
      alert('Gagal mengirim: ' + err.message)
    } finally {
      setSendingWA(false)
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
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
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

          {/* Sparepart */}
          <div className="section-card" style={{ marginBottom: '1rem' }}>
            <div className="card-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="bi bi-box-seam" style={{ color: '#10b981' }} />
                Sparepart Digunakan
              </span>
            </div>
            <div style={{ padding: '1rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="am-label">Pilih Sparepart</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {sparepartList.map(sp => (
                    <button
                      key={sp.id}
                      type="button"
                      onClick={() => toggleSparepart(sp)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 6,
                        border: '1px solid',
                        borderColor: form.sparepart_digunakan.find(s => s.id === sp.id)
                          ? '#3b82f6'
                          : '#334155',
                        background: form.sparepart_digunakan.find(s => s.id === sp.id)
                          ? 'rgba(59, 130, 246, 0.2)'
                          : 'transparent',
                        color: '#f1f5f9',
                        fontSize: '.75rem',
                        cursor: 'pointer'
                      }}
                    >
                      {sp.nama_sparepart} - Rp {parseInt(sp.harga).toLocaleString('id-ID')}
                    </button>
                  ))}
                </div>
              </div>

              {form.sparepart_digunakan.length > 0 && (
                <div>
                  <label className="am-label">Sparepart Terpilih</label>
                  <table className="am-table" style={{ marginTop: 8 }}>
                    <thead>
                      <tr>
                        <th>Nama</th>
                        <th>Harga</th>
                        <th>Qty</th>
                        <th>Subtotal</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.sparepart_digunakan.map(sp => (
                        <tr key={sp.id}>
                          <td>{sp.nama_sparepart}</td>
                          <td>Rp {parseInt(sp.harga).toLocaleString('id-ID')}</td>
                          <td>
                            <input
                              type="number"
                              min="1"
                              value={sp.qty}
                              onChange={(e) => updateSparepartQty(sp.id, e.target.value)}
                              style={{
                                width: 60,
                                padding: '4px 8px',
                                background: '#0f172a',
                                border: '1px solid #334155',
                                borderRadius: 4,
                                color: '#f1f5f9',
                                textAlign: 'center'
                              }}
                            />
                          </td>
                          <td style={{ fontWeight: 600 }}>
                            Rp {(parseInt(sp.harga) * sp.qty).toLocaleString('id-ID')}
                          </td>
                          <td>
                            <button
                              type="button"
                              onClick={() => removeSparepart(sp.id)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#ef4444',
                                cursor: 'pointer',
                                fontSize: '1rem'
                              }}
                            >
                              ×
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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
                <label className="am-label">Biaya Servis (Rp)</label>
                <input
                  type="text"
                  name="estimasi_biaya"
                  value={form.estimasi_biaya}
                  onChange={handleChange}
                  className="am-input"
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
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="am-label">Catatan</label>
                <textarea
                  name="catatan"
                  value={form.catatan}
                  onChange={handleChange}
                  className="am-input"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Total & Submit */}
          <div className="section-card" style={{ marginBottom: '1.5rem', background: 'rgba(59, 130, 246, 0.1)', borderColor: '#3b82f6' }}>
            <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '.875rem' }}>Total Biaya</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f1f5f9' }}>
                  {formatRupiah(calculateTotal())}
                </div>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="am-btn am-btn-primary am-btn-pill"
                style={{ padding: '12px 32px', fontSize: '1rem' }}
              >
                {saving ? (
                  <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Menyimpan...</>
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