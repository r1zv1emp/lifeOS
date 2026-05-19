import type { Metadata, Viewport } from 'next'
import { Toaster } from 'react-hot-toast'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: {
    default: 'LifeOS — Your Life Operating System',
    template: '%s | LifeOS',
  },
  description: 'Premium habit tracking, fitness, sleep, journal, and productivity system. Build discipline. Level up your life.',
  keywords: ['habit tracker', 'productivity', 'discipline', 'fitness tracker', 'sleep tracker', 'journal', 'nofap', 'self improvement'],
  authors: [{ name: 'LifeOS' }],
  creator: 'LifeOS',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: 'LifeOS — Your Life Operating System',
    description: 'Premium habit tracking, fitness, sleep, journal, and productivity system.',
    siteName: 'LifeOS',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LifeOS — Your Life Operating System',
    description: 'Premium habit tracking, fitness, sleep, journal, and productivity system.',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'hsl(0 0% 10%)',
              color: 'hsl(0 0% 95%)',
              border: '1px solid hsl(0 0% 16%)',
              borderRadius: '10px',
              fontSize: '14px',
            },
            success: {
              iconTheme: {
                primary: '#3b82f6',
                secondary: 'white',
              },
            },
          }}
        />
      </body>
    </html>
  )
}
