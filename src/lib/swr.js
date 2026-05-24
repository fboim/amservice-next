import useSWR from 'swr'

const fetcher = (url) => fetch(url, {
  cache: 'no-store',
  headers: { 'Cache-Control': 'no-cache, no-transform' }
}).then(res => res.json())

export function useDashboard() {
  const { data, error, isLoading, mutate } = useSWR('/api/dashboard', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 5000
  })
  return { stats: data, isLoading, error, mutate }
}

export function useServis(page = 1, search = '', status = '') {
  const params = new URLSearchParams({ page, limit: 12, search, _t: Date.now() })
  if (status) params.set('status', status)
  const url = `/api/servis?${params}`

  const { data, error, isLoading, mutate } = useSWR(url, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 5000
  })
  return { servis: data?.servis || [], total: data?.total || 0, isLoading, error, mutate }
}

export function useSparepart(search = '') {
  const params = new URLSearchParams({ search, _t: Date.now() })
  const url = `/api/sparepart?${params}`

  const { data, error, isLoading, mutate } = useSWR(url, fetcher, {
    revalidateOnFocus: false
  })
  return { sparepart: data?.sparepart || [], isLoading, error, mutate }
}

export function usePelanggan(page = 1, search = '') {
  const params = new URLSearchParams({ page, limit: 15, search })
  const url = `/api/pelanggan?${params}`

  const { data, error, isLoading, mutate } = useSWR(url, fetcher, {
    revalidateOnFocus: false
  })
  return { pelanggan: data?.pelanggan || [], total: data?.total || 0, isLoading, error, mutate }
}

export function useTestimonials() {
  const { data, error, isLoading, mutate } = useSWR('/api/testimonials', fetcher, {
    revalidateOnFocus: false
  })
  return { testimonials: Array.isArray(data) ? data : [], isLoading, error, mutate }
}

export { fetcher }