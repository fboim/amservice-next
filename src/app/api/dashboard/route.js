import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET(request) {
  try {
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    const currentMonth = today.toISOString().slice(0, 7) // YYYY-MM
    const currentYear = today.getFullYear()

    // Get statistics
    const { count: antrean } = await supabaseAdmin
      .from('servis')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Antrean')
      .is('deleted_at', null)

    const { count: proses } = await supabaseAdmin
      .from('servis')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Proses')
      .is('deleted_at', null)

    const { count: siap } = await supabaseAdmin
      .from('servis')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Siap Diambil')
      .is('deleted_at', null)

    const { count: selesai } = await supabaseAdmin
      .from('servis')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Sudah Diambil')
      .eq('tanggal', todayStr)
      .is('deleted_at', null)

    // Get daily omzet
    const { data: servisToday } = await supabaseAdmin
      .from('servis')
      .select('estimasi_biaya')
      .eq('status', 'Sudah Diambil')
      .eq('tanggal', todayStr)
      .is('deleted_at', null)

    const omzetHari = servisToday?.reduce((sum, s) => {
      const biaya = parseInt((s.estimasi_biaya || '0').replace(/\D/g, ''))
      return sum + biaya
    }, 0) || 0

    // Get monthly omzet (this year)
    const { data: servisBulanIni } = await supabaseAdmin
      .from('servis')
      .select('estimasi_biaya')
      .eq('status', 'Sudah Diambil')
      .gte('tanggal', `${currentYear}-01-01`)
      .lte('tanggal', `${currentYear}-12-31`)
      .is('deleted_at', null)

    const omzetBulan = servisBulanIni?.reduce((sum, s) => {
      const biaya = parseInt((s.estimasi_biaya || '0').replace(/\D/g, ''))
      return sum + biaya
    }, 0) || 0

    // Get monthly data for chart (last 6 months)
    const monthsData = []
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const year = d.getFullYear()
      const month = d.getMonth() + 1
      const monthLabel = monthNames[d.getMonth()]

      // First day and last day of the month
      const firstDay = `${year}-${String(month).padStart(2, '0')}-01`
      const lastDay = new Date(year, month, 0).toISOString().split('T')[0]

      const { count } = await supabaseAdmin
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

    return Response.json({
      antrean: antrean || 0,
      proses: proses || 0,
      siap: siap || 0,
      selesai: selesai || 0,
      omzet_hari: omzetHari,
      omzet_bulan: omzetBulan,
      monthly_data: monthsData,
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return Response.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}