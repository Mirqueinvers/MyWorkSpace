export interface Patient {
  id: number
  fullName: string
  birthDate: string
  monthKey: string
  createdAt: string
}

export interface AddPatientPayload {
  fullName: string
  birthDate: string
  monthKey: string
}

export interface MedicalExamsApi {
  listPatients: (monthKey: string) => Promise<Patient[]>
  addPatient: (payload: AddPatientPayload) => Promise<Patient>
  deletePatient: (id: number) => Promise<boolean>
  countPatients: (monthKey: string) => Promise<number>
}

export interface WeatherState {
  status: 'loading' | 'ready' | 'error'
  temperature: number | null
  description: string
}
