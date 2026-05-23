'use client'
export const dynamic = 'force-dynamic'

import { Suspense, useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import AppLayout from '@/components/AppLayout'
import { DataServisSkeleton } from '@/components/Skeleton'

function DataServisContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [servis, setServis] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState(searchParams.get('cari') || '')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '')
  const [showTrash, setShowTrash] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem('ams_user') || sessionStorage.getItem('ams_user')
    if (userData) {
      const user = JSON.parse(userData)
      if (user?.role?.toLowerCase() === 'admin') {
        setShowTrash(searchParams.get('trash') === '1')
      }
    }
  }, [searchParams])

  useEffect(() => {
    fetchServis()
  }, [page, search, statusFilter, showTrash])

  const fetchServis = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ page, limit: 12, search })
      if (statusFilter) params.set('status', statusFilter)
      if (showTrash) params.set('trash', '1')
      const res = await fetch(`/api/servis?${params}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      })
      const data = await res.json()
      setServis(data.servis || [])
      setTotal(data.total || 0)
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter, showTrash])

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.print-dropdown') && !e.target.closest('.btn-act')) {
        document.querySelectorAll('.print-dropdown').forEach(function(d) {
          d.style.display = 'none'
        })
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const totalPages = Math.ceil(total / 12)
  const isAdmin = (() => {
    const userData = localStorage.getItem('ams_user') || sessionStorage.getItem('ams_user')
    try {
      const user = JSON.parse(userData)
      return user?.role?.toLowerCase() === 'admin'
    } catch { return false }
    })()
  const isPengunjung = (() => {
    const userData = localStorage.getItem('ams_user') || sessionStorage.getItem('ams_user')
    try {
      const user = JSON.parse(userData)
      return user?.role?.toLowerCase() === 'pengunjung'
    } catch { return false }
    })()

  const getBadgeClass = (status) => {
    const map = {
      'Antrean': 'badge-antrean',
      'Proses': 'badge-proses',
      'Siap Diambil': 'badge-siap',
      'Sudah Diambil': 'badge-selesai',
      'Tidak Bisa': 'badge-gagal',
    }
    return map[status] || 'badge-antrean'
  }

  const getBadgeText = (status) => {
    const map = {
      'Antrean': 'Antrean',
      'Proses': 'Proses',
      'Siap Diambil': 'Siap',
      'Sudah Diambil': 'Selesai',
      'Tidak Bisa': 'Gagal',
    }
    return map[status] || status
  }

  const formatNoWA = (no) => {
    if (!no) return ''
    const clean = no.replace(/[^0-9]/g, '')
    if (clean.startsWith('0')) return '62' + clean.slice(1)
    return clean
  }

  const formatDate = (date) => {
    const d = new Date(date)
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
  }

  // Split data into two columns
  const half = Math.ceil(servis.length / 2)
  const leftCol = servis.slice(0, half)
  const rightCol = servis.slice(half)

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    router.push(`/servis/data${search || statusFilter ? `?cari=${search}&status=${statusFilter}` : ''}`)
  }

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus servis ini?')) return
    try {
      const res = await fetch(`/api/servis?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchServis()
      }
    } catch (err) {
      console.error('Delete error:', err)
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <DataServisSkeleton />
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      {/* Search + Filter */}
      <div className="section-card fade-in" style={{ marginBottom: '16px', padding: '12px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          <input
            type="text"
            name="cari"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari No. Servis, Pelanggan, atau Merk HP…"
            className="am-input"
            style={{ minWidth: '180px' }}
          />
          <select
            name="status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="am-input"
            style={{ maxWidth: '160px', flexShrink: 0 }}
          >
            <option value="">Semua Status</option>
            <option value="Antrean">Antrean</option>
            <option value="Proses">Proses</option>
            <option value="Siap Diambil">Siap Diambil</option>
            <option value="Sudah Diambil">Selesai</option>
            <option value="Tidak Bisa">Tidak Bisa</option>
          </select>
          <button type="submit" className="am-btn am-btn-primary" style={{ padding: '8px 14px', borderRadius: '8px', whiteSpace: 'nowrap' }}>
            <i className="bi bi-search" /> Cari
          </button>
          {search || statusFilter ? (
            <Link href="/servis/data" className="am-btn am-btn-secondary" style={{ padding: '8px 14px', borderRadius: '8px', whiteSpace: 'nowrap' }}>
              Reset
            </Link>
          ) : null}
        </form>
      </div>

      {/* Main Layout: Table + Sidebar */}
      <div className="ds-main fade-in">
        {/* Table Area */}
        <div>
          <div className="section-card" style={{ marginBottom: '14px', overflow: 'hidden' }}>
            {servis.length > 0 ? (
              <>
                {/* Dual Column Table */}
                <div className="dual-wrap">
                  {/* Left Column */}
                  <div className="dt-col">
                    <table>
                      <thead>
                        <tr>
                          <th style={{ width: '28px', textAlign: 'center' }}>#</th>
                          <th style={{ width: '112px' }}>Kode / Tgl</th>
                          <th style={{ textAlign: 'center' }}>Pelanggan &amp; Unit</th>
                          <th style={{ width: '68px', textAlign: 'center' }}>Status</th>
                          <th style={{ width: '110px', textAlign: 'center' }}>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leftCol.map((s, i) => {
                          const hp = formatNoWA(s.no_hp)
                          const keluhanShort = s.keluhan ? (s.keluhan.length > 35 ? s.keluhan.slice(0, 35) + '…' : s.keluhan) : ''
                          const wa_msg = `Halo *${s.nama_pelanggan}*, perangkat *${s.merk_hp} ${s.tipe_hp}* (nota: *${s.no_servis}*) statusnya: *${s.status.toUpperCase()}*\n\nhttps://amservice.web.id/cek_servis.php?no=${s.no_servis}`

                          return (
                            <tr key={s.id}>
                              <td style={{ textAlign: 'center', fontSize: '.75rem', color: 'var(--am-text-muted)', fontWeight: '700' }}>
                                {i + 1}
                              </td>
                              <td>
                                <div style={{ fontWeight: '700', color: '#3b82f6', fontSize: '.79rem' }}>{s.no_servis}</div>
                                <div style={{ fontSize: '.7rem', color: 'var(--am-text-muted)' }}>{formatDate(s.tanggal)}</div>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <div style={{ fontWeight: '600', color: 'var(--am-text)', fontSize: '.8rem', lineHeight: 1.3 }}>
                                  {s.nama_pelanggan}
                                </div>
                                <div style={{ fontSize: '.7rem', color: 'var(--am-text-muted)' }}>{s.merk_hp} {s.tipe_hp}</div>
                                {keluhanShort && (
                                  <div style={{ fontSize: '.68rem', color: 'var(--am-text-muted)', fontStyle: 'italic' }} title={s.keluhan}>
                                    {keluhanShort}
                                  </div>
                                )}
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <span className={`badge-soft ${getBadgeClass(s.status)}`} style={{ fontSize: '.67rem' }}>
                                  {getBadgeText(s.status)}
                                </span>
                              </td>
                              <td>
                                <div className="btn-group-act">
                                  {!isPengunjung && (
                                    <>
                                      <Link href={`/servis/edit/${s.id}`} className="btn-act btn-act-blue" title="Edit">
                                        <i className="bi bi-pencil-square" />
                                      </Link>
                                      {/* Print Dropdown */}
                                      <div style={{ position: 'relative' }}>
                                        <button type="button" className="btn-act btn-act-dark" title="Cetak" onClick={(e) => {
                                          e.stopPropagation()
                                          const dropdown = e.currentTarget.nextElementSibling
                                          dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none'
                                        }}>
                                          <i className="bi bi-chevron-down" style={{ fontSize: '.7rem' }} />
                                        </button>
                                        <div className="print-dropdown" style={{ display: 'none', position: 'absolute', right: 0, top: 'calc(100% + 4px)', zIndex: 50, width: '160px', background: 'var(--am-surface)', border: '1px solid var(--am-border)', borderRadius: '8px', boxShadow: '0 8px 30px rgba(0,0,0,.12)', overflow: 'hidden' }}>
                                          <Link href={`/nota/${s.id}/label`} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', fontSize: '.75rem', color: 'var(--am-text)', textDecoration: 'none', borderBottom: '1px solid var(--am-border)' }}>
                                            <i className="bi bi-tag" style={{ color: '#8b5cf6' }} />Label
                                          </Link>
                                          <Link href={`/nota/${s.id}/penerimaan`} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', fontSize: '.75rem', color: 'var(--am-text)', textDecoration: 'none', borderBottom: '1px solid var(--am-border)' }}>
                                            <i className="bi bi-qr-code" style={{ color: '#2563eb' }} />Nota Penerimaan
                                          </Link>
                                          <Link href={`/nota/${s.id}/garansi`} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', fontSize: '.75rem', color: 'var(--am-text)', textDecoration: 'none' }}>
                                            <i className="bi bi-shield-check" style={{ color: '#f59e0b' }} />Nota Garansi
                                          </Link>
                                        </div>
                                      </div>
                                      {/* WA Button */}
                                      <a href={`https://wa.me/${hp}?text=${encodeURIComponent(wa_msg)}`} target="_blank" className="btn-act btn-act-green" title="Kirim WA">
                                        <i className="bi bi-whatsapp" />
                                      </a>
                                    </>
                                  )}
                                  {isAdmin && (
                                    showTrash ? (
                                      <>
                                        <button onClick={() => handleDelete(s.id)} className="btn-act btn-act-green" title="Pulihkan">
                                          <i className="bi bi-arrow-counterclockwise" />
                                        </button>
                                        <button onClick={() => handleDelete(s.id)} className="btn-act btn-act-red" title="Hapus Permanen" style={{ fontSize: '.68rem', padding: '3px 6px' }}>
                                          <i className="bi bi-trash3-fill" />
                                        </button>
                                      </>
                                    ) : (
                                      <button onClick={() => handleDelete(s.id)} className="btn-act btn-act-red" title="Hapus">
                                        <i className="bi bi-trash" />
                                      </button>
                                    )
                                  )}
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Right Column */}
                  <div className="dt-col">
                    <table>
                      <thead>
                        <tr>
                          <th style={{ width: '28px', textAlign: 'center' }}>#</th>
                          <th style={{ width: '112px' }}>Kode / Tgl</th>
                          <th style={{ textAlign: 'center' }}>Pelanggan &amp; Unit</th>
                          <th style={{ width: '68px', textAlign: 'center' }}>Status</th>
                          <th style={{ width: '110px', textAlign: 'center' }}>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rightCol.map((s, i) => {
                          const hp = formatNoWA(s.no_hp)
                          const keluhanShort = s.keluhan ? (s.keluhan.length > 35 ? s.keluhan.slice(0, 35) + '…' : s.keluhan) : ''
                          const wa_msg = `Halo *${s.nama_pelanggan}*, perangkat *${s.merk_hp} ${s.tipe_hp}* (nota: *${s.no_servis}*) statusnya: *${s.status.toUpperCase()}*\n\nhttps://amservice.web.id/cek_servis.php?no=${s.no_servis}`

                          return (
                            <tr key={s.id}>
                              <td style={{ textAlign: 'center', fontSize: '.75rem', color: 'var(--am-text-muted)', fontWeight: '700' }}>
                                {half + i + 1}
                              </td>
                              <td>
                                <div style={{ fontWeight: '700', color: '#3b82f6', fontSize: '.79rem' }}>{s.no_servis}</div>
                                <div style={{ fontSize: '.7rem', color: 'var(--am-text-muted)' }}>{formatDate(s.tanggal)}</div>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <div style={{ fontWeight: '600', color: 'var(--am-text)', fontSize: '.8rem', lineHeight: 1.3 }}>
                                  {s.nama_pelanggan}
                                </div>
                                <div style={{ fontSize: '.7rem', color: 'var(--am-text-muted)' }}>{s.merk_hp} {s.tipe_hp}</div>
                                {keluhanShort && (
                                  <div style={{ fontSize: '.68rem', color: 'var(--am-text-muted)', fontStyle: 'italic' }} title={s.keluhan}>
                                    {keluhanShort}
                                  </div>
                                )}
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <span className={`badge-soft ${getBadgeClass(s.status)}`} style={{ fontSize: '.67rem' }}>
                                  {getBadgeText(s.status)}
                                </span>
                              </td>
                              <td>
                                <div className="btn-group-act">
                                  {!isPengunjung && (
                                    <>
                                      <Link href={`/servis/edit/${s.id}`} className="btn-act btn-act-blue" title="Edit">
                                        <i className="bi bi-pencil-square" />
                                      </Link>
                                      {/* Print Dropdown */}
                                      <div style={{ position: 'relative' }}>
                                        <button type="button" className="btn-act btn-act-dark" title="Cetak" onClick={(e) => {
                                          e.stopPropagation()
                                          const dropdown = e.currentTarget.nextElementSibling
                                          dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none'
                                        }}>
                                          <i className="bi bi-chevron-down" style={{ fontSize: '.7rem' }} />
                                        </button>
                                        <div className="print-dropdown" style={{ display: 'none', position: 'absolute', right: 0, top: 'calc(100% + 4px)', zIndex: 50, width: '160px', background: 'var(--am-surface)', border: '1px solid var(--am-border)', borderRadius: '8px', boxShadow: '0 8px 30px rgba(0,0,0,.12)', overflow: 'hidden' }}>
                                          <Link href={`/nota/${s.id}/label`} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', fontSize: '.75rem', color: 'var(--am-text)', textDecoration: 'none', borderBottom: '1px solid var(--am-border)' }}>
                                            <i className="bi bi-tag" style={{ color: '#8b5cf6' }} />Label
                                          </Link>
                                          <Link href={`/nota/${s.id}/penerimaan`} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', fontSize: '.75rem', color: 'var(--am-text)', textDecoration: 'none', borderBottom: '1px solid var(--am-border)' }}>
                                            <i className="bi bi-qr-code" style={{ color: '#2563eb' }} />Nota Penerimaan
                                          </Link>
                                          <Link href={`/nota/${s.id}/garansi`} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', fontSize: '.75rem', color: 'var(--am-text)', textDecoration: 'none' }}>
                                            <i className="bi bi-shield-check" style={{ color: '#f59e0b' }} />Nota Garansi
                                          </Link>
                                        </div>
                                      </div>
                                      {/* WA Button */}
                                      <a href={`https://wa.me/${hp}?text=${encodeURIComponent(wa_msg)}`} target="_blank" className="btn-act btn-act-green" title="Kirim WA">
                                        <i className="bi bi-whatsapp" />
                                      </a>
                                    </>
                                  )}
                                  {isAdmin && (
                                    showTrash ? (
                                      <>
                                        <button onClick={() => handleDelete(s.id)} className="btn-act btn-act-green" title="Pulihkan">
                                          <i className="bi bi-arrow-counterclockwise" />
                                        </button>
                                        <button onClick={() => handleDelete(s.id)} className="btn-act btn-act-red" title="Hapus Permanen" style={{ fontSize: '.68rem', padding: '3px 6px' }}>
                                          <i className="bi bi-trash3-fill" />
                                        </button>
                                      </>
                                    ) : (
                                      <button onClick={() => handleDelete(s.id)} className="btn-act btn-act-red" title="Hapus">
                                        <i className="bi bi-trash" />
                                      </button>
                                    )
                                  )}
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Footer Info */}
                <div style={{ borderTop: '2px solid var(--am-border)', background: 'var(--am-bg)', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                  <span style={{ fontSize: '.78rem', fontWeight: '700', color: 'var(--am-text)' }}>
                    Halaman {page} &mdash; {servis.length} data ditampilkan
                  </span>
                  <span style={{ fontSize: '.75rem', color: 'var(--am-text-muted)' }}>
                    Total <strong style={{ color: 'var(--am-text)' }}>{total.toLocaleString('id-ID')}</strong> data
                  </span>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '48px', color: 'var(--am-text-muted)' }}>
                <i className="bi bi-inbox" style={{ fontSize: '2rem', display: 'block', marginBottom: '8px', opacity: 0.4 }} />
                {search ? `Tidak ada data servis untuk "${search}"` : 'Tidak ada data servis'}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
              <div className="am-pagination" style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="am-btn am-btn-secondary"
                  style={{ padding: '8px 12px', fontSize: '.875rem' }}
                >
                  <i className="bi bi-chevron-left" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                  .map((p, idx, arr) => (
                    <>
                      {idx > 0 && arr[idx - 1] !== p - 1 && <span style={{ padding: '8px 12px', color: 'var(--am-text-muted)' }}>…</span>}
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`am-btn ${page === p ? 'am-btn-primary' : 'am-btn-secondary'}`}
                        style={{ padding: '8px 14px', fontSize: '.875rem', minWidth: '40px' }}
                      >
                        {p}
                      </button>
                    </>
                  ))
                }
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="am-btn am-btn-secondary"
                  style={{ padding: '8px 12px', fontSize: '.875rem' }}
                >
                  <i className="bi bi-chevron-right" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Desktop Only */}
        <div className="ds-sidebar">
          {/* Status Recap */}
          <div className="section-card" style={{ marginBottom: '16px' }}>
            <div className="card-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '.84rem', fontWeight: '600', color: 'var(--am-text)' }}>
                <i className="bi bi-bar-chart-fill" style={{ color: '#3b82f6' }} /> Rekap Status
              </span>
            </div>
            <div style={{ padding: '6px 0' }}>
              {[
                { label: 'Antrean', cls: 'badge-antrean', color: '#94a3b8' },
                { label: 'Proses', cls: 'badge-proses', color: '#f59e0b' },
                { label: 'Siap Diambil', cls: 'badge-siap', color: '#06b6d4' },
                { label: 'Selesai', cls: 'badge-selesai', color: '#10b981' },
                { label: 'Tidak Bisa', cls: 'badge-gagal', color: '#ef4444' },
              ].map(({ label, cls, color }) => {
                const count = servis.filter(s => s.status === label).length
                const pct = total > 0 ? Math.round((count / total) * 100) : 0
                return (
                  <div key={label} style={{ padding: '7px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                      <span className={`badge-soft ${cls}`} style={{ fontSize: '.66rem' }}>{label}</span>
                      <span style={{ fontWeight: '700', fontSize: '.82rem', color: 'var(--am-text)' }}>{count}</span>
                    </div>
                    <div style={{ height: '4px', background: 'var(--am-border)', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '99px' }} />
                    </div>
                  </div>
                )
              })}
            </div>
            <div style={{ padding: '8px 16px 10px', borderTop: '1px solid var(--am-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '.72rem', color: 'var(--am-text-muted)' }}>Total semua</span>
              <span style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--am-text)' }}>{total}</span>
            </div>
          </div>

          {/* Activity */}
          <div className="section-card" style={{ marginBottom: '16px' }}>
            <div className="card-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '.84rem', fontWeight: '600', color: 'var(--am-text)' }}>
                <i className="bi bi-calendar-check" style={{ color: '#10b981' }} /> Aktivitas
              </span>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid var(--am-border)' }}>
                <span style={{ fontSize: '.8rem', color: 'var(--am-text-muted)' }}>Hari ini</span>
                <span style={{ fontWeight: '700', color: 'var(--am-text)' }}>
                  {servis.filter(s => s.tanggal === new Date().toISOString().split('T')[0]).length} servis
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px' }}>
                <span style={{ fontSize: '.8rem', color: 'var(--am-text-muted)' }}>Bulan ini</span>
                <span style={{ fontWeight: '700', color: 'var(--am-text)' }}>{servis.length} servis</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

export default function DataServis() {
  return (
    <Suspense fallback={
      <AppLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div style={{ textAlign: 'center', color: 'var(--am-text-muted)' }}>
            <i className="bi bi-arrow-repeat" style={{ fontSize: '2rem', animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: '8px' }}>Memuat...</p>
          </div>
        </div>
      </AppLayout>
    }>
      <DataServisContent />
    </Suspense>
  )
}