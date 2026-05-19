'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AppLayout from '@/components/AppLayout'

export default function BlastPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingTargets, setLoadingTargets] = useState(true)
  const [targets, setTargets] = useState([])
  const [selectedTargets, setSelectedTargets] = useState([])
  const [message, setMessage] = useState('')
  const [result, setResult] = useState(null)
  const [table, setTable] = useState('pelanggan')

  const templates = [
    { name: 'Promo Umum', text: 'Halo {nama}! Kami dari AM Service memiliki promo khusus servis HP hari ini. Jangan sampai错过 ya! 😊' },
    { name: 'Reminder Servis', text: 'Halo {nama}, ini reminder bahwa HP kamu masih dalam proses servis. Estimasi selesai besok. Terima kasih atas kesabarannya!' },
    { name: 'Garansi', text: 'Hai {nama}! Jangan lupa, garansi servis HP di AM Service berlaku 30 hari.센터 masih beroperasi untuk bantu kamu!' },
    { name: 'Keterangan Servis Selesai', text: 'Hallo {nama}, HP kamu udah siap diambil nih! Silakan datang ke toko kami. Terima kasih! 🙏' }
  ]

  useEffect(() => {
    const token = sessionStorage.getItem('ams_token') || localStorage.getItem('ams_token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchTargets()
  }, [router, table])

  const fetchTargets = async () => {
    setLoadingTargets(true)
    try {
      const res = await fetch(`/api/blast?table=${table}`)
      const data = await res.json()

      if (data.success) {
        setTargets(data.targets)
      }
    } catch (err) {
      setMessage('Gagal mengambil data target')
    } finally {
      setLoadingTargets(false)
    }
  }

  const toggleTarget = (hp) => {
    setSelectedTargets(prev =>
      prev.includes(hp) ? prev.filter(t => t !== hp) : [...prev, hp]
    )
  }

  const toggleAll = () => {
    if (selectedTargets.length === targets.length) {
      setSelectedTargets([])
    } else {
      setSelectedTargets(targets.map(t => t.no_hp))
    }
  }

  const handleTemplateSelect = (template) => {
    setMessage(template.text)
  }

  const handleSend = async () => {
    if (selectedTargets.length === 0) {
      alert('Pilih minimal 1 target')
      return
    }

    if (!message.trim()) {
      alert('Ketik pesan terlebih dahulu')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/blast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targets: selectedTargets,
          message
        })
      })

      const data = await res.json()
      setResult(data)

      if (data.success > 0) {
        alert(`Berhasil mengirim ke ${data.success} target!`)
      }
    } catch (err) {
      alert('Gagal mengirim pesan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout>
      <div style={{ minHeight: '100vh', padding: '0' }}>
        {/* Header */}
        <div className="pg-header">
          <div>
            <h4 className="pg-title">
              <i className="bi bi-whatsapp" style={{ color: '#25D366', marginRight: 8 }} />
              WhatsApp Blast
            </h4>
            <p className="pg-subtitle">Kirim pesan massal ke pelanggan</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Left: Target Selection */}
          <div>
            <div className="section-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h5 style={{ color: '#94a3b8', margin: 0 }}>
                  <i className="bi bi-people-fill" style={{ marginRight: 8 }} />
                  Pilih Target
                </h5>
                <select
                  value={table}
                  onChange={(e) => setTable(e.target.value)}
                  className="am-input"
                  style={{ width: 'auto', fontSize: '.85rem' }}
                >
                  <option value="pelanggan">Pelanggan</option>
                  <option value="servis">Servis Aktif</option>
                </select>
              </div>

              {loadingTargets ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                  <span className="spinner" style={{ width: 32, height: 32 }} />
                  <p>Memuat target...</p>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: '1rem' }}>
                    <button
                      onClick={toggleAll}
                      className="am-btn"
                      style={{ fontSize: '.75rem', background: '#334155', padding: '6px 12px' }}
                    >
                      {selectedTargets.length === targets.length ? 'Batal Pilih Semua' : 'Pilih Semua'}
                    </button>
                    <span style={{ marginLeft: 12, color: '#64748b', fontSize: '.85rem' }}>
                      {selectedTargets.length} / {targets.length} dipilih
                    </span>
                  </div>

                  <div style={{ maxHeight: 300, overflowY: 'auto', border: '1px solid #334155', borderRadius: 8 }}>
                    {targets.map((t, i) => (
                      <div
                        key={i}
                        onClick={() => toggleTarget(t.no_hp)}
                        style={{
                          padding: '10px 12px', borderBottom: '1px solid #334155',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
                          background: selectedTargets.includes(t.no_hp) ? 'rgba(16,185,129,0.1)' : 'transparent',
                          transition: 'background 0.2s'
                        }}
                      >
                        <div style={{
                          width: 20, height: 20, borderRadius: 4, border: '2px solid #64748b',
                          background: selectedTargets.includes(t.no_hp) ? '#10b981' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          {selectedTargets.includes(t.no_hp) && (
                            <i className="bi bi-check" style={{ color: '#fff', fontSize: '.7rem' }} />
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: '.85rem' }}>{t.nama}</div>
                          <div style={{ fontSize: '.75rem', color: '#64748b' }}>{t.no_hp}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Templates */}
            <div className="section-card" style={{ marginTop: '1rem' }}>
              <h5 style={{ color: '#94a3b8', marginBottom: '1rem' }}>
                <i className="bi bi-file-text" style={{ marginRight: 8 }} />
                Template Pesan
              </h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {templates.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => handleTemplateSelect(t)}
                    style={{
                      padding: '10px 14px', background: '#1e293b', border: '1px solid #334155',
                      borderRadius: 8, color: '#94a3b8', textAlign: 'left', cursor: 'pointer',
                      fontSize: '.85rem', transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.color = '#fff' }}
                    onMouseLeave={(e) => { e.target.style.borderColor = '#334155'; e.target.style.color = '#94a3b8' }}
                  >
                    <i className="bi bi-lightning" style={{ marginRight: 8 }} />
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Message Composer */}
          <div>
            <div className="section-card">
              <h5 style={{ color: '#94a3b8', marginBottom: '1rem' }}>
                <i className="bi bi-chat-left-text" style={{ marginRight: 8 }} />
               Tulis Pesan
              </h5>

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="am-input"
                rows={8}
                placeholder="Ketik pesan yang akan dikirim...

Gunakan {nama} untuk menggabungkan nama pelanggan."
                style={{ resize: 'vertical', fontSize: '.9rem' }}
              />

              <div style={{ marginTop: '1rem', fontSize: '.75rem', color: '#64748b' }}>
                <i className="bi bi-info-circle" style={{ marginRight: 4 }} />
                {selectedTargets.length} target akan menerima pesan ini
              </div>

              <button
                onClick={handleSend}
                disabled={loading || selectedTargets.length === 0}
                className="am-btn"
                style={{
                  width: '100%', marginTop: '1rem',
                  background: '#25D366', color: '#fff',
                  padding: '12px', fontSize: '1rem'
                }}
              >
                {loading ? (
                  <>
                    <span className="spinner" style={{ width: 20, height: 20, marginRight: 8 }} />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <i className="bi bi-send" style={{ marginRight: 8 }} />
                    Kirim ke {selectedTargets.length} Target
                  </>
                )}
              </button>
            </div>

            {/* Result */}
            {result && (
              <div className="section-card" style={{ marginTop: '1rem' }}>
                <h5 style={{ color: '#94a3b8', marginBottom: '1rem' }}>
                  <i className="bi bi-check-circle" style={{ marginRight: 8 }} />
                  Hasil Pengiriman
                </h5>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div style={{ textAlign: 'center', background: '#1e293b', padding: '1rem', borderRadius: 8 }}>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>{result.success}</div>
                    <div style={{ fontSize: '.75rem', color: '#64748b' }}>Berhasil</div>
                  </div>
                  <div style={{ textAlign: 'center', background: '#1e293b', padding: '1rem', borderRadius: 8 }}>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ef4444' }}>{result.failed}</div>
                    <div style={{ fontSize: '.75rem', color: '#64748b' }}>Gagal</div>
                  </div>
                  <div style={{ textAlign: 'center', background: '#1e293b', padding: '1rem', borderRadius: 8 }}>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#3b82f6' }}>{result.total}</div>
                    <div style={{ fontSize: '.75rem', color: '#64748b' }}>Total</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Back link */}
        <div style={{ marginTop: '2rem' }}>
          <Link href="/dashboard" style={{
            color: '#64748b', textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center', gap: 8
          }}>
            <i className="bi bi-arrow-left" />
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    </AppLayout>
  )
}