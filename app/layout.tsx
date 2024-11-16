import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/Nav'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/utils/authOptions';
import { NextAuthOptions } from 'next-auth';
import { orbitron } from '@/app/fonts';
import Head from 'next/head'
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
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap" rel="stylesheet" />
      </Head>
      <body className={`${inter.className} ${orbitron}`}>      
        {children}
        <Nav user={session?.user}></Nav>      
      </body>
    </html>
  )
}
