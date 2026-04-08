import { NextResponse } from 'next/server'

const COOKIE_NAME = 'intellihub_auth'

async function computeToken(username: string, password: string): Promise<string> {
  const data = new TextEncoder().encode(`${username}:${password}:intellihub-2024`)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

// POST /api/auth — login
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const { username, password } = body as { username?: string; password?: string }

  const expectedUser = process.env.APP_USERNAME
  const expectedPass = process.env.APP_PASSWORD

  if (!username || !password || username !== expectedUser || password !== expectedPass) {
    return NextResponse.json(
      { error: 'Forkert brugernavn eller adgangskode' },
      { status: 401 }
    )
  }

  const token = await computeToken(username, password)

  const response = NextResponse.json({ success: true })
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60, // 1 hour
    path: '/',
  })
  return response
}

// DELETE /api/auth — logout
export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete(COOKIE_NAME)
  return response
}
