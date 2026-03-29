import { useEffect, useRef } from 'react'
import type { FormEvent } from 'react'
import {
  normalizeBirthDateInput,
  normalizePersonNameInput,
} from '../../utils/patient'

interface SickLeavesFormProps {
  lastName: string
  firstName: string
  patronymic: string
  birthDate: string
  periodStartDate: string
  periodEndDate: string
  diagnosis: string
  onLastNameChange: (value: string) => void
  onFirstNameChange: (value: string) => void
  onPatronymicChange: (value: string) => void
  onBirthDateChange: (value: string) => void
  onPeriodStartDateChange: (value: string) => void
  onPeriodEndDateChange: (value: string) => void
  onDiagnosisChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>
  isSaving: boolean
  lastNameFocusKey?: number
}

export function SickLeavesForm({
  lastName,
  firstName,
  patronymic,
  birthDate,
  periodStartDate,
  periodEndDate,
  diagnosis,
  onLastNameChange,
  onFirstNameChange,
  onPatronymicChange,
  onBirthDateChange,
  onPeriodStartDateChange,
  onPeriodEndDateChange,
  onDiagnosisChange,
  onSubmit,
  isSaving,
  lastNameFocusKey = 0,
}: SickLeavesFormProps) {
  const lastNameInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (lastNameFocusKey > 0) {
      lastNameInputRef.current?.focus()
    }
  }, [lastNameFocusKey])

  return (
    <div className="content-card form-card">
      <div className="section-head">
        <div>
          <p className="section-kicker">Новый больничный лист</p>
        </div>
      </div>

      <form
        className="patient-form"
        onSubmit={(event) => {
          void onSubmit(event)
        }}
      >
        <label className="field field-wide">
          <span>Фамилия</span>
          <input
            ref={lastNameInputRef}
            type="text"
            value={lastName}
            onChange={(event) =>
              onLastNameChange(normalizePersonNameInput(event.target.value))
            }
            placeholder="Введите фамилию"
          />
        </label>

        <label className="field field-wide">
          <span>Имя</span>
          <input
            type="text"
            value={firstName}
            onChange={(event) =>
              onFirstNameChange(normalizePersonNameInput(event.target.value))
            }
            placeholder="Введите имя"
          />
        </label>

        <label className="field field-wide">
          <span>Отчество</span>
          <input
            type="text"
            value={patronymic}
            onChange={(event) =>
              onPatronymicChange(normalizePersonNameInput(event.target.value))
            }
            placeholder="Введите отчество"
          />
        </label>

        <label className="field field-wide">
          <span>Дата рождения</span>
          <input
            type="text"
            inputMode="numeric"
            value={birthDate}
            onChange={(event) =>
              onBirthDateChange(normalizeBirthDateInput(event.target.value))
            }
            placeholder="ДДММГГГГ"
          />
        </label>

        <div className="period-fields">
          <label className="field field-wide">
            <span>Открыть с</span>
            <input
              type="text"
              inputMode="numeric"
              value={periodStartDate}
              onChange={(event) =>
                onPeriodStartDateChange(normalizeBirthDateInput(event.target.value))
              }
              placeholder="ДДММГГГГ"
            />
          </label>

          <label className="field field-wide">
            <span>по</span>
            <input
              type="text"
              inputMode="numeric"
              value={periodEndDate}
              onChange={(event) =>
                onPeriodEndDateChange(normalizeBirthDateInput(event.target.value))
              }
              placeholder="ДДММГГГГ"
            />
          </label>
        </div>

        <label className="field field-wide">
          <span>Диагноз</span>
          <input
            type="text"
            value={diagnosis}
            onChange={(event) => onDiagnosisChange(event.target.value)}
            placeholder="Введите диагноз"
          />
        </label>

        <button type="submit" className="primary-button" disabled={isSaving}>
          {isSaving ? 'Сохранение...' : 'Добавить больничный лист'}
        </button>
      </form>
    </div>
  )
}
