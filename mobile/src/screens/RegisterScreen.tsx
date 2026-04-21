import { useState } from 'react'
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
import { register } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import { colors } from '../theme'

export default function RegisterScreen({ navigation }: any) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const { login: authLogin } = useAuth()

  function validate() {
    const newErrors: Record<string, string> = {}
    if (username.length < 3) newErrors.username = 'Username must be at least 3 characters.'
    if (username.length > 20) newErrors.username = 'Username must be 20 characters or fewer.'
    if (password.length < 8) newErrors.password = 'Password must be at least 8 characters.'
    if (password !== confirm) newErrors.confirm = 'Passwords do not match.'
    return newErrors
  }

  async function handleRegister() {
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setLoading(true)

    try {
      const response = await register(username.trim(), password)
      await authLogin(response.accessToken, response.refreshToken)
    } catch {
      setErrors({ general: 'Username is already taken.' })
    } finally {
      setLoading(false)
    }
  }

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
          <Text style={styles.title}>Zivara</Text>
          <Text style={styles.subtitle}>Every journey begins with a single step.</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardAccent} />
          <Text style={styles.cardTitle}>Create Account</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={[styles.input, errors.username ? styles.inputError : null]}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor={colors.textFaint}
            />
            {errors.username ? <Text style={styles.fieldError}>{errors.username}</Text> : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={[styles.input, errors.password ? styles.inputError : null]}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor={colors.textFaint}
            />
            {errors.password ? <Text style={styles.fieldError}>{errors.password}</Text> : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={[styles.input, errors.confirm ? styles.inputError : null]}
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
              placeholderTextColor={colors.textFaint}
            />
            {errors.confirm ? <Text style={styles.fieldError}>{errors.confirm}</Text> : null}
          </View>

          {errors.general ? <Text style={styles.error}>{errors.general}</Text> : null}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.bg} />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={styles.linkRow}
        >
          <Text style={styles.linkText}>
            Already have an account?{' '}
            <Text style={styles.link}>Enter the realm</Text>
          </Text>
        </TouchableOpacity>
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
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 48,
    color: colors.gold,
    letterSpacing: 6,
    marginBottom: 8,
  },
  subtitle: {
    color: colors.textMuted,
    fontStyle: 'italic',
    fontSize: 15,
    textAlign: 'center',
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
    marginBottom: 24,
  },
  field: {
    marginBottom: 16,
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
    fontSize: 16,
  },
  inputError: {
    borderColor: colors.redBright,
  },
  fieldError: {
    color: colors.redBright,
    fontSize: 12,
    marginTop: 4,
  },
  error: {
    color: colors.redBright,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  button: {
    backgroundColor: colors.gold,
    borderRadius: 2,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
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
  linkRow: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  link: {
    color: colors.goldDim,
  },
})