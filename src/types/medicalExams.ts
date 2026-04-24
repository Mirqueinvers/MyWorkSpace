export interface Patient {
  id: number
  xrayPatientId?: number
  fullName: string
  birthDate: string
  monthKey: string
  createdAt: string
  rmisUrl: string | null
}

export interface AddPatientPayload {
  fullName: string
  birthDate: string
  monthKey: string
}

export interface MedicalExamsApi {
  listPatients: (monthKey: string) => Promise<Patient[]>
  listByPatient: (payload: { fullName: string; birthDate: string }) => Promise<Patient[]>
  listByXRayPatient: (xrayPatientId: number) => Promise<Patient[]>
  addPatient: (payload: AddPatientPayload) => Promise<Patient>
  addForPatient: (payload: {
    xrayPatientId?: number
    fullName: string
    birthDate: string
    monthKey?: string
  }) => Promise<Patient>
  updateRmisUrl: (payload: { medicalExamId: number; rmisUrl: string | null }) => Promise<boolean>
  deletePatient: (id: number) => Promise<boolean>
  countPatients: (monthKey: string) => Promise<number>
}

export interface WeatherState {
  status: 'loading' | 'ready' | 'error'
  temperature: number | null
  description: string
}
