import type { MedicalExamsApi } from './medicalExams'
import type { NotesApi } from './notes'
import type { RemindersApi } from './reminders'
import type { SchoolApi } from './school'
import type { SchoolsApi } from './schools'
import type { SickLeavesApi } from './sickLeaves'
import type { UltrasoundJournalApi } from './ultrasound'
import type { XRayApi } from './xray'

interface NetworkApi {
  wakeOnLan(macAddress: string, broadcastIp?: string): Promise<boolean>
  remoteShutdown(ip: string, timeoutSeconds?: number): Promise<boolean>
  remoteRestart(ip: string, timeoutSeconds?: number): Promise<boolean>
}

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
      network: NetworkApi
      ultrasoundJournal: UltrasoundJournalApi
    }
  }
}

export {}
