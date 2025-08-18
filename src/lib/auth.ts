import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "./db"
import bcrypt from "bcryptjs"
import { UserRole } from "@prisma/client"

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await db.user.findUnique({
          where: {
            email: credentials.email
          },
          include: {
            sellerProfile: true,
            walkerProfile: true,
            customerProfile: true
          }
        })

        if (!user || !user.isActive) {
          return null
        }

        // Verificar el password hasheado
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
        
        if (!isPasswordValid) {
          return null
        }
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          sellerProfile: user.sellerProfile,
          walkerProfile: user.walkerProfile,
          customerProfile: user.customerProfile
        }
      }
    })
  ],
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.sellerProfile = user.sellerProfile
        token.walkerProfile = user.walkerProfile
        token.customerProfile = user.customerProfile
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as UserRole
        session.user.sellerProfile = token.sellerProfile
        session.user.walkerProfile = token.walkerProfile
        session.user.customerProfile = token.customerProfile
      }
      return session
    }
  },
  pages: {
    signIn: "/auth/signin",
    signUp: "/auth/signup"
  }
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string
      role: UserRole
      sellerProfile?: any
      walkerProfile?: any
      customerProfile?: any
    }
  }

  interface User {
    id: string
    email: string
    name?: string
    role: UserRole
    sellerProfile?: any
    walkerProfile?: any
    customerProfile?: any
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole
    sellerProfile?: any
    walkerProfile?: any
    customerProfile?: any
  }
}