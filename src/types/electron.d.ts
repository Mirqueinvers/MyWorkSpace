import type { MedicalExamsApi } from './medicalExams'
import type { NotesApi } from './notes'
import type { RemindersApi } from './reminders'
import type { SchoolApi } from './school'
import type { SchoolsApi } from './schools'
import type { SickLeavesApi } from './sickLeaves'
import type { UltrasoundJournalApi } from './ultrasound'
import type { XRayApi } from './xray'

interface RemotePowerPayload {
  ip: string
  username?: string
  password?: string
  timeoutSeconds?: number
}

interface ConnectionTestResult {
  success: boolean
  message: string
}

interface NetworkApi {
  wakeOnLan(macAddress: string, broadcastIp?: string): Promise<boolean>
  remoteShutdown(payload: RemotePowerPayload): Promise<boolean>
  remoteRestart(payload: RemotePowerPayload): Promise<boolean>
  testConnection(payload: RemotePowerPayload): Promise<ConnectionTestResult>
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
