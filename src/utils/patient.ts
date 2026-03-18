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

  const formattedLastName =
    lastName.charAt(0).toUpperCase() + lastName.slice(1)

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

export function getPatientClipboardValue(
  fullName: string,
  birthDate: string,
): string {
  const normalizedName = String(fullName ?? '').trim()
  const [lastName = '', initialsPart = ''] = normalizedName.split(/\s+/, 2)

  const lastNameInitial = lastName.slice(0, 1).toLowerCase()
  const initials = initialsPart.replace(/[^A-Za-zА-Яа-яЁё]/g, '').toLowerCase()
  const normalizedBirthDate = String(birthDate ?? '').replace(/\D/g, '').slice(0, 8)

  return `${lastNameInitial}${initials}${normalizedBirthDate}`
}
