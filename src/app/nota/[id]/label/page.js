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
      setServis(data)
    } catch (err) {
      alert('Gagal memuat data: ' + err.message)
      router.back()
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#fff', fontFamily: 'Courier New, monospace' }}>
        <p style={{ fontSize: '12px' }}>Memuat...</p>
      </div>
    )
  }

  if (!servis) return null

  const tipeBersih = servis.tipe_hp?.replace(/-/g, '').trim() || ''

  return (
    <>
      <style>{`
        @page { size: 58mm auto; margin: 0; }
        body {
          font-family: 'Courier New', Courier, monospace;
          font-size: 9px;
          margin: 0;
          padding: 4px 6px;
          width: 46mm;
          color: #000;
          background: #fff;
        }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .line { border-bottom: 1px dashed #000; margin: 3px 0; }
        .label-box {
          border: 2px solid #000;
          padding: 5px 4px;
          text-align: center;
          border-radius: 4px;
        }
        .unit-blok {
          background: #000;
          color: #fff;
          font-size: 11px;
          font-weight: bold;
          padding: 3px 4px;
          margin: 4px -4px;
          text-transform: uppercase;
          display: block;
        }
        @media print {
          body { width: 100%; margin: 0; padding: 2px 4px; }
        }
        .no-print { display: none; }
      `}</style>

      <div style={{
        width: '58mm',
        margin: '0 auto',
        padding: '4px 6px',
        fontFamily: 'Courier New, Courier, monospace',
        fontSize: '9px',
        color: '#000'
      }}>
        {/* Label Box */}
        <div className="label-box">
          <div className="bold" style={{ fontSize: '10px', letterSpacing: '2px', borderBottom: '1px dashed #000', paddingBottom: '3px', marginBottom: '4px' }}>AM SERVICE</div>
          <div className="bold" style={{ fontSize: '11px', marginBottom: '3px' }}>{servis.nama_pelanggan}</div>
          <span className="unit-blok">{servis.merk_hp} {tipeBersih}</span>
          <div className="bold" style={{ fontSize: '11px', marginTop: '3px' }}>{servis.no_hp || '-'}</div>
          <div style={{ fontSize: '8px', marginTop: '3px', color: '#333' }}>{servis.no_servis}</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ textAlign: 'center', marginTop: '20px' }} className="no-print">
        <button onClick={() => window.print()} style={{
          padding: '8px 24px',
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginRight: '10px'
        }}>
          Cetak Label
        </button>
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