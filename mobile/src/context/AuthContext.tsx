import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getCharacter } from '../api/character'

interface AuthContextValue {
  isAuthenticated: boolean
  character: any | null
  isLoading: boolean
  login: (accessToken: string, refreshToken: string) => Promise<void>
  logout: () => Promise<void>
  refreshCharacter: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [character, setCharacter] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      try {
        const token = await AsyncStorage.getItem('accessToken')
        if (token) {
          const char = await getCharacter()
          setCharacter(char)
          setIsAuthenticated(true)
        }
      } catch {
        await AsyncStorage.removeItem('accessToken')
        await AsyncStorage.removeItem('refreshToken')
      } finally {
        setIsLoading(false)
      }
    }
    checkAuth()
  }, [])

  async function login(accessToken: string, refreshToken: string) {
    await AsyncStorage.setItem('accessToken', accessToken)
    await AsyncStorage.setItem('refreshToken', refreshToken)
    const char = await getCharacter()
    setCharacter(char)
    setIsAuthenticated(true)
  }

  async function logout() {
    await AsyncStorage.removeItem('accessToken')
    await AsyncStorage.removeItem('refreshToken')
    setCharacter(null)
    setIsAuthenticated(false)
  }

  async function refreshCharacter() {
    const char = await getCharacter()
    setCharacter(char)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, character, isLoading, login, logout, refreshCharacter }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}