import { http } from '../http'
import type { LoginRequest, LoginResponse } from '../../types/auth'

export const loginApi = (payload: LoginRequest): Promise<LoginResponse> => {
  return http.post('/auth/login', payload)
}
