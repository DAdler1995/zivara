import { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from 'react-native'
import { logWorkout } from '../api/activity'
import { colors } from '../theme'

interface Props {
  onClose: () => void
  onSuccess: () => void
}

const DURATION_OPTIONS = [
  { minutes: 15, label: '15 min', xp: '+200 XP' },
  { minutes: 30, label: '30 min', xp: '+450 XP' },
  { minutes: 45, label: '45 min', xp: '+700 XP' },
  { minutes: 60, label: '60+ min', xp: '+1000 XP' },
]

export default function LogWorkoutModal({ onClose, onSuccess }: Props) {
  const [duration, setDuration] = useState<number | null>(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  async function handleSubmit() {
    if (!duration) return
    setLoading(true)
    try {
      const response = await logWorkout(duration, notes || undefined)
      setResult(response.message)
      setTimeout(onSuccess, 1200)
    } catch {
      setResult('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Log Workout</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>×</Text>
          </TouchableOpacity>
        </View>

        {result ? (
          <View style={styles.resultContainer}>
            <Text style={styles.resultText}>{result}</Text>
          </View>
        ) : (
          <View style={styles.modalBody}>
            <Text style={styles.fieldLabel}>Duration</Text>
            <View style={styles.durationGrid}>
              {DURATION_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.minutes}
                  onPress={() => setDuration(opt.minutes)}
                  style={[
                    styles.durationButton,
                    duration === opt.minutes && styles.durationButtonSelected,
                  ]}
                >
                  <Text style={[
                    styles.durationLabel,
                    duration === opt.minutes && styles.durationLabelSelected,
                  ]}>
                    {opt.label}
                  </Text>
                  <Text style={styles.durationXp}>{opt.xp}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Notes (optional)</Text>
            <TextInput
              style={styles.textInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="What did you do?"
              placeholderTextColor={colors.textFaint}
              multiline
              numberOfLines={2}
            />

            <TouchableOpacity
              style={[styles.submitButton, (!duration || loading) && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={!duration || loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.bg} />
              ) : (
                <Text style={styles.submitButtonText}>Log Workout</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    color: colors.gold,
    fontSize: 16,
    letterSpacing: 1,
  },
  closeButton: {
    color: colors.textMuted,
    fontSize: 24,
    lineHeight: 24,
  },
  modalBody: {
    padding: 16,
    gap: 12,
  },
  fieldLabel: {
    color: colors.textFaint,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 4,
  },
  durationGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  durationButton: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.borderBright,
    borderRadius: 2,
    alignItems: 'center',
    gap: 2,
  },
  durationButtonSelected: {
    borderColor: colors.gold,
    backgroundColor: 'rgba(201,168,76,0.1)',
  },
  durationLabel: {
    color: colors.textMuted,
    fontSize: 12,
    letterSpacing: 0.5,
  },
  durationLabelSelected: {
    color: colors.gold,
  },
  durationXp: {
    color: colors.textFaint,
    fontSize: 10,
  },
  textInput: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.borderBright,
    borderRadius: 2,
    color: colors.text,
    padding: 10,
    fontSize: 15,
    marginBottom: 8,
  },
  submitButton: {
    backgroundColor: colors.gold,
    borderRadius: 2,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: colors.bg,
    fontSize: 12,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  resultContainer: {
    padding: 32,
    alignItems: 'center',
  },
  resultText: {
    color: colors.gold,
    fontStyle: 'italic',
    fontSize: 15,
    textAlign: 'center',
  },
})