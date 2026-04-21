import { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from 'react-native'
import { logMeal } from '../api/activity'
import { MealRating, MealCategory, HungerOrHabit } from '@zivara/shared'
import { colors } from '../theme'

interface Props {
  onClose: () => void
  onSuccess: () => void
}

export default function LogMealModal({ onClose, onSuccess }: Props) {
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
      const response = await logMeal(
        rating,
        category ?? undefined,
        notes || undefined,
        hungerOrHabit
      )
      setResult(response.message)
      setTimeout(onSuccess, 1200)
    } catch {
      setResult('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const ratingOptions = [
    { value: MealRating.Healthy, label: 'Healthy', xp: '+100 XP', color: colors.greenBright },
    { value: MealRating.Neutral, label: 'Neutral', xp: '+50 XP', color: colors.goldDim },
    { value: MealRating.Unhealthy, label: 'Unhealthy', xp: '+25 XP', color: colors.textMuted },
  ]

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Log Meal</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>×</Text>
          </TouchableOpacity>
        </View>

        {result ? (
          <View style={styles.resultContainer}>
            <Text style={styles.resultText}>{result}</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.modalBody}>
            {/* Rating */}
            <Text style={styles.fieldLabel}>How was it?</Text>
            <View style={styles.ratingRow}>
              {ratingOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => setRating(opt.value)}
                  style={[
                    styles.ratingButton,
                    rating === opt.value && { borderColor: opt.color },
                  ]}
                >
                  <Text style={[
                    styles.ratingLabel,
                    rating === opt.value && { color: opt.color },
                  ]}>
                    {opt.label}
                  </Text>
                  <Text style={styles.ratingXp}>{opt.xp}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Category */}
            <Text style={styles.fieldLabel}>Category (optional)</Text>
            <View style={styles.chipRow}>
              {Object.values(MealCategory).map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(category === cat ? null : cat)}
                  style={[
                    styles.chip,
                    category === cat && styles.chipSelected,
                  ]}
                >
                  <Text style={[
                    styles.chipText,
                    category === cat && styles.chipTextSelected,
                  ]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Notes */}
            <Text style={styles.fieldLabel}>Notes (optional)</Text>
            <TextInput
              style={styles.textInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="What did you eat?"
              placeholderTextColor={colors.textFaint}
              multiline
              numberOfLines={2}
              maxLength={500}
            />

            {/* Hunger or habit */}
            <Text style={styles.fieldLabel}>Hunger or habit?</Text>
            <View style={styles.ratingRow}>
              {[
                { value: HungerOrHabit.ActuallyHungry, label: 'Actually hungry' },
                { value: HungerOrHabit.ProbablyBored, label: 'Probably bored' },
              ].map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => setHungerOrHabit(opt.value)}
                  style={[
                    styles.ratingButton,
                    hungerOrHabit === opt.value && styles.ratingButtonSelected,
                  ]}
                >
                  <Text style={[
                    styles.ratingLabel,
                    hungerOrHabit === opt.value && { color: colors.gold },
                  ]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.submitButton, (!rating || loading) && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={!rating || loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.bg} />
              ) : (
                <Text style={styles.submitButtonText}>Log Meal</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
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
    maxHeight: '90%',
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
  ratingRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  ratingButton: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.borderBright,
    borderRadius: 2,
    alignItems: 'center',
    gap: 2,
  },
  ratingButtonSelected: {
    borderColor: colors.gold,
    backgroundColor: 'rgba(201,168,76,0.1)',
  },
  ratingLabel: {
    color: colors.textMuted,
    fontSize: 12,
    letterSpacing: 0.5,
  },
  ratingXp: {
    color: colors.textFaint,
    fontSize: 10,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  chip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 2,
  },
  chipSelected: {
    borderColor: colors.gold,
    backgroundColor: 'rgba(201,168,76,0.1)',
  },
  chipText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  chipTextSelected: {
    color: colors.gold,
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