import { useState } from 'react'
import { logMeal } from '../api/activity'
import { MealRating, MealCategory, HungerOrHabit } from '@zivara/shared'
import Button from './Button'

interface LogMealModalProps {
  onClose: () => void
  onSuccess: () => void
}

const ratingOptions = [
  { value: MealRating.Healthy, label: 'Healthy', xp: '+100 XP', activeClass: 'border-(--color-green-bright) text-(--color-green-bright)' },
  { value: MealRating.Neutral, label: 'Neutral', xp: '+50 XP', activeClass: 'border-(--color-gold-dim) text-(--color-gold-dim)' },
  { value: MealRating.Unhealthy, label: 'Unhealthy', xp: '+25 XP', activeClass: 'border-(--color-text-muted) text-(--color-text-muted)' },
]

export default function LogMealModal({ onClose, onSuccess }: LogMealModalProps) {
  const [rating, setRating] = useState<MealRating | null>(null)
  const [category, setCategory] = useState<MealCategory | null>(null)
  const [notes, setNotes] = useState('')
  const [hungerOrHabit, setHungerOrHabit] = useState<HungerOrHabit>(HungerOrHabit.ActuallyHungry)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [resultXp, setResultXp] = useState<{ xp: number; skill: string } | null>(null)

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
      setResultXp({ xp: response.xpAwarded, skill: response.skillTrained })
      setTimeout(onSuccess, 1200)
    } catch {
      setResult('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const categories = Object.values(MealCategory)

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/75 flex items-center justify-center z-200 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-120 bg-(--color-surface) border border-(--color-border) rounded-sm flex flex-col max-h-[calc(100vh-4rem)]"
      >
        {/* Header — always visible */}
        <div className="shrink-0 px-5 py-4 border-b border-(--color-border) flex justify-between items-center">
          <h2 className="text-base">Log Meal</h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center min-w-11 min-h-11 bg-transparent border-none text-(--color-text-muted) cursor-pointer text-[1.2rem] leading-none"
          >
            ×
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto p-5 flex flex-col gap-5">
          {result ? (
            <div className="text-center py-4 flex flex-col gap-2">
              <p className="text-(--color-gold) italic">{result}</p>
              {resultXp && resultXp.xp > 0 && (
                <p className="font-display text-[0.85rem] tracking-widest text-(--color-gold-bright)">
                  +{resultXp.xp.toLocaleString()} {resultXp.skill} XP
                </p>
              )}
            </div>
          ) : (
            <>
              {/* Rating — required */}
              <div>
                <FieldLabel text="How was it?" />
                <div className="grid grid-cols-1 min-[380px]:grid-cols-3 gap-2 mt-2">
                  {ratingOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setRating(opt.value)}
                      className={`min-h-11 px-2 py-2 border rounded-xs cursor-pointer font-display text-[0.75rem] tracking-widest uppercase transition-all duration-150 flex flex-col items-center justify-center gap-1 ${
                        rating === opt.value
                          ? `${opt.activeClass} bg-white/5`
                          : 'border-(--color-border-bright) text-(--color-text-muted) bg-transparent'
                      }`}
                    >
                      <span>{opt.label}</span>
                      <span className="text-[0.65rem] opacity-70">{opt.xp}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Category — optional */}
              <div>
                <FieldLabel text="Category (optional)" />
                <div className="flex flex-wrap gap-[0.4rem] mt-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(category === cat ? null : cat)}
                      className={`min-h-9 px-3 py-1 border rounded-xs cursor-pointer text-[0.8rem] transition-all duration-150 ${
                        category === cat
                          ? 'border-(--color-gold) bg-[rgba(201,168,76,0.1)] text-(--color-gold)'
                          : 'border-(--color-border) text-(--color-text-muted) bg-transparent'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes — optional */}
              <div>
                <FieldLabel text="Notes (optional)" />
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What did you eat?"
                  maxLength={500}
                  rows={2}
                  className="w-full mt-2 bg-(--color-surface) border border-(--color-border-bright) rounded-xs text-(--color-text) px-3 py-[0.6rem] text-base font-body resize-y outline-none"
                />
              </div>

              {/* Hunger or habit — optional */}
              <div>
                <FieldLabel text="Hunger or habit?" />
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {[
                    { value: HungerOrHabit.ActuallyHungry, label: 'Actually hungry' },
                    { value: HungerOrHabit.ProbablyBored, label: 'Probably bored' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setHungerOrHabit(opt.value)}
                      className={`min-h-11 px-2 py-2 border rounded-xs cursor-pointer text-[0.85rem] font-body transition-all duration-150 ${
                        hungerOrHabit === opt.value
                          ? 'border-(--color-gold) bg-[rgba(201,168,76,0.1)] text-(--color-gold)'
                          : 'border-(--color-border-bright) text-(--color-text-muted) bg-transparent'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <Button onClick={handleSubmit} loading={loading} disabled={!rating}>
                Log Meal
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function FieldLabel({ text }: { text: string }) {
  return (
    <span className="font-display text-[0.75rem] tracking-widest uppercase text-(--color-text-faint)">
      {text}
    </span>
  )
}
