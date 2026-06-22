import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { validateEnv } from '@/lib/env-config'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { AnalyticsWrapper } from '@/components/AnalyticsWrapper'
import './globals.css'

// Validate environment variables on app startup
validateEnv()

// Force dynamic rendering to avoid Framer Motion SSR issues
export const dynamic = 'force-dynamic';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'ResumeScore - ATS Resume Analyzer',
  icons: {
    icon: [
      {
        url: '/logo.jpeg',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/logo.jpeg',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/logo.jpeg',
        type: 'image/jpeg',
      },
    ],
    apple: '/logo.jpeg',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0A0A0F' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased">
        <ErrorBoundary>
          {children}
          <AnalyticsWrapper />
        </ErrorBoundary>
      </body>
    </html>
  )
}
