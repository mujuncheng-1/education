import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { loginApi } from '../api/modules/auth'
import type { LoginRequest, Role, UserInfo } from '../types/auth'

interface AuthState {
  token: string
  user: UserInfo | null
  loginLoading: boolean
  login: (payload: LoginRequest) => Promise<void>
  logout: () => void
  hasRole: (roles: Role[]) => boolean
}

const AUTH_STORAGE_KEY = 'kg-auth-store'
const TOKEN_STORAGE_KEY = 'kg-token'

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: '',
      user: null,
      loginLoading: false,
      login: async (payload) => {
        set({ loginLoading: true })
        try {
          const data = await loginApi(payload)
          localStorage.setItem(TOKEN_STORAGE_KEY, data.token)
          set({ token: data.token, user: data.user })
        } finally {
          set({ loginLoading: false })
        }
      },
      logout: () => {
        localStorage.removeItem(TOKEN_STORAGE_KEY)
        set({ token: '', user: null })
      },
      hasRole: (roles) => {
        const currentRole = get().user?.role
        return Boolean(currentRole && roles.includes(currentRole))
      },
    }),
    {
      name: AUTH_STORAGE_KEY,
      partialize: (state) => ({ token: state.token, user: state.user, loginLoading: false }),
    },
  ),
)

export const getToken = (): string => localStorage.getItem(TOKEN_STORAGE_KEY) ?? ''
