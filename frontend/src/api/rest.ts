import api from './client'
import type { ApiResponse } from './types'

export async function get<T>(url: string, config?: Parameters<typeof api.get>[1]): Promise<T> {
  const res = await api.get<ApiResponse<T>>(url, config)
  return res.data.data
}

export async function post<T>(url: string, body?: unknown): Promise<T> {
  const res = await api.post<ApiResponse<T>>(url, body)
  return res.data.data
}

export async function put<T>(url: string, body?: unknown): Promise<T> {
  const res = await api.put<ApiResponse<T>>(url, body)
  return res.data.data
}

export async function del<T = void>(url: string): Promise<T> {
  const res = await api.delete<ApiResponse<T>>(url)
  return res.data.data
}
