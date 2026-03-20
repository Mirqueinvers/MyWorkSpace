import type { Reminder } from '../types/reminders'

export function getCurrentMonthKey(date = new Date()): string {
  return date.toISOString().slice(0, 7)
}

export function getCurrentDateDigits(date = new Date()): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = String(date.getFullYear())

  return `${day}${month}${year}`
}

export function getCurrentDayOfMonth(date = new Date()): number {
  return date.getDate()
}

export function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number)

  return new Intl.DateTimeFormat('ru-RU', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, 1))
}

export function formatPatientCreatedAt(value: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function formatStoredDate(value: string): string {
  if (/^\d{8}$/.test(value)) {
    return formatBirthDate(value)
  }

  const parsedDate = new Date(value)

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Не указана'
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(parsedDate)
}

export function formatBirthDate(value: string): string {
  if (!/^\d{8}$/.test(value)) {
    return 'Не указана'
  }

  return `${value.slice(0, 2)}.${value.slice(2, 4)}.${value.slice(4, 8)}`
}

export function formatDateRange(startDate: string, endDate: string): string {
  return `${formatBirthDate(startDate)} - ${formatBirthDate(endDate)}`
}

function parseDateDigits(value: string | null): Date | null {
  if (!value || !/^\d{8}$/.test(value)) {
    return null
  }

  const day = Number(value.slice(0, 2))
  const month = Number(value.slice(2, 4))
  const year = Number(value.slice(4, 8))
  const date = new Date(year, month - 1, day)

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }

  return date
}

export function isReminderVisibleOnDate(
  reminder: Reminder,
  currentDateDigits: string,
  currentDayOfMonth: number,
): boolean {
  const currentDate = parseDateDigits(currentDateDigits)
  const reminderDate = parseDateDigits(reminder.reminderDate)

  if (reminder.recurrence === 'weekly' && reminderDate && currentDate) {
    return reminderDate.getDay() === currentDate.getDay()
  }

  if (reminder.recurrence === 'monthly') {
    if (reminder.recurrenceDay !== null) {
      return reminder.recurrenceDay === currentDayOfMonth
    }

    return reminderDate?.getDate() === currentDayOfMonth
  }

  if (reminder.recurrence === 'yearly' && reminderDate && currentDate) {
    return (
      reminderDate.getDate() === currentDate.getDate() &&
      reminderDate.getMonth() === currentDate.getMonth()
    )
  }

  return reminder.reminderDate === null || reminder.reminderDate === currentDateDigits
}

export function formatReminderSchedule(reminder: Reminder): string {
  if (reminder.recurrence === 'weekly' && reminder.reminderDate) {
    return `Каждую неделю с даты ${formatBirthDate(reminder.reminderDate)}`
  }

  if (reminder.recurrence === 'monthly') {
    const day = reminder.recurrenceDay ?? Number(reminder.reminderDate?.slice(0, 2) ?? '')
    if (Number.isInteger(day) && day >= 1 && day <= 31) {
      return `Каждый месяц ${day}-го числа`
    }
  }

  if (reminder.recurrence === 'yearly' && reminder.reminderDate) {
    return `Каждый год ${formatBirthDate(reminder.reminderDate)}`
  }

  if (reminder.reminderDate) {
    return `На ${formatBirthDate(reminder.reminderDate)}`
  }

  return 'Без даты'
}
