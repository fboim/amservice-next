'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function GaransiServis() {
  const router = useRouter()
  const params = useParams()
  const id = params.id

  const [loading, setLoading] = useState(true)
  const [servis, setServis] = useState(null)
  const [pengaturan, setPengaturan] = useState({
    nama_toko: 'AM SERVICE',
    alamat: '',
    no_wa: '0856 4722 7779',
    link_maps: 'https://maps.google.com',
    snk_garansi: '1. Garansi hanya berlaku untuk sparepart yang diganti.\n2. Kerusakan akibat jatuh, kena air, atau kesalahan pemakian tidak termasuk garansi.\n3. Garansi tidak berlaku jika stiker garansi sobek atau hilang.'
  })
  const [printReady, setPrintReady] = useState(false)

  useEffect(() => {
    fetchData()
  }, [id])

  useEffect(() => {
    if (servis && !printReady) {
      setPrintReady(true)
      // Auto execute print after data loads
      setTimeout(() => {
        eksekusiCetak()
      }, 300)
    }
  }, [servis, printReady])

  const fetchData = async () => {
    try {
      const baseUrl = window.location.origin

      // Fetch servis first
      const servisRes = await fetch(`${baseUrl}/api/servis?id=${id}`)
      if (!servisRes.ok) throw new Error('Gagal memuat data servis')
      const servisData = await servisRes.json()
      if (servisData.error) throw new Error(servisData.error)
      setServis(servisData)

      // Fetch pengaturan
      try {
        const pengaturanRes = await fetch(`${baseUrl}/api/pengaturan`)
        if (pengaturanRes.ok) {
          const json = await pengaturanRes.json()
          if (json.pengaturan) {
            setPengaturan(json.pengaturan)
          }
        }
      } catch (e) {
        console.warn('Pengaturan tidak tersedia, menggunakan default')
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

  // Thermal printer integration - matches PHP version
  const eksekusiCetak = () => {
    if (typeof window.MesinKasir !== 'undefined') {
      // Bluetooth thermal printer available
      printWithMesinKasir()
    } else {
      // Fallback to browser print
      window.print()
    }
  }

  const printWithMesinKasir = () => {
    if (!servis || !pengaturan) return

    const tipeBersih = (servis.tipe_hp || '').replace(/-/g, '').trim()
    const keluhanBersih = getKeluhanBersih(servis.keluhan)
    const totalBiaya = formatRupiah(servis.estimasi_biaya)
    const masaGaransi = (servis.garansi || 'Tidak Ada').toUpperCase()
    const namaToko = (pengaturan.nama_toko || 'AM SERVICE').toUpperCase()
    const noWa = pengaturan.no_wa || ''
    const snkGaransi = pengaturan.snk_garansi || ''
    const linkMaps = pengaturan.link_maps || 'https://maps.google.com'

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

    const tengah = (txt) => {
      txt = String(txt)
      if (txt.length >= 32) return txt.substring(0, 32) + '\n'
      return ' '.repeat(Math.floor((32 - txt.length) / 2)) + txt + '\n'
    }

    // Load logo and print
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
      // Header - Logo already sent before this function
      btSend('tebal', true)
      btSend('teks', tengah(namaToko))
      btSend('tebal', false)

      // Alamat dan WA (font kecil + center)
      btSend('teks', '\x1b\x4d\x01\x1b\x61\x01')
      if (pengaturan.alamat) {
        const alamatLines = pengaturan.alamat.split('\n')
        alamatLines.forEach(line => {
          line = line.trim()
          if (!line) return
          btSend('teks', line + '\n')
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

      // Data
      btSend('teks', 'No: ' + servis.no_servis + ' | ' + new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit' }) + '\n')
      btSend('teks', 'Nama: ' + servis.nama_pelanggan + ' (' + (servis.no_hp || '-') + ')\n')
      btSend('teks', 'Unit: ' + servis.merk_hp + ' ' + tipeBersih + '\n')
      btSend('teks', '--------------------------------\n')
      btSend('teks', 'Keluhan: ' + keluhanBersih + '\n')
      btSend('teks', '--------------------------------\n')

      // Biaya & Garansi
      btSend('teks', '\x1b\x61\x01')
      btSend('tebal', true)
      btSend('teks', 'TOTAL BIAYA  : Rp ' + totalBiaya + '\n')
      btSend('teks', 'MASA GARANSI : ' + masaGaransi + '\n')
      btSend('tebal', false)
      btSend('teks', '\x1b\x61\x00')
      btSend('teks', '--------------------------------\n')

      // SYK Garansi - Fixed wrapping
      if (snkGaransi) {
        btSend('teks', '.------------------------------.\n')
        const rawLines = snkGaransi.split('\n')
        rawLines.forEach(pt => {
          pt = pt.trim()
          if (!pt) return
          // Wrap text at 28 chars without breaking words
          const words = pt.split(' ')
          let currentLine = ''
          words.forEach(word => {
            if ((currentLine + ' ' + word).trim().length > 28) {
              if (currentLine) {
                btSend('teks', '| ' + currentLine.trim().padEnd(28, ' ') + ' |\n')
              }
              currentLine = word
            } else {
              currentLine = (currentLine + ' ' + word).trim()
            }
          })
          if (currentLine) {
            btSend('teks', '| ' + currentLine.trim().padEnd(28, ' ') + ' |\n')
          }
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

  if (!servis) return null

  const tipeBersih = servis.tipe_hp?.replace(/-/g, '').trim() || ''
  const keluhanBersih = getKeluhanBersih(servis.keluhan)
  const totalBiaya = formatRupiah(servis.estimasi_biaya)
  const masaGaransi = servis.garansi || 'Tidak Ada'
  const snkGaransi = pengaturan?.snk_garansi || ''

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
          body { width: 100% !important; margin: 0 !important; padding: 0 !important; }
          .no-print { display: none !important; }
        }
        .no-print { display: block; margin-top: 20px; text-align: center; }
      `}</style>

      {/* Visual preview for browser - larger size */}
      <div style={{
        maxWidth: '380px',
        margin: '20px auto',
        padding: '24px',
        fontFamily: 'Courier New, Courier, monospace',
        fontSize: '14px',
        color: '#000',
        background: '#fff',
        border: '2px solid #333',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
      }}>
        {/* Header dengan Logo */}
        <div className="center" style={{ marginBottom: '12px' }}>
          <img src="/logo_am.png" style={{ width: '80px', height: 'auto' }} alt="Logo AM Service" />
        </div>
        <div className="center bold" style={{ fontSize: '20px', marginTop: '4px' }}>{(pengaturan?.nama_toko || 'AM SERVICE').toUpperCase()}</div>
        {pengaturan?.alamat && (
          <div className="center" style={{ fontSize: '12px', marginTop: '4px', lineHeight: 1.4 }}>{pengaturan.alamat}</div>
        )}
        {pengaturan?.no_wa && (
          <div className="center" style={{ fontSize: '12px', marginTop: '4px' }}>WA: {pengaturan.no_wa}</div>
        )}

        <div className="line" style={{ margin: '12px 0' }}></div>
        <div className="center bold" style={{ fontSize: '14px' }}>NOTA GARANSI SERVIS</div>
        <div className="line" style={{ margin: '12px 0' }}></div>

        {/* Data Table */}
        <table style={{ fontSize: '13px' }}>
          <tbody>
            <tr>
              <td style={{ padding: '4px 0' }}>No:</td>
              <td style={{ padding: '4px 0' }}><strong>{servis.no_servis}</strong> | {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit' })}</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0' }}>Nama:</td>
              <td style={{ padding: '4px 0' }}>{servis.nama_pelanggan} ({servis.no_hp || '-'})</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0' }}>Unit:</td>
              <td style={{ padding: '4px 0' }}><strong>{servis.merk_hp} {tipeBersih}</strong></td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0', verticalAlign: 'top' }}>Keluhan:</td>
              <td style={{ padding: '4px 0' }}>{keluhanBersih}</td>
            </tr>
          </tbody>
        </table>

        <div className="line" style={{ margin: '12px 0' }}></div>

        {/* Total Biaya */}
        <div className="center" style={{ margin: '12px 0' }}>
          <div style={{ fontSize: '14px' }}>TOTAL BIAYA:</div>
          <div className="bold" style={{ fontSize: '22px', color: '#dc2626' }}>Rp {totalBiaya}</div>
        </div>

        {/* Garansi Box */}
        <div className="garansi-box" style={{ margin: '12px 0' }}>
          <div className="bold center" style={{ marginBottom: '8px', fontSize: '14px' }}>
            MASA GARANSI: {masaGaransi.toUpperCase()}
          </div>
          <div style={{ lineHeight: 1.6 }}>
            {snkGaransi ? snkGaransi.split('\n').map((line, i) => (
              line.trim() ? <div key={i}>{line.trim()}</div> : null
            )) : <div>-</div>}
          </div>
        </div>

        <div className="line" style={{ margin: '12px 0' }}></div>

        {/* QR Maps */}
        <div className="center" style={{ marginTop: '16px' }}>
          <div className="bold" style={{ fontSize: '13px' }}>Bantu Kami Berkembang!</div>
          <div style={{ fontSize: '11px', marginTop: '4px' }}>Scan untuk review di Google Maps:</div>
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&margin=5&data=${encodeURIComponent(pengaturan?.link_maps || 'https://maps.google.com')}`}
            style={{ width: '120px', height: '120px', marginTop: '8px' }}
            alt="QR Maps"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="no-print">
        <button onClick={() => eksekusiCetak()} style={{
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