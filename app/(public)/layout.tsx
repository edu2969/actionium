import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
import '../globals.css'
import Nav from '@/app/components/Nav'
import { Providers } from '@/app/components/Providers'

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
  return (    
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className={inter.className}> 
        <Providers>
          {children}
          <Nav />
        </Providers>
      </body>
    </html>
  )
}
