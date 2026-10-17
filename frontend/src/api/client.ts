import axios, { AxiosError } from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let refreshing: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem('refreshToken')
  if (!refreshToken) return null
  try {
    const res = await axios.post(`${api.defaults.baseURL}/auth/refresh`, { refreshToken })
    const { accessToken, refreshToken: newRefresh } = res.data.data
    localStorage.setItem('accessToken', accessToken)
    if (newRefresh) localStorage.setItem('refreshToken', newRefresh)
    return accessToken
  } catch {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    return null
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (typeof error.config & { _retry?: boolean }) | undefined
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true
      refreshing = refreshing ?? refreshAccessToken()
      const token = await refreshing
      refreshing = null
      if (token) {
        originalRequest.headers = originalRequest.headers ?? {}
        originalRequest.headers.Authorization = `Bearer ${token}`
        return api(originalRequest)
      }
    }
    return Promise.reject(error)
  }
)

/** Extract a human-friendly message from any thrown value (including our ApiResponse envelope). */
export function apiErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string; error?: string } | undefined
    if (data?.message) return data.message
    if (data?.error) return data.error
    if (err.code === 'ERR_NETWORK') return 'Cannot reach the server. Is the backend running?'
    if (err.response?.status === 401) return 'Your session has expired. Please sign in again.'
    if (err.response?.status === 403) return 'You do not have access to this resource.'
    if (err.response?.status === 404) return 'The requested resource was not found.'
    if (err.response?.status && err.response.status >= 500) return 'The server ran into a problem. Please try again.'
    return err.message
  }
  if (err instanceof Error) return err.message
  return 'Something went wrong.'
}

export default api
