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
      className="fixed inset-0 bg-black/75 flex items-center justify-center z-200 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-90 bg-(--color-surface) border border-(--color-border) rounded-sm flex flex-col max-h-[calc(100vh-4rem)]"
      >
        {/* Header — always visible */}
        <div className="shrink-0 px-5 py-4 border-b border-(--color-border) flex justify-between items-center">
          <h2 className="text-base">Log Weight</h2>
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
            <p className="text-(--color-gold) italic text-center py-4">{result}</p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
