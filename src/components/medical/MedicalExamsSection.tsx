import { useState } from 'react'
import type { Patient } from '../../types/medicalExams'
import type { XRayPatient } from '../../types/xray'
import { formatBirthDate, formatMonthLabel } from '../../utils/date'
import { getPatientClipboardValue } from '../../utils/patient'

interface MedicalExamsSectionProps {
  currentMonthExamCount: number
  monthKey: string
  onMonthChange: (value: string) => void
  patients: Patient[]
  loading: boolean
  error: string
  onSelectPatient: (patient: XRayPatient) => void
  onOpenPatient: () => void
  onOpenLink: (url: string) => Promise<boolean>
  onUpdatePatientRmisUrl: (medicalExamId: number, rmisUrl: string | null) => Promise<boolean>
}

function normalizeBirthDateDigits(value: string) {
  const digits = String(value ?? '').replace(/\D/g, '')
  return digits.length === 8 ? digits : ''
}

export function MedicalExamsSection({
  currentMonthExamCount,
  monthKey,
  onMonthChange,
  patients,
  loading,
  error,
  onSelectPatient,
  onOpenPatient,
  onOpenLink,
  onUpdatePatientRmisUrl,
}: MedicalExamsSectionProps) {
  const [copiedPatientId, setCopiedPatientId] = useState<number | null>(null)
  const [editingPatientId, setEditingPatientId] = useState<number | null>(null)
  const [rmisDraft, setRmisDraft] = useState('')
  const [savingPatientId, setSavingPatientId] = useState<number | null>(null)

  async function handleOpenPatient(patient: Patient) {
    if (!window.electronAPI?.xray?.searchPatients) {
      return
    }

    const [lastName = '', firstName = '', patronymic = ''] = String(patient.fullName ?? '')
      .trim()
      .split(/\s+/)
    const birthDateDigits = normalizeBirthDateDigits(patient.birthDate)
    const searchQuery = [lastName, firstName, patronymic, birthDateDigits].filter(Boolean).join(' ')

    try {
      const results = await window.electronAPI.xray.searchPatients(searchQuery)
      const matchedPatient =
        results.find((candidate) => {
          if (patient.xrayPatientId && candidate.id === patient.xrayPatientId) {
            return true
          }

          return (
            candidate.lastName === lastName &&
            candidate.firstName === firstName &&
            candidate.patronymic === patronymic &&
            normalizeBirthDateDigits(candidate.birthDate) === birthDateDigits
          )
        }) ?? null

      if (!matchedPatient) {
        return
      }

      onSelectPatient(matchedPatient)
      onOpenPatient()
    } catch {
      // Keep journal interactive even when card open fails.
    }
  }

  async function handleCopyPatientKey(patient: Patient) {
    try {
      await navigator.clipboard.writeText(getPatientClipboardValue(patient.fullName, patient.birthDate))
      setCopiedPatientId(patient.id)
      window.setTimeout(() => {
        setCopiedPatientId((currentId) => (currentId === patient.id ? null : currentId))
      }, 1400)
    } catch {}
  }

  async function handleSaveRmis(patient: Patient) {
    setSavingPatientId(patient.id)
    try {
      const updated = await onUpdatePatientRmisUrl(patient.id, rmisDraft.trim() || null)
      if (!updated) {
        return
      }
      setEditingPatientId(null)
      setRmisDraft('')
    } finally {
      setSavingPatientId(null)
    }
  }

  return (
    <section className="medical-layout medical-layout-list-only">
      <div className="content-card list-card">
        <div className="list-head">
          <div>
            <p className="section-kicker">Список</p>
            <h3>{formatMonthLabel(monthKey)}</h3>
            <label className="month-picker inline-month-picker">
              <span>Месяц</span>
              <input type="month" value={monthKey} onChange={(event) => onMonthChange(event.target.value)} />
            </label>
          </div>

          <div style={{ display: 'grid', gap: '8px', justifyItems: 'end' }}>
            <div className="panel-counter" title="За текущий месяц">
              {currentMonthExamCount}
            </div>
            <div className="patient-count">
              {loading ? 'Загрузка...' : `${patients.length} пациентов`}
            </div>
          </div>
        </div>

        {error ? <div className="state-banner error-banner">{error}</div> : null}

        {!loading && !error && patients.length === 0 ? (
          <div className="empty-state">За выбранный месяц пациентов пока нет.</div>
        ) : null}

        {patients.length > 0 ? (
          <div className="xray-journal-list">
            {patients.map((patient) => {
              const isEditing = editingPatientId === patient.id

              return (
                <article key={patient.id} className="xray-journal-item xray-fl-journal-item">
                  <div className="xray-journal-item-head">
                    <div className="xray-fl-journal-patient-line">
                      <button
                        type="button"
                        className="xray-fl-journal-copy-button"
                        onClick={() => {
                          void handleOpenPatient(patient)
                        }}
                        aria-label="Открыть карточку пациента"
                        title="Открыть карточку пациента"
                      >
                        <svg viewBox="0 0 20 20" aria-hidden="true">
                          <path
                            d="M10 3.25a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                          />
                          <path
                            d="M4.5 16.25a5.5 5.5 0 0 1 11 0"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                          />
                        </svg>
                      </button>

                      <strong
                        className={`xray-fl-journal-name${patient.rmisUrl ? ' has-link' : ''}`}
                        onClick={() => {
                          if (patient.rmisUrl) {
                            void onOpenLink(patient.rmisUrl)
                          }
                        }}
                        role={patient.rmisUrl ? 'button' : undefined}
                        tabIndex={patient.rmisUrl ? 0 : undefined}
                        onKeyDown={(event) => {
                          if (patient.rmisUrl && (event.key === 'Enter' || event.key === ' ')) {
                            event.preventDefault()
                            void onOpenLink(patient.rmisUrl)
                          }
                        }}
                      >
                        {patient.fullName}
                      </strong>

                      <span className="xray-fl-journal-birth-date">{formatBirthDate(patient.birthDate)}</span>

                      <button
                        type="button"
                        className={`xray-fl-journal-copy-button${copiedPatientId === patient.id ? ' is-copied' : ''}`}
                        onClick={() => {
                          void handleCopyPatientKey(patient)
                        }}
                        aria-label="Скопировать ключ пациента"
                        title="Скопировать ключ пациента"
                      >
                        {copiedPatientId === patient.id ? (
                          <svg viewBox="0 0 20 20" aria-hidden="true">
                            <path
                              d="M4.5 10.5 8 14l7.5-8"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path
                              d="M8 3a2 2 0 0 0-2 2v10h2V5h8V3H8Zm3 4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-8Zm0 2h8v10h-8V9Z"
                              fill="currentColor"
                            />
                          </svg>
                        )}
                      </button>

                      <button
                        type="button"
                        className="xray-fl-journal-add-button"
                        onClick={() => {
                          setEditingPatientId(patient.id)
                          setRmisDraft(patient.rmisUrl ?? '')
                        }}
                        aria-label={patient.rmisUrl ? 'Изменить РМИС ссылку' : 'Добавить РМИС ссылку'}
                        title={patient.rmisUrl ? 'Изменить РМИС ссылку' : 'Добавить РМИС ссылку'}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="xray-fl-journal-rmis-editor">
                      <input
                        type="url"
                        className="input"
                        value={rmisDraft}
                        onChange={(event) => setRmisDraft(event.target.value)}
                        placeholder="Добавить РМИС ссылку"
                      />
                      <button
                        type="button"
                        className="primary-button"
                        onClick={() => {
                          void handleSaveRmis(patient)
                        }}
                        disabled={savingPatientId === patient.id}
                      >
                        {savingPatientId === patient.id ? 'Сохраняю...' : 'Сохранить'}
                      </button>
                    </div>
                  ) : null}
                </article>
              )
            })}
          </div>
        ) : null}
      </div>
    </section>
  )
}
