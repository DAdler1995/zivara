import { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import { checkNameAvailability, updateCharacterName } from '../api/character'
import { useAuth } from '../context/AuthContext'
import { colors } from '../theme'

export default function CreateCharacterScreen() {
  const [name, setName] = useState('')
  const [available, setAvailable] = useState<boolean | null>(null)
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { refreshCharacter } = useAuth()

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (name.length < 2) {
        setAvailable(null)
        setChecking(false)
        return
      }
      setChecking(true)
      try {
        const result = await checkNameAvailability(name)
        setAvailable(result)
      } catch {
        setAvailable(null)
      } finally {
        setChecking(false)
      }
    }, 400)

    return () => clearTimeout(timeout)
  }, [name])

  async function handleSubmit() {
    if (!available) return
    setError('')
    setLoading(true)
    try {
      await updateCharacterName(name)
      await refreshCharacter()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function getStatusText() {
    if (name.length < 2) return null
    if (checking) return { text: 'Checking...', color: colors.textMuted }
    if (available === true) return { text: 'Name available', color: colors.greenBright }
    if (available === false) return { text: 'Name already taken', color: colors.redBright }
    return null
  }

  const status = getStatusText()

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Enter Zivara</Text>
        </View>

        <View style={styles.loreCard}>
          <Text style={styles.loreText}>
            The world does not know your name yet. It will remember whatever you give it.
            Choose carefully. This is who you are in Zivara.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardAccent} />
          <Text style={styles.cardTitle}>Choose Your Name</Text>

          <Text style={styles.label}>Character Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            maxLength={20}
            autoFocus
            autoCapitalize="words"
            autoCorrect={false}
            placeholderTextColor={colors.textFaint}
            placeholder="Enter a name..."
          />

          <View style={styles.nameFooter}>
            {status ? (
              <Text style={[styles.statusText, { color: status.color }]}>
                {status.text}
              </Text>
            ) : (
              <Text />
            )}
            <Text style={styles.charCount}>{name.length}/20</Text>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[
              styles.button,
              (!available || loading) && styles.buttonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!available || loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.bg} />
            ) : (
              <Text style={styles.buttonText}>Enter the World</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.footnote}>
          Names can be changed once every 30 days.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 36,
    color: colors.gold,
    letterSpacing: 4,
  },
  loreCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 3,
    borderLeftColor: colors.goldDim,
    padding: 16,
    borderRadius: 2,
  },
  loreText: {
    color: colors.textMuted,
    fontStyle: 'italic',
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    padding: 24,
    paddingTop: 28,
    overflow: 'hidden',
  },
  cardAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.gold,
    opacity: 0.6,
  },
  cardTitle: {
    color: colors.textMuted,
    fontSize: 13,
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    color: colors.goldDim,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderBright,
    borderRadius: 2,
    color: colors.text,
    padding: 12,
    fontSize: 18,
  },
  nameFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 13,
  },
  charCount: {
    color: colors.textFaint,
    fontSize: 12,
  },
  error: {
    color: colors.redBright,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 12,
  },
  button: {
    backgroundColor: colors.gold,
    borderRadius: 2,
    padding: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.bg,
    fontSize: 12,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  footnote: {
    textAlign: 'center',
    color: colors.textFaint,
    fontSize: 12,
    fontStyle: 'italic',
  },
})