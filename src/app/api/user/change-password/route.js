import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify token and get user
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !authUser) {
      return Response.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { passwordLama, passwordBaru } = body

    if (!passwordLama || !passwordBaru) {
      return Response.json({ error: 'Password lama dan baru wajib diisi' }, { status: 400 })
    }

    if (passwordBaru.length < 6) {
      return Response.json({ error: 'Password minimal 6 karakter' }, { status: 400 })
    }

    // Get user data from users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('password')
      .eq('email', authUser.email)
      .single()

    if (userError || !userData) {
      return Response.json({ error: 'User tidak ditemukan' }, { status: 404 })
    }

    // Verify old password
    if (userData.password !== passwordLama) {
      return Response.json({ error: 'Password lama salah' }, { status: 400 })
    }

    // Update password in users table
    const { error: updateError } = await supabase
      .from('users')
      .update({ password: passwordBaru })
      .eq('email', authUser.email)

    if (updateError) {
      console.error('Password update error:', updateError)
      return Response.json({ error: 'Gagal mengubah password' }, { status: 500 })
    }

    return Response.json({ success: true, message: 'Password berhasil diubah' })
  } catch (error) {
    console.error('Change password error:', error)
    return Response.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}