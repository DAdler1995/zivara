import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

const client = axios.create({
  baseURL: 'http://192.168.1.3:5295/api/v1',
})

client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

client.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url)
    return response
  },
  async (error) => {
    console.error('API Error:', JSON.stringify({
      message: error?.message,
      code: error?.code,
      url: error?.config?.url,
      status: error?.response?.status,
    }))
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('accessToken')
      await AsyncStorage.removeItem('refreshToken')
    }
    return Promise.reject(error)
  }
)

export default client