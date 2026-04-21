import { useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { StatusBar } from 'expo-status-bar'
import { AuthProvider, useAuth } from './src/context/AuthContext'
import { View, ActivityIndicator } from 'react-native'
import { colors } from './src/theme'
import LoginScreen from './src/screens/LoginScreen'
import RegisterScreen from './src/screens/RegisterScreen'
import CreateCharacterScreen from './src/screens/CreateCharacterScreen'
import MainTabs from './src/navigation/MainTabs'

const Stack = createStackNavigator()

function RootNavigator() {
  const { isAuthenticated, isLoading, character } = useAuth()

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

  // Check if character name is still the default username
  // If character exists and has a real name, go straight to Main
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