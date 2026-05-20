import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  // Prevent caching
  const headers = new Headers()
  headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  headers.set('Pragma', 'no-cache')
  headers.set('Expires', '0')

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
      return new Response(JSON.stringify({
        pengaturan: {
          id: 1,
          nama_toko: 'AM SERVICE',
          no_wa: '',
          alamat: '',
          link_maps: '',
          snk_penerimaan: '1. Pelanggan wajib menunjukkan nota saat pengambilan unit.\n2. Garansi tidak berlaku jika kerusakan disebabkan oleh faktor eksternal.\n3. Estimasi waktu dapat berubah tergantung kondisi.',
          snk_garansi: '1. Garansi berlaku 7 hari sejak tanggal nota.\n2. Garansi hanya berlaku untuk kerusakan yang sama.\n3. Garansi tidak berlaku jika unit mengalami kerusakan fisik.'
        }
      }), { headers })
    }

    return new Response(JSON.stringify({ pengaturan: data }), { headers })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers })
  }
}

export async function PUT(request) {
  // Prevent caching
  const headers = new Headers()
  headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')

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

    return new Response(JSON.stringify({ success: true, pengaturan: result }), { headers })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers })
  }
}