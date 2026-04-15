export interface UltrasoundJournalPatient {
  fullName: string
  lastName: string
  firstName: string
  patronymic: string
  birthDate: string
}

export interface UltrasoundJournalStudy {
  id: number
  studyDate: string
  studyTitle: string
  doctorName: string
  conclusion: string
  rmisUrl: string | null
  createdAt: string
}

export interface UltrasoundJournalEntry {
  patient: UltrasoundJournalPatient
  studies: UltrasoundJournalStudy[]
}

export interface UltrasoundProtocolEntry extends UltrasoundJournalStudy {
  patient: UltrasoundJournalPatient
  sourceFile: string
  documentHtml: string
}

export interface ImportUltrasoundJournalResult {
  imported: number
  skipped: number
}

export interface ListUltrasoundJournalByPatientPayload {
  lastName: string
  firstName: string
  patronymic: string
  birthDate: string
}

export interface DeleteUltrasoundJournalPatientPayload {
  lastName: string
  firstName: string
  patronymic: string
  birthDate: string
}

export interface UltrasoundJournalApi {
  listByDate: (studyDate: string) => Promise<UltrasoundJournalEntry[]>
  listByPatient: (
    payload: ListUltrasoundJournalByPatientPayload,
  ) => Promise<UltrasoundJournalStudy[]>
  getProtocol: (id: number) => Promise<UltrasoundProtocolEntry | null>
  deleteStudy: (id: number) => Promise<boolean>
  deletePatient: (payload: DeleteUltrasoundJournalPatientPayload) => Promise<number>
  selectFile: () => Promise<string | null>
  importFile: (filePath: string) => Promise<ImportUltrasoundJournalResult>
}
