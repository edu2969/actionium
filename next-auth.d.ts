import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
    role?: number;
  }

  interface Session extends DefaultSession {
    user: {
      id: string;
      name: string;
      email: string;
      createdAt: Date;
      role?: number;
    } & DefaultSession['user'];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
    role?: number;
  }
}
