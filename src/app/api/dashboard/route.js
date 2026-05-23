import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

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

    // Get statistics - all time counts
    const { count: antrean } = await supabase
      .from('servis')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Antrean')
      .is('deleted_at', null)

    const { count: proses } = await supabase
      .from('servis')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Proses')
      .is('deleted_at', null)

    const { count: siap } = await supabase
      .from('servis')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Siap Diambil')
      .is('deleted_at', null)

    // Selesai = unit yang sudah selesai diambil hari ini
    const { count: selesai } = await supabase
      .from('servis')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Sudah Diambil')
      .eq('tanggal', todayStr)
      .is('deleted_at', null)

    // Get daily omzet (hari ini - transaksi selesai)
    const { data: servisToday, error: errorToday } = await supabase
      .from('servis')
      .select('estimasi_biaya, status, tanggal')
      .eq('status', 'Sudah Diambil')
      .eq('tanggal', todayStr)
      .is('deleted_at', null)

    console.log('Daily omzet query:', { todayStr, count: servisToday?.length, error: errorToday })

    const omzetHari = servisToday?.reduce((sum, s) => {
      const biaya = parseInt(String(s.estimasi_biaya || '0').replace(/\D/g, ''))
      console.log('Daily servis:', s.no_servis, 'biaya:', s.estimasi_biaya, '-> parsed:', biaya)
      return sum + biaya
    }, 0) || 0

    console.log('Total omzet Hari:', omzetHari)

    // Get monthly omzet (bulan ini saja, bukan tahun ini)
    const monthStart = `${currentYear}-${currentMonth}-01`
    const { data: servisBulanIni, error: errorBulan } = await supabase
      .from('servis')
      .select('estimasi_biaya, status, tanggal')
      .eq('status', 'Sudah Diambil')
      .gte('tanggal', monthStart)
      .is('deleted_at', null)

    console.log('Monthly omzet query:', { monthStart, count: servisBulanIni?.length, error: errorBulan })

    const omzetBulan = servisBulanIni?.reduce((sum, s) => {
      const biaya = parseInt(String(s.estimasi_biaya || '0').replace(/\D/g, ''))
      console.log('Monthly servis:', s.no_servis, 'biaya:', s.estimasi_biaya, '-> parsed:', biaya)
      return sum + biaya
    }, 0) || 0

    console.log('Total omzet Bulan:', omzetBulan)

    // Get merk populer from ALL servis (not just latest)
    const { data: allServis } = await supabase
      .from('servis')
      .select('merk_hp')
      .is('deleted_at', null)

    const merkCount = {}
    if (allServis && allServis.length > 0) {
      allServis.forEach(s => {
        const merk = s.merk_hp?.trim() || 'Lainnya'
        if (merk) {
          merkCount[merk] = (merkCount[merk] || 0) + 1
        }
      })
    }

    const merkPopuler = Object.entries(merkCount)
      .map(([merk_hp, total]) => ({ merk_hp, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)

    // Get monthly data for chart (last 6 months)
    const monthsData = []
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const year = d.getFullYear()
      const month = d.getMonth() + 1
      const monthLabel = monthNames[d.getMonth()]

      const firstDay = `${year}-${String(month).padStart(2, '0')}-01`
      const lastDay = new Date(year, month, 0).toISOString().split('T')[0]

      const { count } = await supabase
        .from('servis')
        .select('*', { count: 'exact', head: true })
        .gte('tanggal', firstDay)
        .lte('tanggal', lastDay)
        .is('deleted_at', null)

      monthsData.push({
        label: monthLabel,
        value: count || 0,
      })
    }

    // Get total servis tahun ini
    const yearStart = `${currentYear}-01-01`
    const { count: totalTahun } = await supabase
      .from('servis')
      .select('*', { count: 'exact', head: true })
      .gte('tanggal', yearStart)
      .is('deleted_at', null)

    return Response.json({
      antrean: antrean || 0,
      proses: proses || 0,
      siap: siap || 0,
      selesai: selesai || 0,
      omzet_hari: omzetHari,
      omzet_bulan: omzetBulan,
      monthly_data: monthsData,
      merk_populer: merkPopuler,
      total_tahun: totalTahun || 0,
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return Response.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}