import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Credentials from "next-auth/providers/credentials"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import authConfig from "./auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  trustHost: true,
  ...authConfig,
  providers: [
    Credentials({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        })

        if (!user || !user.password) return null

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isValid) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    }),
    Credentials({
      id: "impersonation",
      name: "Impersonation",
      credentials: {
        userId: { label: "User ID", type: "text" },
        secret: { label: "Secret", type: "password" }
      },
      async authorize(credentials) {
        const isAllowed = process.env.NODE_ENV === "development" || process.env.ALLOW_IMPERSONATION === "true"
        const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET

        if (!isAllowed || !secret || !credentials?.secret || credentials.secret !== secret) return null

        const user = await prisma.user.findUnique({
          where: { id: credentials.userId as string }
        })
        if (!user) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    })
  ]
})
