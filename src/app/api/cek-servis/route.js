import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const no = searchParams.get('no')
  const hp = searchParams.get('hp')

  try {
    if (no) {
      // Search by nomor servis
      const { data, error } = await supabaseAdmin
        .from('servis')
        .select('no_servis, nama_pelanggan, merk_hp, tipe_hp, status, estimasi_biaya, tanggal, garansi')
        .eq('no_servis', no)
        .is('deleted_at', null)
        .single()

      if (error || !data) {
        return Response.json({ error: 'Nomor servis tidak ditemukan' }, { status: 404 })
      }

      const biaya = parseInt((data.estimasi_biaya || '0').replace(/\D/g, ''))

      return Response.json({
        no_servis: data.no_servis,
        nama: data.nama_pelanggan?.toUpperCase(),
        unit: `${data.merk_hp} ${data.tipe_hp}`,
        status: data.status,
        biaya: `Rp ${biaya.toLocaleString('id-ID')}`,
        tanggal: new Date(data.tanggal).toLocaleDateString('id-ID'),
        garansi: data.garansi || 'Tidak Ada',
        siap_diambil: data.status === 'Siap Diambil',
        selesai: data.status === 'Sudah Diambil',
      })
    }

    if (hp) {
      // Search by nomor HP
      const { data, error } = await supabaseAdmin
        .from('servis')
        .select('no_servis, merk_hp, tipe_hp, status, tanggal')
        .eq('no_hp', hp)
        .is('deleted_at', null)
        .order('tanggal', { ascending: false })
        .limit(10)

      if (error || !data || data.length === 0) {
        return Response.json({ error: 'Nomor HP tidak ditemukan' }, { status: 404 })
      }

      const riwayat = data.map(s => ({
        no_servis: s.no_servis,
        unit: `${s.merk_hp} ${s.tipe_hp}`,
        status: s.status,
        tanggal: new Date(s.tanggal).toLocaleDateString('id-ID'),
      }))

      return Response.json({ total: data.length, data: riwayat })
    }

    return Response.json({ error: 'Parameter ?no= atau ?hp= diperlukan' }, { status: 400 })
  } catch (err) {
    console.error('Cek servis error:', err)
    return Response.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}