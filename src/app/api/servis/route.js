import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 0

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

    // Generate month prefix: YYMM format (e.g., "2605" for May 2026)
    const d = new Date()
    const tahun = String(d.getFullYear()).slice(2, 4)  // "26"
    const bulan = String(d.getMonth() + 1).padStart(2, '0')  // "05"
    const bulanIni = tahun + bulan  // "2605"
    const prefix = `AM-${bulanIni}-`

    // Find existing numbers with single dash format
    const { data: lastServis, error: lastError } = await supabaseAdmin
      .from('servis')
      .select('no_servis')
      .like('no_servis', `${prefix}%`)
      .order('id', { ascending: false })
      .limit(10)

    if (lastError) {
      console.error('Error fetching last servis:', lastError)
    }

    let urutan = 1
    if (lastServis && lastServis.length > 0) {
      // Extract number from no_servis - handle both old double dash and new single dash formats
      for (const item of lastServis) {
        // Match pattern: AM-YYMM-X or AM-YYMM--X (old format)
        const match = item.no_servis.match(/AM-\d{4}--?(\d+)/)
        if (match) {
          urutan = parseInt(match[1]) + 1
          break
        }
      }
    }

    const noServis = `${prefix}${String(urutan).padStart(3, '0')}`
    console.log('Creating servis:', { noServis, body })

    // Build insert data - only include fields that exist
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

    // Only add foto_hp if it has a value
    if (body.foto_hp) {
      insertData.foto_hp = body.foto_hp
    }

    console.log('Insert data:', insertData)

    const { data, error } = await supabaseAdmin
      .from('servis')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Insert error:', error)
      throw error
    }

    console.log('Insert success:', data)

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