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
        password: { label: "Password", type: "password" },
        slug: { label: "Slug", type: "text" }
      },
      async authorize(credentials) {
        console.log("--- AUTH DEBUG START ---")
        console.log("Email attempting login:", credentials?.email)
        console.log("Slug provided:", credentials?.slug)
        
        if (!credentials?.email || !credentials?.password) {
          console.log("Auth Error: Missing email or password")
          return null
        }

        let user;
        const email = credentials.email as string;
        const slug = credentials.slug as string;

        if (slug) {
          console.log("Type: Branded Login (Slug:", slug, ")")
          const salon = await prisma.salon.findUnique({ where: { slug } })
          if (!salon) {
            console.log("Auth Error: Salon not found for slug:", slug)
            return null
          }

          user = await prisma.user.findFirst({
            where: { 
              email,
              salon_id: salon.id
            },
            include: { salon: true }
          })
        } else {
          console.log("Type: Global/Admin Login")
          user = await prisma.user.findFirst({
            where: { 
              email,
              salon_id: null
            },
            include: { salon: true }
          })
        }

        if (!user) {
          console.log("Auth Error: User not found in DB for email:", email)
          return null
        }
        
        if (!user.password) {
          console.log("Auth Error: User has no password set")
          return null
        }

        console.log("User found ID:", user.id, "Role:", user.role)

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        console.log("Password Valid?", isValid)

        if (!isValid) return null

        console.log("Auth Success!")
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          salon_id: user.salon_id,
          salon_slug: user.salon?.slug || null
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
