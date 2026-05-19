import { createClient } from '@supabase/supabase-js'

export async function GET(request, { params }) {
  try {
    const { id } = params

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data: user, error } = await supabase
      .from('admin')
      .select('id, username, role, created_at')
      .eq('id', id)
      .single()

    if (error || !user) {
      return Response.json({ error: 'User tidak ditemukan' }, { status: 404 })
    }

    return Response.json({ user })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}