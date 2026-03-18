export interface SickLeavePeriod {
  id: number
  sickLeaveId: number
  startDate: string
  endDate: string
  createdAt: string
}

export interface SickLeave {
  id: number
  lastName: string
  firstName: string
  patronymic: string
  birthDate: string
  diagnosis: string
  status: 'open' | 'closed'
  createdAt: string
  closedAt: string | null
  periods: SickLeavePeriod[]
}

export interface AddSickLeavePayload {
  lastName: string
  firstName: string
  patronymic: string
  birthDate: string
  diagnosis: string
  startDate: string
  endDate: string
}

export interface AddSickLeavePeriodPayload {
  sickLeaveId: number
  startDate: string
  endDate: string
}

export interface CloseSickLeavePayload {
  id: number
  closeDate: string
}

export interface SickLeavesApi {
  list: () => Promise<SickLeave[]>
  add: (payload: AddSickLeavePayload) => Promise<SickLeave>
  addPeriod: (payload: AddSickLeavePeriodPayload) => Promise<SickLeavePeriod>
  close: (payload: CloseSickLeavePayload) => Promise<SickLeave>
  delete: (id: number) => Promise<boolean>
}
