import type { Metadata } from 'next'
import './globals.css'
import { AppStateProvider } from '@/lib/state-context'

export const metadata: Metadata = {
  title: 'BuiltWith Analyzer',
  description: 'Comprehensive website analysis tool with traffic analytics and technology stack insights',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <AppStateProvider>
          {children}
        </AppStateProvider>
      </body>
    </html>
  )
}
