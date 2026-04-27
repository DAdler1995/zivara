import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { checkNameAvailability, updateCharacterName } from '../api/character'
import { useAuth } from '../context/useAuth'
import Input from '../components/Input'
import Button from '../components/Button'
import { usePageTitle } from '../context/usePageTitle'

export default function CreateCharacterPage() {
  usePageTitle('Begin Your Journey')
  const [name, setName] = useState('')
  const [available, setAvailable] = useState<boolean | null>(null)
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { refreshCharacter } = useAuth()
  const navigate = useNavigate()

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
    <div className="min-h-screen flex items-center justify-center bg-(--color-bg) p-8">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(ellipse at 50% 0%, #1a1408 0%, transparent 70%)' }}
      />

      <div className="w-full max-w-120 relative">
        <div className="text-center mb-10">
          <h1 className="text-4xl tracking-[0.15em] mb-6">Enter Zivara</h1>
          <div className="bg-(--color-surface) border border-(--color-border) border-l-[3px] border-l-(--color-gold-dim) px-6 py-5 text-left rounded-xs">
            <p className="text-(--color-text-muted) italic leading-[1.7] text-base">
              The world does not know your name yet. It will remember whatever you give it.
              Choose carefully. This is who you are in Zivara.
            </p>
          </div>
        </div>

        <div className="bg-(--color-surface) border border-(--color-border) rounded-sm p-8">
          <div
            className="h-0.5 -mt-8 -mx-8 mb-7"
            style={{ background: 'linear-gradient(90deg, transparent, var(--color-gold), transparent)' }}
          />

          <h2 className="text-base mb-6 text-(--color-text-muted) font-normal tracking-widest text-center">
            Choose Your Name
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
              <div className="flex justify-between mt-[0.4rem]">
                {nameStatus ? (
                  <span className="text-[0.85rem]" style={{ color: nameStatus.color }}>
                    {nameStatus.text}
                  </span>
                ) : (
                  <span />
                )}
                <span className="text-(--color-text-faint) text-[0.85rem]">
                  {name.length}/20
                </span>
              </div>
            </div>

            {error && (
              <p className="text-(--color-red-bright) text-[0.9rem] text-center">{error}</p>
            )}

            <Button
              type="submit"
              loading={loading}
              disabled={!available || name.length < 2}
              className="mt-2"
            >
              Enter the World
            </Button>
          </form>
        </div>

        <p className="text-center mt-5 text-(--color-text-faint) text-[0.85rem] italic">
          Names can be changed once every 30 days.
        </p>
      </div>
    </div>
  )
}
