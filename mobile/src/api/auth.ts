import client from './client'

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  expiresAt: string
}

export async function login(username: string, password: string): Promise<AuthResponse> {
  const response = await client.post<AuthResponse>('/auth/login', { username, password })
  return response.data
}

export async function register(username: string, password: string): Promise<AuthResponse> {
  const response = await client.post<AuthResponse>('/auth/register', { username, password })
  return response.data
}