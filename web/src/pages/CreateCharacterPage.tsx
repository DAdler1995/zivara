import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { checkNameAvailability, updateCharacterName } from '../api/character'
import { useAuth } from '../context/useAuth'
import Input from '../components/Input'
import Button from '../components/Button'

export default function CreateCharacterPage() {
  const [name, setName] = useState('')
  const [available, setAvailable] = useState<boolean | null>(null)
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { refreshCharacter } = useAuth()
  const navigate = useNavigate()

// Check name availability as the player types
useEffect(() => {
  const timeout = setTimeout(async () => {
    if (name.length < 2) {
      setAvailable(null)
      setChecking(false)
      return
    }
    setChecking(true)
    try {
      const result = await checkNameAvailability(name)
      setAvailable(result)
    } catch {
      setAvailable(null)
    } finally {
      setChecking(false)
    }
  }, 400)

  return () => clearTimeout(timeout)
}, [name])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!available) return

    setError('')
    setLoading(true)

    try {
      await updateCharacterName(name)
      await refreshCharacter()
      navigate('/dashboard')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function getNameStatus() {
    if (name.length < 2) return null
    if (checking) return { color: 'var(--color-text-muted)', text: 'Checking...' }
    if (available === true) return { color: 'var(--color-green-bright)', text: 'Name available' }
    if (available === false) return { color: 'var(--color-red-bright)', text: 'Name already taken' }
    return null
  }

  const nameStatus = getNameStatus()

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

      <div style={{ width: '100%', maxWidth: '480px', position: 'relative' }}>
        {/* Lore header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1
            style={{
              fontSize: '2.25rem',
              letterSpacing: '0.15em',
              color: 'var(--color-gold)',
              marginBottom: '1.5rem',
            }}
          >
            Enter Zivara
          </h1>
          <div
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderLeft: '3px solid var(--color-gold-dim)',
              padding: '1.25rem 1.5rem',
              textAlign: 'left',
              borderRadius: '2px',
            }}
          >
            <p
              style={{
                color: 'var(--color-text-muted)',
                fontStyle: 'italic',
                lineHeight: 1.7,
                fontSize: '1rem',
              }}
            >
              The world does not know your name yet. It will remember whatever you give it.
              Choose carefully. This is who you are in Zivara.
            </p>
          </div>
        </div>

        {/* Name form */}
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
            Choose Your Name
          </h2>

          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
          >
            <div>
              <Input
                label="Character Name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={20}
                autoFocus
                required
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '0.4rem',
                }}
              >
                {nameStatus ? (
                  <span style={{ color: nameStatus.color, fontSize: '0.85rem' }}>
                    {nameStatus.text}
                  </span>
                ) : (
                  <span />
                )}
                <span
                  style={{
                    color: 'var(--color-text-faint)',
                    fontSize: '0.85rem',
                  }}
                >
                  {name.length}/20
                </span>
              </div>
            </div>

            {error && (
              <p
                style={{
                  color: 'var(--color-red-bright)',
                  fontSize: '0.9rem',
                  textAlign: 'center',
                }}
              >
                {error}
              </p>
            )}

            <Button
              type="submit"
              loading={loading}
              disabled={!available || name.length < 2}
              style={{ marginTop: '0.5rem' }}
            >
              Enter the World
            </Button>
          </form>
        </div>

        {/* Fine print */}
        <p
          style={{
            textAlign: 'center',
            marginTop: '1.25rem',
            color: 'var(--color-text-faint)',
            fontSize: '0.85rem',
            fontStyle: 'italic',
          }}
        >
          Names can be changed once every 30 days.
        </p>
      </div>
    </div>
  )
}