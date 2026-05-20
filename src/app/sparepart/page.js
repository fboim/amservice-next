'use client'
export const dynamic = 'force-dynamic'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import AppLayout from '@/components/AppLayout'

function DataSparepartContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [sparepart, setSparepart] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState(searchParams.get('cari') || '')

  useEffect(() => {
    fetchSparepart()
  }, [page, search])

  const fetchSparepart = async () => {
    try {
      const params = new URLSearchParams({ page, limit: 12, search })
      const res = await fetch(`/api/sparepart?${params}`)
      const data = await res.json()
      setSparepart(data.sparepart || [])
      setTotal(data.total || 0)
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(total / 12)

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    router.push(`/sparepart${search ? `?cari=${search}` : ''}`)
  }

  const getStokBadge = (stok) => {
    if (stok <= 5) return 'badge-proses'
    if (stok <= 10) return 'badge-siap'
    return 'badge-selesai'
  }

  const getStokText = (stok) => {
    if (stok <= 5) return 'Habis'
    if (stok <= 10) return 'Sedikit'
    return 'Tersedia'
  }

  if (loading) {
    return (
      <AppLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div style={{ textAlign: 'center', color: 'var(--am-text-muted)' }}>
            <i className="bi bi-arrow-repeat" style={{ fontSize: '2rem', animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: '8px' }}>Memuat data sparepart...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      {/* Page Header */}
      <div className="pg-header">
        <div>
          <h4 className="pg-title">
            <i className="bi bi-box-seam" style={{ color: '#3b82f6', marginRight: 8 }} />
            Data Sparepart
          </h4>
          <p className="pg-subtitle">
            Kelola semua sparepart &mdash; {total.toLocaleString('id-ID')} item
          </p>
        </div>
        <Link href="/sparepart/tambah" className="am-btn am-btn-primary am-btn-pill am-btn-sm" style={{ boxShadow: '0 2px 10px rgba(59,130,246,.25)' }}>
          <i className="bi bi-plus-circle" /> Tambah Sparepart
        </Link>
      </div>

      {/* Search */}
      <div className="section-card" style={{ marginBottom: '16px', padding: '12px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          <input
            type="text"
            name="cari"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama sparepart..."
            className="am-input"
            style={{ minWidth: '180px', maxWidth: '320px' }}
          />
          <button type="submit" className="am-btn am-btn-primary" style={{ padding: '8px 14px', borderRadius: '8px', whiteSpace: 'nowrap' }}>
            <i className="bi bi-search" /> Cari
          </button>
          {search ? (
            <Link href="/sparepart" className="am-btn am-btn-secondary" style={{ padding: '8px 14px', borderRadius: '8px', whiteSpace: 'nowrap' }}>
              Reset
            </Link>
          ) : null}
        </form>
      </div>

      {/* Table */}
      <div className="section-card" style={{ marginBottom: '14px', overflow: 'hidden' }}>
        {sparepart.length > 0 ? (
          <>
            <div className="dual-wrap">
              {/* Left Column */}
              <div className="dt-col">
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: '28px', textAlign: 'center' }}>#</th>
                      <th>Nama Sparepart</th>
                      <th style={{ width: '80px', textAlign: 'center' }}>Stok</th>
                      <th style={{ width: '110px', textAlign: 'center' }}>Harga</th>
                      <th style={{ width: '80px', textAlign: 'center' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sparepart.slice(0, Math.ceil(sparepart.length / 2)).map((sp, i) => (
                      <tr key={sp.id}>
                        <td style={{ textAlign: 'center', fontSize: '.75rem', color: 'var(--am-text-muted)', fontWeight: '700' }}>
                          {i + 1}
                        </td>
                        <td>
                          <div style={{ fontWeight: '600', color: 'var(--am-text)', fontSize: '.82rem', textTransform: 'uppercase' }}>
                            {sp.nama_sparepart}
                          </div>
                          {sp.supplier && (
                            <div style={{ fontSize: '.68rem', color: 'var(--am-text-muted)' }}>
                              Supplier: {sp.supplier}
                            </div>
                          )}
                          {sp.lokasi && (
                            <div style={{ fontSize: '.68rem', color: 'var(--am-text-muted)' }}>
                              Lokasi: {sp.lokasi}
                            </div>
                          )}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`badge-soft ${getStokBadge(sp.stok)}`} style={{ fontSize: '.67rem' }}>
                            {sp.stok} pcs
                          </span>
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: '700', color: '#ef4444', fontSize: '.8rem' }}>
                          Rp {(parseInt(sp.harga) || 0).toLocaleString('id-ID')}
                        </td>
                        <td>
                          <div className="btn-group-act">
                            <Link href={`/sparepart/edit/${sp.id}`} className="btn-act btn-act-blue" title="Edit">
                              <i className="bi bi-pencil-square" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Right Column */}
              <div className="dt-col">
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: '28px', textAlign: 'center' }}>#</th>
                      <th>Nama Sparepart</th>
                      <th style={{ width: '80px', textAlign: 'center' }}>Stok</th>
                      <th style={{ width: '110px', textAlign: 'center' }}>Harga</th>
                      <th style={{ width: '80px', textAlign: 'center' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sparepart.slice(Math.ceil(sparepart.length / 2)).map((sp, i) => {
                      const idx = Math.ceil(sparepart.length / 2) + i
                      return (
                        <tr key={sp.id}>
                          <td style={{ textAlign: 'center', fontSize: '.75rem', color: 'var(--am-text-muted)', fontWeight: '700' }}>
                            {idx + 1}
                          </td>
                          <td>
                            <div style={{ fontWeight: '600', color: 'var(--am-text)', fontSize: '.82rem', textTransform: 'uppercase' }}>
                              {sp.nama_sparepart}
                            </div>
                            {sp.supplier && (
                              <div style={{ fontSize: '.68rem', color: 'var(--am-text-muted)' }}>
                                Supplier: {sp.supplier}
                              </div>
                            )}
                            {sp.lokasi && (
                              <div style={{ fontSize: '.68rem', color: 'var(--am-text-muted)' }}>
                                Lokasi: {sp.lokasi}
                              </div>
                            )}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span className={`badge-soft ${getStokBadge(sp.stok)}`} style={{ fontSize: '.67rem' }}>
                              {sp.stok} pcs
                            </span>
                          </td>
                          <td style={{ textAlign: 'center', fontWeight: '700', color: '#ef4444', fontSize: '.8rem' }}>
                            Rp {(parseInt(sp.harga) || 0).toLocaleString('id-ID')}
                          </td>
                          <td>
                            <div className="btn-group-act">
                              <Link href={`/sparepart/edit/${sp.id}`} className="btn-act btn-act-blue" title="Edit">
                                <i className="bi bi-pencil-square" />
                              </Link>
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
                Halaman {page} &mdash; {sparepart.length} data ditampilkan
              </span>
              <span style={{ fontSize: '.75rem', color: 'var(--am-text-muted)' }}>
                Total <strong style={{ color: 'var(--am-text)' }}>{total.toLocaleString('id-ID')}</strong> item
              </span>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--am-text-muted)' }}>
            <i className="bi bi-inbox" style={{ fontSize: '2rem', display: 'block', marginBottom: '8px', opacity: 0.4 }} />
            {search ? `Tidak ada sparepart untuk "${search}"` : 'Tidak ada data sparepart'}
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
    </AppLayout>
  )
}

export default function Sparepart() {
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
      <DataSparepartContent />
    </Suspense>
  )
}