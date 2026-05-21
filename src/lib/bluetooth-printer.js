// Bluetooth Thermal Printer Utilities
// Supports ESC/POS commands for 58mm Bluetooth printers

const ESC = 0x1B
const GS = 0x1D

export const PrinterCommands = {
  // Initialize printer
  INIT: [ESC, 0x40],

  // Text formatting
  ALIGN_LEFT: [ESC, 0x61, 0x00],
  ALIGN_CENTER: [ESC, 0x61, 0x01],
  ALIGN_RIGHT: [ESC, 0x61, 0x02],

  // Font size
  FONT_NORMAL: [ESC, 0x4D, 0x00],
  FONT_SMALL: [ESC, 0x4D, 0x01],
  FONT_BOLD_ON: [ESC, 0x45, 0x01],
  FONT_BOLD_OFF: [ESC, 0x45, 0x00],

  // Line spacing
  LINE_SPACING_DEFAULT: [ESC, 0x32],
  LINE_SPACING_SET: (n) => [ESC, 0x33, n],

  // Paper
  CUT: [GS, 0x56, 0x00],
  CUT_PARTIAL: [GS, 0x56, 0x01],

  // Feed
  FEED_LINES: (n) => [ESC, 0x64, n],
  FEED_DOTS: (n) => [ESC, 0x4A, n],
}

export class ThermalPrinter {
  constructor() {
    this.device = null
    this.writer = null
    this.encoder = new TextEncoder()
  }

  async connect() {
    try {
      this.device = await navigator.bluetooth.requestDevice({
        filters: [
          { namePrefix: 'MTP' },
          { namePrefix: 'Printer' },
          { namePrefix: 'POS' },
          { namePrefix: '58' },
          { namePrefix: 'Thermal' },
        ],
        optionalServices: ['0000ff00-0000-1000-8000-00805f9b34fb']
      })

      const server = await this.device.gatt.connect()
      const service = await server.getPrimaryService('0000ff00-0000-1000-8000-00805f9b34fb')
      const characteristic = await service.getCharacteristic('0000ff02-0000-1000-8000-00805f9b34fb')

      this.writer = characteristic
      return true
    } catch (error) {
      console.error('Bluetooth connection failed:', error)
      throw error
    }
  }

  async disconnect() {
    if (this.device?.gatt?.connected) {
      this.device.gatt.disconnect()
    }
    this.device = null
    this.writer = null
  }

  async send(data) {
    if (!this.writer) {
      throw new Error('Printer not connected')
    }
    const bytes = new Uint8Array(data)
    await this.writer.writeValue(bytes)
  }

  async sendText(text) {
    const bytes = this.encoder.encode(text)
    const buffer = new Uint8Array(bytes.length + 1)
    buffer.set(bytes)
    buffer[bytes.length] = 0x0A // Line feed
    await this.send(Array.from(buffer))
  }

  async printReceipt(data) {
    const cmd = PrinterCommands
    const width = 32 // 58mm paper = ~32 chars at 12pt

    // Helper to center text
    const center = (text) => {
      const t = String(text)
      if (t.length >= width) return t.substring(0, width)
      const spaces = Math.floor((width - t.length) / 2)
      return ' '.repeat(spaces) + t
    }

    // Helper to pad text
    const pad = (text, len) => String(text).padEnd(len).substring(0, len)

    try {
      // Initialize
      await this.send(cmd.INIT)

      // Logo (if exists)
      if (data.logoBase64) {
        await this.printImage(data.logoBase64)
      }

      // Store name (bold, centered)
      await this.send(cmd.FONT_BOLD_ON)
      await this.send(cmd.ALIGN_CENTER)
      await this.sendText(center(data.storeName || 'AM SERVICE'))
      await this.send(cmd.FONT_BOLD_OFF)

      // Address & WA
      await this.send(cmd.FONT_SMALL)
      await this.send(cmd.ALIGN_CENTER)
      if (data.address) {
        for (const line of data.address.split('\n')) {
          await this.sendText(line)
        }
      }
      if (data.whatsapp) {
        await this.sendText('WA: ' + data.whatsapp)
      }

      // Separator
      await this.send(cmd.ALIGN_LEFT)
      await this.sendText('='.repeat(width))
      await this.send(cmd.FONT_BOLD_ON)
      await this.sendText(center(data.title || 'TANDA TERIMA SERVIS'))
      await this.send(cmd.FONT_BOLD_OFF)
      await this.sendText('='.repeat(width))

      // Data
      await this.sendText('')
      await this.sendText('No: ' + data.noServis + ' | ' + data.date)
      await this.sendText('Nama: ' + data.customer + ' (' + data.phone + ')')
      await this.sendText('Unit: ' + data.unit)
      if (data.problem) {
        await this.sendText('Keluhan: ' + data.problem)
      }

      // Separator
      await this.sendText('='.repeat(width))

      // Total
      await this.send(cmd.ALIGN_CENTER)
      await this.send(cmd.FONT_BOLD_ON)
      await this.sendText('ESTIMASI: Rp ' + data.total)
      await this.send(cmd.FONT_BOLD_OFF)
      await this.send(cmd.ALIGN_LEFT)

      // Terms (if any)
      if (data.terms && data.terms.length > 0) {
        await this.sendText('-'.repeat(width))
        await this.sendText('| ' + pad(data.terms[0], width - 2) + ' |')
        if (data.terms[1]) {
          await this.sendText('| ' + pad(data.terms[1], width - 2) + ' |')
        }
        await this.sendText("'".repeat(width))
      }

      // Separator
      await this.sendText('='.repeat(width))

      // QR Code
      await this.send(cmd.ALIGN_CENTER)
      await this.sendText('Cek Status Servis:')
      await this.printQR(data.qrUrl)

      // Feed and cut
      await this.send(cmd.FEED_LINES(4))
      await this.send(cmd.CUT_PARTIAL)

    } catch (error) {
      console.error('Print failed:', error)
      throw error
    }
  }

