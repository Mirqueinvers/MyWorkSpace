import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { Reminder } from '../types/reminders'
import { normalizeBirthDateInput } from '../utils/patient'

const ELECTRON_API_UNAVAILABLE =
  'API Electron недоступно. Откройте экран через dev:electron.'
const LOAD_ERROR = 'Не удалось загрузить напоминания из базы SQLite.'
const SAVE_ERROR = 'Не удалось сохранить напоминание в SQLite.'
const DELETE_ERROR = 'Не удалось удалить напоминание.'

export function useReminders() {
  const [text, setText] = useState('')
  const [reminderDate, setReminderDate] = useState('')
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [deletingReminderId, setDeletingReminderId] = useState<number | null>(null)

  useEffect(() => {
    let isCancelled = false

    async function loadReminders() {
      if (!window.electronAPI?.reminders) {
        setError(ELECTRON_API_UNAVAILABLE)
        setReminders([])
        return
      }

      setLoading(true)
      setError('')

      try {
        const items = await window.electronAPI.reminders.list()

        if (!isCancelled) {
          setReminders(items)
        }
      } catch {
        if (!isCancelled) {
          setReminders([])
          setError(LOAD_ERROR)
        }
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    void loadReminders()

    return () => {
      isCancelled = true
    }
  }, [])

  async function handleAddReminder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const normalizedText = text.trim()
    if (!normalizedText) {
      setError('Введите текст напоминания.')
      return
    }

    if (reminderDate && !/^\d{8}$/.test(reminderDate)) {
      setError('Введите дату напоминания в формате ДДММГГГГ.')
      return
    }

    if (!window.electronAPI?.reminders) {
      setError(ELECTRON_API_UNAVAILABLE)
      return
    }

    setIsSaving(true)
    setError('')

    try {
      const createdReminder = await window.electronAPI.reminders.add({
        text: normalizedText,
        reminderDate: reminderDate || null,
      })

      setReminders((currentReminders) => [createdReminder, ...currentReminders])
      setText('')
      setReminderDate('')
    } catch {
      setError(SAVE_ERROR)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDeleteReminder(id: number) {
    if (!window.electronAPI?.reminders) {
      setError(ELECTRON_API_UNAVAILABLE)
      return
    }

    setDeletingReminderId(id)
    setError('')

    try {
      await window.electronAPI.reminders.delete(id)
      setReminders((currentReminders) =>
        currentReminders.filter((reminder) => reminder.id !== id),
      )
    } catch {
      setError(DELETE_ERROR)
    } finally {
      setDeletingReminderId(null)
    }
  }

  return {
    text,
    setText,
    reminderDate,
    setReminderDate: (value: string) => setReminderDate(normalizeBirthDateInput(value)),
    reminders,
    loading,
    error,
    isSaving,
    deletingReminderId,
    handleAddReminder,
    handleDeleteReminder,
  }
}
