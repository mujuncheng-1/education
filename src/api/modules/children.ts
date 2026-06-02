import { http } from '../http'
import type { ChildPayload, ChildQuery, ChildRecord } from '../../types/child'
import type { PaginatedResult } from '../../types/api'

export const getChildrenApi = (params: ChildQuery): Promise<PaginatedResult<ChildRecord>> => {
  return http.get('/children', { params })
}

export const createChildApi = (payload: ChildPayload): Promise<ChildRecord> => {
  return http.post('/children', payload)
}

export const updateChildApi = (id: string, payload: ChildPayload): Promise<ChildRecord> => {
  return http.put(`/children/${id}`, payload)
}

export const deleteChildApi = (id: string): Promise<{ id: string }> => {
  return http.delete(`/children/${id}`)
}
