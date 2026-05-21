'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function GaransiServis() {
  const router = useRouter()
  const params = useParams()
  const id = params.id
  const printRef = useRef(null)

  const [loading, setLoading] = useState(true)
  const [servisData, setServisData] = useState(null)
  const [pengaturanData, setPengaturanData] = useState(null)
  const [downloading, setDownloading] = useState(false)
  const [printerReady, setPrinterReady] = useState(false)

  useEffect(() => {
    fetchAllData()
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
    if (!servisData) return
    if (!window.MesinKasir) {
      alert('MesinKasir plugin belum aktif. Pastikan aplikasi terhubung ke printer.')
      return
    }

    const p = pengaturanData || {}
    const servis = servisData
    const tipeBersih = servis.tipe_hp?.replace(/-/g, '').trim() || ''
    const keluhanBersih = getKeluhanBersih(servis.keluhan)
    const totalBiaya = formatRupiah(servis.estimasi_biaya)
    const masaGaransi = servis.garansi || 'Tidak Ada'
    const snkGaransi = p.snk_garansi || ''
    const linkMaps = p.link_maps || 'https://maps.google.com'

    const center = (t) => {
      t = String(t)
      if (t.length >= 32) return t.substring(0, 32) + '\n'
      return ' '.repeat(Math.floor((32 - t.length) / 2)) + t + '\n'
    }

    const lanjutCetak = () => {
      // Store name
      btSend('tebal', true)
      btSend('teks', center((p.nama_toko || 'AM SERVICE').toUpperCase()))
      btSend('tebal', false)
      btSend('teks', '\x1b\x4d\x01\x1b\x61\x01')

      // Address (melebar - satu baris panjang)
      if (p.alamat) {
        const al = p.alamat.replace(/\n/g, ' ')
        btSend('teks', al + '\n')
      }
      if (p.no_wa) btSend('teks', 'WA: ' + p.no_wa + '\n')

      btSend('teks', '\x1b\x4d\x00\x1b\x61\x00')
      btSend('teks', '--------------------------------\n')
      btSend('tebal', true)
      btSend('teks', center('NOTA GARANSI SERVIS'))
      btSend('tebal', false)
      btSend('teks', '--------------------------------\n')

      // Data
      btSend('teks', 'No: ' + servis.no_servis + ' | ' + new Date(servis.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit' }) + '\n')
      btSend('teks', 'Nama: ' + servis.nama_pelanggan + ' (' + (servis.no_hp || '-') + ')\n')
      btSend('teks', 'Unit: ' + servis.merk_hp + ' ' + tipeBersih + '\n')
      btSend('teks', 'Keluhan: ' + keluhanBersih + '\n')
      btSend('teks', '--------------------------------\n')

      // Total
      btSend('teks', '\x1b\x61\x01')
      btSend('tebal', true)
      btSend('teks', 'TOTAL BIAYA: Rp ' + totalBiaya + '\n')
      btSend('tebal', false)
      btSend('teks', '\x1b\x61\x00')

      // Garansi box
      btSend('teks', '--------------------------------\n')
      btSend('tebal', true)
      btSend('teks', center('MASA GARANSI: ' + masaGaransi.toUpperCase()))
      btSend('tebal', false)
      if (snkGaransi) {
        // Split SNK into lines (max 28 chars per line with padding)
        const raw = snkGaransi.replace(/<br\s*\/?>/gi, '\n')
        const lines = raw.split('\n')
        for (let i = 0; i < lines.length; i++) {
          let trimmed = lines[i].trim()
          if (!trimmed) continue
          // Word wrap at 28 chars - properly truncate
          while (trimmed.length > 28) {
            btSend('teks', '| ' + trimmed.substring(0, 28) + ' |\n')
            trimmed = trimmed.substring(28)
          }
          if (trimmed.length > 0) {
            btSend('teks', '| ' + trimmed.padEnd(28) + ' |\n')
          }
        }
      } else {
        btSend('teks', '| -                            |\n')
      }
      btSend('teks', "'------------------------------'\n")

      // QR Maps
      btSend('teks', '\x1b\x61\x01')
      btSend('teks', 'Bantu Kami Berkembang!\n')
      btSend('teks', 'Scan untuk review:\n')
      btSend('qr', linkMaps)
      btSend('teks', '\x1b\x61\x00')
      btSend('teks', '\n\n\n')
    }

    // Load logo and start printing (smaller size)
    const logoImg = new Image()
    logoImg.crossOrigin = 'Anonymous'
    logoImg.src = '/logo.png'
    logoImg.onload = () => {
      // Create smaller logo for thermal printer
      const cv = document.createElement('canvas')
      cv.width = 80
      cv.height = Math.round((logoImg.height / logoImg.width) * 80)
      if (cv.height > 80) cv.height = 80 // Max height 80px
      const ctx = cv.getContext('2d')
      ctx.fillStyle = '#FFF'
      ctx.fillRect(0, 0, cv.width, cv.height)
      ctx.drawImage(logoImg, 0, 0, cv.width, cv.height)
      const logoData = cv.toDataURL('image/png')
      btSend('logo', logoData)
      lanjutCetak()
    }
    logoImg.onerror = () => { lanjutCetak() }
  }

  // Keyboard shortcuts
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
  // useEffect(() => {
  //   if (!loading && servisData && printRef.current) {
  //     window.print()
  //   }
  // }, [loading, servisData])

  const fetchAllData = async () => {
    try {
      const baseUrl = window.location.origin

      const [servisRes, pengaturanRes] = await Promise.all([
        fetch(`${baseUrl}/api/servis?id=${id}`),
        fetch(`${baseUrl}/api/pengaturan`)
      ])

      const servisJson = await servisRes.json()
      if (servisJson.error) throw new Error(servisJson.error)
      setServisData(servisJson)

      if (pengaturanRes.ok) {
        const pengaturanJson = await pengaturanRes.json()
        if (pengaturanJson.pengaturan) {
          setPengaturanData(pengaturanJson.pengaturan)
        }
      }
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

  const handleDownloadPDF = async () => {
    if (!printRef.current || downloading) return
    setDownloading(true)

    try {
      const html2canvas = await loadHtml2Canvas()
      const { jsPDF } = await loadJsPDF()

      const content = printRef.current
      const canvas = await html2canvas(content, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      })

      const imgData = canvas.toDataURL('image/png')
      const pdfWidth = 58
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = pdfWidth / imgWidth
      const pdfHeight = imgHeight * ratio

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [pdfWidth, pdfHeight]
      })

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`GARANSI-${servisData.no_servis}.pdf`)
    } catch (err) {
      alert('Gagal download PDF: ' + err.message)
    } finally {
      setDownloading(false)
    }
  }

  const loadHtml2Canvas = () => {
    if (window.html2canvas) return Promise.resolve(window.html2canvas)
    return new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js'
      script.onload = () => resolve(window.html2canvas)
      document.head.appendChild(script)
    })
  }

  const loadJsPDF = () => {
    if (window.jspdf) return Promise.resolve({ jsPDF: window.jspdf.jsPDF })
    return new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js'
      script.onload = () => resolve({ jsPDF: window.jspdf.jsPDF })
      document.head.appendChild(script)
    })
  }

  // Loading Skeleton
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#e2e8f0' }}>
        <div className="thermal-skeleton">
          <div className="skeleton-logo"></div>
          <div className="skeleton-line skeleton-title"></div>
          <div className="skeleton-line skeleton-address"></div>
          <div className="skeleton-divider"></div>
          <div className="skeleton-line skeleton-header"></div>
          <div className="skeleton-divider"></div>
          <div className="skeleton-line"></div>
          <div className="skeleton-line"></div>
          <div className="skeleton-line"></div>
          <div className="skeleton-divider"></div>
          <div className="skeleton-line skeleton-total"></div>
          <div className="skeleton-divider"></div>
          <div className="skeleton-line"></div>
          <div className="skeleton-line"></div>
          <div className="skeleton-divider"></div>
          <div className="skeleton-qr"></div>
        </div>
        <p style={{ fontSize: '12px', color: '#64748b', marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i className="bi bi-printer" style={{ fontSize: '16px' }} />
          Mencetak nota garansi...
        </p>
      </div>
    )
  }

  if (!servisData) return null

  const p = pengaturanData || {}
  const servis = servisData
  const tipeBersih = servis.tipe_hp?.replace(/-/g, '').trim() || ''
  const keluhanBersih = getKeluhanBersih(servis.keluhan)
  const totalBiaya = formatRupiah(servis.estimasi_biaya)
  const masaGaransi = servis.garansi || 'Tidak Ada'
  const snkGaransi = p.snk_garansi || ''

  return (
    <>
      {/* Print Preview */}
      <div className="preview-wrapper">
        <div ref={printRef} className="thermal-preview">
          {/* Header with centered Logo */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '10px' }}>
            <img src="/logo_am.png" style={{ width: '50px', height: 'auto' }} alt="Logo" onError={(e) => { e.target.style.display = 'none' }} />
          </div>
          <div className="center bold" style={{ fontSize: '14px' }}>{(p.nama_toko || 'AM SERVICE').toUpperCase()}</div>
          {p.alamat && (
            <div className="center" style={{ fontSize: '9px', marginTop: '3px', lineHeight: 1.4 }}>{p.alamat}</div>
          )}
          {p.no_wa && (
            <div className="center" style={{ fontSize: '9px', marginTop: '3px', marginBottom: '6px' }}>WA: {p.no_wa}</div>
          )}

          <div style={{ borderBottom: '1px dashed #000', margin: '8px 0' }}></div>
          <div className="center bold" style={{ fontSize: '11px' }}>NOTA GARANSI SERVIS</div>
          <div style={{ borderBottom: '1px dashed #000', margin: '8px 0' }}></div>

          {/* Data */}
          <div style={{ fontSize: '11px', lineHeight: 1.6 }}>
            <div>No: {servis.no_servis} | {new Date(servis.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit' })}</div>
            <div>Nama: {servis.nama_pelanggan} ({servis.no_hp || '-'})</div>
            <div>Unit: <span className="bold">{servis.merk_hp} {tipeBersih}</span></div>
            <div>Keluhan: {keluhanBersih}</div>
          </div>

          <div style={{ borderBottom: '1px dashed #000', margin: '10px 0' }}></div>

          {/* Total */}
          <div className="center" style={{ margin: '8px 0' }}>
            <div style={{ fontSize: '11px' }}>TOTAL BIAYA:</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#dc2626' }}>Rp {totalBiaya}</div>
          </div>

          {/* Garansi */}
          <div style={{ border: '1px dashed #000', padding: '6px 8px', marginTop: '8px', fontSize: '9px', lineHeight: 1.5 }}>
            <div className="center bold" style={{ marginBottom: '4px', fontSize: '11px' }}>
              MASA GARANSI: {masaGaransi.toUpperCase()}
            </div>
            {snkGaransi ? snkGaransi.split('\n').map((line, i) => (
              line.trim() ? <div key={i}>{line.trim()}</div> : null
            )) : <div>-</div>}
          </div>

          <div style={{ borderBottom: '1px dashed #000', margin: '10px 0' }}></div>

          {/* QR - Centered */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '10px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '10px' }}>Bantu Kami Berkembang!</div>
            <div style={{ fontSize: '9px', marginTop: '3px' }}>Scan untuk review:</div>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&margin=4&data=${encodeURIComponent(p.link_maps || 'https://maps.google.com')}`}
              style={{ width: '80px', height: '80px', marginTop: '6px' }}
              alt="QR Maps"
            />
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="action-bar">
        <button onClick={() => router.back()} className="btn-back" title="Kembali (Esc)">
          <i className="bi bi-arrow-left" />
        </button>
        <button onClick={() => alert('Gunakan tombol BT untuk mencetak via Bluetooth')} className="btn-print" title="Cetak (Ctrl+P)">
          <i className="bi bi-printer" />
          Cetak
        </button>
        <button
          onClick={handlePrintBluetooth}
          className={printerReady ? 'btn-bluetooth' : 'btn-bluetooth-disconnect'}
          title={printerReady ? 'Cetak via Bluetooth' : 'MesinKasir belum terhubung'}
        >
          <i className="bi bi-bluetooth" />
          BT
        </button>
        <button
          onClick={handleDownloadPDF}
          disabled={downloading}
          className="btn-download"
        >
          {downloading ? (
            <>
              <span className="spinner" style={{ width: 16, height: 16 }} />
              Memproses...
            </>
          ) : (
            <>
              <i className="bi bi-file-earmark-pdf" />
              PDF
            </>
          )}
        </button>
      </div>

      <style jsx>{`
        /* Skeleton Loading */
        .thermal-skeleton {
          width: 220px;
          padding: 12px;
          background: #fff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          border-radius: 4px;
        }
        .skeleton-logo {
          width: 50px;
          height: 50px;
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
          margin: 0 auto 10px;
        }
        .skeleton-line {
          height: 12px;
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 3px;
          margin: 8px auto;
        }
        .skeleton-title { width: 70%; height: 14px; }
        .skeleton-address { width: 90%; }
        .skeleton-header { width: 80%; }
        .skeleton-total { width: 60%; height: 16px; }
        .skeleton-divider {
          height: 1px;
          background: #e2e8f0;
          margin: 10px 0;
        }
        .skeleton-qr {
          width: 80px;
          height: 80px;
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
          margin: 12px auto 0;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .preview-wrapper {
          background: #e2e8f0;
          min-height: 100vh;
          padding: 16px;
          display: flex;
          justify-content: center;
          overflow-x: auto;
          overflow-y: auto;
          box-sizing: border-box;
          padding-bottom: 80px;
        }
        .thermal-preview {
          width: 220px;
          flex-shrink: 0;
          background: #fff;
          padding: 12px;
          font-family: 'Courier New', Courier, monospace;
          font-size: 12px;
          color: #000;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          box-sizing: border-box;
        }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .thermal-preview img {
          display: block;
          margin-left: auto;
          margin-right: auto;
          max-width: 100%;
        }
        .thermal-preview * {
          max-width: 100%;
          word-wrap: break-word;
        }

        .action-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          display: flex;
          gap: 8px;
          padding: 12px 16px;
          background: #fff;
          box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
          z-index: 10;
        }
        .btn-back {
          width: 44px;
          height: 44px;
          border-radius: 8px;
          border: none;
          background: #e2e8f0;
          color: #64748b;
          font-size: 18px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .btn-print {
          flex: 1;
          height: 44px;
          border-radius: 8px;
          border: none;
          background: #3b82f6;
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .btn-download {
          flex: 1;
          height: 44px;
          border-radius: 8px;
          border: none;
          background: #dc2626;
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .btn-download:disabled {
          opacity: 0.7;
          cursor: wait;
        }
        .btn-bluetooth {
          height: 44px;
          padding: 0 16px;
          border-radius: 8px;
          border: none;
          background: #8b5cf6;
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .btn-bluetooth-disconnect {
          height: 44px;
          padding: 0 16px;
          border-radius: 8px;
          border: none;
          background: #64748b;
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .btn-bluetooth-disconnect:disabled {
          opacity: 0.7;
          cursor: wait;
        }
        .btn-bluetooth:hover, .btn-bluetooth-disconnect:hover {
          opacity: 0.9;
        }

        @media print {
          .action-bar { display: none !important; }
          .preview-wrapper {
            padding: 0;
            background: #fff;
          }
          .thermal-preview {
            box-shadow: none;
            width: 58mm;
          }
        }

        @media (max-width: 480px) {
          .preview-wrapper {
            padding: 8px;
            padding-bottom: 80px;
          }
        }
      `}</style>
    </>
  )
}