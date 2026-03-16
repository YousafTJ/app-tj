'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      if (res.ok) {
        router.push('/')
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error ?? 'Login fejlede')
      }
    } catch {
      setError('Noget gik galt. Prøv igen.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Inter", sans-serif',
    }}>
      <div className="uv-card-1" style={{ width: '100%', maxWidth: 400 }}>
        <div className="uv-card-1-inner" style={{ padding: '48px 40px' }}>
          {/* Logo / title */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 52,
              height: 52,
              background: 'linear-gradient(144deg, #AF40FF, #5B42F3 50%, #00DDEB)',
              borderRadius: 12,
              marginBottom: 16,
            }}>
              <span style={{ color: '#f4f1ee', fontSize: 22 }}>◈</span>
            </div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.3px' }}>
              TJHUB
            </h1>
            <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--text-2)' }}>
              Log ind for at fortsætte
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-2)', marginBottom: 6 }}>
                Brugernavn
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
                required
                className="uv-input"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-2)', marginBottom: 6 }}>
                Adgangskode
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="uv-input"
              />
            </div>

            {error && (
              <div style={{
                background: 'var(--red-light)',
                border: '1px solid var(--red-light)',
                borderRadius: 8,
                padding: '10px 12px',
                fontSize: 13,
                color: 'var(--red)',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="uv-btn"
              style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
            >
              <span className="uv-btn-text"><span>{loading ? 'Logger ind…' : 'Log ind'}</span></span>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
