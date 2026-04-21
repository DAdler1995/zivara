import client from './client'

export async function getDailyQuests() {
  const response = await client.get('/quests/daily')
  return response.data
}