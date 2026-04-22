import { useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { StatusBar } from 'expo-status-bar'
import { AuthProvider, useAuth } from './src/context/AuthContext'
import { View, ActivityIndicator, Platform } from 'react-native'
import { colors } from './src/theme'
import LoginScreen from './src/screens/LoginScreen'
import RegisterScreen from './src/screens/RegisterScreen'
import CreateCharacterScreen from './src/screens/CreateCharacterScreen'
import MainTabs from './src/navigation/MainTabs'
import {
  initializeHealthConnect,
  requestHealthPermissions,
  getTodaySteps,
  getLatestWeight,
} from './src/services/HealthConnectService'
import { syncSteps, syncWeight } from './src/api/activity'

const Stack = createStackNavigator()

function RootNavigator() {
  const { isAuthenticated, isLoading, character } = useAuth()

  useEffect(() => {
  if (!isAuthenticated) return

  async function syncHealthData() {
    if (Platform.OS !== 'android') return

    await new Promise(resolve => setTimeout(resolve, 3000))

    try {
      const initialized = await initializeHealthConnect()
      if (!initialized) return

      // Skip permission request on startup -- only sync if already granted
      const steps = await getTodaySteps()
      if (steps > 0) {
        const today = new Date().toISOString().split('T')[0]
        await syncSteps(today, steps).catch(() => {})
      }

      const weightLbs = await getLatestWeight()
      if (weightLbs) {
        await syncWeight(weightLbs).catch(() => {})
      }
    } catch (err) {
      console.log('Health Connect sync skipped:', err)
    }
  }

  syncHealthData()
}, [isAuthenticated])

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.gold} />
      </View>
    )
  }

  if (!isAuthenticated) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
      </Stack.Navigator>
    )
  }

  const needsCharacterSetup = !character

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {needsCharacterSetup ? (
        <Stack.Screen name="CreateCharacter" component={CreateCharacterScreen} />
      ) : (
        <Stack.Screen name="Main" component={MainTabs} />
      )}
    </Stack.Navigator>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  )
}