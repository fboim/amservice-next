'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function NotaServis() {
  const router = useRouter()
  const params = useParams()
  const id = params.id
  const printRef = useRef()

  const [loading, setLoading] = useState(true)
  const [servis, setServis] = useState(null)
  const [sparepart, setSparepart] = useState([])
  const [pengaturan, setPengaturan] = useState(null)
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
    if (!servis) return
    if (!window.MesinKasir) {
      alert('MesinKasir plugin belum aktif. Pastikan aplikasi terhubung ke printer.')
      return
    }

    const p = pengaturan || {}
    const linkCek = `https://amservice.web.id/?no=${servis.no_servis}`
    const totalBiaya = servis.estimasi_biaya || 'Rp 0'

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

      // Address (melebar)
      if (p.alamat) {
        const al = p.alamat.replace(/\n/g, ' ')
        btSend('teks', al + '\n')
      }
      if (p.no_wa) btSend('teks', 'WA: ' + p.no_wa + '\n')

      btSend('teks', '\x1b\x4d\x00\x1b\x61\x00')
      btSend('teks', '--------------------------------\n')
      btSend('tebal', true)
      btSend('teks', center('NOTA LUNAS / PENGAMBILAN'))
      btSend('tebal', false)
      btSend('teks', '--------------------------------\n')

      // Data
      btSend('teks', 'No: ' + servis.no_servis + ' | ' + formatDate(servis.tanggal) + '\n')
      btSend('teks', 'Nama: ' + servis.nama_pelanggan + ' (' + (servis.no_hp || '-') + ')\n')
      btSend('teks', 'Unit: ' + servis.merk_hp + ' ' + (servis.tipe_hp || '') + '\n')
      btSend('teks', '--------------------------------\n')
      if (servis.keluhan) {
        btSend('teks', 'Keluhan: ' + servis.keluhan + '\n')
        btSend('teks', '--------------------------------\n')
      }

      // Total
      btSend('teks', '\x1b\x61\x01')
      btSend('tebal', true)
      btSend('teks', 'TOTAL: ' + totalBiaya + '\n')
      btSend('tebal', false)
      btSend('teks', '\x1b\x61\x00')

      // Status & Garansi
      if (servis.status) btSend('teks', 'Status: ' + servis.status + '\n')
      if (servis.garansi) btSend('teks', 'Garansi: ' + servis.garansi + '\n')
      btSend('teks', '--------------------------------\n')

      // Thank you
      btSend('teks', '.------------------------------.\n')
      btSend('teks', '|  Terima Kasih Atas           |\n')
      btSend('teks', '|  Kepercayaan Anda            |\n')
      btSend('teks', "'------------------------------'\n")

      // QR
      btSend('teks', '\x1b\x61\x01')
      btSend('teks', 'Cek Status Servis:\n')
      btSend('qr', linkCek)
      btSend('teks', '\x1b\x61\x00')
      btSend('teks', '\n\n\n')
    }

    // Load logo and start printing
    const loadLogo = (src) => {
      const logoImg = new Image()
      logoImg.crossOrigin = 'Anonymous'
      logoImg.src = src
      logoImg.onload = () => {
        const cv = document.createElement('canvas')
        cv.width = 80
        cv.height = Math.round((logoImg.height / logoImg.width) * 80)
        if (cv.height > 80) cv.height = 80
        const ctx = cv.getContext('2d')
        ctx.fillStyle = '#FFF'
        ctx.fillRect(0, 0, cv.width, cv.height)
        ctx.drawImage(logoImg, 0, 0, cv.width, cv.height)
        btSend('logo', cv.toDataURL('image/png'))
        lanjutCetak()
      }
      logoImg.onerror = () => {
        if (src === '/logo_am.png') {
          loadLogo('/logo.png')
        } else {
          lanjutCetak()
        }
      }
    }
    loadLogo('/logo_am.png')
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
  //   if (!loading && servis && printRef.current) {
  //     window.print()
  //   }
  // }, [loading, servis])

  const fetchAllData = async () => {
    try {
      const baseUrl = window.location.origin
      const [servisRes, pengaturanRes] = await Promise.all([
        fetch(`${baseUrl}/api/servis?id=${id}`),
        fetch(`${baseUrl}/api/pengaturan`)
      ])

      const servisData = await servisRes.json()
      if (servisData.error) throw new Error(servisData.error)
      setServis(servisData.servis)

      // Parse sparepart
      try {
        const parsed = JSON.parse(servisData.servis.sparepart_json || '[]')
        setSparepart(parsed)
      } catch (e) {
        setSparepart([])
      }

      if (pengaturanRes.ok) {
        const pengaturanData = await pengaturanRes.json()
        if (pengaturanData.pengaturan) {
          setPengaturan(pengaturanData.pengaturan)
        }
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

  const loadHtml2Canvas = async () => {
    if (window.html2canvas) return window.html2canvas
    return new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js'
      script.onload = () => resolve(window.html2canvas)
      document.head.appendChild(script)
    })
  }

  const loadJsPDF = async () => {
    if (window.jspdf) return window.jspdf
    return new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js'
      script.onload = () => resolve(window.jspdf)
      document.head.appendChild(script)
    })
  }

  const handleDownloadPDF = async () => {
    if (!servis || downloading) return
    setDownloading(true)

    try {
      const html2canvas = await loadHtml2Canvas()
      const { jsPDF } = await loadJsPDF()
      const content = document.getElementById('nota-content')
      const canvas = await html2canvas(content, { scale: 2, useCORS: true })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = pageWidth / imgWidth * 2
      const scaledHeight = imgHeight * ratio
      let heightLeft = scaledHeight
      let position = 0
      pdf.addImage(imgData, 'PNG', 0, position, pageWidth, scaledHeight)
      heightLeft -= pageHeight
      while (heightLeft > 0) {
        position = heightLeft - scaledHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, pageWidth, scaledHeight)
        heightLeft -= pageHeight
      }
      pdf.save(`NOTA-${servis.no_servis}.pdf`)
    } catch (err) {
      alert('Gagal download PDF: ' + err.message)
    } finally {
      setDownloading(false)
    }
  }

  // Loading Skeleton
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#e2e8f0',
        padding: '20px'
      }}>
        <div className="nota-skeleton">
          <div className="skeleton-header"></div>
          <div className="skeleton-info-row">
            <div className="skeleton-info"></div>
            <div className="skeleton-info"></div>
          </div>
          <div className="skeleton-divider"></div>
          <div className="skeleton-two-col">
            <div>
              <div className="skeleton-label"></div>
              <div className="skeleton-text"></div>
            </div>
            <div>
              <div className="skeleton-label"></div>
              <div className="skeleton-text"></div>
            </div>
          </div>
          <div className="skeleton-divider"></div>
          <div className="skeleton-total"></div>
        </div>
        <p style={{ fontSize: '13px', color: '#64748b', marginTop: '16px' }}>
          <i className="bi bi-printer" style={{ marginRight: '8px' }} />
          Mencetak nota...
        </p>
      </div>
    )
  }

  if (!servis) return null

  const totalBiaya = parseInt(String(servis.estimasi_biaya || '0').replace(/\D/g, ''))

  return (
    <div style={{ minHeight: '100vh', background: '#e2e8f0', padding: '2rem' }}>
      <style jsx>{`
        .nota-skeleton {
          width: 100%;
          max-width: 600px;
          background: #fff;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }
        .skeleton-header {
          height: 80px;
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 8px;
          margin-bottom: 16px;
        }
        .skeleton-info-row {
          display: flex;
          gap: 16px;
          margin-bottom: 16px;
        }
        .skeleton-info {
          flex: 1;
          height: 60px;
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 8px;
        }
        .skeleton-divider {
          height: 2px;
          background: #e2e8f0;
          margin: 16px 0;
        }
        .skeleton-two-col {
          display: flex;
          gap: 24px;
        }
        .skeleton-two-col > div {
          flex: 1;
        }
        .skeleton-label {
          width: 80px;
          height: 12px;
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
          margin-bottom: 8px;
        }
        .skeleton-text {
          width: 100%;
          height: 40px;
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
        }
        .skeleton-total {
          width: 200px;
          height: 50px;
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 8px;
          margin: 16px auto 0;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
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
              gap: 8,
              fontWeight: 600
            }}
          >
            <i className="bi bi-arrow-left" /> Kembali
          </button>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {servis.no_hp && (
              <button
                onClick={handleSendWA}
                style={{
                  padding: '10px 20px',
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
                <i className="bi bi-whatsapp" /> Kirim WA
              </button>
            )}
            <a
              href={`/nota/${id}/penerimaan`}
              target="_blank"
              style={{
                padding: '10px 20px',
                background: '#64748b',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                textDecoration: 'none'
              }}
            >
              <i className="bi bi-file-earmark-text" /> Nota Terima
            </a>
            <a
              href={`/nota/${id}/garansi`}
              target="_blank"
              style={{
                padding: '10px 20px',
                background: '#8b5cf6',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                textDecoration: 'none'
              }}
            >
              <i className="bi bi-shield-check" /> Garansi
            </a>
            <a
              href={`/nota/${id}/label`}
              target="_blank"
              style={{
                padding: '10px 20px',
                background: '#06b6d4',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                textDecoration: 'none'
              }}
            >
              <i className="bi bi-upc" /> Label
            </a>
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              style={{
                padding: '10px 20px',
                background: '#059669',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                cursor: downloading ? 'wait' : 'pointer',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                opacity: downloading ? 0.7 : 1
              }}
            >
              <i className="bi bi-file-earmark-pdf" />
              {downloading ? 'Memproses...' : 'Download PDF'}
            </button>
            <button
              onClick={handlePrintBluetooth}
              style={{
                padding: '10px 20px',
                background: '#8b5cf6',
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
              <i className="bi bi-bluetooth" /> BT
            </button>
            <button
              onClick={() => alert('Gunakan tombol BT untuk mencetak via Bluetooth')}
              style={{
                padding: '10px 20px',
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
              <i className="bi bi-printer" /> Cetak Nota
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