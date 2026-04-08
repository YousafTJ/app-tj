import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const COOKIE_NAME = 'intellihub_auth'

async function computeToken(username: string, password: string): Promise<string> {
  const data = new TextEncoder().encode(`${username}:${password}:intellihub-2024`)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow login page and auth API through
  if (pathname.startsWith('/login') || pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  const authCookie = request.cookies.get(COOKIE_NAME)
  if (!authCookie?.value) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const expectedToken = await computeToken(
    process.env.APP_USERNAME ?? '',
    process.env.APP_PASSWORD ?? ''
  )

  if (authCookie.value !== expectedToken) {
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete(COOKIE_NAME)
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
