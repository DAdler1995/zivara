import client from './client'
import type { CharacterDto } from '@zivara/shared'

export async function getCharacter(): Promise<CharacterDto> {
  const response = await client.get<CharacterDto>('/character')
  return response.data
}

export async function checkNameAvailability(name: string): Promise<boolean> {
  const response = await client.get<{ available: boolean }>(
    `/character/name/availability/${name}`
  )
  return response.data.available
}

export async function updateCharacterName(name: string): Promise<CharacterDto> {
  const response = await client.put<CharacterDto>('/character/name', { name })
  return response.data
}