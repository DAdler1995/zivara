import client from './client'
import type { SkillType } from '@zivara/shared'

export interface QuestDto {
  id: string
  skillTarget: SkillType
  description: string
  targetValue: number
  currentValue: number
  status: 'Active' | 'Completed' | 'Expired'
  expiresAt: string
}

export interface DailyQuestsResponse {
  quests: QuestDto[]
  allCompleted: boolean
}

export async function getDailyQuests(): Promise<DailyQuestsResponse> {
  const response = await client.get<DailyQuestsResponse>('/quests/daily')
  return response.data
}