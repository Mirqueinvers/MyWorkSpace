import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type {
  XRayPatient,
  XRaySearchResult,
  XRayStudy,
} from '../types/xray'

const ELECTRON_API_UNAVAILABLE =
  'API Electron недоступно. Откройте приложение через dev:electron.'
const SEARCH_ERROR = 'Не удалось выполнить поиск пациента в базе X-ray.'
const SAVE_ERROR = 'Не удалось сохранить пациента в базе X-ray.'
const UPDATE_ERROR = 'Не удалось обновить карточку пациента.'
const DELETE_ERROR = 'Не удалось удалить пациента из базы X-ray.'
const STUDIES_LOAD_ERROR = 'Не удалось загрузить исследования пациента.'
const STUDY_SAVE_ERROR = 'Не удалось сохранить исследование.'
const STUDY_DELETE_ERROR = 'Не удалось удалить исследование.'

export function useXRay() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<XRaySearchResult[]>([])
  const [selectedPatient, setSelectedPatient] = useState<XRayPatient | null>(null)
  const [studies, setStudies] = useState<XRayStudy[]>([])
  const [lastSubmittedQuery, setLastSubmittedQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [studiesLoading, setStudiesLoading] = useState(false)
  const [isSavingStudy, setIsSavingStudy] = useState(false)
  const [deletingStudyId, setDeletingStudyId] = useState<number | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let isCancelled = false

    async function loadStudies() {
      if (!selectedPatient) {
        setStudies([])
        return
      }

      if (!window.electronAPI?.xray) {
        setError(ELECTRON_API_UNAVAILABLE)
        setStudies([])
        return
      }

      setStudiesLoading(true)

      try {
        const items = await window.electronAPI.xray.listStudies(selectedPatient.id)

        if (!isCancelled) {
          setStudies(items)
        }
      } catch {
        if (!isCancelled) {
          setStudies([])
          setError(STUDIES_LOAD_ERROR)
        }
      } finally {
        if (!isCancelled) {
          setStudiesLoading(false)
        }
      }
    }

    void loadStudies()

    return () => {
      isCancelled = true
    }
  }, [selectedPatient])

  async function handleSearch(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault()

    const trimmedQuery = query.trim()
    setLastSubmittedQuery(trimmedQuery)
    setSelectedPatient(null)
    setStudies([])

    if (!trimmedQuery) {
      setResults([])
      setError('')
      return
    }

    if (!window.electronAPI?.xray) {
      setResults([])
      setError(ELECTRON_API_UNAVAILABLE)
      return
    }

    setLoading(true)
    setError('')

    try {
      const items = await window.electronAPI.xray.searchPatients(trimmedQuery)
      setResults(items)
    } catch {
      setResults([])
      setError(SEARCH_ERROR)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddPatient(payload: {
    lastName: string
    firstName: string
    patronymic: string
    birthDate: string
    address: string
    rmisUrl: string | null
  }) {
    if (!window.electronAPI?.xray) {
      setError(ELECTRON_API_UNAVAILABLE)
      return null
    }

    setIsSaving(true)
    setError('')

    try {
      const createdPatient = await window.electronAPI.xray.addPatient(payload)
      setSelectedPatient(createdPatient)
      setStudies([])
      setResults([])
      setQuery(
        `${createdPatient.lastName} ${createdPatient.firstName} ${createdPatient.patronymic} ${createdPatient.birthDate}`.trim(),
      )
      setLastSubmittedQuery(
        `${createdPatient.lastName} ${createdPatient.firstName} ${createdPatient.patronymic} ${createdPatient.birthDate}`.trim(),
      )
      return createdPatient
    } catch {
      setError(SAVE_ERROR)
      return null
    } finally {
      setIsSaving(false)
    }
  }

  function handleSelectPatient(patient: XRayPatient) {
    setSelectedPatient(patient)
    setError('')
  }

  async function handleDeletePatient(id: number) {
    if (!window.electronAPI?.xray) {
      setError(ELECTRON_API_UNAVAILABLE)
      return false
    }

    setIsDeleting(true)
    setError('')

    try {
      const deleted = await window.electronAPI.xray.deletePatient(id)

      if (deleted) {
        setSelectedPatient((currentPatient) =>
          currentPatient?.id === id ? null : currentPatient,
        )
        setStudies([])
        setResults((currentResults) =>
          currentResults.filter((patient) => patient.id !== id),
        )
        setQuery('')
        setLastSubmittedQuery('')
      }

      return deleted
    } catch {
      setError(DELETE_ERROR)
      return false
    } finally {
      setIsDeleting(false)
    }
  }

  async function handleUpdatePatient(payload: {
    id: number
    lastName: string
    firstName: string
    patronymic: string
    birthDate: string
    address: string
    rmisUrl: string | null
  }) {
    if (!window.electronAPI?.xray) {
      setError(ELECTRON_API_UNAVAILABLE)
      return null
    }

    setIsSaving(true)
    setError('')

    try {
      const updatedPatient = await window.electronAPI.xray.updatePatient(payload)
      setSelectedPatient(updatedPatient)
      setResults((currentResults) =>
        currentResults.map((patient) =>
          patient.id === updatedPatient.id
            ? { ...patient, ...updatedPatient, matchLabel: patient.matchLabel }
            : patient,
        ),
      )
      return updatedPatient
    } catch {
      setError(UPDATE_ERROR)
      return null
    } finally {
      setIsSaving(false)
    }
  }

  async function handleAddStudy(payload: {
    patientId: number
    studyDate: string
    referralDiagnosis: string
    studyArea: string
    studyType: 'Рентген' | 'Урография'
    cassette: '13х18' | '18х24' | '24х30' | '30х40' | '35х35'
    studyCount: 1 | 2 | 3 | 4 | 5 | 6
    radiationDose: string
    referredBy: string
  }) {
    if (!window.electronAPI?.xray) {
      setError(ELECTRON_API_UNAVAILABLE)
      return null
    }

    setIsSavingStudy(true)
    setError('')

    try {
      const createdStudy = await window.electronAPI.xray.addStudy(payload)
      setStudies((currentStudies) => [createdStudy, ...currentStudies])
      return createdStudy
    } catch {
      setError(STUDY_SAVE_ERROR)
      return null
    } finally {
      setIsSavingStudy(false)
    }
  }

  async function handleUpdateStudy(payload: {
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
  }) {
    if (!window.electronAPI?.xray) {
      setError(ELECTRON_API_UNAVAILABLE)
      return null
    }

    setIsSavingStudy(true)
    setError('')

    try {
      const updatedStudy = await window.electronAPI.xray.updateStudy(payload)
      setStudies((currentStudies) =>
        currentStudies.map((study) =>
          study.id === updatedStudy.id ? updatedStudy : study,
        ),
      )
      return updatedStudy
    } catch {
      setError(STUDY_SAVE_ERROR)
      return null
    } finally {
      setIsSavingStudy(false)
    }
  }

  async function handleDeleteStudy(id: number) {
    if (!window.electronAPI?.xray) {
      setError(ELECTRON_API_UNAVAILABLE)
      return false
    }

    setDeletingStudyId(id)
    setError('')

    try {
      const deleted = await window.electronAPI.xray.deleteStudy(id)

      if (deleted) {
        setStudies((currentStudies) =>
          currentStudies.filter((study) => study.id !== id),
        )
      }

      return deleted
    } catch {
      setError(STUDY_DELETE_ERROR)
      return false
    } finally {
      setDeletingStudyId(null)
    }
  }

  async function handleOpenLink(url: string) {
    if (!window.electronAPI?.xray) {
      setError(ELECTRON_API_UNAVAILABLE)
      return false
    }

    try {
      return await window.electronAPI.xray.openLink(url)
    } catch {
      setError('Не удалось открыть ссылку РМИС.')
      return false
    }
  }

  function resetState() {
    setQuery('')
    setResults([])
    setSelectedPatient(null)
    setStudies([])
    setLastSubmittedQuery('')
    setLoading(false)
    setIsSaving(false)
    setIsDeleting(false)
    setStudiesLoading(false)
    setIsSavingStudy(false)
    setDeletingStudyId(null)
    setError('')
  }

  return {
    query,
    setQuery,
    results,
    selectedPatient,
    studies,
    lastSubmittedQuery,
    loading,
    isSaving,
    isDeleting,
    studiesLoading,
    isSavingStudy,
    deletingStudyId,
    error,
    handleSearch,
    handleAddPatient,
    handleUpdatePatient,
    handleSelectPatient,
    handleDeletePatient,
    handleOpenLink,
    handleAddStudy,
    handleUpdateStudy,
    handleDeleteStudy,
    resetState,
  }
}
