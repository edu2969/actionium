import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/Nav'
import { getServerSession } from 'next-auth'
import { authOptions } from './api/auth/[...nextauth]/route'
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Ocustocus',
  description: 'by Eduardo Troncoso',
}

export default async function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions);
  return (    
    <html lang="en">      
      <body className={inter.className}>      
        {children}
        <Nav user={session?.user}></Nav>      
      </body>
    </html>
  )
}
