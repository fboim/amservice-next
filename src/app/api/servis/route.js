import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const noServis = searchParams.get('no_servis')

  // Get single servis by ID
  if (id) {
    const { data, error } = await supabaseAdmin
      .from('servis')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return Response.json({ error: error.message }, { status: 404 })
    }
    return Response.json(data)
  }

  // Search by no_servis for cek servis
  if (noServis) {
    const { data, error } = await supabaseAdmin
      .from('servis')
      .select('*')
      .ilike('no_servis', `%${noServis}%`)
      .is('deleted_at', null)
      .limit(1)
      .single()

    if (error) {
      // If not found, return empty (not an error)
      return Response.json({ not_found: true })
    }
    return Response.json(data)
  }

  // List servis with pagination
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '12')
  const search = searchParams.get('cari') || ''
  const status = searchParams.get('status') || ''
  const trash = searchParams.get('trash') === '1'

  const offset = (page - 1) * limit

  let query = supabaseAdmin
    .from('servis')
    .select('*', { count: 'exact' })
    .order('id', { ascending: false })

  // Trash mode
  if (trash) {
    query = query.not('deleted_at', 'is', null)
  } else {
    query = query.is('deleted_at', null)
  }

  if (search) {
    query = query.or(`no_servis.ilike.%${search}%,nama_pelanggan.ilike.%${search}%,merk_hp.ilike.%${search}%`)
  }

  if (status) {
    query = query.eq('status', status)
  }

  const { data, count, error } = await query.range(offset, offset + limit - 1)

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({
    servis: data || [],
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  })
}

export async function POST(request) {
  try {
    const body = await request.json()

    const bulanIni = new Date().toISOString().slice(2, 8).replace('-', '')
    const prefix = `AM-${bulanIni}-`

    const { data: lastServis } = await supabaseAdmin
      .from('servis')
      .select('no_servis')
      .like('no_servis', `${prefix}%`)
      .order('id', { ascending: false })
      .limit(1)

    let urutan = 1
    if (lastServis && lastServis.length > 0) {
      const lastNo = lastServis[0].no_servis
      const num = parseInt(lastNo.replace(prefix, ''))
      urutan = num + 1
    }

    const noServis = `${prefix}${String(urutan).padStart(3, '0')}`

    // Only include valid columns for servis table
    const { data, error } = await supabaseAdmin
      .from('servis')
      .insert({
        no_servis: noServis,
        tanggal: body.tanggal || new Date().toISOString().split('T')[0],
        nama_pelanggan: body.nama_pelanggan,
        no_hp: body.no_hp,
        merk_hp: body.merk_hp,
        tipe_hp: body.tipe_hp,
        keluhan: body.keluhan,
        estimasi_biaya: body.estimasi_biaya,
        modal_sparepart: body.modal_sparepart,
        status: body.status || 'Antrean',
        garansi: body.garansi || 'Tidak Ada',
        foto_hp: body.foto_hp,
      })
      .select()
      .single()

    if (error) throw error

    return Response.json({ success: true, servis: data })
  } catch (error) {
    console.error('Create servis error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return Response.json({ error: 'ID diperlukan' }, { status: 400 })
    }

    // Only include valid columns for servis table
    const validData = {}
    const validColumns = ['nama_pelanggan', 'no_hp', 'merk_hp', 'tipe_hp', 'keluhan', 'estimasi_biaya', 'modal_sparepart', 'status', 'garansi', 'foto_hp', 'deleted_at']
    for (const key of validColumns) {
      if (key in updateData) {
        validData[key] = updateData[key]
      }
    }

    const { data, error } = await supabaseAdmin
      .from('servis')
      .update(validData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return Response.json({ success: true, servis: data })
  } catch (error) {
    console.error('Update servis error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return Response.json({ error: 'ID diperlukan' }, { status: 400 })
    }

    // Soft delete
    const { error } = await supabaseAdmin
      .from('servis')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error

    return Response.json({ success: true })
  } catch (error) {
    console.error('Delete servis error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}