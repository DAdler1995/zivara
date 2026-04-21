import client from './client'

export async function syncSteps(date: string, stepCount: number) {
  const response = await client.post('/steps/sync', { date, stepCount })
  return response.data
}

export async function syncWeight(weightLbs: number) {
  const response = await client.post('/activity/weight', { weightLbs })
  return response.data
}

export async function logMeal(
  rating: string,
  category?: string,
  foodNotes?: string,
  hungerOrHabit?: string
) {
  const response = await client.post('/activity/meal', {
    rating,
    category,
    foodNotes,
    hungerOrHabit,
  })
  return response.data
}

export async function logWorkout(durationMinutes: number, notes?: string) {
  const response = await client.post('/activity/workout', { durationMinutes, notes })
  return response.data
}

export async function logWater(glasses: number) {
  const response = await client.post('/activity/water', { glasses })
  return response.data
}

export async function removeLastWater() {
  await client.delete('/activity/water/today/last')
}

export async function checkIn() {
  const response = await client.post('/activity/checkin')
  return response.data
}

export async function getTodayActivity() {
  const response = await client.get('/activity/today')
  return response.data
}