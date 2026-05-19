import { createClient } from '@supabase/supabase-js'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 15
    const search = searchParams.get('search') || ''
    const offset = (page - 1) * limit

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    let query = supabase
      .from('pelanggan')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (search) {
      query = query.or(`nama_pelanggan.ilike.%${search}%,no_hp.ilike.%${search}%`)
    }

    const { data: pelanggan, error, count } = await query
      .range(offset, offset + limit - 1)

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ pelanggan: pelanggan || [], total: count || 0 })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { nama_pelanggan, no_hp, alamat, email, catatan } = await request.json()

    if (!nama_pelanggan || !no_hp) {
      return Response.json({ error: 'Nama dan No. HP wajib diisi' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Check if customer already exists
    const { data: existing } = await supabase
      .from('pelanggan')
      .select('id')
      .eq('no_hp', no_hp)
      .single()

    if (existing) {
      return Response.json({ error: 'No. HP sudah terdaftar' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('pelanggan')
      .insert({ nama_pelanggan, no_hp, alamat: alamat || null, email: email || null, catatan: catatan || null })
      .select()
      .single()

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ success: true, pelanggan: data })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}