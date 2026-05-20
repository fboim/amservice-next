'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function GaransiServis() {
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#fff', fontFamily: 'Courier New, Courier, monospace' }}>
        <p style={{ fontSize: '12px' }}>Memuat...</p>
      </div>
    )
  }

  if (!servis) return null

  const tipeBersih = servis.tipe_hp?.replace(/-/g, '').trim() || ''
  const keluhanBersih = getKeluhanBersih(servis.keluhan)
  const totalBiaya = formatRupiah(servis.estimasi_biaya)
  const masaGaransi = servis.garansi || 'Tidak Ada'

  const snkGaransi = "1. Garansi hanya berlaku untuk sparepart yang diganti.\n2. Kerusakan akibat jatuh, kena air, atau kesalahan pemakian tidak termasuk garansi.\n3. Garansi tidak berlaku jika stiker garansi sobek atau hilang."

  return (
    <>
      <style>{`
        @page { size: 58mm auto; margin: 0; }
        body {
          font-family: 'Courier New', Courier, monospace;
          font-size: 12px;
          margin: 0;
          padding: 10px;
          width: 50mm;
          color: #000;
          background: #fff;
        }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .line { border-bottom: 1px dashed #000; margin: 5px 0; }
        table { width: 100%; font-size: 12px; border-collapse: collapse; }
        td { vertical-align: top; padding-bottom: 3px; }
        .garansi-box {
          border: 1px dashed #000;
          padding: 5px;
          margin-top: 5px;
          font-size: 10px;
          text-align: left;
        }
        @media print {
          body { width: 100%; margin: 0; padding: 0; }
        }
        .no-print { display: none; }
      `}</style>

      <div style={{
        width: '58mm',
        margin: '0 auto',
        padding: '10px',
        fontFamily: 'Courier New, Courier, monospace',
        fontSize: '12px',
        color: '#000'
      }}>
        {/* Header dengan Logo */}
        <div className="center">
          <img src="/logo_am.png" style={{ width: '60px', height: 'auto' }} alt="Logo AM Service" />
        </div>
        <div className="center bold" style={{ fontSize: '16px', marginTop: '3px' }}>AM SERVICE</div>
        <div className="center" style={{ fontSize: '10px', marginBottom: '3px' }}>WA: 0856 4722 7779</div>

        <div className="line"></div>
        <div className="center" style={{ fontSize: '10px' }}>NOTA GARANSI SERVIS</div>
        <div className="line"></div>

        {/* Data Table */}
        <table>
          <tbody>
            <tr>
              <td colSpan="2">No: {servis.no_servis} | {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '/')}</td>
            </tr>
            <tr>
              <td colSpan="2">Nama: {servis.nama_pelanggan} ({servis.no_hp || '-'})</td>
            </tr>
            <tr>
              <td colSpan="2">Unit: <span className="bold">{servis.merk_hp} {tipeBersih}</span></td>
            </tr>
            <tr>
              <td colSpan="2">Keluhan: {keluhanBersih}</td>
            </tr>
          </tbody>
        </table>

        <div className="line"></div>

        {/* Total Biaya */}
        <div className="center" style={{ margin: '8px 0' }}>
          <div style={{ fontSize: '12px' }}>TOTAL BIAYA :</div>
          <div className="bold" style={{ fontSize: '16px' }}>Rp {totalBiaya}</div>
        </div>

        {/* Garansi Box */}
        <div className="garansi-box">
          <div className="bold center" style={{ marginBottom: '4px', fontSize: '11px' }}>
            MASA GARANSI: {masaGaransi.toUpperCase()}
          </div>
          {snkGaransi.split('\n').map((line, i) => (
            <span key={i}>{line}<br/></span>
          ))}
        </div>

        <div className="line"></div>

        {/* QR Maps */}
        <div className="center" style={{ marginTop: '10px' }}>
          <div className="bold">Bantu Kami Berkembang!</div>
          <div style={{ fontSize: '10px', marginTop: '3px' }}>Scan QR ini untuk ulas di Google Maps:</div>
          <img
            src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&margin=0&data=https://maps.google.com"
            style={{ width: '100px', height: '100px' }}
            alt="QR Maps"
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