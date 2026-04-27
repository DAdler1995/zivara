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
    <div className="min-h-screen flex items-center justify-center bg-(--color-bg) p-8">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(ellipse at 50% 0%, #1a1408 0%, transparent 70%)' }}
      />

      <div className="w-full max-w-105 relative">
        <div className="text-center mb-12">
          <h1 className="text-5xl tracking-[0.15em] mb-2">Zivara</h1>
          <p className="text-(--color-text-muted) italic text-base">The road does not walk itself.</p>
        </div>

        <div className="bg-(--color-surface) border border-(--color-border) rounded-sm p-8">
          <div
            className="h-0.5 -mt-8 -mx-8 mb-7"
            style={{ background: 'linear-gradient(90deg, transparent, var(--color-gold), transparent)' }}
          />

          <h2 className="text-base mb-6 text-(--color-text-muted) font-normal tracking-widest text-center">
            Enter the Realm
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
              <p className="text-(--color-red-bright) text-[0.9rem] text-center">{error}</p>
            )}

            <Button type="submit" loading={loading} className="mt-2">
              Enter
            </Button>
          </form>
        </div>

        <p className="text-center mt-6 text-(--color-text-muted) text-[0.95rem]">
          No account?{' '}
          <Link
            to="/register"
            className="text-(--color-gold-dim) no-underline transition-colors duration-150 hover:text-(--color-gold)"
          >
            Begin your journey
          </Link>
        </p>
      </div>
    </div>
  )
}
