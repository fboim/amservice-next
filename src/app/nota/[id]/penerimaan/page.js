'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function NotaPenerimaan() {
  const router = useRouter()
  const params = useParams()
  const id = params.id

  const [loading, setLoading] = useState(true)
  const [servis, setServis] = useState(null)

  useEffect(() => {
    fetchServis()
  }, [id])

  const fetchServis = async () => {
    try {
      const res = await fetch(`/api/servis?id=${id}`)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setServis(data.servis)
    } catch (err) {
      alert('Gagal memuat data: ' + err.message)
      router.back()
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatRupiah = (str) => {
    if (!str) return 'Rp 0'
    const num = parseInt(String(str).replace(/\D/g, ''))
    return 'Rp ' + num.toLocaleString('id-ID')
  }

  useEffect(() => {
    if (!loading && servis) {
      window.print()
    }
  }, [loading, servis])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <p>Memuat...</p>
      </div>
    )
  }

  if (!servis) return null

  return (
    <>
      <style>{`
        @media print {
          @page { size: 80mm auto; margin: 0; }
          body { font-size: 11px; }
        }
      `}</style>

      <div style={{
        width: '80mm',
        padding: '10px',
        fontFamily: 'Courier New, monospace',
        fontSize: '12px',
        lineHeight: 1.4
      }}>
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          <strong style={{ fontSize: '16px' }}>AM SERVICE</strong><br/>
          Jl. Contoh No. 123, Kota<br/>
          Telp: 0812-3456-7890
        </div>

        <div style={{ textAlign: 'center', borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '5px 0', margin: '5px 0' }}>
          <strong>NOTA PENERIMAAN</strong><br/>
          No: {servis.no_servis}
        </div>

        <div style={{ marginTop: '10px' }}>
          <div>Tanggal: {formatDate(servis.tanggal)}</div>
          <div style={{ marginTop: '5px' }}>
            <strong>Pelanggan:</strong><br/>
            {servis.nama_pelanggan}<br/>
            {servis.no_hp || '-'}
          </div>
          <div style={{ marginTop: '5px' }}>
            <strong>Unit:</strong><br/>
            {servis.merk_hp} {servis.tipe_hp}
          </div>
          <div style={{ marginTop: '5px' }}>
            <strong>Keluhan:</strong><br/>
            {servis.keluhan || '-'}
          </div>
        </div>

        <div style={{ marginTop: '10px', borderTop: '1px dashed #000', paddingTop: '5px' }}>
          <strong>PERKIRAAN:</strong>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Biaya Servis:</span>
            <span>{servis.estimasi_biaya || 'Rp 0'}</span>
          </div>
        </div>

        <div style={{ marginTop: '10px', padding: '5px', background: '#f5f5f5', fontSize: '10px' }}>
          <strong>SYARAT:</strong><br/>
          - Ambil HP dengan nota ini<br/>
          - Garansi sesuai ketentuan<br/>
          - Tidak valid tanpa stiker
        </div>

        <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ textAlign: 'center', borderTop: '1px solid #000', paddingTop: '3px', width: '45%' }}>
            Pelanggan
          </div>
          <div style={{ textAlign: 'center', borderTop: '1px solid #000', paddingTop: '3px', width: '45%' }}>
            Admin
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '10px' }}>
          {new Date().toLocaleDateString('id-ID')}
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button onClick={() => window.close()} style={{
          padding: '8px 24px',
          background: '#334155',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}>
          Tutup
        </button>
      </div>
    </>
  )
}