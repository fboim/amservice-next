import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data, error } = await supabase
      .from('pengaturan')
      .select('*')
      .limit(1)
      .single()

    if (error || !data) {
      // Return default settings if none exist
      return Response.json({
        pengaturan: {
          id: 1,
          nama_toko: 'AM SERVICE',
          no_wa: '',
          alamat: '',
          link_maps: '',
          snk_penerimaan: '1. Pelanggan wajib menunjukkan nota saat pengambilan unit.\n2. Garansi tidak berlaku jika kerusakan disebabkan oleh faktor eksternal.\n3. Estimasi waktu dapat berubah tergantung kondisi.',
          snk_garansi: '1. Garansi berlaku 7 hari sejak tanggal nota.\n2. Garansi hanya berlaku untuk kerusakan yang sama.\n3. Garansi tidak berlaku jika unit mengalami kerusakan fisik.'
        }
      })
    }

    return Response.json({ pengaturan: data })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const body = await request.json()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Check if pengaturan exists
    const { data: existing } = await supabase
      .from('pengaturan')
      .select('id')
      .limit(1)
      .single()

    let result

    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from('pengaturan')
        .update(body)
        .eq('id', existing.id)
        .select()
        .single()

      if (error) throw error
      result = data
    } else {
      // Insert new
      const { data, error } = await supabase
        .from('pengaturan')
        .insert(body)
        .select()
        .single()

      if (error) throw error
      result = data
    }

    return Response.json({ success: true, pengaturan: result })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}