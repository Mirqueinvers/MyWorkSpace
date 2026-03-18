import type { MedicalExamsApi } from './medicalExams'
import type { RemindersApi } from './reminders'
import type { SchoolsApi } from './schools'
import type { SickLeavesApi } from './sickLeaves'

declare global {
  interface Window {
    electronAPI?: {
      medicalExams: MedicalExamsApi
      sickLeaves: SickLeavesApi
      reminders: RemindersApi
      schools: SchoolsApi
    }
  }
}

export {}
