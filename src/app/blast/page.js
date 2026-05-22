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
      <style jsx global>{`
        .fade-in {
          animation: fadeIn 0.4s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .section-card {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>

      <div className="page-wrapper">
        <div className="dashboard-two-col fade-in" style={{ marginBottom: '20px' }}>
          {/* Left: Target Selection */}
          <div>
            <div className="section-card">
              <div className="card-header">
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="bi bi-people-fill" style={{ color: '#3b82f6' }} />
                  Pilih Target
                </span>
                <select
                  value={table}
                  onChange={(e) => setTable(e.target.value)}
                  className="am-input"
                  style={{ width: 'auto', fontSize: '.8rem', padding: '6px 10px' }}
                >
                  <option value="pelanggan">Pelanggan</option>
                  <option value="servis">Servis Aktif</option>
                </select>
              </div>

              {loadingTargets ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <span className="spinner" style={{ width: 32, height: 32 }} />
                  <p style={{ color: 'var(--am-text-muted)', marginTop: '8px' }}>Memuat target...</p>
                </div>
              ) : (
                <>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--am-border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                      onClick={toggleAll}
                      className="am-btn am-btn-secondary"
                      style={{ fontSize: '.75rem', padding: '6px 12px' }}
                    >
                      {selectedTargets.length === targets.length ? 'Batal Pilih Semua' : 'Pilih Semua'}
                    </button>
                    <span style={{ color: 'var(--am-text-muted)', fontSize: '.85rem' }}>
                      {selectedTargets.length} / {targets.length} dipilih
                    </span>
                  </div>

                  <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                    {targets.map((t, i) => (
                      <div
                        key={i}
                        onClick={() => toggleTarget(t.no_hp)}
                        style={{
                          padding: '12px 16px', borderBottom: '1px solid var(--am-border)',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
                          background: selectedTargets.includes(t.no_hp) ? 'rgba(16,185,129,0.08)' : 'transparent',
                          transition: 'background 0.2s'
                        }}
                      >
                        <div style={{
                          width: 22, height: 22, borderRadius: '6px', border: '2px solid var(--am-border)',
                          background: selectedTargets.includes(t.no_hp) ? '#10b981' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                        }}>
                          {selectedTargets.includes(t.no_hp) && (
                            <i className="bi bi-check" style={{ color: '#fff', fontSize: '.7rem' }} />
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: '.9rem' }}>{t.nama}</div>
                          <div style={{ fontSize: '.75rem', color: 'var(--am-text-muted)' }}>{t.no_hp}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Templates */}
            <div className="section-card" style={{ marginTop: '16px' }}>
              <div className="card-header">
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="bi bi-file-text" style={{ color: '#f59e0b' }} />
                  Template Pesan
                </span>
              </div>
              <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {templates.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => handleTemplateSelect(t)}
                    className="am-btn am-btn-secondary"
                    style={{ justifyContent: 'flex-start', fontSize: '.85rem' }}
                  >
                    <i className="bi bi-lightning" style={{ color: '#f59e0b' }} />
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Message Composer */}
          <div>
            <div className="section-card">
              <div className="card-header">
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="bi bi-chat-left-text" style={{ color: '#10b981' }} />
                  Tulis Pesan
                </span>
              </div>
              <div style={{ padding: '16px' }}>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="am-input"
                  rows={8}
                  placeholder="Ketik pesan yang akan dikirim...

Gunakan {nama} untuk menggabungkan nama pelanggan."
                  style={{ resize: 'vertical', fontSize: '.9rem' }}
                />

                <div style={{ marginTop: '12px', fontSize: '.75rem', color: 'var(--am-text-muted)' }}>
                  <i className="bi bi-info-circle" style={{ marginRight: 4 }} />
                  {selectedTargets.length} target akan menerima pesan ini
                </div>

                <button
                  onClick={handleSend}
                  disabled={loading || selectedTargets.length === 0}
                  className="am-btn"
                  style={{
                    width: '100%', marginTop: '16px',
                    background: '#25D366', color: '#fff',
                    padding: '14px', fontSize: '1rem'
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
            </div>

            {/* Result */}
            {result && (
              <div className="section-card" style={{ marginTop: '16px' }}>
                <div className="card-header">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="bi bi-check-circle" style={{ color: '#10b981' }} />
                    Hasil Pengiriman
                  </span>
                </div>
                <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  <div style={{ textAlign: 'center', background: 'var(--am-surface-2)', padding: '16px', borderRadius: '12px' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981' }}>{result.success}</div>
                    <div style={{ fontSize: '.75rem', color: 'var(--am-text-muted)' }}>Berhasil</div>
                  </div>
                  <div style={{ textAlign: 'center', background: 'var(--am-surface-2)', padding: '16px', borderRadius: '12px' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ef4444' }}>{result.failed}</div>
                    <div style={{ fontSize: '.75rem', color: 'var(--am-text-muted)' }}>Gagal</div>
                  </div>
                  <div style={{ textAlign: 'center', background: 'var(--am-surface-2)', padding: '16px', borderRadius: '12px' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#3b82f6' }}>{result.total}</div>
                    <div style={{ fontSize: '.75rem', color: 'var(--am-text-muted)' }}>Total</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}