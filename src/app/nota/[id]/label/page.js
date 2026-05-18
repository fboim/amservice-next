'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function LabelServis() {
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
      day: '2-digit',
      month: 'short',
      year: '2-digit'
    })
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
          @page { size: 80mm 40mm; margin: 0; }
          body { margin: 0; padding: 0; font-size: 10px; }
        }
      `}</style>

      <div style={{
        width: '80mm',
        padding: '8px',
        fontFamily: 'Arial, sans-serif',
        fontSize: '11px',
        lineHeight: 1.3
      }}>
        <div style={{ textAlign: 'center', marginBottom: '6px', borderBottom: '1px dashed #000', paddingBottom: '6px' }}>
          <strong style={{ fontSize: '14px' }}>AM SERVICE</strong>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
          <tr>
            <td style={{ fontWeight: 'bold', width: '30%' }}>No</td>
            <td>: {servis.no_servis}</td>
          </tr>
          <tr>
            <td style={{ fontWeight: 'bold' }}>Tgl</td>
            <td>: {formatDate(servis.tanggal)}</td>
          </tr>
          <tr>
            <td style={{ fontWeight: 'bold' }}>Nama</td>
            <td>: {servis.nama_pelanggan}</td>
          </tr>
          <tr>
            <td style={{ fontWeight: 'bold' }}>HP</td>
            <td>: {servis.merk_hp} {servis.tipe_hp}</td>
          </tr>
          <tr>
            <td style={{ fontWeight: 'bold', verticalAlign: 'top' }}>Kerusakan</td>
            <td>: {servis.keluhan?.substring(0, 50) || '-'}</td>
          </tr>
        </table>

        <div style={{ textAlign: 'center', marginTop: '8px' }}>
          <svg id="barcode-{id}"></svg>
        </div>

        <div style={{ textAlign: 'center', marginTop: '4px', fontSize: '9px' }}>
          {servis.no_servis}
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button onClick={() => window.close()} style={{ padding: '8px 16px' }}>
          Tutup
        </button>
      </div>
    </>
  )
}