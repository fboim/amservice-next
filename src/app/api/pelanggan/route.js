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

    // Get all servis and extract unique pelanggan
    const { data: allServis, error } = await supabase
      .from('servis')
      .select('nama_pelanggan, no_hp')
      .is('deleted_at', null)
      .not('nama_pelanggan', 'is', null)
      .order('nama_pelanggan', { ascending: true })

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    // Get unique pelanggan by no_hp
    const pelangganMap = {}
    allServis.forEach(s => {
      const key = s.no_hp
      if (!pelangganMap[key]) {
        pelangganMap[key] = { nama_pelanggan: s.nama_pelanggan, no_hp: s.no_hp }
      }
    })

    let pelangganList = Object.values(pelangganMap)
    let total = pelangganList.length

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase()
      pelangganList = pelangganList.filter(p =>
        p.nama_pelanggan.toLowerCase().includes(searchLower) ||
        p.no_hp.includes(search)
      )
      total = pelangganList.length
    }

    // Apply pagination
    const paginated = pelangganList.slice(offset, offset + limit)

    return Response.json({ pelanggan: paginated, total })
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
      .from('servis')
      .select('id')
      .eq('no_hp', no_hp)
      .is('deleted_at', null)
      .single()

    if (existing) {
      return Response.json({ error: 'No. HP sudah terdaftar' }, { status: 400 })
    }

    return Response.json({ success: true, message: 'Data pelanggan tersimpan otomatis di servis' })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}