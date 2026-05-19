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
      .from('servis')
      .select('*', { count: 'exact' })
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false })

    if (search) {
      query = query.or(`no_servis.ilike.%${search}%,nama_pelanggan.ilike.%${search}%,merk_hp.ilike.%${search}%`)
    }

    const { data: trash, count, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({
      trash: trash || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const permanent = searchParams.get('permanent') === 'true'

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    if (permanent) {
      // Permanent delete (hapus dari trash)
      const { error } = await supabase
        .from('servis')
        .delete()
        .eq('id', id)

      if (error) throw error
    } else {
      // Soft delete (pindahkan ke trash)
      const { error } = await supabase
        .from('servis')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
    }

    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const body = await request.json()
    const { id, action } = body

    if (!id) {
      return Response.json({ error: 'ID diperlukan' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    if (action === 'restore') {
      // Restore from trash
      const { error } = await supabase
        .from('servis')
        .update({ deleted_at: null })
        .eq('id', id)

      if (error) throw error
      return Response.json({ success: true, message: 'Servis berhasil direstore' })
    }

    if (action === 'permanent_delete') {
      // Permanent delete
      const { error } = await supabase
        .from('servis')
        .delete()
        .eq('id', id)

      if (error) throw error
      return Response.json({ success: true, message: 'Servis dihapus permanen' })
    }

    return Response.json({ error: 'Action tidak valid' }, { status: 400 })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}