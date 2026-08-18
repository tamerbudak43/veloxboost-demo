import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import './globals.css'

const inter = localFont({
  src: [
    { path: '../public/assets/velox-document-regular.ttf', weight: '400', style: 'normal' },
    { path: '../public/assets/velox-document-bold.ttf', weight: '700', style: 'normal' },
  ],
  variable: '--font-sans',
  display: 'swap',
})

const jetbrainsMono = localFont({
  src: '../public/assets/velox-pdf-unicode-regular.ttf',
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'VELOX — Arbitrage Terminal',
  description: 'VELOX professional USDT arbitrage and investment operations terminal.',
  generator: 'v0.app',
  icons: {
    icon: '/velox-logo.png',
    apple: '/velox-logo.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#03070d',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" dir="ltr" className="dark bg-background">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
