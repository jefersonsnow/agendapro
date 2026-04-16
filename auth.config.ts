import type { NextAuthConfig } from "next-auth"

// Esse ficheiro só contém o que é compatível com o Edge (sem Prisma, sem Bcrypt)
export default {
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.salon_slug = (user as any).salon_slug
      }
      return token
    },
    async session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        (session.user as any).salon_slug = token.salon_slug as string
      }
      return session
    },
  },
} satisfies NextAuthConfig

