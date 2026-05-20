import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  // Get single sparepart by id
  if (id) {
    const { data, error } = await supabaseAdmin
      .from('sparepart')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ sparepart: data })
  }

  // Get list with pagination
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

export async function PUT(request) {
  try {
    const body = await request.json()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id') || body.id

    if (!id) {
      return Response.json({ error: 'ID is required' }, { status: 400 })
    }

    // Extract fields for update
    const { nama_sparepart, stok, harga, supplier, lokasi, adjustment } = body

    // If adjustment is provided, update stok relative to current value
    if (adjustment !== undefined) {
      const { data: current } = await supabaseAdmin
        .from('sparepart')
        .select('stok')
        .eq('id', id)
        .single()

      if (current) {
        const newStok = Math.max(0, (current.stok || 0) + adjustment)
        const { data, error } = await supabaseAdmin
          .from('sparepart')
          .update({ stok: newStok })
          .eq('id', id)
          .select()
          .single()

        if (error) throw error
        return Response.json({ success: true, sparepart: data })
      }
    }

    // Normal update
    const updateData = {}
    if (nama_sparepart !== undefined) updateData.nama_sparepart = nama_sparepart
    if (stok !== undefined) updateData.stok = stok
    if (harga !== undefined) updateData.harga = harga
    if (supplier !== undefined) updateData.supplier = supplier
    if (lokasi !== undefined) updateData.lokasi = lokasi

    const { data, error } = await supabaseAdmin
      .from('sparepart')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return Response.json({ success: true, sparepart: data })
  } catch (error) {
    console.error('Update sparepart error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return Response.json({ error: 'ID is required' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('sparepart')
      .delete()
      .eq('id', id)

    if (error) throw error

    return Response.json({ success: true })
  } catch (error) {
    console.error('Delete sparepart error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}