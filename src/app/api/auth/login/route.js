import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request) {
  try {
    const { username, password } = await request.json()

    const { data: admin, error } = await supabaseAdmin
      .from('admin')
      .select('*')
      .eq('username', username)
      .single()

    if (error || !admin) {
      return Response.json({ error: 'Username atau password salah' }, { status: 401 })
    }

    const isValid = await bcrypt.compare(password, admin.password)
    if (!isValid) {
      return Response.json({ error: 'Username atau password salah' }, { status: 401 })
    }

    const token = jwt.sign(
      { userId: admin.id, username: admin.username, role: admin.role },
      process.env.JWT_SECRET || 'amservice-secret-key-2024',
      { expiresIn: '7d' }
    )

    return Response.json({
      success: true,
      user: { id: admin.id, username: admin.username, role: admin.role },
      token,
    })
  } catch (error) {
    console.error('Login error:', error)
    return Response.json({ error: 'Terjadi kesalahan: ' + error.message }, { status: 500 })
  }
}