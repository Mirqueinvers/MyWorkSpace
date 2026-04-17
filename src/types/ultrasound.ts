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

export interface UltrasoundStudyAttachment {
  id: number
  studyId: number
  originalName: string
  storedName: string
  filePath: string
  mimeType: string
  fileSize: number
  createdAt: string
  kind: 'image' | 'video' | 'file'
}

export interface UltrasoundJournalEntry {
  patient: UltrasoundJournalPatient
  studies: UltrasoundJournalStudy[]
}

export interface UltrasoundProtocolEntry extends UltrasoundJournalStudy {
  patient: UltrasoundJournalPatient
  sourceFile: string
  documentHtml: string
  attachments: UltrasoundStudyAttachment[]
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
  listAttachments: (studyId: number) => Promise<UltrasoundStudyAttachment[]>
  getAttachmentPreview: (filePath: string) => Promise<string | null>
  deleteAttachment: (attachmentId: number) => Promise<boolean>
  deleteStudy: (id: number) => Promise<boolean>
  deletePatient: (payload: DeleteUltrasoundJournalPatientPayload) => Promise<number>
  selectFile: () => Promise<string | null>
  importFile: (filePath: string) => Promise<ImportUltrasoundJournalResult>
  selectAttachmentFile: () => Promise<string | null>
  importAttachmentFile: (
    studyId: number,
    filePath: string,
  ) => Promise<UltrasoundStudyAttachment>
  openAttachment: (filePath: string) => Promise<boolean>
}
