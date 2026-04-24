export function formatPatientName(value: string): string {
  const normalized = String(value ?? '')
    .trim()
    .replace(/\s+/g, '')
    .toLowerCase()

  if (!normalized) {
    return ''
  }

  if (normalized.length <= 2) {
    return normalized.charAt(0).toUpperCase() + normalized.slice(1)
  }

  const lastName = normalized.slice(0, -2)
  const initialsSource = normalized.slice(-2)

  const formattedLastName = lastName.charAt(0).toUpperCase() + lastName.slice(1)

  const initials = initialsSource
    .slice(0, 2)
    .split('')
    .map((letter) => `${letter.toUpperCase()}.`)
    .join('')

  return `${formattedLastName}${initials ? ` ${initials}` : ''}`
}

export function normalizePersonNameInput(value: string): string {
  const normalized = String(value ?? '').replace(/^\s+/, '')

  if (!normalized) {
    return ''
  }

  return normalized.charAt(0).toLocaleUpperCase('ru-RU') + normalized.slice(1)
}

export function normalizeBirthDateInput(value: string): string {
  return value.replace(/\D/g, '').slice(0, 8)
}

export function getPatientClipboardValue(fullName: string, birthDate: string): string {
  const normalizedName = String(fullName ?? '').trim()
  const nameParts = normalizedName
    .replace(/\./g, ' ')
    .split(/\s+/)
    .filter(Boolean)
  const [lastName = '', firstNameOrInitials = '', patronymic = ''] = nameParts
  const secondPartLetters = firstNameOrInitials.replace(/[^A-Za-zА-Яа-яЁё]/g, '')

  const lastNameInitial = lastName.slice(0, 1).toLocaleLowerCase('ru-RU')
  const firstNameInitial = (
    firstNameOrInitials.slice(0, 1) ||
    secondPartLetters.slice(0, 1)
  ).toLocaleLowerCase('ru-RU')
  const patronymicInitial = (
    patronymic.slice(0, 1) ||
    secondPartLetters.slice(1, 2)
  ).toLocaleLowerCase('ru-RU')
  const normalizedBirthDate = String(birthDate ?? '').replace(/\D/g, '').slice(0, 8)

  return `${lastNameInitial}${firstNameInitial}${patronymicInitial}${normalizedBirthDate}`
}
