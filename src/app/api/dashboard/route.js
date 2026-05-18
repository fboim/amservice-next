import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET(request) {
  // Check auth header
  const authHeader = request.headers.get('authorization')
  if (!authHeader) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const today = new Date().toISOString().split('T')[0]

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
      .eq('tanggal', today)
      .is('deleted_at', null)

    // Get omzet
    const { data: servisToday } = await supabaseAdmin
      .from('servis')
      .select('estimasi_biaya')
      .eq('status', 'Sudah Diambil')
      .eq('tanggal', today)

    const omzetHari = servisToday?.reduce((sum, s) => {
      const biaya = parseInt((s.estimasi_biaya || '0').replace(/\D/g, ''))
      return sum + biaya
    }, 0) || 0

    return Response.json({
      antrean: antrean || 0,
      proses: proses || 0,
      siap: siap || 0,
      selesai: selesai || 0,
      omzet_hari: omzetHari,
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return Response.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}