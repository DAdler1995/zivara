import client from './client'

export async function getCharacter() {
  const response = await client.get('/character')
  return response.data
}

export async function checkNameAvailability(name: string) {
  const response = await client.get(`/character/name/availability/${name}`)
  return response.data.available
}

export async function updateCharacterName(name: string) {
  const response = await client.put('/character/name', { name })
  return response.data
}

export async function getEventLog(page = 1, pageSize = 30) {
  const response = await client.get(`/character/eventlog?page=${page}&pageSize=${pageSize}`)
  return response.data
}