import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'
import { getToken } from '../store/auth'
import type { ApiResponse } from '../types/api'

const instance = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

instance.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

const unwrapResponse = <T>(response: ApiResponse<T>): T => {
  if (response.code !== 0) {
    throw new Error(response.message || '请求失败')
  }
  return response.data
}

export const http = {
  get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return instance.get<ApiResponse<T>>(url, config).then((res) => unwrapResponse(res.data))
  },
  post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return instance
      .post<ApiResponse<T>>(url, data, config)
      .then((res) => unwrapResponse(res.data))
  },
  put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return instance
      .put<ApiResponse<T>>(url, data, config)
      .then((res) => unwrapResponse(res.data))
  },
  delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return instance.delete<ApiResponse<T>>(url, config).then((res) => unwrapResponse(res.data))
  },
}
