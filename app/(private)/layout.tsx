import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
import '../globals.css'
import Nav from '@/app/components/Nav'
import AuthProvider from '../providers/AuthProvider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { QueryProvider } from '../providers/QueryProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'A C T I O N I U M',
  description: 'by EDUARDO TRONCOSO',
}

export default async function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  const queryClient = new QueryClient();
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className={inter.className}>
        <QueryProvider>
          <AuthProvider>
            {children}
            <Nav />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
