import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  try {
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    const currentYear = today.getFullYear()
    const currentMonth = String(today.getMonth() + 1).padStart(2, '0')

    // Run all queries in parallel
    const [
      antreanResult,
      prosesResult,
      siapResult,
      selesaiResult,
      servisTodayResult,
      servisBulanIniResult,
      allServisResult,
      totalTahunResult
    ] = await Promise.all([
      supabase.from('servis').select('*', { count: 'exact', head: true }).eq('status', 'Antrean').is('deleted_at', null),
      supabase.from('servis').select('*', { count: 'exact', head: true }).eq('status', 'Proses').is('deleted_at', null),
      supabase.from('servis').select('*', { count: 'exact', head: true }).eq('status', 'Siap Diambil').is('deleted_at', null),
      supabase.from('servis').select('*', { count: 'exact', head: true }).eq('status', 'Sudah Diambil').eq('tanggal', todayStr).is('deleted_at', null),
      supabase.from('servis').select('estimasi_biaya').eq('status', 'Sudah Diambil').eq('tanggal', todayStr).is('deleted_at', null),
      supabase.from('servis').select('estimasi_biaya').eq('status', 'Sudah Diambil').gte('tanggal', currentYear + '-' + currentMonth + '-01').is('deleted_at', null),
      supabase.from('servis').select('merk_hp').is('deleted_at', null),
      supabase.from('servis').select('*', { count: 'exact', head: true }).gte('tanggal', currentYear + '-01-01').is('deleted_at', null)
    ])

    const antrean = antreanResult.count || 0
    const proses = prosesResult.count || 0
    const siap = siapResult.count || 0
    const selesai = selesaiResult.count || 0
    const servisToday = servisTodayResult.data || []
    const servisBulanIni = servisBulanIniResult.data || []
    const allServis = allServisResult.data || []
    const totalTahun = totalTahunResult.count || 0

    // Calculate omzet
    const omzetHari = servisToday.reduce((sum, s) => {
      const biaya = parseInt(String(s.estimasi_biaya || '0').replace(/\D/g, '')) || 0
      return sum + biaya
    }, 0)
    const omzetBulan = servisBulanIni.reduce((sum, s) => {
      const biaya = parseInt(String(s.estimasi_biaya || '0').replace(/\D/g, '')) || 0
      return sum + biaya
    }, 0)

    // Count merk
    const merkCount = {}
    allServis.forEach(s => {
      const merk = s.merk_hp?.trim() || 'Lainnya'
      if (merk) merkCount[merk] = (merkCount[merk] || 0) + 1
    })
    const merkPopuler = Object.entries(merkCount).map(([merk_hp, total]) => ({ merk_hp, total })).sort((a, b) => b.total - a.total).slice(0, 10)

    // Get monthly data in parallel (6 queries)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    const monthsQueries = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const year = d.getFullYear()
      const month = d.getMonth() + 1
      const firstDay = year + '-' + String(month).padStart(2, '0') + '-01'
      const lastDay = new Date(year, month, 0).toISOString().split('T')[0]
      monthsQueries.push({
        label: monthNames[d.getMonth()],
        query: supabase.from('servis').select('*', { count: 'exact', head: true }).gte('tanggal', firstDay).lte('tanggal', lastDay).is('deleted_at', null)
      })
    }

    const monthsResults = await Promise.all(monthsQueries.map(q => q.query))
    const monthsData = monthsResults.map((result, i) => ({
      label: monthsQueries[i].label,
      value: result.count || 0
    }))

    return Response.json({
      antrean,
      proses,
      siap,
      selesai,
      omzet_hari: omzetHari,
      omzet_bulan: omzetBulan,
      monthly_data: monthsData,
      merk_populer: merkPopuler,
      total_tahun: totalTahun,
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return Response.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}
