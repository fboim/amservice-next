import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('testimonials')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, text, rating = 5 } = body

    if (!name || !text) {
      return NextResponse.json({ error: 'Name and text are required' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('testimonials')
      .insert({ name, text, rating, is_active: true })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}