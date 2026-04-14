import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next()
  }

  // Obter o token com log de depuração para o servidor (Coolify)
  const token = await getToken({ 
    req, 
    secret: process.env.AUTH_SECRET,
    // Em produção com HTTPS, o NextAuth prefixa o cookie com __Secure-
    secureCookie: process.env.NODE_ENV === "production"
  })
  
  const isAuth = !!token

  // Log de depuração (remover após validar)
  if (pathname.includes('/dashboard') || pathname.includes('/admin')) {
    console.log(`[Middleware] Path: ${pathname} | Auth: ${isAuth ? 'YES' : 'NO'}`);
  }

  // Extrair o locale do path (ex: /pt/admin -> 'pt')
  const segments = pathname.split('/')
  const locale = ['pt', 'en', 'es', 'fr', 'it', 'de'].includes(segments[1]) ? segments[1] : 'pt'

  // Rota protegida sem sessão → Login
  const isProtected = pathname.includes('/dashboard') || pathname.includes('/admin')
  const isAuthRoute = pathname.includes('/auth/')

  if (isProtected && !isAuthRoute && !isAuth) {
    return NextResponse.redirect(new URL(`/${locale}/auth/login`, req.url))
  }

  // Já logado e vai para login → Dashboard
  if (isAuthRoute && isAuth) {
    const role = (token?.role as string) === 'admin' ? 'admin' : 'dashboard'
    return NextResponse.redirect(new URL(`/${locale}/${role}`, req.url))
  }

  return intlMiddleware(req)
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
}
