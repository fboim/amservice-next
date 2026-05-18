import './globals.css'

export const metadata = {
  title: 'AM Service - Repair Center',
  description: 'Sistem manajemen servis smartphone',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}