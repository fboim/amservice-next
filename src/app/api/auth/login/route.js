import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(request) {
  try {
    const { username, password } = await request.json()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data: admin, error } = await supabase
      .from('admin')
      .select('*')
      .eq('username', username)
      .single()

    if (error || !admin) {
      return Response.json({ error: 'Username atau password salah' }, { status: 401 })
    }

    // Debug: log hash prefix
    console.log('Hash in DB:', admin.password?.substring(0, 10))
    console.log('Password received:', password)

    const isValid = bcrypt.compareSync(password, admin.password)
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