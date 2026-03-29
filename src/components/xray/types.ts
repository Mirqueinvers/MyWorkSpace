import type { FormEvent } from 'react'
import type {
  AddXRayPatientPayload,
  AddXRayStudyPayload,
  UpdateXRayPatientPayload,
  UpdateXRayStudyPayload,
  XRayFlJournalEntry,
  XRayPatient,
  XRaySearchResult,
  XRayStudy,
} from '../../types/xray'

export interface XRaySectionProps {
  query: string
  results: XRaySearchResult[]
  selectedPatient: XRayPatient | null
  studies: XRayStudy[]
  flStudies: XRayFlJournalEntry[]
  lastSubmittedQuery: string
  loading: boolean
  error: string
  isSaving: boolean
  isDeleting: boolean
  studiesLoading: boolean
  flStudiesLoading: boolean
  isSavingStudy: boolean
  deletingStudyId: number | null
  onQueryChange: (value: string) => void
  onSearch: (event?: FormEvent<HTMLFormElement>) => Promise<void>
  onSelectPatient: (patient: XRayPatient) => void
  onAddPatient: (payload: AddXRayPatientPayload) => Promise<XRayPatient | null>
  onUpdatePatient: (payload: UpdateXRayPatientPayload) => Promise<XRayPatient | null>
  onDeletePatient: (id: number) => Promise<boolean>
  onOpenLink: (url: string) => Promise<boolean>
  onAddStudy: (payload: AddXRayStudyPayload) => Promise<XRayStudy | null>
  onUpdateStudy: (payload: UpdateXRayStudyPayload) => Promise<XRayStudy | null>
  onDeleteStudy: (id: number) => Promise<boolean>
  onReset: () => void
}

export interface PatientFormState {
  lastName: string
  firstName: string
  patronymic: string
  birthDate: string
  address: string
  rmisUrl: string
}

export interface StudyFormState {
  studyDate: string
  description: string
  referralDiagnosis: string
  studyArea: string
  studyType: AddXRayStudyPayload['studyType']
  cassette: AddXRayStudyPayload['cassette']
  studyCount: 1 | 2 | 3 | 4 | 5 | 6
  radiationDose: string
  referredBy: string
}

export type StudySelectFieldKey = null | 'studyArea' | 'studyType' | 'cassette' | 'studyCount'

export interface XRaySelectFieldProps<T extends string | number> {
  label: string
  value: T
  options: readonly T[]
  isOpen: boolean
  onToggle: () => void
  onSelect: (value: T) => void
}
