'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function GaransiServis() {
  const router = useRouter()
  const params = useParams()
  const id = params.id
  const printRef = useRef(null)

  const [loading, setLoading] = useState(true)
  const [servisData, setServisData] = useState(null)
  const [pengaturanData, setPengaturanData] = useState(null)
  const [allReady, setAllReady] = useState(false)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    fetchAllData()
  }, [id])

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

      setAllReady(true)
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
      // Dynamic import html2canvas and jspdf
      const html2canvas = await loadHtml2Canvas()
      const { jsPDF } = await loadJsPDF()

      const content = printRef.current
      const canvas = await html2canvas(content, { scale: 2, useCORS: true, width: content.scrollWidth })
      const imgData = canvas.toDataURL('image/png')

      const pdf = new jsPDF('p', 'mm', [58, content.scrollHeight / 2 + 20])
      const pageWidth = pdf.internal.pageSize.getWidth()
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = pageWidth / imgWidth * 2
      const scaledHeight = imgHeight * ratio

      pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, scaledHeight)
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

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#fff', fontFamily: 'Courier New, Courier, monospace' }}>
        <p style={{ fontSize: '12px' }}>Memuat...</p>
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
      {/* Print Preview - thermal paper style (exact size match) */}
      <div className="preview-wrapper">
        <div ref={printRef} className="thermal-preview">
          {/* Header dengan Logo */}
          <div className="center" style={{ marginBottom: '10px' }}>
            <img src="/logo_am.png" style={{ width: '60px', height: 'auto' }} alt="Logo" />
          </div>
          <div className="center bold" style={{ fontSize: '16px' }}>{(p.nama_toko || 'AM SERVICE').toUpperCase()}</div>
          {p.alamat && (
            <div className="center" style={{ fontSize: '10px', marginTop: '4px', lineHeight: 1.4 }}>{p.alamat}</div>
          )}
          {p.no_wa && (
            <div className="center" style={{ fontSize: '10px', marginTop: '4px', marginBottom: '6px' }}>WA: {p.no_wa}</div>
          )}

          <div style={{ borderBottom: '1px dashed #000', margin: '8px 0' }}></div>
          <div className="center bold" style={{ fontSize: '12px' }}>NOTA GARANSI SERVIS</div>
          <div style={{ borderBottom: '1px dashed #000', margin: '8px 0' }}></div>

          {/* Data */}
          <div style={{ fontSize: '12px', lineHeight: 1.5 }}>
            <div><span style={{ fontWeight: 'bold' }}>No:</span> {servis.no_servis} | {new Date(servis.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit' })}</div>
            <div><span style={{ fontWeight: 'bold' }}>Nama:</span> {servis.nama_pelanggan} ({servis.no_hp || '-'})</div>
            <div><span style={{ fontWeight: 'bold' }}>Unit:</span> {servis.merk_hp} {tipeBersih}</div>
            <div><span style={{ fontWeight: 'bold' }}>Keluhan:</span> {keluhanBersih}</div>
          </div>

          <div style={{ borderBottom: '1px dashed #000', margin: '10px 0' }}></div>

          {/* Total */}
          <div className="center" style={{ margin: '8px 0' }}>
            <div style={{ fontSize: '12px' }}>TOTAL BIAYA:</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#dc2626' }}>Rp {totalBiaya}</div>
          </div>

          {/* Garansi */}
          <div style={{ border: '1px dashed #000', padding: '8px', marginTop: '8px', fontSize: '11px', lineHeight: 1.5 }}>
            <div className="center bold" style={{ marginBottom: '6px', fontSize: '12px' }}>
              MASA GARANSI: {masaGaransi.toUpperCase()}
            </div>
            {snkGaransi ? snkGaransi.split('\n').map((line, i) => (
              line.trim() ? <div key={i}>{line.trim()}</div> : null
            )) : <div>-</div>}
          </div>

          <div style={{ borderBottom: '1px dashed #000', margin: '10px 0' }}></div>

          {/* QR */}
          <div className="center" style={{ marginTop: '12px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '11px' }}>Bantu Kami Berkembang!</div>
            <div style={{ fontSize: '10px', marginTop: '4px' }}>Scan untuk review:</div>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&margin=4&data=${encodeURIComponent(p.link_maps || 'https://maps.google.com')}`}
              style={{ width: '100px', height: '100px', marginTop: '6px' }}
              alt="QR Maps"
            />
          </div>
        </div>
      </div>

      {/* Download Button */}
      <div className="action-bar">
        <button
          onClick={() => router.back()}
          className="btn-back"
        >
          <i className="bi bi-arrow-left" />
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
              Download PDF
            </>
          )}
        </button>
      </div>

      <style jsx>{`
        .preview-wrapper {
          background: #e2e8f0;
          min-height: 100vh;
          padding: 16px;
          display: flex;
          justify-content: center;
          overflow-x: auto;
          overflow-y: auto;
          box-sizing: border-box;
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

        @media (max-width: 480px) {
          .preview-wrapper {
            padding: 8px;
            padding-bottom: 80px;
            justify-content: flex-start;
          }
        }
      `}</style>
    </>
  )
}