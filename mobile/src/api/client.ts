import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

const client = axios.create({
  baseURL: 'https://10.0.2.2:7043/api/v1', // Android emulator localhost
  httpsAgent: undefined,
})

client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('accessToken')
      await AsyncStorage.removeItem('refreshToken')
    }
    return Promise.reject(error)
  }
)

export default client