import { http } from '../http'

export interface BasicMetric {
  label: string
  value: number
  trend?: number
}

export interface NoticeItem {
  id: string
  title: string
  content: string
  read: boolean
  createdAt: string
}

export interface RecipeItem {
  id: string
  day: string
  breakfast: string[]
  lunch: string[]
  dinner: string[]
  calories: number
}

export interface GrowthItem {
  id: string
  childName: string
  content: string
  createdAt: string
  media: string[]
}

export const getAttendanceSummaryApi = (): Promise<{
  stats: BasicMetric[]
  records: Array<{ id: string; name: string; className: string; status: string; date: string }>
}> => {
  return http.get('/attendance/summary')
}

export const getRecipeWeeklyApi = (): Promise<{ list: RecipeItem[] }> => {
  return http.get('/recipe/weekly')
}

export const getGrowthTimelineApi = (): Promise<{ list: GrowthItem[] }> => {
  return http.get('/growth/timeline')
}

export const getHomeNoticesApi = (): Promise<{ list: NoticeItem[] }> => {
  return http.get('/home/notices')
}

export const getHealthMorningCheckApi = (): Promise<{
  list: Array<{
    id: string
    childName: string
    className: string
    temperature: number
    oralCheck: string
    handCheck: string
    spirit: string
    abnormal: boolean
  }>
}> => {
  return http.get('/health/morning-check')
}

export const getStaffListApi = (): Promise<{
  list: Array<{
    id: string
    name: string
    department: string
    role: string
    phone: string
    certExpireDate: string
    status: string
  }>
}> => {
  return http.get('/staff/list')
}

export const getFinanceSummaryApi = (): Promise<{
  stats: BasicMetric[]
  trend: Array<{ month: string; income: number; expense: number }>
}> => {
  return http.get('/finance/summary')
}

export const getRbacUsersApi = (): Promise<{
  list: Array<{ id: string; username: string; role: string; status: boolean }>
}> => {
  return http.get('/rbac/users')
}

export const getRbacRolesApi = (): Promise<{
  list: Array<{ id: string; roleName: string; userCount: number }>
}> => {
  return http.get('/rbac/roles')
}
