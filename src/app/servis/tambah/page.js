'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/AppLayout'

export default function TambahServis() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [sparepartList, setSparepartList] = useState([])
  const [pelangganMode, setPelangganMode] = useState('baru') // 'baru' atau 'lama'
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
    fetchSparepart()
  }, [])

  const fetchSparepart = async () => {
    try {
      const res = await fetch('/api/sparepart')
      const data = await res.json()
      setSparepartList(data.sparepart || [])
    } catch (err) {
      console.error('Fetch sparepart error:', err)
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

  const updateSparepartQty = (id, qty) => {
    setForm(prev => ({
      ...prev,
      sparepart_digunakan: prev.sparepart_digunakan.map(sp =>
        sp.id === id ? { ...sp, qty: parseInt(qty) || 1 } : sp
      )
    }))
  }

  const removeSparepart = (id) => {
    setForm(prev => ({
      ...prev,
      sparepart_digunakan: prev.sparepart_digunakan.filter(sp => sp.id !== id)
    }))
  }

  const calculateTotal = () => {
    const sparepartTotal = form.sparepart_digunakan.reduce((sum, sp) => {
      return sum + (parseInt(sp.harga) * sp.qty)
    }, 0)
    const biayaLain = parseInt(form.estimasi_biaya.replace(/\D/g, '')) || 0
    return sparepartTotal + biayaLain
  }

  const formatRupiah = (num) => {
    return 'Rp ' + num.toLocaleString('id-ID')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const totalBiaya = calculateTotal()

      const res = await fetch('/api/servis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          estimasi_biaya: formatRupiah(totalBiaya),
          sparepart_json: JSON.stringify(form.sparepart_digunakan),
        })
      })

      const data = await res.json()

      if (data.error) throw new Error(data.error)

      // Update stok sparepart
      for (const sp of form.sparepart_digunakan) {
        await fetch(`/api/sparepart/${sp.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ adjustment: -sp.qty })
        })
      }

      router.push('/servis/data')
    } catch (err) {
      alert('Gagal menyimpan: ' + err.message)
    } finally {
      setLoading(false)
    }
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
                  placeholder="Masukkan nama pelanggan"
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
                  placeholder="08xxxxxxxxxx"
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
                  placeholder="Contoh: Samsung, iPhone, Xiaomi"
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
                  placeholder="Contoh: Galaxy S23, iPhone 14"
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
                  placeholder="Deskripsikan keluhan atau kerusakan HP"
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
              {/* Available sparepart */}
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
                  {sparepartList.length === 0 && (
                    <span style={{ color: '#64748b', fontSize: '.8rem' }}>
                      Tidak ada sparepart. <a href="/sparepart/tambah" style={{ color: '#3b82f6' }}>Tambah dulu</a>
                    </span>
                  )}
                </div>
              </div>

              {/* Selected sparepart */}
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
                  placeholder="Biaya jasa servis"
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
                  placeholder="Catatan tambahan (opsional)"
                />
              </div>
            </div>
          </div>

          {/* Total & Submit */}
          <div className="section-card fade-in" style={{ marginBottom: '1.5rem', background: 'rgba(59, 130, 246, 0.08)', borderColor: '#3b82f6' }}>
            <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ color: 'var(--am-text-muted)', fontSize: '.875rem' }}>Total Biaya</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>
                  {formatRupiah(calculateTotal())}
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="am-btn am-btn-primary am-btn-pill"
                style={{ padding: '12px 32px', fontSize: '1rem' }}
              >
                {loading ? (
                  <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Menyimpan...</>
                ) : (
                  <><i className="bi bi-check-circle" /> Simpan Servis</>
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