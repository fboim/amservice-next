'use client'

import { useState, useEffect } from 'react'
import AppLayout from '@/components/AppLayout'
import { ToastContainer, useToast } from '@/components/Toast'

export default function TestimoniPage() {
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const { toasts, addToast, removeToast } = useToast()

  const [form, setForm] = useState({
    name: '',
    text: '',
    rating: 5,
    is_active: true
  })

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      const res = await fetch('/api/testimonials')
      const data = await res.json()
      setTestimonials(Array.isArray(data) ? data : [])
    } catch (error) {
      addToast('Gagal memuat testimoni', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const url = editingId ? `/api/testimonials/${editingId}` : '/api/testimonials'
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      if (!res.ok) throw new Error('Gagal menyimpan')

      addToast(editingId ? 'Testimoni berhasil diupdate' : 'Testimoni berhasil ditambahkan', 'success')
      setShowModal(false)
      resetForm()
      fetchTestimonials()
    } catch (error) {
      addToast(error.message, 'error')
    }
  }

  const handleEdit = (item) => {
    setForm({
      name: item.name,
      text: item.text,
      rating: item.rating,
      is_active: item.is_active
    })
    setEditingId(item.id)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Yakin hapus testimoni ini?')) return
    try {
      const res = await fetch(`/api/testimonials/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Gagal hapus')
      addToast('Testimoni berhasil dihapus', 'success')
      fetchTestimonials()
    } catch (error) {
      addToast(error.message, 'error')
    }
  }

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const res = await fetch(`/api/testimonials/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus })
      })
      if (!res.ok) throw new Error('Gagal update')
      addToast('Status berhasil diubah', 'success')
      fetchTestimonials()
    } catch (error) {
      addToast(error.message, 'error')
    }
  }

  const resetForm = () => {
    setForm({ name: '', text: '', rating: 5, is_active: true })
    setEditingId(null)
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
        .testimonials-list {
          max-width: 700px;
        }
      `}</style>

      <div className="page-wrapper">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--am-text-muted)' }}>
            <i className="bi bi-arrow-repeat" style={{ fontSize: '2rem', animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: '8px' }}>Memuat...</p>
          </div>
        ) : testimonials.length === 0 ? (
          <div className="section-card fade-in" style={{ textAlign: 'center', padding: '3rem' }}>
            <i className="bi bi-chat-quote" style={{ fontSize: '3rem', color: 'var(--am-border)', marginBottom: '1rem' }} />
            <p style={{ color: 'var(--am-text-muted)' }}>Belum ada testimoni. Tambahkan yang pertama!</p>
          </div>
        ) : (
          <div className="testimonials-list fade-in">
            {testimonials.map((item) => (
              <div key={item.id} style={{
                background: 'var(--am-surface)',
                border: '1px solid var(--am-border)',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '16px',
                opacity: item.is_active ? 1 : 0.6,
                boxShadow: 'var(--am-shadow)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{ display: 'flex', gap: '16px', flex: 1 }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: '14px',
                      background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 700, fontSize: '1.2rem', flexShrink: 0
                    }}>
                      {item.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 6px', fontWeight: 600, fontSize: '1rem' }}>
                        {item.name}
                        {!item.is_active && (
                          <span style={{
                            marginLeft: 8, fontSize: '.65rem', fontWeight: 500,
                            padding: '2px 8px', background: 'var(--am-surface-2)', borderRadius: '999px',
                            color: 'var(--am-text-muted)'
                          }}>
                            Nonaktif
                          </span>
                        )}
                      </h4>
                      <div style={{ display: 'flex', gap: '2px', marginBottom: '8px' }}>
                        {[...Array(5)].map((_, i) => (
                          <i key={i} className={`bi ${i < item.rating ? 'bi-star-fill' : 'bi-star'}`}
                            style={{ fontSize: '.8rem', color: i < item.rating ? '#fbbf24' : 'var(--am-border)' }} />
                        ))}
                      </div>
                      <p style={{ margin: 0, color: 'var(--am-text-muted)', fontSize: '.9rem', lineHeight: 1.6 }}>
                        "{item.text}"
                      </p>
                      <p style={{ margin: '8px 0 0', fontSize: '.7rem', color: 'var(--am-text-subtle)' }}>
                        {new Date(item.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => handleToggleActive(item.id, item.is_active)}
                      className="btn-act"
                      style={{
                        background: item.is_active ? 'rgba(245,158,11,.12)' : 'rgba(16,185,129,.12)',
                        color: item.is_active ? '#f59e0b' : '#10b981',
                        border: 'none'
                      }}
                      title={item.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                    >
                      <i className={`bi ${item.is_active ? 'bi-eye-slash' : 'bi-eye'}`} />
                    </button>
                    <button
                      onClick={() => handleEdit(item)}
                      className="btn-act btn-act-blue"
                    >
                      <i className="bi bi-pencil" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="btn-act btn-act-red"
                    >
                      <i className="bi bi-trash3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem'
          }} onClick={() => setShowModal(false)}>
            <div className="section-card" style={{
              width: '100%', maxWidth: 500
            }} onClick={(e) => e.stopPropagation()}>
              <div className="card-header">
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="bi bi-chat-quote" style={{ color: '#f59e0b' }} />
                  {editingId ? 'Edit Testimoni' : 'Tambah Testimoni'}
                </span>
              </div>
              <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <label className="am-label">Nama Pelanggan</label>
                  <input
                    type="text"
                    className="am-input"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Contoh: Budi Santoso"
                    required
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label className="am-label">Testimoni</label>
                  <textarea
                    className="am-input"
                    value={form.text}
                    onChange={(e) => setForm({ ...form, text: e.target.value })}
                    placeholder="Ketik testimoni pelanggan..."
                    rows={3}
                    required
                    style={{ resize: 'vertical' }}
                  />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label className="am-label">Rating</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setForm({ ...form, rating: star })}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          fontSize: '1.5rem',
                          color: star <= form.rating ? '#fbbf24' : 'var(--am-border)',
                          padding: 0
                        }}
                      >
                        <i className={`bi ${star <= form.rating ? 'bi-star-fill' : 'bi-star'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="am-btn am-btn-secondary"
                  >
                    Batal
                  </button>
                  <button type="submit" className="am-btn am-btn-primary">
                    {editingId ? 'Update' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
    </AppLayout>
  )
}