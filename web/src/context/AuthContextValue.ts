import { createContext } from 'react'
import type { CharacterDto } from '@zivara/shared'

export interface AuthContextValue {
  isAuthenticated: boolean
  character: CharacterDto | null
  login: (accessToken: string, refreshToken: string) => Promise<void>
  logout: () => void
  refreshCharacter: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)