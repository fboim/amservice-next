import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '12')
  const search = searchParams.get('search') || ''
  const low = searchParams.get('low') === 'true'

  const offset = (page - 1) * limit

  let query = supabaseAdmin.from('sparepart').select('*', { count: 'exact' })

  if (search) {
    query = query.ilike('nama_sparepart', `%${search}%`)
  }

  if (low) {
    query = query.lte('stok', 5).order('stok', { ascending: true })
  } else {
    query = query.order('id', { ascending: false })
  }

  const { data, count, error } = await query.range(offset, offset + limit - 1)

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({
    sparepart: data || [],
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  })
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { data, error } = await supabaseAdmin
      .from('sparepart')
      .insert(body)
      .select()
      .single()

    if (error) throw error

    return Response.json({ success: true, sparepart: data })
  } catch (error) {
    console.error('Create sparepart error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}