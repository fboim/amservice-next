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
      setServis(data)
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
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getKeluhanBersih = (keluhan) => {
    if (!keluhan) return '-'
    if (keluhan.includes('Keluhan:')) {
      const pecah = keluhan.split('Keluhan:')
      return pecah[1] ? pecah[1].trim() : '-'
    }
    return keluhan
  }

  const formatRupiah = (str) => {
    if (!str) return '0'
    const num = parseInt(String(str).replace(/\D/g, ''))
    return num.toLocaleString('id-ID')
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
  const keluhanBersih = getKeluhanBersih(servis.keluhan)
  const estimasi = formatRupiah(servis.estimasi_biaya)

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
        table { width: 100%; font-size: 9px; border-collapse: collapse; }
        td { vertical-align: top; padding-bottom: 2px; }
        .snk-box { border: 1px dashed #000; padding: 3px 4px; margin-top: 3px; font-size: 8px; }
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
        {/* Header */}
        <div className="center">
          <img src="/logo_am.png" style={{ width: '40px', height: 'auto' }} alt="Logo" />
        </div>
        <div className="center bold" style={{ fontSize: '11px', marginTop: '2px' }}>AM SERVICE</div>
        <div className="center" style={{ fontSize: '8px', marginTop: '1px' }}>WA: 0856 4722 7779</div>

        <div className="line"></div>
        <div className="center bold" style={{ fontSize: '9px' }}>TANDA TERIMA SERVIS</div>
        <div className="line"></div>

        {/* Data */}
        <table>
          <tbody>
            <tr>
              <td colSpan={2}>No: {servis.no_servis} | {formatDate(servis.tanggal)}</td>
            </tr>
            <tr>
              <td colSpan={2}>Nama: {servis.nama_pelanggan} ({servis.no_hp || '-'})</td>
            </tr>
            <tr>
              <td colSpan={2}>Unit: <span className="bold">{servis.merk_hp} {tipeBersih}</span></td>
            </tr>
            <tr>
              <td colSpan={2}>Keluhan: {keluhanBersih}</td>
            </tr>
          </tbody>
        </table>

        <div className="line"></div>

        {/* Estimasi */}
        <div style={{ margin: '3px 0', textAlign: 'center' }}>
          <div className="bold" style={{ fontSize: '10px' }}>ESTIMASI: Rp {estimasi}</div>
          <div style={{ fontSize: '7px', fontStyle: 'italic' }}>(Biaya bisa berubah setelah pengecekan)</div>
        </div>

        {/* SNK */}
        <div className="snk-box">
          1. Harap bawa nota ini saat pengambilan.<br/>
          2. Kehilangan data bukan tanggung jawab toko.
        </div>

        <div className="line"></div>

        {/* QR */}
        <div className="center" style={{ marginTop: '4px' }}>
          <div style={{ fontSize: '8px' }}>Scan untuk Cek Status:</div>
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&margin=0&data=https://amservice.web.id/cek_servis.php?no=${servis.no_servis}`}
            style={{ width: '80px', height: '80px' }}
            alt="QR Code"
          />
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
          Cetak
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