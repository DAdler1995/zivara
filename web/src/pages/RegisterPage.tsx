import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../api/auth'
import { useAuth } from '../context/useAuth'
import Input from '../components/Input'
import Button from '../components/Button'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const { login: authLogin } = useAuth()
  const navigate = useNavigate()

  function validate() {
    const newErrors: Record<string, string> = {}
    if (username.length < 3) newErrors.username = 'Username must be at least 3 characters.'
    if (username.length > 20) newErrors.username = 'Username must be 20 characters or fewer.'
    if (password.length < 8) newErrors.password = 'Password must be at least 8 characters.'
    if (password !== confirm) newErrors.confirm = 'Passwords do not match.'
    return newErrors
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setLoading(true)

    try {
      const response = await register({ username, password })
      await authLogin(response.accessToken, response.refreshToken)
      navigate('/create-character')
    } catch {
      setErrors({ general: 'Username is already taken.' })
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
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: `radial-gradient(ellipse at 50% 0%, #1a1408 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative' }}>
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
            Every journey begins with a single step.
          </p>
        </div>

        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '4px',
            padding: '2rem',
          }}
        >
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
            Create Account
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <Input
              label="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              error={errors.username}
              autoComplete="username"
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              autoComplete="new-password"
              required
            />
            <Input
              label="Confirm Password"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              error={errors.confirm}
              autoComplete="new-password"
              required
            />

            {errors.general && (
              <p style={{ color: 'var(--color-red-bright)', fontSize: '0.9rem', textAlign: 'center' }}>
                {errors.general}
              </p>
            )}

            <Button type="submit" loading={loading} style={{ marginTop: '0.5rem' }}>
              Create Account
            </Button>
          </form>
        </div>

        <p
          style={{
            textAlign: 'center',
            marginTop: '1.5rem',
            color: 'var(--color-text-muted)',
            fontSize: '0.95rem',
          }}
        >
          Already have an account?{' '}
          <Link
            to="/login"
            style={{ color: 'var(--color-gold-dim)', textDecoration: 'none' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-gold)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-gold-dim)')}
          >
            Enter the realm
          </Link>
        </p>
      </div>
    </div>
  )
}