import client from './client'

export async function getJarSummary() {
  const response = await client.get('/rewards/jar')
  return response.data
}

export async function getWishList() {
  const response = await client.get('/rewards/wishlist')
  return response.data
}