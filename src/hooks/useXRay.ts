import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type {
  AddXRayStudyPayload,
  UpdateXRayStudyPayload,
  XRayFlJournalEntry,
  XRayPatient,
  XRaySearchResult,
  XRayStudy,
} from '../types/xray'

const ELECTRON_API_UNAVAILABLE =
  'API Electron \u043d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u043d\u043e. \u041e\u0442\u043a\u0440\u043e\u0439\u0442\u0435 \u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u0435 \u0447\u0435\u0440\u0435\u0437 dev:electron.'
const SEARCH_ERROR = '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0432\u044b\u043f\u043e\u043b\u043d\u0438\u0442\u044c \u043f\u043e\u0438\u0441\u043a \u043f\u0430\u0446\u0438\u0435\u043d\u0442\u0430 \u0432 \u0431\u0430\u0437\u0435 X-ray.'
const SAVE_ERROR = '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0441\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c \u043f\u0430\u0446\u0438\u0435\u043d\u0442\u0430 \u0432 \u0431\u0430\u0437\u0435 X-ray.'
const UPDATE_ERROR = '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u043e\u0431\u043d\u043e\u0432\u0438\u0442\u044c \u043a\u0430\u0440\u0442\u043e\u0447\u043a\u0443 \u043f\u0430\u0446\u0438\u0435\u043d\u0442\u0430.'
const DELETE_ERROR = '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0443\u0434\u0430\u043b\u0438\u0442\u044c \u043f\u0430\u0446\u0438\u0435\u043d\u0442\u0430 \u0438\u0437 \u0431\u0430\u0437\u044b X-ray.'
const STUDIES_LOAD_ERROR = '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c \u0438\u0441\u0441\u043b\u0435\u0434\u043e\u0432\u0430\u043d\u0438\u044f \u043f\u0430\u0446\u0438\u0435\u043d\u0442\u0430.'
const FL_STUDIES_LOAD_ERROR = '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c \u0444\u043b\u044e\u043e\u0440\u043e\u0433\u0440\u0430\u0444\u0438\u0438 \u043f\u0430\u0446\u0438\u0435\u043d\u0442\u0430.'
const STUDY_SAVE_ERROR = '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0441\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c \u0438\u0441\u0441\u043b\u0435\u0434\u043e\u0432\u0430\u043d\u0438\u0435.'
const STUDY_DELETE_ERROR = '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0443\u0434\u0430\u043b\u0438\u0442\u044c \u0438\u0441\u0441\u043b\u0435\u0434\u043e\u0432\u0430\u043d\u0438\u0435.'
const OPEN_LINK_ERROR = '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u043e\u0442\u043a\u0440\u044b\u0442\u044c \u0441\u0441\u044b\u043b\u043a\u0443 \u0420\u041c\u0418\u0421.'

export function useXRay() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<XRaySearchResult[]>([])
  const [selectedPatient, setSelectedPatient] = useState<XRayPatient | null>(null)
  const [studies, setStudies] = useState<XRayStudy[]>([])
  const [flStudies, setFlStudies] = useState<XRayFlJournalEntry[]>([])
  const [lastSubmittedQuery, setLastSubmittedQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [studiesLoading, setStudiesLoading] = useState(false)
  const [flStudiesLoading, setFlStudiesLoading] = useState(false)
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

  useEffect(() => {
    let isCancelled = false

    async function loadFlStudies() {
      if (!selectedPatient) {
        setFlStudies([])
        return
      }

      if (!window.electronAPI?.xray) {
        setError(ELECTRON_API_UNAVAILABLE)
        setFlStudies([])
        return
      }

      if (!window.electronAPI.xray.listFlJournalByPatient) {
        setError(ELECTRON_API_UNAVAILABLE)
        setFlStudies([])
        return
      }

      setFlStudiesLoading(true)

      try {
        const items = await window.electronAPI.xray.listFlJournalByPatient({
          lastName: selectedPatient.lastName,
          firstName: selectedPatient.firstName,
          patronymic: selectedPatient.patronymic,
          birthDate: selectedPatient.birthDate,
        })

        if (!isCancelled) {
          setFlStudies(items)
        }
      } catch {
        if (!isCancelled) {
          setFlStudies([])
          setError(FL_STUDIES_LOAD_ERROR)
        }
      } finally {
        if (!isCancelled) {
          setFlStudiesLoading(false)
        }
      }
    }

    void loadFlStudies()

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
    setFlStudies([])

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
      setFlStudies([])
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
        setFlStudies([])
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

  async function handleAddStudy(payload: AddXRayStudyPayload) {
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

  async function handleUpdateStudy(payload: UpdateXRayStudyPayload) {
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
      setError(OPEN_LINK_ERROR)
      return false
    }
  }

  function resetState() {
    setQuery('')
    setResults([])
    setSelectedPatient(null)
    setStudies([])
    setFlStudies([])
    setLastSubmittedQuery('')
    setLoading(false)
    setIsSaving(false)
    setIsDeleting(false)
    setStudiesLoading(false)
    setFlStudiesLoading(false)
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
    flStudies,
    lastSubmittedQuery,
    loading,
    isSaving,
    isDeleting,
    studiesLoading,
    flStudiesLoading,
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
