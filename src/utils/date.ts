export function getCurrentMonthKey(date = new Date()): string {
  return date.toISOString().slice(0, 7)
}

export function getCurrentDateDigits(date = new Date()): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = String(date.getFullYear())

  return `${day}${month}${year}`
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
