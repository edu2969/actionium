import { Genos } from 'next/font/google'
import type { Metadata } from 'next'
import '../globals.css'
import Nav from '@/app/components/Nav'
import { Providers } from '@/app/components/Providers'

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
  return (    
    <html lang="en">
      <body className={genos.className}> 
        <Providers>
          {children}
          <Nav />
        </Providers>
      </body>
    </html>
  )
}
