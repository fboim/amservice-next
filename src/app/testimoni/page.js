'use client'

import { useState, useEffect } from 'react'
import { Toast, ToastContainer, useToast } from '@/components/Toast'

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
    <div style={{ padding: '2rem' }}>
      <div className="pg-header">
        <div>
          <h1 className="pg-title">Testimoni</h1>
          <p className="pg-subtitle">Kelola testimoni pelanggan yang ditampilkan di landing page</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true) }}
          className="am-btn am-btn-primary"
        >
          <i className="bi bi-plus-lg" /> Tambah Testimoni
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
          Memuat...
        </div>
      ) : testimonials.length === 0 ? (
        <div className="am-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <i className="bi bi-chat-quote" style={{ fontSize: '3rem', color: '#334155', marginBottom: '1rem' }} />
          <p style={{ color: '#64748b' }}>Belum ada testimoni. Tambahkan yang pertama!</p>
        </div>
      ) : (
        <div className="testimonials-list">
          {testimonials.map((item) => (
            <div key={item.id} className="testimonial-item" style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 12,
              padding: '1.25rem',
              marginBottom: '1rem',
              opacity: item.is_active ? 1 : 0.5
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 700, fontSize: '1.2rem', flexShrink: 0
                  }}>
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 4px', color: '#e2e8f0', fontWeight: 600 }}>
                      {item.name}
                      {!item.is_active && (
                        <span style={{
                          marginLeft: 8, fontSize: '.65rem', fontWeight: 500,
                          padding: '2px 8px', background: '#475569', borderRadius: 999
                        }}>
                          Nonaktif
                        </span>
                      )}
                    </h4>
                    <div style={{ display: 'flex', gap: 2, marginBottom: 8 }}>
                      {[...Array(5)].map((_, i) => (
                        <i key={i} className={`bi ${i < item.rating ? 'bi-star-fill' : 'bi-star'}`}
                          style={{ fontSize: '.75rem', color: i < item.rating ? '#fbbf24' : '#475569' }} />
                      ))}
                    </div>
                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '.9rem', lineHeight: 1.6 }}>
                      "{item.text}"
                    </p>
                    <p style={{ margin: '8px 0 0', fontSize: '.7rem', color: '#64748b' }}>
                      {new Date(item.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => handleToggleActive(item.id, item.is_active)}
                    className="am-btn am-btn-sm"
                    style={{
                      background: item.is_active ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)',
                      color: item.is_active ? '#f59e0b' : '#10b981',
                      border: 'none'
                    }}
                    title={item.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                  >
                    <i className={`bi ${item.is_active ? 'bi-eye-slash' : 'bi-eye'}`} />
                  </button>
                  <button
                    onClick={() => handleEdit(item)}
                    className="am-btn am-btn-sm am-btn-secondary"
                  >
                    <i className="bi bi-pencil" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="am-btn am-btn-sm"
                    style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: 'none' }}
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
          background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem'
        }} onClick={() => setShowModal(false)}>
          <div style={{
            background: '#1e293b', borderRadius: 16, padding: '1.5rem',
            width: '100%', maxWidth: 500
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 1.5rem', color: '#fff' }}>
              {editingId ? 'Edit Testimoni' : 'Tambah Testimoni'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
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
              <div style={{ marginBottom: '1rem' }}>
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
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="am-label">Rating</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setForm({ ...form, rating: star })}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: '1.5rem',
                        color: star <= form.rating ? '#fbbf24' : '#475569',
                        padding: 0
                      }}
                    >
                      <i className={`bi ${star <= form.rating ? 'bi-star-fill' : 'bi-star'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
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

      <style jsx global>{`
        .testimonials-list {
          max-width: 700px;
        }
        @media (max-width: 640px) {
          .testimonial-item > div:first-child {
            flex-direction: column;
          }
          .testimonial-item .am-btn-group {
            margin-top: 1rem;
            width: 100%;
            justify-content: flex-start;
          }
        }
      `}</style>
    </div>
  )
}