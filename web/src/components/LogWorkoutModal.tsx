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
  const [resultXp, setResultXp] = useState<{ xp: number; skill: string } | null>(null)

  async function handleSubmit() {
    if (!duration) return
    setLoading(true)
    try {
      const response = await logWorkout({ durationMinutes: duration, notes: notes || undefined })
      setResult(response.message)
      setResultXp({ xp: response.xpAwarded, skill: response.skillTrained })
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
      className="fixed inset-0 bg-black/75 flex items-center justify-center z-200 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-110 bg-(--color-surface) border border-(--color-border) rounded-sm flex flex-col max-h-[calc(100vh-4rem)]"
      >
        {/* Header — always visible */}
        <div className="shrink-0 px-5 py-4 border-b border-(--color-border) flex justify-between items-center">
          <h2 className="text-base">Log Workout</h2>
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
              {/* Duration */}
              <div>
                <span className="font-display text-[0.75rem] tracking-widest uppercase text-(--color-text-faint)">
                  Duration
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                  {DURATION_OPTIONS.map((opt) => (
                    <button
                      key={opt.minutes}
                      onClick={() => setDuration(opt.minutes)}
                      className={`min-h-11 px-2 py-2 border rounded-xs cursor-pointer font-display text-[0.75rem] tracking-wider uppercase transition-all duration-150 flex flex-col items-center justify-center gap-1 ${
                        duration === opt.minutes
                          ? 'border-(--color-gold) bg-[rgba(201,168,76,0.1)] text-(--color-gold)'
                          : 'border-(--color-border-bright) text-(--color-text-muted) bg-transparent'
                      }`}
                    >
                      <span>{opt.label}</span>
                      <span className="text-[0.65rem] opacity-70">{opt.xp}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <span className="font-display text-[0.75rem] tracking-widest uppercase text-(--color-text-faint)">
                  Notes (optional)
                </span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What did you do?"
                  rows={2}
                  className="w-full mt-2 bg-(--color-surface) border border-(--color-border-bright) rounded-xs text-(--color-text) px-3 py-[0.6rem] text-base font-body resize-y outline-none"
                />
              </div>

              <Button onClick={handleSubmit} loading={loading} disabled={!duration}>
                Log Workout
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
