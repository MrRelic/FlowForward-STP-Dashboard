import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'STP Dashboard - Sewage Treatment Plant Management',
  description: 'Real-time monitoring and management system for sewage treatment plants with role-based access and transparency features.',
  keywords: 'sewage treatment, water management, environmental monitoring, dashboard',
  authors: [{ name: 'STP Dashboard Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  )
}