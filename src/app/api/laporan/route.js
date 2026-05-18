import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'harian'
  const bulan = searchParams.get('bulan') || new Date().toISOString().slice(0, 7)

  try {
    let startDate, endDate
    const now = new Date()

    if (type === 'harian') {
      startDate = now.toISOString().split('T')[0]
      endDate = startDate
    } else if (type === 'mingguan') {
      const dayOfWeek = now.getDay()
      startDate = new Date(now.setDate(now.getDate() - dayOfWeek)).toISOString().split('T')[0]
      endDate = new Date().toISOString().split('T')[0]
    } else if (type === 'bulanan') {
      startDate = `${bulan}-01`
      const [year, month] = bulan.split('-')
      endDate = new Date(year, month, 0).toISOString().split('T')[0]
    } else if (type === 'custom') {
      startDate = searchParams.get('start') || now.toISOString().split('T')[0]
      endDate = searchParams.get('end') || now.toISOString().split('T')[0]
    }

    // Get servis data
    const { data: servis, error } = await supabaseAdmin
      .from('servis')
      .select('*')
      .gte('tanggal', startDate)
      .lte('tanggal', endDate)
      .is('deleted_at', null)
      .order('tanggal', { ascending: false })

    if (error) throw error

    // Calculate statistics
    const stats = {
      total: servis.length,
      antrean: servis.filter(s => s.status === 'Antrean').length,
      proses: servis.filter(s => s.status === 'Proses').length,
      siap: servis.filter(s => s.status === 'Siap Diambil').length,
      selesai: servis.filter(s => s.status === 'Sudah Diambil').length,
      gagal: servis.filter(s => s.status === 'Tidak Bisa').length,
    }

    // Calculate omzet
    let omzet = 0
    servis.forEach(s => {
      const biaya = parseInt((s.estimasi_biaya || '0').replace(/\D/g, ''))
      omzet += biaya
    })

    // Group by date for chart
    const byDate = {}
    servis.forEach(s => {
      const date = s.tanggal
      if (!byDate[date]) {
        byDate[date] = { total: 0, omzet: 0, count: 0 }
      }
      byDate[date].count++
      byDate[date].omzet += parseInt((s.estimasi_biaya || '0').replace(/\D/g, ''))
    })

    // Group by merk
    const byMerk = {}
    servis.forEach(s => {
      const merk = s.merk_hp || 'Lainnya'
      if (!byMerk[merk]) {
        byMerk[merk] = { count: 0, omzet: 0 }
      }
      byMerk[merk].count++
      byMerk[merk].omzet += parseInt((s.estimasi_biaya || '0').replace(/\D/g, ''))
    })

    // Sort byMerk by count
    const topMerk = Object.entries(byMerk)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)

    return Response.json({
      success: true,
      stats,
      omzet,
      servis,
      byDate,
      byMerk: topMerk,
      period: { start: startDate, end: endDate, type }
    })
  } catch (error) {
    console.error('Laporan error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}