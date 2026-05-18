import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: admin, error } = await supabase
      .from('admin')
      .select('id, username, password')
      .eq('username', 'admin')
      .single()

    return Response.json({
      env: {
        url: supabaseUrl ? 'SET' : 'MISSING',
        key: supabaseServiceKey ? 'SET' : 'MISSING',
        urlValue: supabaseUrl?.substring(0, 30) + '...'
      },
      admin: admin ? { id: admin.id, username: admin.username } : null,
      error: error?.message || null,
      hashPrefix: admin?.password?.substring(0, 10),
      bcryptTest: admin ? bcrypt.compareSync('admin123', admin.password) : null
    })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}