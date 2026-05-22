// Currency formatting
export function formatRupiah(angka) {
  if (angka === undefined || angka === null) return 'Rp 0'
  if (typeof angka !== 'string' && typeof angka !== 'number') return 'Rp 0'
  if (typeof angka === 'string' && angka.trim() === '') return 'Rp 0'
  const num = typeof angka === 'string' ? parseInt(angka.replace(/\D/g, '')) : Number(angka)
  if (isNaN(num)) return 'Rp 0'
  return 'Rp ' + num.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

// Parse rupiah string to number
export function parseRupiah(str) {
  if (!str) return 0
  return parseInt(str.replace(/[^0-9]/g, '')) || 0
}

// Escape HTML
export function escapeHtml(str) {
  if (!str) return ''
  return str.replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[m]))
}

// Format phone number for WhatsApp
export function formatNoWA(no) {
  if (!no) return ''
  const clean = no.replace(/[^0-9]/g, '')
  if (clean.startsWith('0')) {
    return '62' + clean.slice(1)
  }
  return clean
}

// Get WhatsApp URL
export function getWAUrl(phone, message = '') {
  const waNumber = formatNoWA(phone)
  const encodedMsg = encodeURIComponent(message)
  return `https://wa.me/${waNumber}?text=${encodedMsg}`
}

// Format date to Indonesian locale
export function formatDate(date, options = {}) {
  if (!date) return '-'
  const d = new Date(date)
  const defaultOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }
  return d.toLocaleDateString('id-ID', { ...defaultOptions, ...options })
}

// Get status badge class
export function getStatusBadgeClass(status) {
  const map = {
    'Antrean': 'bg-blue-100 text-blue-700',
    'Proses': 'bg-amber-100 text-amber-700',
    'Siap Diambil': 'bg-cyan-100 text-cyan-700',
    'Sudah Diambil': 'bg-emerald-100 text-emerald-700',
    'Tidak Bisa': 'bg-red-100 text-red-700',
  }
  return map[status] || 'bg-gray-100 text-gray-700'
}

// Get status icon
export function getStatusIcon(status) {
  const map = {
    'Antrean': 'bi-person-plus-fill',
    'Proses': 'bi-tools',
    'Siap Diambil': 'bi-bag-check-fill',
    'Sudah Diambil': 'bi-check-circle-fill',
    'Tidak Bisa': 'bi-x-circle-fill',
  }
  return map[status] || 'bi-question-circle'
}

// Get status color
export function getStatusColor(status) {
  const map = {
    'Antrean': '#3b82f6',
    'Proses': '#f59e0b',
    'Siap Diambil': '#06b6d4',
    'Sudah Diambil': '#10b981',
    'Tidak Bisa': '#ef4444',
  }
  return map[status] || '#6b7280'
}

// Truncate text
export function truncate(str, length = 30) {
  if (!str) return ''
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

// Get month name
export function getMonthName(monthIndex) {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]
  return months[monthIndex] || ''
}

// Generate months array for charts
export function getLast6Months() {
  const months = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({
      label: getMonthName(d.getMonth()),
      value: d.toISOString().slice(0, 7), // YYYY-MM
    })
  }
  return months
}