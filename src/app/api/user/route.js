import { createClient } from '@supabase/supabase-js'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const search = searchParams.get('search') || ''
    const offset = (page - 1) * limit

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    let query = supabase
      .from('admin')
      .select('id, username, role, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (search) {
      query = query.ilike('username', `%${search}%`)
    }

    const { data: users, error, count } = await query
      .range(offset, offset + limit - 1)

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ users, total: count || 0 })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { username, password, role } = await request.json()

    if (!username || !password) {
      return Response.json({ error: 'Username dan password wajib diisi' }, { status: 400 })
    }

    const bcrypt = require('bcryptjs')
    const hashedPassword = bcrypt.hashSync(password, 10)

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Check if username exists
    const { data: existing } = await supabase
      .from('admin')
      .select('id')
      .eq('username', username)
      .single()

    if (existing) {
      return Response.json({ error: 'Username sudah digunakan' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('admin')
      .insert({ username, password: hashedPassword, role: role || 'teknisi' })
      .select()
      .single()

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ success: true, user: { id: data.id, username: data.username, role: data.role } })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}