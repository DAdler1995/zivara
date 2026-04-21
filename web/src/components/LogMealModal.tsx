import { useState } from 'react'
import { logMeal } from '../api/activity'
import { MealRating, MealCategory, HungerOrHabit } from '@zivara/shared'
import Button from './Button'

interface LogMealModalProps {
  onClose: () => void
  onSuccess: () => void
}

export default function LogMealModal({ onClose, onSuccess }: LogMealModalProps) {
  const [rating, setRating] = useState<MealRating | null>(null)
  const [category, setCategory] = useState<MealCategory | null>(null)
  const [notes, setNotes] = useState('')
  const [hungerOrHabit, setHungerOrHabit] = useState<HungerOrHabit>(HungerOrHabit.ActuallyHungry)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  async function handleSubmit() {
    if (!rating) return
    setLoading(true)
    try {
      const response = await logMeal({
        rating,
        category: category ?? undefined,
        foodNotes: notes || undefined,
        hungerOrHabit,
      })
      setResult(response.message)
      setTimeout(onSuccess, 1200)
    } catch {
      setResult('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const ratingOptions = [
    { value: MealRating.Healthy, label: 'Healthy', xp: '+100 XP', color: 'var(--color-green-bright)' },
    { value: MealRating.Neutral, label: 'Neutral', xp: '+50 XP', color: 'var(--color-gold-dim)' },
    { value: MealRating.Unhealthy, label: 'Unhealthy', xp: '+25 XP', color: 'var(--color-text-muted)' },
  ]

  const categories = Object.values(MealCategory)

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
          maxWidth: '480px',
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
          <h2 style={{ fontSize: '1rem', color: 'var(--color-gold)' }}>Log Meal</h2>
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
              {/* Rating -- required */}
              <div>
                <Label text="How was it?" />
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {ratingOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setRating(opt.value)}
                      style={{
                        flex: 1,
                        padding: '0.65rem 0.5rem',
                        border: `1px solid ${rating === opt.value ? opt.color : 'var(--color-border-bright)'}`,
                        borderRadius: '2px',
                        background: rating === opt.value ? 'rgba(255,255,255,0.05)' : 'transparent',
                        color: rating === opt.value ? opt.color : 'var(--color-text-muted)',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-display)',
                        fontSize: '0.65rem',
                        letterSpacing: '0.08em',
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

              {/* Category -- optional */}
              <div>
                <Label text="Category (optional)" />
                <div style={{
                  display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem',
                }}>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(category === cat ? null : cat)}
                      style={{
                        padding: '0.3rem 0.65rem',
                        border: `1px solid ${category === cat ? 'var(--color-gold)' : 'var(--color-border)'}`,
                        borderRadius: '2px',
                        background: category === cat ? 'rgba(201,168,76,0.1)' : 'transparent',
                        color: category === cat ? 'var(--color-gold)' : 'var(--color-text-muted)',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        transition: 'all 0.15s',
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes -- optional */}
              <div>
                <Label text="Notes (optional)" />
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What did you eat?"
                  maxLength={500}
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

              {/* Hunger or habit -- optional */}
              <div>
                <Label text="Hunger or habit?" />
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {[
                    { value: HungerOrHabit.ActuallyHungry, label: 'Actually hungry' },
                    { value: HungerOrHabit.ProbablyBored, label: 'Probably bored' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setHungerOrHabit(opt.value)}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        border: `1px solid ${hungerOrHabit === opt.value ? 'var(--color-gold)' : 'var(--color-border-bright)'}`,
                        borderRadius: '2px',
                        background: hungerOrHabit === opt.value ? 'rgba(201,168,76,0.1)' : 'transparent',
                        color: hungerOrHabit === opt.value ? 'var(--color-gold)' : 'var(--color-text-muted)',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontFamily: 'var(--font-body)',
                        transition: 'all 0.15s',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                loading={loading}
                disabled={!rating}
              >
                Log Meal
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function Label({ text }: { text: string }) {
  return (
    <span style={{
      fontFamily: 'var(--font-display)',
      fontSize: '0.7rem',
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: 'var(--color-text-faint)',
    }}>
      {text}
    </span>
  )
}