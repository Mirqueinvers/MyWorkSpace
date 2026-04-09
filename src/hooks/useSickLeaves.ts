import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { SickLeave } from '../types/sickLeaves'

const ELECTRON_API_UNAVAILABLE =
  'API Electron недоступно. Откройте экран через dev:electron.'
const LOAD_ERROR = 'Не удалось загрузить больничные листы из базы SQLite.'
const SAVE_ERROR = 'Не удалось сохранить больничный лист в SQLite.'
const SAVE_PERIOD_ERROR = 'Не удалось добавить период больничного листа.'
const CLOSE_ERROR = 'Не удалось закрыть больничный лист.'
const DELETE_ERROR = 'Не удалось удалить больничный лист.'

function dateDigitsToNumber(value: string): number {
  return Number(`${value.slice(4, 8)}${value.slice(2, 4)}${value.slice(0, 2)}`)
}

function isDateRangeValid(startDate: string, endDate: string): boolean {
  return dateDigitsToNumber(startDate) <= dateDigitsToNumber(endDate)
}

function getErrorCode(error: unknown): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message
  }

  return ''
}

function getAddSickLeaveErrorMessage(error: unknown): string {
  const errorCode = getErrorCode(error)

  switch (errorCode) {
    case 'LAST_NAME_REQUIRED':
      return 'Введите фамилию пациента.'
    case 'FIRST_NAME_REQUIRED':
      return 'Введите имя пациента.'
    case 'PATRONYMIC_REQUIRED':
      return 'Введите отчество пациента.'
    case 'DATE_INVALID':
      return 'Проверьте даты: используйте формат ДДММГГГГ.'
    case 'DIAGNOSIS_REQUIRED':
      return 'Введите диагноз.'
    case 'PERIOD_RANGE_INVALID':
      return 'Дата окончания больничного не может быть раньше даты открытия.'
    default:
      return SAVE_ERROR
  }
}

function getAddPeriodErrorMessage(error: unknown): string {
  const errorCode = getErrorCode(error)

  switch (errorCode) {
    case 'DATE_INVALID':
      return 'Проверьте даты продления: используйте формат ДДММГГГГ.'
    case 'PERIOD_RANGE_INVALID':
      return 'Дата окончания периода не может быть раньше даты начала.'
    case 'SICK_LEAVE_NOT_FOUND':
      return 'Больничный лист не найден.'
    case 'SICK_LEAVE_ALREADY_CLOSED':
      return 'Нельзя продлить уже закрытый больничный лист.'
    default:
      return SAVE_PERIOD_ERROR
  }
}

function getUpdatePeriodErrorMessage(error: unknown): string {
  const errorCode = getErrorCode(error)

  switch (errorCode) {
    case 'DATE_INVALID':
      return 'Введите даты периода в формате ДДММГГГГ.'
    case 'PERIOD_RANGE_INVALID':
      return 'Дата окончания периода не может быть раньше даты начала.'
    case 'SICK_LEAVE_NOT_FOUND':
      return 'Больничный лист не найден.'
    case 'SICK_LEAVE_PERIOD_NOT_FOUND':
      return 'Период больничного листа не найден.'
    case 'SICK_LEAVE_ALREADY_CLOSED':
      return 'Нельзя изменить период уже закрытого больничного листа.'
    default:
      return 'Не удалось изменить период больничного листа.'
  }
}

function getCloseSickLeaveErrorMessage(error: unknown): string {
  const errorCode = getErrorCode(error)

  switch (errorCode) {
    case 'DATE_INVALID':
      return 'Введите дату закрытия в формате ДДММГГГГ.'
    case 'SICK_LEAVE_NOT_FOUND':
      return 'Больничный лист не найден.'
    default:
      return CLOSE_ERROR
  }
}

function getDeleteSickLeaveErrorMessage(error: unknown): string {
  const errorCode = getErrorCode(error)

  switch (errorCode) {
    case 'SICK_LEAVE_NOT_FOUND':
      return 'Больничный лист не найден.'
    default:
      return DELETE_ERROR
  }
}

