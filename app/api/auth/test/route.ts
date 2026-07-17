// Test API route to verify NextAuth is working
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Auth API test route working',
    timestamp: new Date().toISOString(),
    url: request.url
  });
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Auth API POST test route working',
    timestamp: new Date().toISOString(),
    url: request.url
  });
}