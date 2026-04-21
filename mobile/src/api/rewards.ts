import client from './client'

export async function getJarSummary() {
  const response = await client.get('/rewards/jar')
  return response.data
}

export async function getWishList() {
  const response = await client.get('/rewards/wishlist')
  return response.data
}

export async function createWishListItem(
  label: string,
  estimatedCost?: number,
  milestoneTrigger?: string
) {
  const response = await client.post('/rewards/wishlist', {
    label,
    estimatedCost,
    milestoneTrigger,
  })
  return response.data
}

export async function deleteWishListItem(id: string) {
  await client.delete(`/rewards/wishlist/${id}`)
}