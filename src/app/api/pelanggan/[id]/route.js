import { createClient } from '@supabase/supabase-js'

export async function GET(request, { params }) {
  try {
    const { id } = params

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data: pelanggan, error } = await supabase
      .from('pelanggan')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !pelanggan) {
      return Response.json({ error: 'Pelanggan tidak ditemukan' }, { status: 404 })
    }

    return Response.json({ pelanggan })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params
    const { nama_pelanggan, no_hp, alamat, email, catatan } = await request.json()

    if (!nama_pelanggan || !no_hp) {
      return Response.json({ error: 'Nama dan No. HP wajib diisi' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Check if no_hp already used by other customer
    const { data: existing } = await supabase
      .from('pelanggan')
      .select('id')
      .eq('no_hp', no_hp)
      .neq('id', id)
      .single()

    if (existing) {
      return Response.json({ error: 'No. HP sudah terdaftar' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('pelanggan')
      .update({ nama_pelanggan, no_hp, alamat, email, catatan, updated_at: new Date().toISOString() })
      .eq('id', id)
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

export async function DELETE(request, { params }) {
  try {
    const { id } = params

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { error } = await supabase
      .from('pelanggan')
      .delete()
      .eq('id', id)

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}