import { createClient } from '@supabase/supabase-js'

const FONTE_API = 'https://api.fonnte.com/api/send'

export async function POST(request) {
  try {
    const { targets, message, schedule } = await request.json()

    if (!targets || !Array.isArray(targets) || targets.length === 0) {
      return Response.json({ error: 'Target kosong' }, { status: 400 })
    }

    if (!message || message.trim() === '') {
      return Response.json({ error: 'Pesan kosong' }, { status: 400 })
    }

    const token = process.env.FONTE_TOKEN
    if (!token) {
      return Response.json({ error: 'Fonnte token tidak dikonfigurasi' }, { status: 500 })
    }

    // Normalize phone numbers
    const normalizedTargets = targets.map(hp => {
      hp = hp.replace(/[\s-]/g, '')
      if (hp.startsWith('0')) hp = '62' + hp.substring(1)
      if (!hp.endsWith('@c.us')) hp = hp + '@c.us'
      return hp
    }).filter(hp => hp.length > 10)

    const results = {
      success: 0,
      failed: 0,
      total: normalizedTargets.length,
      details: []
    }

    // Send to each target
    for (const target of normalizedTargets) {
      try {
        const cleanTarget = target.replace('@c.us', '')
        const payload = new URLSearchParams({
          target,
          message: message.trim(),
          schedule: schedule || '0'
        })

        const res = await fetch(FONTE_API, {
          method: 'POST',
          headers: {
            'Authorization': token
          },
          body: payload
        })

        const data = await res.json()

        if (data.status === true || data.status === 'success') {
          results.success++
          results.details.push({ target: cleanTarget, status: 'sent' })
        } else {
          results.failed++
          results.details.push({ target: cleanTarget, status: 'failed', error: data.message || 'Unknown error' })
        }
      } catch (err) {
        results.failed++
        results.details.push({ target: target.replace('@c.us', ''), status: 'error', error: err.message })
      }

      // Rate limit: 1 second between sends
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    return Response.json(results)
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const table = searchParams.get('table') || 'pelanggan'

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    let query = supabase.from(table).select('no_hp')

    if (table === 'servis') {
      query = query.select('no_hp, nama_pelanggan')
    } else if (table === 'pelanggan') {
      query = query.select('no_hp, nama_pelanggan')
    }

    const { data, error } = await query

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    // Filter valid phone numbers
    const targets = data
      .filter(d => d.no_hp && d.no_hp.length >= 10)
      .map(d => ({
        no_hp: d.no_hp.replace(/[\s-]/g, ''),
        nama: d.nama_pelanggan || 'Unknown'
      }))

    return Response.json({
      success: true,
      count: targets.length,
      targets
    })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}