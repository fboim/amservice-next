import './globals.css'

export const metadata = {
  title: 'AM Service Kulon Progo | Repair Center HP & Gadget',
  description: 'Solusi cepat dan terpercaya untuk perbaikan smartphone, tablet, dan gadget. Servis berkualitas dengan garansi. Kulon Progo, Yogyakarta.',
  keywords: 'servis HP, repair HP, kulon progo, service gadget, am service, service smartphone',
  authors: [{ name: 'AM Service' }],
  openGraph: {
    title: 'AM Service Kulon Progo | Repair Center',
    description: 'Solusi cepat & terpercaya untuk perbaikan smartphone dan gadget Anda. Servis berkualitas dengan garansi.',
    url: 'https://amservice.id',
    siteName: 'AM Service',
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AM Service Kulon Progo | Repair Center',
    description: 'Solusi cepat & terpercaya untuk perbaikan smartphone dan gadget.',
  },
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: '#07070f',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'AM Service',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}