import { Genos } from 'next/font/google'
import type { Metadata } from 'next'
import '../globals.css'
import Nav from '@/app/components/Nav'
import AuthProvider from '../providers/AuthProvider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { QueryProvider } from '../providers/QueryProvider'

const genos = Genos({ subsets: ['latin'] })

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
    <html lang="es_CL">
      <body className={genos.className}>
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
