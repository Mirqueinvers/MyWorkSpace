import type { MedicalExamsApi } from './medicalExams'
import type { NotesApi } from './notes'
import type { RemindersApi } from './reminders'
import type { SchoolApi } from './school'
import type { SchoolsApi } from './schools'
import type { SickLeavesApi } from './sickLeaves'
import type { UltrasoundJournalApi } from './ultrasound'
import type { XRayApi } from './xray'

declare global {
  interface Window {
    electronAPI?: {
      medicalExams: MedicalExamsApi
      sickLeaves: SickLeavesApi
      reminders: RemindersApi
      notes: NotesApi
      school: SchoolApi
      schools: SchoolsApi
      xray: XRayApi
      ultrasoundJournal: UltrasoundJournalApi
    }
  }
}

export {}
