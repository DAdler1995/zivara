import { useState } from 'react'
import { logWeight } from '../api/activity'
import Button from './Button'
import Input from './Input'

interface LogWeightModalProps {
  onClose: () => void
  onSuccess: () => void
}

export default function LogWeightModal({ onClose, onSuccess }: LogWeightModalProps) {
  const [weight, setWeight] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const value = parseFloat(weight)
    if (isNaN(value) || value <= 0) {
      setError('Please enter a valid weight.')
      return
    }

    setError('')
    setLoading(true)

    try {
      const response = await logWeight({ weightLbs: value })
      setResult(response.message)
      setTimeout(onSuccess, 1200)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 200, padding: '1rem',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '4px',
          width: '100%',
          maxWidth: '360px',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h2 style={{ fontSize: '1rem', color: 'var(--color-gold)' }}>Log Weight</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none',
              color: 'var(--color-text-muted)', cursor: 'pointer',
              fontSize: '1.2rem', lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: '1.25rem' }}>
          {result ? (
            <p style={{
              color: 'var(--color-gold)',
              fontStyle: 'italic',
              textAlign: 'center',
              padding: '1rem',
            }}>
              {result}
            </p>
          ) : (
            <form
              onSubmit={handleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
            >
              <Input
                label="Weight (lbs)"
                type="number"
                step="0.1"
                min="0"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                error={error}
                autoFocus
                placeholder="e.g. 210.5"
              />
              <Button type="submit" loading={loading} disabled={!weight}>
                Log Weight
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}