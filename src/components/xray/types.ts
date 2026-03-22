import type { FormEvent } from 'react'
import type { XRayPatient, XRaySearchResult, XRayStudy } from '../../types/xray'

export interface XRaySectionProps {
  query: string
  results: XRaySearchResult[]
  selectedPatient: XRayPatient | null
  studies: XRayStudy[]
  lastSubmittedQuery: string
  loading: boolean
  error: string
  isSaving: boolean
  isDeleting: boolean
  studiesLoading: boolean
  isSavingStudy: boolean
  deletingStudyId: number | null
  onQueryChange: (value: string) => void
  onSearch: (event?: FormEvent<HTMLFormElement>) => Promise<void>
  onSelectPatient: (patient: XRayPatient) => void
  onAddPatient: (payload: {
    lastName: string
    firstName: string
    patronymic: string
    birthDate: string
    address: string
    rmisUrl: string | null
  }) => Promise<XRayPatient | null>
  onUpdatePatient: (payload: {
    id: number
    lastName: string
    firstName: string
    patronymic: string
    birthDate: string
    address: string
    rmisUrl: string | null
  }) => Promise<XRayPatient | null>
  onDeletePatient: (id: number) => Promise<boolean>
  onOpenLink: (url: string) => Promise<boolean>
  onAddStudy: (payload: {
    patientId: number
    studyDate: string
    description: string
    referralDiagnosis: string
    studyArea: string
    studyType: 'Рентген' | 'Урография'
    cassette: '13х18' | '18х24' | '24х30' | '30х40' | '35х35'
    studyCount: 1 | 2 | 3 | 4 | 5 | 6
    radiationDose: string
    referredBy: string
  }) => Promise<XRayStudy | null>
  onUpdateStudy: (payload: {
    id: number
    patientId: number
    studyDate: string
    description: string
    referralDiagnosis: string
    studyArea: string
    studyType: 'Рентген' | 'Урография'
    cassette: '13х18' | '18х24' | '24х30' | '30х40' | '35х35'
    studyCount: 1 | 2 | 3 | 4 | 5 | 6
    radiationDose: string
    referredBy: string
  }) => Promise<XRayStudy | null>
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
  studyType: 'Рентген' | 'Урография'
  cassette: '13х18' | '18х24' | '24х30' | '30х40' | '35х35'
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
