'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function NotaServis() {
  const router = useRouter()
  const params = useParams()
  const id = params.id
  const printRef = useRef()

  const [loading, setLoading] = useState(true)
  const [servis, setServis] = useState(null)
  const [sparepart, setSparepart] = useState([])

  useEffect(() => {
    fetchServis()
  }, [id])

  const fetchServis = async () => {
    try {
      const res = await fetch(`/api/servis?id=${id}`)
      const data = await res.json()

      if (data.error) throw new Error(data.error)

      setServis(data.servis)

      // Parse sparepart
      try {
        const parsed = JSON.parse(data.servis.sparepart_json || '[]')
        setSparepart(parsed)
      } catch (e) {
        setSparepart([])
      }
    } catch (err) {
      alert('Gagal memuat data: ' + err.message)
      router.back()
    } finally {
      setLoading(false)
    }
  }

  const formatRupiah = (num) => {
    return 'Rp ' + (num || 0).toLocaleString('id-ID')
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const handlePrint = () => {
    window.print()
  }

  const handleSendWA = async () => {
    if (!servis.no_hp) {
      alert('Nomor HP tidak tersedia')
      return
    }

    if (!confirm('Kirim notifikasi WhatsApp ke pelanggan?')) return

    try {
      const res = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, type: 'status' })
      })
      const data = await res.json()

      if (data.note) {
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
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    )
  }

  if (!servis) return null

  const totalBiaya = parseInt((servis.estimasi_biaya || '0').replace(/\D/g, ''))

  return (
    <div style={{ minHeight: '100vh', background: '#e2e8f0', padding: '2rem' }}>
      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #nota-content, #nota-content * {
            visibility: visible;
          }
          #nota-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
            padding: 20px;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Action Buttons */}
      <div style={{ maxWidth: 800, margin: '0 auto 2rem' }} className="no-print">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={() => router.back()}
            style={{
              padding: '10px 20px',
              background: '#334155',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            ← Kembali
          </button>
          <div style={{ display: 'flex', gap: 12 }}>
            {servis.no_hp && (
              <button
                onClick={handleSendWA}
                style={{
                  padding: '10px 24px',
                  background: '#25D366',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <i className="bi bi-whatsapp" />
                Kirim WA
              </button>
            )}
            <button
              onClick={handlePrint}
              style={{
                padding: '10px 24px',
                background: '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <i className="bi bi-printer" />
              Cetak Nota
            </button>
          </div>
        </div>
      </div>

      {/* Nota Content */}
      <div id="nota-content" ref={printRef} style={{
        maxWidth: 800,
        margin: '0 auto',
        background: '#fff',
        borderRadius: 8,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        color: '#1e293b'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          color: '#fff',
          padding: '2rem',
          borderRadius: '8px 8px 0 0',
          textAlign: 'center'
        }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>AM SERVICE</h1>
          <p style={{ margin: '4px 0 0', fontSize: '.875rem', opacity: 0.8 }}>
            Jl. Contoh No. 123, Kota<br />
            Telp: 0812-3456-7890
          </p>
          <div style={{
            marginTop: '1rem',
            paddingTop: '1rem',
            borderTop: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>NOTA SERVIS</div>
            <div style={{ fontSize: '.9rem', opacity: 0.8, marginTop: 4 }}>
              No: {servis.no_servis}
            </div>
          </div>
        </div>

        {/* Info */}
        <div style={{ padding: '1.5rem 2rem', borderBottom: '2px solid #e2e8f0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '.7rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Tanggal</div>
              <div style={{ fontWeight: 600 }}>{formatDate(servis.tanggal)}</div>
            </div>
            <div>
              <div style={{ fontSize: '.7rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Status</div>
              <div style={{
                display: 'inline-block',
                padding: '2px 10px',
                borderRadius: 999,
                fontSize: '.75rem',
                fontWeight: 600,
                background: servis.status === 'Sudah Diambil' ? '#dcfce7' : '#fef3c7',
                color: servis.status === 'Sudah Diambil' ? '#166534' : '#92400e'
              }}>
                {servis.status}
              </div>
            </div>
          </div>
        </div>

        {/* Pelanggan & Unit */}
        <div style={{ padding: '1.5rem 2rem', borderBottom: '2px solid #e2e8f0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <div style={{ fontSize: '.7rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>Data Pelanggan</div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{servis.nama_pelanggan}</div>
            <div style={{ fontSize: '.875rem', color: '#475569' }}>{servis.no_hp || '-'}</div>
            {servis.teknisi && (
              <div style={{ marginTop: 8, fontSize: '.8rem' }}>
                <span style={{ color: '#64748b' }}>Teknisi: </span>
                <span>{servis.teknisi}</span>
              </div>
            )}
          </div>
          <div>
            <div style={{ fontSize: '.7rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>Unit HP</div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{servis.merk_hp} {servis.tipe_hp}</div>
            <div style={{ fontSize: '.875rem', color: '#475569', marginTop: 4 }}>Keluhan:</div>
            <div style={{ fontSize: '.875rem' }}>{servis.keluhan || '-'}</div>
          </div>
        </div>

        {/* Sparepart */}
        {sparepart.length > 0 && (
          <div style={{ padding: '1.5rem 2rem', borderBottom: '2px solid #e2e8f0' }}>
            <div style={{ fontSize: '.7rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: 12 }}>Sparepart Digunakan</div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ textAlign: 'left', padding: '8px 0', fontSize: '.75rem', color: '#64748b' }}>Sparepart</th>
                  <th style={{ textAlign: 'center', padding: '8px 0', fontSize: '.75rem', color: '#64748b' }}>Qty</th>
                  <th style={{ textAlign: 'right', padding: '8px 0', fontSize: '.75rem', color: '#64748b' }}>Harga</th>
                  <th style={{ textAlign: 'right', padding: '8px 0', fontSize: '.75rem', color: '#64748b' }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {sparepart.map((sp, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 0' }}>{sp.nama_sparepart}</td>
                    <td style={{ textAlign: 'center', padding: '10px 0' }}>{sp.qty}</td>
                    <td style={{ textAlign: 'right', padding: '10px 0' }}>{formatRupiah(sp.harga)}</td>
                    <td style={{ textAlign: 'right', padding: '10px 0', fontWeight: 600 }}>
                      {formatRupiah(parseInt(sp.harga) * sp.qty)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Total */}
        <div style={{ padding: '1.5rem 2rem', borderBottom: '2px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>TOTAL BIAYA</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#dc2626' }}>
              {servis.estimasi_biaya}
            </div>
          </div>
        </div>

        {/* Catatan */}
        {servis.catatan && (
          <div style={{ padding: '1.5rem 2rem', borderBottom: '2px solid #e2e8f0' }}>
            <div style={{ fontSize: '.7rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>Catatan</div>
            <div style={{ fontSize: '.875rem' }}>{servis.catatan}</div>
          </div>
        )}

        {/* Garansi */}
        <div style={{ padding: '1.5rem 2rem', borderBottom: '2px solid #e2e8f0' }}>
          <div style={{ fontSize: '.7rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>Garansi</div>
          <div style={{ fontSize: '.875rem' }}>{servis.garansi || 'Tidak Ada'}</div>
        </div>

        {/* Footer */}
        <div style={{ padding: '2rem', textAlign: 'center', background: '#f8fafc' }}>
          <div style={{ fontSize: '.75rem', color: '#64748b', marginBottom: '1rem' }}>
            Terima kasih telah menggunakan jasa kami
          </div>
          <div style={{
            display: 'inline-block',
            padding: '8px 20px',
            background: '#1e293b',
            color: '#fff',
            borderRadius: 6,
            fontSize: '.7rem'
          }}>
            {servis.no_servis} - {new Date().toLocaleDateString('id-ID')}
          </div>
        </div>
      </div>
    </div>
  )
}