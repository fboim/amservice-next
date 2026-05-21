'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function LabelServis() {
  const router = useRouter()
  const params = useParams()
  const id = params.id

  const [loading, setLoading] = useState(true)
  const [servis, setServis] = useState(null)
  const [printerReady, setPrinterReady] = useState(false)

  useEffect(() => {
    fetchServis()
    // Check if MesinKasir plugin is available
    const checkPrinter = setInterval(() => {
      if (window.MesinKasir) {
        setPrinterReady(true)
        clearInterval(checkPrinter)
      }
    }, 500)
    return () => clearInterval(checkPrinter)
  }, [id])

  // Direct print without queue (simpler, less blocking)
  const btSend = useCallback((type, data) => {
    try {
      if (type === 'teks') window.MesinKasir.cetakTeks(data)
      else if (type === 'tebal') window.MesinKasir.formatTebal(data)
      else if (type === 'logo') window.MesinKasir.cetakLogo(data)
      else if (type === 'qr') window.MesinKasir.cetakQR(data)
    } catch (e) { console.warn('BT error:', e) }
  }, [])

  // Print via Bluetooth (MesinKasir plugin)
  const handlePrintBluetooth = () => {
    if (!servis) return
    if (!window.MesinKasir) {
      alert('MesinKasir plugin belum aktif. Pastikan aplikasi terhubung ke printer.')
      return
    }

    const tipeBersih = servis.tipe_hp?.replace(/-/g, '').trim() || ''

    // Print label
    btSend('tebal', true)
    btSend('teks', servis.nama_pelanggan + '\n')
    btSend('tebal', false)
    btSend('tebal', true)
    btSend('teks', servis.merk_hp + ' ' + tipeBersih + '\n')
    btSend('tebal', false)
    btSend('tebal', true)
    btSend('teks', servis.no_hp || '-' + '\n')
    btSend('tebal', false)
    btSend('teks', '\n\n')
  }

  // Keyboard shortcuts (print disabled in WebView)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        router.back()
      }
      // Print shortcut disabled - causes WebView crash
      // else if (e.ctrlKey && e.key === 'p') {
      //   e.preventDefault()
      //   window.print()
      // }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [router])

  // Auto-print disabled completely - causes WebView crash
  // useEffect(() => {
  //   if (!loading && servis) {
  //     window.print()
  //   }
  // }, [loading, servis])

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
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#fff',
        fontFamily: 'Courier New, monospace'
      }}>
        <div className="label-skeleton">
          <div className="skeleton-line skeleton-name"></div>
          <div className="skeleton-unit"></div>
          <div className="skeleton-line skeleton-phone"></div>
        </div>
        <p style={{ fontSize: '11px', color: '#64748b', marginTop: '12px' }}>
          <i className="bi bi-printer" style={{ marginRight: '6px' }} />
          Mencetak label...
        </p>
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

        /* Skeleton Loading */
        .label-skeleton {
          width: 180px;
          padding: 12px;
          border: 2px solid #e2e8f0;
          border-radius: 6px;
        }
        .skeleton-line {
          height: 14px;
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
          margin: 8px auto;
        }
        .skeleton-name { width: 80%; }
        .skeleton-phone { width: 60%; }
        .skeleton-unit {
          height: 20px;
          background: linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
          margin: 10px -4px;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <div style={{
        width: '58mm',
        margin: '0 auto',
        padding: '4px 6px',
        fontFamily: 'Courier New, Courier, monospace',
        fontSize: '9px',
        color: '#000'
      }}>
        {/* Label Box - Clean version without header */}
        <div className="label-box">
          <div className="bold" style={{ fontSize: '11px', marginBottom: '3px' }}>{servis.nama_pelanggan}</div>
          <span className="unit-blok">{servis.merk_hp} {tipeBersih}</span>
          <div className="bold" style={{ fontSize: '11px', marginTop: '3px' }}>{servis.no_hp || '-'}</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ textAlign: 'center', marginTop: '20px' }} className="no-print">
        <button onClick={handlePrintBluetooth} style={{
          padding: '8px 24px',
          background: '#8b5cf6',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginRight: '10px'
        }}>
          <i className="bi bi-bluetooth" style={{ marginRight: '6px' }} />
          BT
        </button>
        <button onClick={() => alert('Gunakan tombol BT untuk mencetak via Bluetooth')} style={{
          padding: '8px 24px',
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginRight: '10px'
        }}>
          <i className="bi bi-printer" style={{ marginRight: '6px' }} />
          Cetak Ulang
        </button>
        <button onClick={() => router.back()} style={{
          padding: '8px 24px',
          background: '#334155',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}>
          <i className="bi bi-x-lg" style={{ marginRight: '6px' }} />
          Tutup (Esc)
        </button>
      </div>
    </>
  )
}