export type ChildStatus = '在园' | '请假' | '毕业' | '退学'

export interface ChildRecord {
  id: string
  name: string
  gender: '男' | '女'
  birthDate: string
  idCard: string
  address: string
  className: string
  studentNo: string
  status: ChildStatus
  avatar?: string
  parentName: string
  parentMobile: string
  relation: string
  pickupPermission: boolean
  allergyHistory: string
  medicalHistory: string
  vaccineRecord: string
  height: number
  weight: number
}

export interface ChildQuery {
  name?: string
  className?: string
  parentMobile?: string
}

export type ChildPayload = Omit<ChildRecord, 'id' | 'studentNo'> & {
  id?: string
  studentNo?: string
}
