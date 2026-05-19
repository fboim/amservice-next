import { createClient } from '@supabase/supabase-js'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const table = searchParams.get('table') || 'all'
    const format = searchParams.get('format') || 'json'

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const tables = table === 'all'
      ? ['servis', 'sparepart', 'pelanggan', 'admin', 'pengaturan']
      : [table]

    const result = {}

    for (const t of tables) {
      const { data, error } = await supabase
        .from(t)
        .select('*')
        .order('id', { ascending: true })

      if (error) {
        result[t] = { error: error.message }
      } else {
        result[t] = data
      }
    }

    if (format === 'csv') {
      // Return summary for CSV download (servis only for now)
      const servis = result.servis
      if (Array.isArray(servis)) {
        const headers = ['no_servis', 'tanggal', 'nama_pelanggan', 'no_hp', 'merk_hp', 'tipe_hp', 'keluhan', 'status', 'estimasi_biaya']
        const csvRows = [headers.join(',')]

        for (const s of servis) {
          const row = headers.map(h => {
            const val = s[h] || ''
            return `"${String(val).replace(/"/g, '""')}"`
          })
          csvRows.push(row.join(','))
        }

        const csv = csvRows.join('\n')
        return new Response(csv, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="backup_servis_${new Date().toISOString().split('T')[0]}.csv`
          }
        })
      }
    }

    return Response.json({
      success: true,
      timestamp: new Date().toISOString(),
      tables: Object.keys(result),
      data: result
    })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { action, table, data } = body

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    if (action === 'restore') {
      // Restore data from backup
      if (!table || !data || !Array.isArray(data)) {
        return Response.json({ error: 'Table dan data diperlukan' }, { status: 400 })
      }

      let restored = 0
      let errors = 0

      for (const item of data) {
        const { id, ...fields } = item

        if (id) {
          // Update existing
          const { error } = await supabase
            .from(table)
            .update({ ...fields, updated_at: new Date().toISOString() })
            .eq('id', id)

          if (error) errors++
          else restored++
        } else {
          // Insert new
          const { error } = await supabase
            .from(table)
            .insert(fields)

          if (error) errors++
          else restored++
        }
      }

      return Response.json({
        success: true,
        restored,
        errors,
        message: `Restored ${restored} items`
      })
    }

    return Response.json({ error: 'Action tidak valid' }, { status: 400 })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}