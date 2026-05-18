import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Server-side client with service role (bypass RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Statistics calculation
export async function getDashboardStats() {
  const today = new Date().toISOString().split('T')[0]
  const bulanIni = today.substring(0, 7)

  // Get counts
  const { count: antrean } = await supabaseAdmin
    .from('servis')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'Antrean')
    .eq('deleted_at', null)

  const { count: proses } = await supabaseAdmin
    .from('servis')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'Proses')
    .eq('deleted_at', null)

  const { count: siap } = await supabaseAdmin
    .from('servis')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'Siap Diambil')
    .eq('deleted_at', null)

  const { count: selesai } = await supabaseAdmin
    .from('servis')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'Sudah Diambil')
    .eq('deleted_at', null)

  // Calculate omzet today
  const { data: servisToday } = await supabaseAdmin
    .from('servis')
    .select('estimasi_biaya')
    .eq('status', 'Sudah Diambil')
    .eq('tanggal', today)
    .not('deleted_at', 'neq', null)

  const omzetHari = servisToday?.reduce((sum, s) => {
    const biaya = parseInt((s.estimasi_biaya || '0').replace(/\D/g, ''))
    return sum + biaya
  }, 0) || 0

  return {
    antrean: antrean || 0,
    proses: proses || 0,
    siap: siap || 0,
    selesai: selesai || 0,
    omzet_hari: omzetHari,
    omzet_bulan: omzetHari, // Simplified for now
  }
}

// Get servis with filters
export async function getServisList(options = {}) {
  const { page = 1, limit = 12, search = '', status = '', trash = false } = options
  const offset = (page - 1) * limit

  let query = supabaseAdmin
    .from('servis')
    .select('*', { count: 'exact' })
    .order('id', { ascending: false })

  if (!trash) {
    query = query.is('deleted_at', null)
  } else {
    query = query.is('deleted_at', 'notnull')
  }

  if (search) {
    query = query.or(`no_servis.ilike.%${search}%,nama_pelanggan.ilike.%${search}%,merk_hp.ilike.%${search}%`)
  }

  if (status && !trash) {
    query = query.eq('status', status)
  }

  const { data, count } = await query.range(offset, offset + limit - 1)

  return { servis: data || [], total: count || 0, page, totalPages: Math.ceil((count || 0) / limit) }
}

// Get single servis
export async function getServisById(id) {
  const { data, error } = await supabaseAdmin
    .from('servis')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

// Create servis
export async function createServis(data) {
  // Generate no_servis
  const bulanIni = new Date().format('yyMM')
  const prefix = `AM-${bulanIni}-`

  const { data: lastServis } = await supabaseAdmin
    .from('servis')
    .select('no_servis')
    .like('no_servis', `${prefix}%`)
    .order('id', { ascending: false })
    .limit(1)

  let urutan = 1
  if (lastServis && lastServis.length > 0) {
    const lastNo = lastServis[0].no_servis
    const num = parseInt(lastNo.replace(prefix, ''))
    urutan = num + 1
  }

  const noServis = `${prefix}${String(urutan).padStart(3, '0')}`

  const { data: result, error } = await supabaseAdmin
    .from('servis')
    .insert({ ...data, no_servis: noServis, tanggal: new Date().toISOString().split('T')[0] })
    .select()
    .single()

  if (error) throw error
  return result
}

// Update servis
export async function updateServis(id, data) {
  const { data: result, error } = await supabaseAdmin
    .from('servis')
    .update(data)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return result
}

// Soft delete servis
export async function deleteServis(id) {
  const { error } = await supabaseAdmin
    .from('servis')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
  return true
}

// Permanent delete servis
export async function permanentDeleteServis(id) {
  const { error } = await supabaseAdmin
    .from('servis')
    .delete()
    .eq('id', id)
  if (error) throw error
  return true
}

// Restore servis
export async function restoreServis(id) {
  const { error } = await supabaseAdmin
    .from('servis')
    .update({ deleted_at: null })
    .eq('id', id)
  if (error) throw error
  return true
}