export function useSickLeaves() {
  const [lastName, setLastName] = useState('')
  const [firstName, setFirstName] = useState('')
  const [patronymic, setPatronymic] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [periodStartDate, setPeriodStartDate] = useState('')
  const [periodEndDate, setPeriodEndDate] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [sickLeaves, setSickLeaves] = useState<SickLeave[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [savingPeriodLeaveId, setSavingPeriodLeaveId] = useState<number | null>(null)
  const [closingLeaveId, setClosingLeaveId] = useState<number | null>(null)
  const [deletingLeaveId, setDeletingLeaveId] = useState<number | null>(null)
  const [lastNameFocusKey, setLastNameFocusKey] = useState(0)

  useEffect(() => {
    let isCancelled = false

    async function loadSickLeaves() {
      if (!window.electronAPI?.sickLeaves) {
        setError(ELECTRON_API_UNAVAILABLE)
        setSickLeaves([])
        return
      }

      setLoading(true)
      setError('')

      try {
        const items = await window.electronAPI.sickLeaves.list()

        if (!isCancelled) {
          setSickLeaves(items)
        }
      } catch {
        if (!isCancelled) {
          setSickLeaves([])
          setError(LOAD_ERROR)
        }
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    void loadSickLeaves()

    return () => {
      isCancelled = true
    }
  }, [])

  async function handleAddSickLeave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!lastName.trim()) {
      setError('Введите фамилию пациента.')
      return
    }

    if (!firstName.trim()) {
      setError('Введите имя пациента.')
      return
    }

    if (!patronymic.trim()) {
      setError('Введите отчество пациента.')
      return
    }

    if (!/^\d{8}$/.test(birthDate)) {
      setError('Введите дату рождения в формате ДДММГГГГ.')
      return
    }

    if (!/^\d{8}$/.test(periodStartDate) || !/^\d{8}$/.test(periodEndDate)) {
      setError('Введите период открытия в формате ДДММГГГГ.')
      return
    }

    if (!isDateRangeValid(periodStartDate, periodEndDate)) {
      setError('Дата окончания больничного не может быть раньше даты открытия.')
      return
    }

    if (!diagnosis.trim()) {
      setError('Введите диагноз.')
      return
    }

    if (!window.electronAPI?.sickLeaves) {
      setError(ELECTRON_API_UNAVAILABLE)
      return
    }

    setIsSaving(true)
    setError('')

    try {
      const createdSickLeave = await window.electronAPI.sickLeaves.add({
        lastName,
        firstName,
        patronymic,
        birthDate,
        diagnosis,
        startDate: periodStartDate,
        endDate: periodEndDate,
      })

      setSickLeaves((currentLeaves) => [createdSickLeave, ...currentLeaves])
      setLastName('')
      setFirstName('')
      setPatronymic('')
      setBirthDate('')
      setPeriodStartDate('')
      setPeriodEndDate('')
      setDiagnosis('')
      setLastNameFocusKey((currentKey) => currentKey + 1)
    } catch (error) {
      setError(getAddSickLeaveErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleAddPeriod(
    sickLeaveId: number,
    startDate: string,
    endDate: string,
  ) {
    if (!/^\d{8}$/.test(startDate) || !/^\d{8}$/.test(endDate)) {
      setError('Введите период продления в формате ДДММГГГГ.')
      return false
    }

    if (!isDateRangeValid(startDate, endDate)) {
      setError('Дата окончания периода не может быть раньше даты начала.')
      return false
    }

    if (!window.electronAPI?.sickLeaves) {
      setError(ELECTRON_API_UNAVAILABLE)
      return false
    }

    setSavingPeriodLeaveId(sickLeaveId)
    setError('')

    try {
      const createdPeriod = await window.electronAPI.sickLeaves.addPeriod({
        sickLeaveId,
        startDate,
        endDate,
      })

      setSickLeaves((currentLeaves) =>
        currentLeaves.map((sickLeave) =>
          sickLeave.id === sickLeaveId
            ? {
                ...sickLeave,
                periods: [...sickLeave.periods, createdPeriod],
              }
            : sickLeave,
        ),
      )

      return true
    } catch (error) {
      setError(getAddPeriodErrorMessage(error))
      return false
    } finally {
      setSavingPeriodLeaveId(null)
    }
  }

  async function handleUpdatePeriod(
    sickLeaveId: number,
    periodId: number,
    startDate: string,
    endDate: string,
  ) {
    if (!/^\d{8}$/.test(startDate) || !/^\d{8}$/.test(endDate)) {
      setError('Введите период продления в формате ДДММГГГГ.')
      return false
    }

    if (!isDateRangeValid(startDate, endDate)) {
      setError('Дата окончания периода не может быть раньше даты начала.')
      return false
    }

    if (!window.electronAPI?.sickLeaves) {
      setError(ELECTRON_API_UNAVAILABLE)
      return false
    }

    setSavingPeriodLeaveId(sickLeaveId)
    setError('')

    try {
      const updatedPeriod = await window.electronAPI.sickLeaves.updatePeriod({
        id: periodId,
        sickLeaveId,
        startDate,
        endDate,
      })

      setSickLeaves((currentLeaves) =>
        currentLeaves.map((sickLeave) =>
          sickLeave.id === sickLeaveId
            ? {
                ...sickLeave,
                periods: sickLeave.periods.map((period) =>
                  period.id === periodId ? updatedPeriod : period,
                ),
              }
            : sickLeave,
        ),
      )

      return true
    } catch (error) {
      setError(getUpdatePeriodErrorMessage(error))
      return false
    } finally {
      setSavingPeriodLeaveId(null)
    }
  }

  async function handleCloseSickLeave(id: number, closeDate: string) {
    if (!/^\d{8}$/.test(closeDate)) {
      setError('Введите дату закрытия в формате ДДММГГГГ.')
      return
    }

    if (!window.electronAPI?.sickLeaves) {
      setError(ELECTRON_API_UNAVAILABLE)
      return
    }

    setClosingLeaveId(id)
    setError('')

    try {
      const closedSickLeave = await window.electronAPI.sickLeaves.close({
        id,
        closeDate,
      })

      setSickLeaves((currentLeaves) =>
        currentLeaves.map((sickLeave) =>
          sickLeave.id === id ? closedSickLeave : sickLeave,
        ),
      )
    } catch (error) {
      setError(getCloseSickLeaveErrorMessage(error))
    } finally {
      setClosingLeaveId(null)
    }
  }

  async function handleDeleteSickLeave(id: number) {
    if (!window.electronAPI?.sickLeaves) {
      setError(ELECTRON_API_UNAVAILABLE)
      return
    }

    setDeletingLeaveId(id)
    setError('')

    try {
      await window.electronAPI.sickLeaves.delete(id)
      setSickLeaves((currentLeaves) =>
        currentLeaves.filter((sickLeave) => sickLeave.id !== id),
      )
    } catch (error) {
      setError(getDeleteSickLeaveErrorMessage(error))
    } finally {
      setDeletingLeaveId(null)
    }
  }

  const openSickLeavesCount = sickLeaves.filter(
    (sickLeave) => sickLeave.status === 'open',
  ).length

  return {
    lastName,
    setLastName,
    firstName,
    setFirstName,
    patronymic,
    setPatronymic,
    birthDate,
    setBirthDate,
    periodStartDate,
    setPeriodStartDate,
    periodEndDate,
    setPeriodEndDate,
    diagnosis,
    setDiagnosis,
    sickLeaves,
    loading,
    error,
    isSaving,
    savingPeriodLeaveId,
    closingLeaveId,
    deletingLeaveId,
    lastNameFocusKey,
    openSickLeavesCount,
    handleAddSickLeave,
    handleAddPeriod,
    handleUpdatePeriod,
    handleCloseSickLeave,
    handleDeleteSickLeave,
  }
}
