export interface DashboardOverview {
  childrenTotal: number
  classTotal: number
  staffTotal: number
  todayAttendance: {
    shouldArrive: number
    arrived: number
    leave: number
    absent: number
  }
  weekRecipeSummary: Array<{
    day: string
    calories: number
  }>
  monthlyIncomeTrend: Array<{
    month: string
    income: number
    expense: number
  }>
}
