import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request) {
  try {
    const { username, password } = await request.json()

    // Query admin table for user
    const { data: admin, error } = await supabaseAdmin
      .from('admin')
      .select('*')
      .eq('username', username)
      .single()

    if (error || !admin) {
      return Response.json({ error: 'Username atau password salah' }, { status: 401 })
    }

    // Verify password
    const isValid = await bcrypt.compare(password, admin.password)
    if (!isValid) {
      return Response.json({ error: 'Username atau password salah' }, { status: 401 })
    }

    // Create session token (JWT)
    const token = jwt.sign(
      { userId: admin.id, username: admin.username, role: admin.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    return Response.json({
      success: true,
      user: { id: admin.id, username: admin.username, role: admin.role },
      token,
    })
  } catch (error) {
    console.error('Login error:', error)
    return Response.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}