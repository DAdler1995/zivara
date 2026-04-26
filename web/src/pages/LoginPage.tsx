import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../api/auth'
import { useAuth } from '../context/useAuth'
import Input from '../components/Input'
import Button from '../components/Button'
import { usePageTitle } from '../context/usePageTitle'

export default function LoginPage() {
  usePageTitle('Login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login: authLogin } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await login({ username, password })
      await authLogin(response.accessToken, response.refreshToken)
      navigate('/dashboard')
    } catch {
      setError('Invalid username or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg)',
        padding: '2rem',
      }}
    >
      {/* Subtle background texture */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: `radial-gradient(ellipse at 50% 0%, #1a1408 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1
            style={{
              fontSize: '3rem',
              letterSpacing: '0.15em',
              color: 'var(--color-gold)',
              marginBottom: '0.5rem',
            }}
          >
            Zivara
          </h1>
          <p
            style={{
              color: 'var(--color-text-muted)',
              fontStyle: 'italic',
              fontSize: '1rem',
            }}
          >
            The road does not walk itself.
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '4px',
            padding: '2rem',
          }}
        >
          {/* Gold top accent */}
          <div
            style={{
              height: '2px',
              background: 'linear-gradient(90deg, transparent, var(--color-gold), transparent)',
              marginBottom: '1.75rem',
              marginTop: '-2rem',
              marginLeft: '-2rem',
              marginRight: '-2rem',
            }}
          />

          <h2
            style={{
              fontSize: '1rem',
              marginBottom: '1.5rem',
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-display)',
              fontWeight: 400,
              letterSpacing: '0.1em',
              textAlign: 'center',
            }}
          >
            Enter the Realm
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <Input
              label="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />

            {error && (
              <p style={{ color: 'var(--color-red-bright)', fontSize: '0.9rem', textAlign: 'center' }}>
                {error}
              </p>
            )}

            <Button type="submit" loading={loading} style={{ marginTop: '0.5rem' }}>
              Enter
            </Button>
          </form>
        </div>

        {/* Register link */}
        <p
          style={{
            textAlign: 'center',
            marginTop: '1.5rem',
            color: 'var(--color-text-muted)',
            fontSize: '0.95rem',
          }}
        >
          No account?{' '}
          <Link
            to="/register"
            style={{ color: 'var(--color-gold-dim)', textDecoration: 'none' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-gold)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-gold-dim)')}
          >
            Begin your journey
          </Link>
        </p>
      </div>
    </div>
  )
}