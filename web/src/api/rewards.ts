import client from './client'

export interface JarSummaryResponse {
  totalUnlockedBalance: number
  currentWeekMaxEarn: number
  currentWeekUnlockedAmount: number
  currentWeekUnlockedPercent: number
  dailyQuestDaysCompletedThisWeek: number
  weeklyQuestCompleted: boolean
  worldBossKilledThisWeek: boolean
}

export interface WishListItemDto {
  id: string
  label: string
  estimatedCost: number | null
  milestoneTrigger: string | null
  isUnlocked: boolean
  unlockedAt: string | null
  createdAt: string
}

export async function getJarSummary(): Promise<JarSummaryResponse> {
  const response = await client.get<JarSummaryResponse>('/rewards/jar')
  return response.data
}

export async function getWishList(): Promise<WishListItemDto[]> {
  const response = await client.get<WishListItemDto[]>('/rewards/wishlist')
  return response.data
}

export async function createWishListItem(
  label: string,
  estimatedCost?: number,
  milestoneTrigger?: string
): Promise<WishListItemDto> {
  const response = await client.post<WishListItemDto>('/rewards/wishlist', {
    label,
    estimatedCost,
    milestoneTrigger,
  })
  return response.data
}

export async function deleteWishListItem(id: string): Promise<void> {
  await client.delete(`/rewards/wishlist/${id}`)
}