import type { XRayPatient, XRayStudy } from '../../types/xray'
import type { PatientFormState, StudyFormState } from './types'
import {
  XRAY_CASSETTES,
  XRAY_STUDY_AREAS,
} from './config'

export function getTodayIsoDate() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function createInitialStudyFormState(): StudyFormState {
  return {
    studyDate: getTodayIsoDate(),
    description: '',
    referralDiagnosis: '',
    studyArea: XRAY_STUDY_AREAS[0],
    studyType: 'Рентген',
    cassette: XRAY_CASSETTES[0],
    studyCount: 2,
    radiationDose: '',
    referredBy: '',
  }
}

export function createPatientFormState(patient: XRayPatient): PatientFormState {
  return {
    lastName: patient.lastName,
    firstName: patient.firstName,
    patronymic: patient.patronymic,
    birthDate: patient.birthDate,
    address: patient.address,
    rmisUrl: patient.rmisUrl ?? '',
  }
}

export function normalizeLeadingCapital(value: string) {
  const normalizedValue = String(value ?? '').replace(/^\s+/, '')

  if (!normalizedValue) {
    return ''
  }

  return normalizedValue.charAt(0).toLocaleUpperCase('ru-RU') + normalizedValue.slice(1)
}

export function parseSearchDraft(query: string) {
  const trimmedQuery = String(query ?? '').trim()
  const birthDate = trimmedQuery.replace(/\D/g, '').slice(0, 8)
  const namesPart = trimmedQuery.replace(/\d/g, ' ').replace(/\s+/g, ' ').trim()
  const [lastName = '', firstName = '', patronymic = ''] = namesPart.split(' ')

  return {
    lastName,
    firstName,
    patronymic,
    birthDate,
    address: '',
  }
}

export function getPatientFullName(patient: XRayPatient) {
  return `${patient.lastName} ${patient.firstName} ${patient.patronymic}`.trim()
}

export function formatStudyLabel(study: XRayStudy) {
  return study.studyArea
}
