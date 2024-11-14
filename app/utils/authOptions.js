import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/user";
import bcrypt from "bcryptjs";

export const authOptions = {
    providers: [
      CredentialsProvider({
        name: "credentials",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" }
        },
        async authorize(credentials) {
          const { email, password } = credentials;
  
          try {
            await connectMongoDB();
            const user = await User.findOne({ email });
  
            if (!user) {
              throw new Error("No user found with the given email");
            }
  
            const isValid = await bcrypt.compare(password, user.password);
  
            if (!isValid) {
              throw new Error("Invalid password");
            }
  
            return user;
          } catch (error) {
            throw new Error(error.message);
          }
        }
      })
    ],
    session: {
      strategy: "jwt"
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
      signIn: "/auth/signin"
    },
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.id = user.id;
        }
        return token;
      },
      async session({ session, token }) {
        session.user.id = token.id;
        return session;
      }
    }
  };
  
  export default NextAuth(authOptions);