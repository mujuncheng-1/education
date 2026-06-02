export type Role =
  | 'principal'
  | 'headTeacher'
  | 'assistantTeacher'
  | 'nurse'
  | 'finance'
  | 'parent'

export interface UserInfo {
  id: string
  name: string
  role: Role
  avatar?: string
}

export interface LoginRequest {
  username: string
  password: string
  role: Role
}

export interface LoginResponse {
  token: string
  user: UserInfo
}

export type ThemeMode = 'light' | 'dark'