  async printImage(base64Data) {
    // Convert base64 to raw pixels and send as bitmap
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = base64Data

    return new Promise((resolve) => {
      img.onload = async () => {
        try {
          const canvas = document.createElement('canvas')
          canvas.width = 120
          canvas.height = Math.round((img.height / img.width) * 120)
          const ctx = canvas.getContext('2d')
          ctx.fillStyle = '#FFF'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

          // Convert to ESC/POS bitmap
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const width = canvas.width
          const height = canvas.height

          // Print bitmap command
          await this.send([ESC, 0x33, 24]) // Set line spacing
          await this.send([GS, 0x76, 0x30, 0x00]) // Print raster bit image

          // Width low, width high, height low, height high
          await this.send([width % 256, Math.floor(width / 256), height % 256, Math.floor(height / 256)])

          // Send image data (monochrome)
          const bytesPerLine = Math.ceil(width / 8)
          const data = imageData.data

          for (let y = 0; y < height; y++) {
            const row = []
            for (let x = 0; x < bytesPerLine; x++) {
              let byte = 0
              for (let bit = 0; bit < 8; bit++) {
                const px = x * 8 + bit
                if (px < width) {
                  const idx = (y * width + px) * 4
                  const gray = (data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114)
                  if (gray < 128) {
                    byte |= (0x80 >> bit)
                  }
                }
              }
              row.push(byte)
            }
            await this.send(row)
          }

          await this.send([ESC, 0x32]) // Reset line spacing
          resolve()
        } catch (e) {
          console.warn('Image print failed:', e)
          resolve()
        }
      }
      img.onerror = () => resolve()
    })
  }

  async printQR(url) {
    // Generate QR code as data URL
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=80x80&margin=0&data=${encodeURIComponent(url)}`
    await this.printImage(qrUrl)
  }

  async printLabel(data) {
    const cmd = PrinterCommands
    const width = 32

    try {
      // Initialize
      await this.send(cmd.INIT)

      // Label box
      await this.send(cmd.ALIGN_CENTER)
      await this.send(cmd.FONT_BOLD_ON)
      await this.sendText(data.customerName || '')
      await this.send(cmd.FONT_BOLD_OFF)

      // Unit block (inverted - black background)
      await this.send(cmd.FONT_BOLD_ON)
      await this.sendText(data.unit || '')
      await this.send(cmd.FONT_BOLD_OFF)

      // Phone
      await this.send(cmd.FONT_BOLD_ON)
      await this.sendText(data.phone || '-')
      await this.send(cmd.FONT_BOLD_OFF)

      // Feed and cut
      await this.send(cmd.FEED_LINES(3))
      await this.send(cmd.CUT_PARTIAL)

    } catch (error) {
      console.error('Label print failed:', error)
      throw error
    }
  }
}

// Singleton instance
let printerInstance = null

export function getPrinter() {
  if (!printerInstance) {
    printerInstance = new ThermalPrinter()
  }
  return printerInstance
}

export async function checkBluetoothSupport() {
  return 'bluetooth' in navigator
}

export async function checkBluetoothEnabled() {
  try {
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ namePrefix: 'Test' }],
      optionalServices: ['0000ff00-0000-1000-8000-00805f9b34fb']
    })
    device.gatt?.connect()?.disconnect()
    return true
  } catch {
    return true // User canceled means Bluetooth is available
  }
}