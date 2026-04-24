import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { Patient } from '../types/medicalExams'
import { formatPatientName } from '../utils/patient'

const ELECTRON_API_UNAVAILABLE =
  'API Electron недоступно. Откройте экран через dev:electron.'
const LOAD_ERROR = 'Не удалось загрузить пациентов из базы SQLite.'
const SAVE_ERROR = 'Не удалось сохранить пациента в SQLite.'
const DELETE_ERROR = 'Не удалось удалить пациента из SQLite.'
const UPDATE_RMIS_ERROR = 'Не удалось сохранить ссылку РМИС.'

export function useMedicalExams(currentMonthKey: string) {
  const [monthKey, setMonthKey] = useState(currentMonthKey)
  const [patientName, setPatientName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [patientNameFocusKey, setPatientNameFocusKey] = useState(0)
  const [patients, setPatients] = useState<Patient[]>([])
  const [patientsLoading, setPatientsLoading] = useState(false)
  const [patientsError, setPatientsError] = useState('')
  const [isSavingPatient, setIsSavingPatient] = useState(false)
  const [deletingPatientId, setDeletingPatientId] = useState<number | null>(null)
  const [currentMonthExamCount, setCurrentMonthExamCount] = useState(0)

  useEffect(() => {
    let isCancelled = false

    async function loadPatients() {
      if (!window.electronAPI?.medicalExams) {
        setPatientsError(ELECTRON_API_UNAVAILABLE)
        setPatients([])
        return
      }

      setPatientsLoading(true)
      setPatientsError('')

      try {
        const items = await window.electronAPI.medicalExams.listPatients(monthKey)

        if (!isCancelled) {
          setPatients(items)
        }
      } catch {
        if (!isCancelled) {
          setPatients([])
          setPatientsError(LOAD_ERROR)
        }
      } finally {
        if (!isCancelled) {
          setPatientsLoading(false)
        }
      }
    }

    void loadPatients()

    return () => {
      isCancelled = true
    }
  }, [monthKey])

  useEffect(() => {
    let isCancelled = false

    async function loadCurrentMonthExamCount() {
      if (!window.electronAPI?.medicalExams) {
        return
      }

      try {
        const total = await window.electronAPI.medicalExams.countPatients(currentMonthKey)

        if (!isCancelled) {
          setCurrentMonthExamCount(total)
        }
      } catch {
        if (!isCancelled) {
          setCurrentMonthExamCount(0)
        }
      }
    }

    void loadCurrentMonthExamCount()

    return () => {
      isCancelled = true
    }
  }, [currentMonthKey])

  async function handleAddPatient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formattedName = formatPatientName(patientName)
    if (!formattedName) {
      setPatientsError('Введите ФИО пациента, чтобы добавить запись.')
      return
    }

    if (!/^\d{8}$/.test(birthDate)) {
      setPatientsError('Введите дату рождения в формате ДДММГГГГ.')
      return
    }

    if (!window.electronAPI?.medicalExams) {
      setPatientsError(ELECTRON_API_UNAVAILABLE)
      return
    }

    setIsSavingPatient(true)
    setPatientsError('')

    try {
      const createdPatient = await window.electronAPI.medicalExams.addPatient({
        fullName: formattedName,
        birthDate,
        monthKey,
      })

      setPatients((currentPatients) => [createdPatient, ...currentPatients])
      setPatientName('')
      setBirthDate('')
      setPatientNameFocusKey((currentKey) => currentKey + 1)

      if (monthKey === currentMonthKey) {
        setCurrentMonthExamCount((count) => count + 1)
      }
    } catch {
      setPatientsError(SAVE_ERROR)
    } finally {
      setIsSavingPatient(false)
    }
  }

  async function handleDeletePatient(id: number) {
    if (!window.electronAPI?.medicalExams) {
      setPatientsError(ELECTRON_API_UNAVAILABLE)
      return
    }

    const patientToDelete = patients.find((patient) => patient.id === id)

    setDeletingPatientId(id)
    setPatientsError('')

    try {
      await window.electronAPI.medicalExams.deletePatient(id)
      setPatients((currentPatients) =>
        currentPatients.filter((patient) => patient.id !== id),
      )

      if (patientToDelete?.monthKey === currentMonthKey) {
        setCurrentMonthExamCount((count) => Math.max(0, count - 1))
      }
    } catch {
      setPatientsError(DELETE_ERROR)
    } finally {
      setDeletingPatientId(null)
    }
  }

  async function handleUpdatePatientRmisUrl(medicalExamId: number, rmisUrl: string | null) {
    if (!window.electronAPI?.medicalExams?.updateRmisUrl) {
      setPatientsError(ELECTRON_API_UNAVAILABLE)
      return false
    }

    setPatientsError('')

    try {
      const updated = await window.electronAPI.medicalExams.updateRmisUrl({
        medicalExamId,
        rmisUrl,
      })

      if (!updated) {
        setPatientsError(UPDATE_RMIS_ERROR)
        return false
      }

      setPatients((currentPatients) =>
        currentPatients.map((patient) =>
          patient.id === medicalExamId ? { ...patient, rmisUrl } : patient,
        ),
      )

      return true
    } catch {
      setPatientsError(UPDATE_RMIS_ERROR)
      return false
    }
  }

  return {
    monthKey,
    setMonthKey,
    patientName,
    setPatientName,
    birthDate,
    setBirthDate,
    patientNameFocusKey,
    patients,
    patientsLoading,
    patientsError,
    isSavingPatient,
    deletingPatientId,
    currentMonthExamCount,
    handleAddPatient,
    handleDeletePatient,
    handleUpdatePatientRmisUrl,
  }
}
