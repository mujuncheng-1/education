import { http } from '../http'
import type { DashboardOverview } from '../../types/dashboard'

export const getDashboardOverviewApi = (): Promise<DashboardOverview> => {
  return http.get('/dashboard/overview')
}
