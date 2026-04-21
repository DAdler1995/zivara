import client from './client'

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  expiresAt: string
}

export interface RegisterRequest {
  username: string
  password: string
}

export interface LoginRequest {
  username: string
  password: string
}

export async function register(request: RegisterRequest): Promise<AuthResponse> {
  const response = await client.post<AuthResponse>('/auth/register', request)
  return response.data
}

export async function login(request: LoginRequest): Promise<AuthResponse> {
  const response = await client.post<AuthResponse>('/auth/login', request)
  return response.data
}