import type { Role } from '../types/auth'

export const ROLE_LABEL: Record<Role, string> = {
  principal: '园长',
  headTeacher: '班主任',
  assistantTeacher: '配班老师',
  nurse: '保健医',
  finance: '财务',
  parent: '家长',
}

export const DEMO_USERS: Record<Role, { username: string; password: string; name: string }> = {
  principal: { username: 'principal', password: '123456', name: '王园长' },
  headTeacher: { username: 'headteacher', password: '123456', name: '李老师' },
  assistantTeacher: { username: 'assistant', password: '123456', name: '陈老师' },
  nurse: { username: 'nurse', password: '123456', name: '周医生' },
  finance: { username: 'finance', password: '123456', name: '徐会计' },
  parent: { username: 'parent', password: '123456', name: '张家长' },
}

export const ROLE_HOME_PATH: Record<Role, string> = {
  principal: '/dashboard',
  headTeacher: '/dashboard',
  assistantTeacher: '/dashboard',
  nurse: '/health',
  finance: '/finance',
  parent: '/home',
}
