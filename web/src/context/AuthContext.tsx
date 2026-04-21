import { useState, useEffect, type ReactNode } from 'react'
import { getCharacter } from '../api/character'
import { AuthContext } from './AuthContextValue'
import type { CharacterDto } from '@zivara/shared'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    !!localStorage.getItem('accessToken')
  )
  const [character, setCharacter] = useState<CharacterDto | null>(null)

  useEffect(() => {
    if (isAuthenticated) {
      getCharacter()
        .then(setCharacter)
        .catch(() => {
          setIsAuthenticated(false)
          setCharacter(null)
        })
    }
  }, [isAuthenticated])

  async function login(accessToken: string, refreshToken: string) {
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    setIsAuthenticated(true)
    const char = await getCharacter()
    setCharacter(char)
  }

  function logout() {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setIsAuthenticated(false)
    setCharacter(null)
  }

  async function refreshCharacter() {
    const char = await getCharacter()
    setCharacter(char)
  }

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, character, login, logout, refreshCharacter }}
    >
      {children}
    </AuthContext.Provider>
  )
}