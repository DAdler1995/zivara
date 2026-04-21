import { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from 'react-native'
import { logWeight } from '../api/activity'
import { colors } from '../theme'

interface Props {
  onClose: () => void
  onSuccess: () => void
}

export default function LogWeightModal({ onClose, onSuccess }: Props) {
  const [weight, setWeight] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  async function handleSubmit() {
    const value = parseFloat(weight)
    if (isNaN(value) || value <= 0) {
      setError('Please enter a valid weight.')
      return
    }

    setError('')
    setLoading(true)

    try {
      const response = await logWeight(value)
      setResult(response.message)
      setTimeout(onSuccess, 1200)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Log Weight</Text>
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
            <Text style={styles.fieldLabel}>Weight (lbs)</Text>
            <TextInput
              style={styles.textInput}
              value={weight}
              onChangeText={setWeight}
              placeholder="e.g. 210.5"
              placeholderTextColor={colors.textFaint}
              keyboardType="decimal-pad"
              autoFocus
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.submitButton, (!weight || loading) && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={!weight || loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.bg} />
              ) : (
                <Text style={styles.submitButtonText}>Log Weight</Text>
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
  },
  textInput: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.borderBright,
    borderRadius: 2,
    color: colors.text,
    padding: 12,
    fontSize: 20,
    marginBottom: 8,
  },
  error: {
    color: colors.redBright,
    fontSize: 13,
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