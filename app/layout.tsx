import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/Nav'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/utils/authOptions';
import { NextAuthOptions } from 'next-auth';
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
  const session = await getServerSession(authOptions as NextAuthOptions);
  return (    
    <html lang="en">
      <head/>
      <body className={inter.className}>      
        {children}
        <Nav user={session?.user}></Nav>      
      </body>
    </html>
  )
}
