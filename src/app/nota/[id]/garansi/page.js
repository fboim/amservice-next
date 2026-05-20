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

  useEffect(() => {
    fetchAllData()
  }, [id])

  const fetchAllData = async () => {
    try {
      const baseUrl = window.location.origin

      // Fetch both at the same time
      const [servisRes, pengaturanRes] = await Promise.all([
        fetch(`${baseUrl}/api/servis?id=${id}`),
        fetch(`${baseUrl}/api/pengaturan`)
      ])

      // Parse servis
      const servisJson = await servisRes.json()
      if (servisJson.error) throw new Error(servisJson.error)
      setServisData(servisJson)

      // Parse pengaturan
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

  // Auto print when all data is ready
  useEffect(() => {
    if (allReady && servisData) {
      setTimeout(() => {
        eksekusiCetak()
      }, 500)
    }
  }, [allReady])

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

  const wrapText = (text, maxLen) => {
    if (!text) return []
    const words = text.split(' ')
    const lines = []
    let currentLine = ''
    words.forEach(word => {
      if ((currentLine + ' ' + word).trim().length > maxLen) {
        if (currentLine) lines.push(currentLine.trim())
        currentLine = word
      } else {
        currentLine = (currentLine + ' ' + word).trim()
      }
    })
    if (currentLine) lines.push(currentLine.trim())
    return lines
  }

  const tengah = (txt) => {
    txt = String(txt)
    if (txt.length >= 32) return txt.substring(0, 32) + '\n'
    return ' '.repeat(Math.floor((32 - txt.length) / 2)) + txt + '\n'
  }

  const eksekusiCetak = () => {
    if (typeof window.MesinKasir !== 'undefined') {
      printWithMesinKasir()
    } else {
      window.print()
    }
  }

  const printWithMesinKasir = () => {
    if (!servisData) return

    // Get data from state
    const p = pengaturanData || {}
    const servis = servisData

    const tipeBersih = (servis.tipe_hp || '').replace(/-/g, '').trim()
    const keluhanBersih = getKeluhanBersih(servis.keluhan)
    const totalBiaya = formatRupiah(servis.estimasi_biaya)
    const masaGaransi = (servis.garansi || 'Tidak Ada').toUpperCase()
    const namaToko = (p.nama_toko || 'AM SERVICE').toUpperCase()
    const noWa = p.no_wa || ''
    const alamat = p.alamat || ''
    const snkGaransi = p.snk_garansi || ''
    const linkMaps = p.link_maps || 'https://maps.google.com'

    console.log('PRINT DATA:', { namaToko, alamat, noWa, snkGaransi })

    const _btQueue = []
    let _btBusy = false
    const BT_DELAY = 100

    const btSend = (type, data) => {
      _btQueue.push({ type, data })
      if (!_btBusy) _btNext()
    }

    const _btNext = () => {
      if (_btQueue.length === 0) { _btBusy = false; return }
      _btBusy = true
      const cmd = _btQueue.shift()
      try {
        if (cmd.type === 'teks') window.MesinKasir.cetakTeks(cmd.data)
        else if (cmd.type === 'tebal') window.MesinKasir.formatTebal(cmd.data)
        else if (cmd.type === 'logo') window.MesinKasir.cetakLogo(cmd.data)
        else if (cmd.type === 'qr') window.MesinKasir.cetakQR(cmd.data)
      } catch (e) { console.warn('BT print error:', e) }
      setTimeout(_btNext, BT_DELAY)
    }

    // Load logo
    const logoImg = new Image()
    logoImg.crossOrigin = 'Anonymous'
    logoImg.src = '/logo_am.png'
    logoImg.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 120
      canvas.height = Math.round((logoImg.height / logoImg.width) * 120)
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(logoImg, 0, 0, canvas.width, canvas.height)
      btSend('logo', canvas.toDataURL('image/png'))
      lanjutCetak()
    }
    logoImg.onerror = () => { lanjutCetak() }

    const lanjutCetak = () => {
      // Header - Nama Toko
      btSend('tebal', true)
      btSend('teks', tengah(namaToko))
      btSend('tebal', false)

      // Alamat dan WA
      btSend('teks', '\x1b\x4d\x01\x1b\x61\x01')
      if (alamat) {
        const al = alamat.replace(/[\r\n]+/g, ' ').replace(/<[^>]*>/g, '').trim()
        const alamatLines = wrapText(al, 42)
        alamatLines.forEach(line => {
          if (line) btSend('teks', line + '\n')
        })
      }
      if (noWa) btSend('teks', 'WA: ' + noWa + '\n')
      btSend('teks', '\x1b\x4d\x00\x1b\x61\x00')

      // Judul
      btSend('teks', '--------------------------------\n')
      btSend('tebal', true)
      btSend('teks', tengah('NOTA GARANSI SERVIS'))
      btSend('tebal', false)
      btSend('teks', '--------------------------------\n')

      // Data Servis
      btSend('teks', 'No: ' + servis.no_servis + ' | ' + new Date(servis.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit' }) + '\n')
      btSend('teks', 'Nama: ' + servis.nama_pelanggan + ' (' + (servis.no_hp || '-') + ')\n')
      btSend('teks', 'Unit: ' + servis.merk_hp + ' ' + tipeBersih + '\n')
      btSend('teks', '--------------------------------\n')
      btSend('teks', 'Keluhan: ' + keluhanBersih + '\n')
      btSend('teks', '--------------------------------\n')

      // Total & Garansi
      btSend('teks', '\x1b\x61\x01')
      btSend('tebal', true)
      btSend('teks', 'TOTAL BIAYA  : Rp ' + totalBiaya + '\n')
      btSend('teks', 'MASA GARANSI : ' + masaGaransi + '\n')
      btSend('tebal', false)
      btSend('teks', '\x1b\x61\x00')
      btSend('teks', '--------------------------------\n')

      // SYK Garansi
      if (snkGaransi) {
        btSend('teks', '.------------------------------.\n')
        const raw = snkGaransi.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '').trim()
        const points = raw.split('\n')
        points.forEach(pt => {
          pt = pt.trim()
          if (!pt) return
          const wrappedLines = wrapText(pt, 28)
          wrappedLines.forEach(w => {
            if (w) btSend('teks', '| ' + w.padEnd(28, ' ') + ' |\n')
          })
        })
        btSend('teks', "'------------------------------'\n")
      }

      // QR Maps
      btSend('teks', '\x1b\x61\x01')
      btSend('teks', 'Bantu Ulas Kami Di Maps:\n')
      btSend('qr', linkMaps)
      btSend('teks', '\x1b\x61\x00')
      btSend('teks', '\n\n\n')
    }
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
      <style>{`
        @page { size: 58mm auto; margin: 0; }
        body {
          font-family: 'Courier New', Courier, monospace;
          font-size: 12px;
          margin: 0;
          padding: 10px;
          width: 58mm;
          color: #000;
          background: #fff;
        }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .line { border-bottom: 1px dashed #000; }
        table { width: 100%; font-size: 12px; border-collapse: collapse; }
        td { vertical-align: top; padding-bottom: 3px; }
        .garansi-box {
          border: 1px dashed #000;
          padding: 8px;
          margin-top: 8px;
          font-size: 11px;
          text-align: left;
          line-height: 1.5;
        }
        @media print {
          body { width: 100% !important; margin: 0 !important; padding: 0 !important; }
          .no-print { display: none !important; }
        }
        .no-print { display: block; margin-top: 20px; text-align: center; }
      `}</style>

      {/* Print Preview - scaled to 58mm thermal paper ratio */}
      <div className="print-preview-container">
        <div ref={printRef} className="print-preview">
          {/* Header dengan Logo */}
          <div className="center" style={{ marginBottom: '12px' }}>
            <img src="/logo_am.png" style={{ width: '70px', height: 'auto' }} alt="Logo" />
          </div>
          <div className="center bold" style={{ fontSize: '18px', marginTop: '4px' }}>{(p.nama_toko || 'AM SERVICE').toUpperCase()}</div>
          {p.alamat && (
            <div className="center" style={{ fontSize: '11px', marginTop: '4px', lineHeight: 1.4 }}>{p.alamat}</div>
          )}
          {p.no_wa && (
            <div className="center" style={{ fontSize: '11px', marginTop: '4px' }}>WA: {p.no_wa}</div>
          )}

          <div className="line" style={{ margin: '10px 0' }}></div>
          <div className="center bold" style={{ fontSize: '12px' }}>NOTA GARANSI SERVIS</div>
          <div className="line" style={{ margin: '10px 0' }}></div>

          {/* Data */}
          <table style={{ fontSize: '11px' }}>
            <tbody>
              <tr>
                <td style={{ padding: '3px 0', whiteSpace: 'nowrap' }}>No:</td>
                <td style={{ padding: '3px 0' }}><strong>{servis.no_servis}</strong> | {new Date(servis.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit' })}</td>
              </tr>
              <tr>
                <td style={{ padding: '3px 0', whiteSpace: 'nowrap' }}>Nama:</td>
                <td style={{ padding: '3px 0' }}>{servis.nama_pelanggan} ({servis.no_hp || '-'})</td>
              </tr>
              <tr>
                <td style={{ padding: '3px 0', whiteSpace: 'nowrap' }}>Unit:</td>
                <td style={{ padding: '3px 0' }}><strong>{servis.merk_hp} {tipeBersih}</strong></td>
              </tr>
              <tr>
                <td style={{ padding: '3px 0', verticalAlign: 'top', whiteSpace: 'nowrap' }}>Keluhan:</td>
                <td style={{ padding: '3px 0' }}>{keluhanBersih}</td>
              </tr>
            </tbody>
          </table>

          <div className="line" style={{ margin: '10px 0' }}></div>

          {/* Total */}
          <div className="center" style={{ margin: '8px 0' }}>
            <div style={{ fontSize: '12px' }}>TOTAL BIAYA:</div>
            <div className="bold" style={{ fontSize: '18px', color: '#dc2626' }}>Rp {totalBiaya}</div>
          </div>

          {/* Garansi */}
          <div className="garansi-box">
            <div className="bold center" style={{ marginBottom: '6px', fontSize: '12px' }}>
              MASA GARANSI: {masaGaransi.toUpperCase()}
            </div>
            <div style={{ lineHeight: 1.5 }}>
              {snkGaransi ? snkGaransi.split('\n').map((line, i) => (
                line.trim() ? <div key={i}>{line.trim()}</div> : null
              )) : <div>-</div>}
            </div>
          </div>

          <div className="line" style={{ margin: '10px 0' }}></div>

          {/* QR */}
          <div className="center" style={{ marginTop: '12px' }}>
            <div className="bold" style={{ fontSize: '11px' }}>Bantu Kami Berkembang!</div>
            <div style={{ fontSize: '10px', marginTop: '4px' }}>Scan untuk review di Google Maps:</div>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&margin=3&data=${encodeURIComponent(p.link_maps || 'https://maps.google.com')}`}
              style={{ width: '100px', height: '100px', marginTop: '6px' }}
              alt="QR Maps"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="no-print">
        <button onClick={() => eksekusiCetak()} style={{
          padding: '10px 24px',
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          marginRight: '10px',
          fontSize: '14px'
        }}>
          <i className="bi bi-printer" style={{ marginRight: '6px' }} />
          Cetak
        </button>
        <button onClick={() => window.close()} style={{
          padding: '10px 24px',
          background: '#64748b',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px'
        }}>
          Tutup
        </button>
      </div>

      <style jsx>{`
        .print-preview-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16px;
          background: #e2e8f0;
          min-height: calc(100vh - 80px);
          box-sizing: border-box;
        }
        .print-preview {
          width: 58mm;
          max-width: 58mm;
          background: #fff;
          padding: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          font-family: 'Courier New', Courier, monospace;
          font-size: 12px;
          color: #000;
          box-sizing: border-box;
        }
        @media (max-width: 480px) {
          .print-preview-container {
            padding: 8px;
            min-height: auto;
          }
          .print-preview {
            width: calc(100vw - 32px);
            max-width: calc(100vw - 32px);
            box-shadow: 0 1px 4px rgba(0,0,0,0.12);
          }
          .no-print {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            display: flex;
            justify-content: center;
            gap: 8px;
            padding: 12px;
            background: #fff;
            box-shadow: 0 -2px 8px rgba(0,0,0,0.1);
          }
        }
      `}</style>
    </>
  )
}