export interface XRayPatient {
  id: number
  lastName: string
  firstName: string
  patronymic: string
  birthDate: string
  address: string
  rmisUrl: string | null
  createdAt: string
}

export interface XRayStudy {
  id: number
  patientId: number
  studyDate: string
  referralDiagnosis: string
  studyArea: string
  studyType: 'Рентген' | 'Урография'
  cassette: '13х18' | '18х24' | '24х30' | '30х40' | '35х35'
  studyCount: 1 | 2 | 3 | 4 | 5 | 6
  radiationDose: string
  referredBy: string
  createdAt: string
}

export interface AddXRayPatientPayload {
  lastName: string
  firstName: string
  patronymic: string
  birthDate: string
  address: string
  rmisUrl: string | null
}

export interface UpdateXRayPatientPayload extends AddXRayPatientPayload {
  id: number
}

export interface XRaySearchResult extends XRayPatient {
  matchLabel: string
}

export interface AddXRayStudyPayload {
  patientId: number
  studyDate: string
  referralDiagnosis: string
  studyArea: string
  studyType: 'Рентген' | 'Урография'
  cassette: '13х18' | '18х24' | '24х30' | '30х40' | '35х35'
  studyCount: 1 | 2 | 3 | 4 | 5 | 6
  radiationDose: string
  referredBy: string
}

export interface UpdateXRayStudyPayload extends AddXRayStudyPayload {
  id: number
}

export interface XRayApi {
  searchPatients: (query: string) => Promise<XRaySearchResult[]>
  addPatient: (payload: AddXRayPatientPayload) => Promise<XRayPatient>
  updatePatient: (payload: UpdateXRayPatientPayload) => Promise<XRayPatient>
  deletePatient: (id: number) => Promise<boolean>
  openLink: (url: string) => Promise<boolean>
  listStudies: (patientId: number) => Promise<XRayStudy[]>
  addStudy: (payload: AddXRayStudyPayload) => Promise<XRayStudy>
  updateStudy: (payload: UpdateXRayStudyPayload) => Promise<XRayStudy>
  deleteStudy: (id: number) => Promise<boolean>
}
