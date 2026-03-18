import { useEffect, useRef } from 'react'
import type { FormEvent } from 'react'
import { normalizeBirthDateInput } from '../../utils/patient'

interface MedicalExamsFormProps {
  currentMonthExamCount: number
  monthKey: string
  onMonthChange: (value: string) => void
  patientName: string
  birthDate: string
  onPatientNameChange: (value: string) => void
  onBirthDateChange: (value: string) => void
  onAddPatient: (event: FormEvent<HTMLFormElement>) => void | Promise<void>
  isSaving: boolean
  patientNameFocusKey?: number
}

export function MedicalExamsForm({
  currentMonthExamCount,
  monthKey,
  onMonthChange,
  patientName,
  birthDate,
  onPatientNameChange,
  onBirthDateChange,
  onAddPatient,
  isSaving,
  patientNameFocusKey = 0,
}: MedicalExamsFormProps) {
  const patientNameInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (patientNameFocusKey > 0) {
      patientNameInputRef.current?.focus()
    }
  }, [patientNameFocusKey])

  return (
    <div className="content-card form-card">
      <div className="section-head">
        <div>
          <p className="section-kicker">Мед осмотры</p>
        </div>
        <div
          className="panel-counter"
          aria-label="Количество медосмотров за текущий месяц"
          title="Количество медосмотров за текущий месяц"
        >
          {currentMonthExamCount}
        </div>
      </div>

      <label className="month-picker inline-month-picker">
        <span>Месяц</span>
        <input
          type="month"
          value={monthKey}
          onChange={(event) => onMonthChange(event.target.value)}
        />
      </label>

      <form
        className="patient-form"
        onSubmit={(event) => {
          void onAddPatient(event)
        }}
      >
        <label className="field field-wide">
          <span>Пациент</span>
          <input
            ref={patientNameInputRef}
            type="text"
            value={patientName}
            onChange={(event) => onPatientNameChange(event.target.value)}
            placeholder="Введите ФИО пациента"
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

        <button type="submit" className="primary-button" disabled={isSaving}>
          {isSaving ? 'Сохранение...' : 'Добавить пациента'}
        </button>
      </form>
    </div>
  )
}
