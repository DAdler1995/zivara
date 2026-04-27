import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../api/auth'
import { useAuth } from '../context/useAuth'
import Input from '../components/Input'
import Button from '../components/Button'
import { usePageTitle } from '../context/usePageTitle'

export default function RegisterPage() {
  usePageTitle('Register')
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
    <div className="min-h-screen flex items-center justify-center bg-(--color-bg) p-8">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(ellipse at 50% 0%, #1a1408 0%, transparent 70%)' }}
      />

      <div className="w-full max-w-105 relative">
        <div className="text-center mb-12">
          <h1 className="text-5xl tracking-[0.15em] mb-2">Zivara</h1>
          <p className="text-(--color-text-muted) italic text-base">Every journey begins with a single step.</p>
        </div>

        <div className="bg-(--color-surface) border border-(--color-border) rounded-sm p-8">
          <div
            className="h-0.5 -mt-8 -mx-8 mb-7"
            style={{ background: 'linear-gradient(90deg, transparent, var(--color-gold), transparent)' }}
          />

          <h2 className="text-base mb-6 text-(--color-text-muted) font-normal tracking-widest text-center">
            Create Account
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
              <p className="text-(--color-red-bright) text-[0.9rem] text-center">{errors.general}</p>
            )}

            <Button type="submit" loading={loading} className="mt-2">
              Create Account
            </Button>
          </form>
        </div>

        <p className="text-center mt-6 text-(--color-text-muted) text-[0.95rem]">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-(--color-gold-dim) no-underline transition-colors duration-150 hover:text-(--color-gold)"
          >
            Enter the realm
          </Link>
        </p>
      </div>
    </div>
  )
}
