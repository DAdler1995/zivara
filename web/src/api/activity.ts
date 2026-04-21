import client from './client'
import type {
  LogMealRequest,
  LogWorkoutRequest,
  LogWeightRequest,
  LogWaterRequest,
} from '@zivara/shared'

export interface ActivityResponse {
  message: string
  xpAwarded: number
  skillTrained: string
}

export interface TodayActivityResponse {
  stepsToday: number
  waterGlassesToday: number
  mealsLoggedToday: number
  checkedInToday: boolean
  meals: MealSummary[]
}

export interface MealSummary {
  id: string
  rating: string
  category: string | null
  foodNotes: string | null
  hungerOrHabit: string
  loggedAt: string
}

export async function logMeal(request: LogMealRequest): Promise<ActivityResponse> {
  const response = await client.post<ActivityResponse>('/activity/meal', request)
  return response.data
}

export async function logWorkout(request: LogWorkoutRequest): Promise<ActivityResponse> {
  const response = await client.post<ActivityResponse>('/activity/workout', request)
  return response.data
}

export async function logWeight(request: LogWeightRequest): Promise<ActivityResponse> {
  const response = await client.post<ActivityResponse>('/activity/weight', request)
  return response.data
}

export async function logWater(request: LogWaterRequest): Promise<ActivityResponse> {
  const response = await client.post<ActivityResponse>('/activity/water', request)
  return response.data
}

export async function removeLastWater(): Promise<void> {
  await client.delete('/activity/water/today/last')
}

export async function checkIn(): Promise<ActivityResponse> {
  const response = await client.post<ActivityResponse>('/activity/checkin')
  return response.data
}

export async function getTodayActivity(): Promise<TodayActivityResponse> {
  const response = await client.get<TodayActivityResponse>('/activity/today')
  return response.data
}