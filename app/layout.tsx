import type { Metadata } from 'next'
import './globals.css'
import NavigationHeader from './components/navigation-header'

export const metadata: Metadata = {
  title: 'Website Analyzer',
  description: 'Comprehensive website analysis tool with SimilarWeb, BuiltWith, Google Trends, and AI Chat',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <NavigationHeader />
        {children}
      </body>
    </html>
  )
}
