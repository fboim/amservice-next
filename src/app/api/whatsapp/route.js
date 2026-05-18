import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const body = await request.json()
    const { id, type = 'status', phone } = body

    // Get servis data
    const { data: servis, error: servisError } = await supabaseAdmin
      .from('servis')
      .select('*')
      .eq('id', id)
      .single()

    if (servisError || !servis) {
      return Response.json({ error: 'Servis tidak ditemukan' }, { status: 404 })
    }

    // Get phone number
    const phoneNumber = phone || servis.no_hp

    if (!phoneNumber) {
      return Response.json({ error: 'Nomor HP tidak tersedia' }, { status: 400 })
    }

    // Format phone number (Indonesian format)
    let formattedPhone = phoneNumber.replace(/\D/g, '')
    if (!formattedPhone.startsWith('62')) {
      formattedPhone = '62' + formattedPhone.replace(/^0/, '')
    }

    // Generate message based on type
    let message = ''
    const statusMessages = {
      'Antrean': 'Servis Anda telah diterima dan masuk dalam antrean.',
      'Proses': 'Servis HP Anda sedang dikerjakan oleh teknisi kami.',
      'Siap Diambil': 'Selamat! Servis HP Anda telah selesai dan siap diambil.',
      'Sudah Diambil': 'Terima kasih telah menggunakan jasa kami.',
      'Tidak Bisa': 'Mohon maaf, servisan tidak dapat dilanjutkan.'
    }

    if (type === 'status') {
      message = `Halo ${servis.nama_pelanggan}!

📱 *Status Servis HP*

No. Servis: ${servis.no_servis}
Unit: ${servis.merk_hp} ${servis.tipe_hp}
Status: *${servis.status}*

${statusMessages[servis.status] || ''}

💰 Estimasi Biaya: ${servis.estimasi_biaya}

Terima kasih atas kepercayaan Anda.
*AM Service*`
    } else if (type === 'ready') {
      message = `Halo ${servis.nama_pelanggan}!

✅ *Servis Selesai*

No. Servis: ${servis.no_servis}
Unit: ${servis.merk_hp} ${servis.tipe_hp}
Biaya: ${servis.estimasi_biaya}

Servis HP Anda telah selesai!
Silakan diambil di tempat kami.

Terima kasih 🙏
*AM Service*`
    } else if (type === 'custom') {
      message = body.message || 'Pesan dari AM Service'
    }

    // Send via WhatsApp provider (Fonnte, WaBlas, etc.)
    const whatsappApiKey = process.env.WHATSAPP_API_KEY
    const whatsappSender = process.env.WHATSAPP_SENDER

    if (whatsappApiKey && whatsappSender) {
      // Try Fonnte API
      try {
        const fonnteResponse = await fetch('https://api.fonnte.com/send', {
          method: 'POST',
          headers: {
            'Authorization': whatsappApiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            target: formattedPhone,
            message: message,
            scheduled: null
          })
        })

        const fonnteResult = await fonnteResponse.json()

        if (fonnteResult.status === true || fonnteResult.recipient_count > 0) {
          // Log notification
          await supabaseAdmin.from('notifikasi').insert({
            servis_id: id,
            type: type,
            phone: formattedPhone,
            message: message,
            status: 'sent',
            provider: 'fonnte'
          })

          return Response.json({ success: true, message: 'Notifikasi berhasil dikirim' })
        }
      } catch (apiError) {
        console.error('WhatsApp API error:', apiError)
      }
    }

    // If no API configured, return the message for manual sending
    // This is useful for development or when using WhatsApp Web manually
    return Response.json({
      success: true,
      message: message,
      phone: formattedPhone,
      note: 'WhatsApp API belum dikonfigurasi. Pesan ditampilkan untuk pengiriman manual.'
    })

  } catch (error) {
    console.error('WhatsApp notification error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const servisId = searchParams.get('servis_id')

  if (!servisId) {
    return Response.json({ error: 'servis_id diperlukan' }, { status: 400 })
  }

  try {
    const { data: notifikasi } = await supabaseAdmin
      .from('notifikasi')
      .select('*')
      .eq('servis_id', servisId)
      .order('created_at', { ascending: false })

    return Response.json({ notifikasi: notifikasi || [] })
  } catch (error) {
    console.error('Fetch notifikasi error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}