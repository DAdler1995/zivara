import { useState } from 'react'
import { syncSteps } from '../api/activity'
import Button from './Button'
import Input from './Input'

interface LogStepsModalProps {
  onClose: () => void
  onSuccess: () => void
  existingStepCount: number | null
}

export default function LogStepsModal({ onClose, onSuccess, existingStepCount }: LogStepsModalProps) {
  const [stepCount, setStepCount] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [resultXp, setResultXp] = useState<{ xp: number; skill: string } | null>(null)

  const isUpdate = existingStepCount !== null
  const label = isUpdate ? 'Update Steps' : 'Log Steps'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const value = parseInt(stepCount, 10)
    if (isNaN(value) || value < 0 || stepCount.includes('.')) {
      setError('Please enter a valid step count.')
      return
    }

    setError('')
    setLoading(true)

    try {
      const response = await syncSteps(value)
      setResult(response.message)
      setResultXp({ xp: response.xpAwarded, skill: response.skillTrained })
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
      className="fixed inset-0 bg-black/75 flex items-center justify-center z-200 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-90 bg-(--color-surface) border border-(--color-border) rounded-sm flex flex-col max-h-[calc(100vh-4rem)]"
      >
        {/* Header — always visible */}
        <div className="shrink-0 px-5 py-4 border-b border-(--color-border) flex justify-between items-center">
          <h2 className="text-base">{label}</h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center min-w-11 min-h-11 bg-transparent border-none text-(--color-text-muted) cursor-pointer text-[1.2rem] leading-none"
          >
            ×
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto p-5">
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
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <Input
                label="Steps walked today"
                type="number"
                min="0"
                step="1"
                value={stepCount}
                onChange={(e) => setStepCount(e.target.value)}
                error={error}
                autoFocus
                placeholder={existingStepCount !== null ? String(existingStepCount) : ''}
              />
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={loading}
                  disabled={!stepCount}
                  className="flex-1"
                >
                  {label}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
