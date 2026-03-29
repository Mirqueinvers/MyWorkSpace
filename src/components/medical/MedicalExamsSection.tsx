import type { FormEvent } from 'react'
import type { Patient } from '../../types/medicalExams'
import {
  formatBirthDate,
  formatMonthLabel,
  formatPatientCreatedAt,
} from '../../utils/date'
import { getPatientClipboardValue } from '../../utils/patient'
import { MedicalExamsForm } from './MedicalExamsForm'

interface MedicalExamsSectionProps {
  currentMonthExamCount: number
  monthKey: string
  onMonthChange: (value: string) => void
  patients: Patient[]
  loading: boolean
  error: string
  patientName: string
  birthDate: string
  onPatientNameChange: (value: string) => void
  onBirthDateChange: (value: string) => void
  onAddPatient: (event: FormEvent<HTMLFormElement>) => void | Promise<void>
  onDeletePatient: (id: number) => void | Promise<void>
  isSaving: boolean
  deletingPatientId: number | null
  patientNameFocusKey: number
}

export function MedicalExamsSection({
  currentMonthExamCount,
  monthKey,
  onMonthChange,
  patients,
  loading,
  error,
  patientName,
  birthDate,
  onPatientNameChange,
  onBirthDateChange,
  onAddPatient,
  onDeletePatient,
  isSaving,
  deletingPatientId,
  patientNameFocusKey,
}: MedicalExamsSectionProps) {
  async function handleCopyPatient(patient: Patient) {
    const value = getPatientClipboardValue(patient.fullName, patient.birthDate)
    await navigator.clipboard.writeText(value)
  }

  return (
    <section className="medical-layout">
      <MedicalExamsForm
        currentMonthExamCount={currentMonthExamCount}
        monthKey={monthKey}
        onMonthChange={onMonthChange}
        patientName={patientName}
        birthDate={birthDate}
        onPatientNameChange={onPatientNameChange}
        onBirthDateChange={onBirthDateChange}
        onAddPatient={onAddPatient}
        isSaving={isSaving}
        patientNameFocusKey={patientNameFocusKey}
      />

      <div className="content-card list-card">
        <div className="list-head">
          <div>
            <p className="section-kicker">Список</p>
            <h3>{formatMonthLabel(monthKey)}</h3>
          </div>
          <div className="patient-count">
            {loading ? 'Загрузка...' : `${patients.length} пациентов`}
          </div>
        </div>

        {error ? <div className="state-banner error-banner">{error}</div> : null}

        {!loading && !error && patients.length === 0 ? (
          <div className="empty-state">
            За выбранный месяц пациентов пока нет. Добавьте первого пациента
            через форму слева.
          </div>
        ) : null}

        {patients.length > 0 ? (
          <div className="patient-list">
            {patients.map((patient) => (
              <article
                key={patient.id}
                className="patient-item patient-item-copyable"
                role="button"
                tabIndex={0}
                title="Нажмите, чтобы скопировать сокращение"
                onClick={() => {
                  void handleCopyPatient(patient)
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    void handleCopyPatient(patient)
                  }
                }}
              >
                <div className="patient-main">
                  <div className="patient-name">{patient.fullName}</div>
                  <div className="patient-meta">
                    Дата рождения: {formatBirthDate(patient.birthDate)}
                  </div>
                  <div className="patient-meta">
                    Добавлен: {formatPatientCreatedAt(patient.createdAt)}
                  </div>
                </div>
                <button
                  type="button"
                  className="notes-delete"
                  onClick={(event) => {
                    event.stopPropagation()
                    void onDeletePatient(patient.id)
                  }}
                  disabled={deletingPatientId === patient.id}
                  aria-label="Удалить пациента">
                  {deletingPatientId === patient.id ? '…' : '×'}
                </button>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}
