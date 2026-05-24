import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Initialize Supabase client
const supabaseAdmin = (() => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing Supabase environment variables')
    throw new Error('Missing Supabase environment variables')
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
})()

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
    // Parse request body
    let body
    try {
      body = await request.json()
    } catch (e) {
      return Response.json({ error: 'Invalid JSON in request body' }, { status: 400 })
    }

    // Check if body is valid
    if (!body || typeof body !== 'object') {
      return Response.json({ error: 'Invalid request body' }, { status: 400 })
    }

    // Simple no_servis generation: AM-YYMM-NNN
    const d = new Date()
    const tahun = String(d.getFullYear()).slice(2, 4)
    const bulan = String(d.getMonth() + 1).padStart(2, '0')
    const prefix = `AM-${tahun}${bulan}-`

    // Get count of existing records for this month to generate next number
    const { count, error: countError } = await supabaseAdmin
      .from('servis')
      .select('*', { count: 'exact', head: true })
      .like('no_servis', `${prefix}%`)

    if (countError) {
      console.error('Count error:', countError)
    }

    const nextNum = (count || 0) + 1
    const noServis = `${prefix}${String(nextNum).padStart(3, '0')}`

    // Build insert data
    const insertData = {
      no_servis: noServis,
      tanggal: body.tanggal || new Date().toISOString().split('T')[0],
      nama_pelanggan: body.nama_pelanggan || '',
      no_hp: body.no_hp || '',
      merk_hp: body.merk_hp || '',
      tipe_hp: body.tipe_hp || '',
      keluhan: body.keluhan || '',
      estimasi_biaya: body.estimasi_biaya ? parseInt(body.estimasi_biaya) : 0,
      modal_sparepart: body.modal_sparepart ? parseInt(body.modal_sparepart) : 0,
      status: body.status || 'Antrean',
      garansi: body.garansi || 'Tidak Ada',
    }

    // Insert data
    const { data, error } = await supabaseAdmin
      .from('servis')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Insert error:', error)
      return Response.json({
        error: 'Gagal menyimpan data',
        details: error.message,
        code: error.code
      }, { status: 500 })
    }

    return Response.json({ success: true, servis: data })
  } catch (error) {
    console.error('Create servis error:', error)
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      details: error?.details,
      hint: error?.hint
    })
    return Response.json({
      error: error?.message || 'Terjadi kesalahan',
      details: error
    }, { status: 500 })
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
    const validColumns = ['nama_pelanggan', 'no_hp', 'merk_hp', 'tipe_hp', 'keluhan', 'estimasi_biaya', 'modal_sparepart', 'status', 'garansi', 'foto_hp', 'deleted_at', 'tanggal']
    for (const key of validColumns) {
      if (key in updateData) {
        const val = updateData[key]
        // Handle integer fields - convert empty/null to 0
        if (key === 'estimasi_biaya' || key === 'modal_sparepart') {
          if (val === '' || val === null || val === undefined) {
            validData[key] = 0
          } else {
            const parsed = parseInt(val)
            validData[key] = isNaN(parsed) ? 0 : parsed
          }
        } else {
          validData[key] = val
        }
      }
    }

    // Always update tanggal if provided in the request
    if (updateData.tanggal !== undefined) {
      validData.tanggal = updateData.tanggal
    }

    console.log('Final validData:', JSON.stringify(validData))

    const { data, error } = await supabaseAdmin
      .from('servis')
      .update(validData)
      .eq('id', id)
      .select()
      .single()

    console.log('Update result:', { data, error })

    if (error) {
      console.error('Supabase update error:', error)
      return Response.json({ error: error.message, details: error }, { status: 500 })
    }

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