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
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const getExpiryDate = (tanggal) => {
    const date = new Date(tanggal)
    date.setMonth(date.getMonth() + 1)
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
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
          @page { size: A5; margin: 10mm; }
          body { background: white; }
        }
      `}</style>

      <div style={{
        maxWidth: '600px',
        margin: '20px auto',
        padding: '20px',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px solid #1e293b', paddingBottom: '15px' }}>
          <h1 style={{ margin: 0, fontSize: '24px', color: '#1e293b' }}>KARTU GARANSI</h1>
          <p style={{ margin: '5px 0 0', color: '#666' }}>AM Service - Repair Center</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
          <div style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '5px' }}>
            <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
              <tr>
                <td style={{ fontWeight: 'bold', width: '35%' }}>No Servis</td>
                <td>: {servis.no_servis}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold' }}>Tanggal</td>
                <td>: {formatDate(servis.tanggal)}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold' }}>Pelanggan</td>
                <td>: {servis.nama_pelanggan}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold' }}>No HP</td>
                <td>: {servis.no_hp || '-'}</td>
              </tr>
            </table>
          </div>
          <div style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '5px' }}>
            <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
              <tr>
                <td style={{ fontWeight: 'bold' }}>Unit</td>
                <td>: {servis.merk_hp} {servis.tipe_hp}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold' }}>IMEI</td>
                <td>: ........................</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold' }}>Teknisi</td>
                <td>: {servis.teknisi || '-'}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold' }}>Garansi</td>
                <td>: 1 Bulan (Sparepart)</td>
              </tr>
            </table>
          </div>
        </div>

        <div style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '5px', marginBottom: '20px' }}>
          <strong style={{ fontSize: '12px' }}>Kerusakan / Perbaikan:</strong>
          <p style={{ fontSize: '12px', margin: '5px 0 0' }}>{servis.keluhan || '-'}</p>
        </div>

        <div style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '5px', marginBottom: '20px' }}>
          <strong style={{ fontSize: '12px' }}>Sparepart yang Diganti:</strong>
          <p style={{ fontSize: '12px', margin: '5px 0 0', color: '#666' }}>Sesuai nota servis</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', fontSize: '11px' }}>
          <div style={{ textAlign: 'center' }}>
            <p>Pelanggan</p>
            <div style={{ height: '40px', borderBottom: '1px solid #000', width: '150px' }}></div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p>Teknisi</p>
            <div style={{ height: '40px', borderBottom: '1px solid #000', width: '150px' }}></div>
          </div>
        </div>

        <div style={{ marginTop: '30px', padding: '10px', background: '#f5f5f5', borderRadius: '5px', fontSize: '10px' }}>
          <strong>Syarat Garansi:</strong>
          <ul style={{ margin: '5px 0 0', paddingLeft: '20px' }}>
            <li>Garansi valid 1 bulan sejak tanggal nota</li>
            <li>Garansi meliputi sparepart yang diganti</li>
            <li>Garansi tidak berlaku jika:</li>
            <ul style={{ margin: 0, paddingLeft: '15px' }}>
              <li>Kerusakan akibat human error (jatuh, kena air, dll)</li>
              <li>Stiker garansi sobek/rusak</li>
              <li>Segel resmi dibuka oleh pihak lain</li>
            </ul>
          </ul>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
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
      </div>
    </>
  )
}