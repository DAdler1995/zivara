import { useState } from 'react'
import { logWorkout } from '../api/activity'
import Button from './Button'

interface LogWorkoutModalProps {
  onClose: () => void
  onSuccess: () => void
}

const DURATION_OPTIONS = [
  { minutes: 15, label: '15 min', xp: '+200 XP' },
  { minutes: 30, label: '30 min', xp: '+450 XP' },
  { minutes: 45, label: '45 min', xp: '+700 XP' },
  { minutes: 60, label: '60+ min', xp: '+1000 XP' },
]

export default function LogWorkoutModal({ onClose, onSuccess }: LogWorkoutModalProps) {
  const [duration, setDuration] = useState<number | null>(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  async function handleSubmit() {
    if (!duration) return
    setLoading(true)
    try {
      const response = await logWorkout({ durationMinutes: duration, notes: notes || undefined })
      setResult(response.message)
      setTimeout(onSuccess, 1200)
    } catch {
      setResult('Something went wrong. Please try again.')
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
          maxWidth: '440px',
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
          <h2 style={{ fontSize: '1rem', color: 'var(--color-gold)' }}>Log Workout</h2>
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

        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {result ? (
            <p style={{ color: 'var(--color-gold)', fontStyle: 'italic', textAlign: 'center', padding: '1rem' }}>
              {result}
            </p>
          ) : (
            <>
              {/* Duration */}
              <div>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.7rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--color-text-faint)',
                }}>
                  Duration
                </span>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '0.5rem',
                  marginTop: '0.5rem',
                }}>
                  {DURATION_OPTIONS.map((opt) => (
                    <button
                      key={opt.minutes}
                      onClick={() => setDuration(opt.minutes)}
                      style={{
                        padding: '0.65rem 0.25rem',
                        border: `1px solid ${duration === opt.minutes ? 'var(--color-gold)' : 'var(--color-border-bright)'}`,
                        borderRadius: '2px',
                        background: duration === opt.minutes ? 'rgba(201,168,76,0.1)' : 'transparent',
                        color: duration === opt.minutes ? 'var(--color-gold)' : 'var(--color-text-muted)',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-display)',
                        fontSize: '0.65rem',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        transition: 'all 0.15s',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.2rem',
                      }}
                    >
                      <span>{opt.label}</span>
                      <span style={{ fontSize: '0.6rem', opacity: 0.7 }}>{opt.xp}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.7rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--color-text-faint)',
                }}>
                  Notes (optional)
                </span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What did you do?"
                  rows={2}
                  style={{
                    width: '100%',
                    marginTop: '0.5rem',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border-bright)',
                    borderRadius: '2px',
                    color: 'var(--color-text)',
                    padding: '0.6rem 0.75rem',
                    fontSize: '1rem',
                    fontFamily: 'var(--font-body)',
                    resize: 'vertical',
                    outline: 'none',
                  }}
                />
              </div>

              <Button
                onClick={handleSubmit}
                loading={loading}
                disabled={!duration}
              >
                Log Workout
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}