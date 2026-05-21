---
name: bluetooth-printing-revisions
description: Bluetooth thermal printer integration for nota pages
metadata:
  type: project
---

# Bluetooth Thermal Printer Integration - Session Log

## Context
User is building a service center management system (amservice-next) with Next.js. They want to print receipts via Bluetooth thermal printer using a custom wrapper app that exposes `window.MesinKasir` API (not Web Bluetooth API).

## Key Files Modified
- `src/app/nota/[id]/page.js` - Nota Lunas/Pengambilan
- `src/app/nota/[id]/penerimaan/page.js` - Nota Penerimaan
- `src/app/nota/[id]/garansi/page.js` - Nota Garansi
- `src/app/nota/[id]/label/page.js` - Label Servis

## Important Changes Made

### 1. Bluetooth Print Implementation
- Uses `window.MesinKasir` plugin API (not Web Bluetooth)
- Methods: `cetakTeks()`, `formatTebal()`, `cetakLogo()`, `cetakQR()`
- Simple direct calls, no queue system (caused WebView freeze)

### 2. URL Updates
- QR codes now point to `https://amservice.web.id/?no=XXX` (main page)
- Previously pointed to `/cek_servis.php?no=XXX`

### 3. Logo Loading
- Tries `/logo_am.png` first (exists in public/)
- Falls back to `/logo.png` if not found

### 4. Garansi Box Format (match PHP)
```
.------------------------------.
|         MASA GARANSI         |
| 1.Garansi berlaku mulai      |
| Pengembalian                 |
'------------------------------'
```
- Header is static text, not center() function
- Word wrap breaks at last space before 28 chars

### 5. Word Wrap Algorithm
```javascript
let remaining = line
while (remaining.length > 0) {
  if (remaining.length <= 28) {
    const padded = remaining.padEnd(28, ' ')
    btSend('teks', '| ' + padded + ' |\n')
    break
  }
  // Find last space before or at position 28
  let cut = 28
  for (let j = 27; j >= 0; j--) {
    if (remaining[j] === ' ') {
      cut = j
      break
    }
  }
  const text = remaining.substring(0, cut).padEnd(28, ' ')
  btSend('teks', '| ' + text + ' |\n')
  remaining = remaining.substring(cut).trim()
}
```

### 6. Window.print() Disabled
- All `window.print()` calls disabled (causes WebView freeze on Android)
- Only BT button works for printing via MesinKasir plugin
- Print buttons show alert: "Gunakan tombol BT untuk mencetak via Bluetooth"

### 7. Auto-print Disabled
- Auto-print on page load disabled (causes freeze)
- Ctrl+P shortcut disabled

## Current State (2026-05-21)
- Build successful
- All nota pages use same BT print logic
- QR links updated to main page URL
- Logo fallback logic in place

## Known Issues
- Printer freeze when clicking BT button - likely issue with MesinKasir plugin, not code
- WebView freeze - all window.print() disabled as workaround