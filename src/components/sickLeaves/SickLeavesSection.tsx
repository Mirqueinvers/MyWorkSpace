import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { SickLeave } from '../../types/sickLeaves'
import type { XRayPatient } from '../../types/xray'
import {
  formatBirthDate,
  formatDateRange,
  formatPatientCreatedAt,
  formatStoredDate,
} from '../../utils/date'
import { normalizeBirthDateInput } from '../../utils/patient'
import { SickLeavesForm } from './SickLeavesForm'

interface SickLeavesSectionProps {
  lastName: string
  firstName: string
  patronymic: string
  birthDate: string
  periodStartDate: string
  periodEndDate: string
  diagnosis: string
  sickLeaves: SickLeave[]
  loading: boolean
  error: string
  isSaving: boolean
  savingPeriodLeaveId: number | null
  closingLeaveId: number | null
  deletingLeaveId: number | null
  openSickLeavesCount: number
  lastNameFocusKey: number
  onSelectPatient: (patient: XRayPatient) => void
  onOpenPatient: () => void
  onLastNameChange: (value: string) => void
  onFirstNameChange: (value: string) => void
  onPatronymicChange: (value: string) => void
  onBirthDateChange: (value: string) => void
  onPeriodStartDateChange: (value: string) => void
  onPeriodEndDateChange: (value: string) => void
  onDiagnosisChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>
  onAddPeriod: (sickLeaveId: number, startDate: string, endDate: string) => Promise<boolean>
  onCloseSickLeave: (id: number, closeDate: string) => void | Promise<void>
  onDeleteSickLeave: (id: number) => void | Promise<void>
}

interface PeriodDraft {
  startDate: string
  endDate: string
  closeDate: string
}

export function SickLeavesSection({
  lastName,
  firstName,
  patronymic,
  birthDate,
  periodStartDate,
  periodEndDate,
  diagnosis,
  sickLeaves,
  loading,
  error,
  isSaving,
  savingPeriodLeaveId,
  closingLeaveId,
  deletingLeaveId,
  openSickLeavesCount,
  lastNameFocusKey,
  onSelectPatient,
  onOpenPatient,
  onLastNameChange,
  onFirstNameChange,
  onPatronymicChange,
  onBirthDateChange,
  onPeriodStartDateChange,
  onPeriodEndDateChange,
  onDiagnosisChange,
  onSubmit,
  onAddPeriod,
  onCloseSickLeave,
  onDeleteSickLeave,
}: SickLeavesSectionProps) {
  const [periodDrafts, setPeriodDrafts] = useState<Record<number, PeriodDraft>>({})
  const [localError, setLocalError] = useState('')
  const [copiedSickLeaveId, setCopiedSickLeaveId] = useState<number | null>(null)
  const [patientLinkMap, setPatientLinkMap] = useState<Record<number, string>>({})

  function normalizeBirthDateDigits(value: string) {
    const digits = String(value ?? '').replace(/\D/g, '')
    return digits.length === 8 ? digits : ''
  }

  function getPatientClipboardKey(sickLeave: SickLeave) {
    const initials = `${sickLeave.lastName[0] ?? ''}${sickLeave.firstName[0] ?? ''}${sickLeave.patronymic[0] ?? ''}`
    return `${initials}${normalizeBirthDateDigits(sickLeave.birthDate)}`.toLocaleLowerCase('ru-RU')
  }

  async function lookupXRayPatient(sickLeave: SickLeave) {
    const searchQuery = [
      sickLeave.lastName,
      sickLeave.firstName,
      sickLeave.patronymic,
      normalizeBirthDateDigits(sickLeave.birthDate),
    ]
      .filter(Boolean)
      .join(' ')

    const results = await window.electronAPI.xray.searchPatients(searchQuery)
    const birthDateDigits = normalizeBirthDateDigits(sickLeave.birthDate)

    return (
      results.find(
        (patient) =>
          patient.lastName === sickLeave.lastName &&
          patient.firstName === sickLeave.firstName &&
          patient.patronymic === sickLeave.patronymic &&
          normalizeBirthDateDigits(patient.birthDate) === birthDateDigits,
      ) ?? null
    )
  }

  async function findXRayPatient(sickLeave: SickLeave) {
    if (!window.electronAPI?.xray?.searchPatients) {
      setLocalError('Переход в карточку пациента недоступен.')
      return null
    }

    return lookupXRayPatient(sickLeave)
  }

  useEffect(() => {
    if (!window.electronAPI?.xray?.searchPatients || sickLeaves.length === 0) {
      setPatientLinkMap({})
      return
    }

    let isCancelled = false

    async function loadPatientLinks() {
      const entries = await Promise.all(
        sickLeaves.map(async (sickLeave) => {
          try {
            const patient = await lookupXRayPatient(sickLeave)
            return [sickLeave.id, patient?.rmisUrl?.trim() ?? ''] as const
          } catch {
            return [sickLeave.id, ''] as const
          }
        }),
      )

      if (isCancelled) {
        return
      }

      setPatientLinkMap(Object.fromEntries(entries))
    }

    void loadPatientLinks()

    return () => {
      isCancelled = true
    }
  }, [sickLeaves])

  async function handleOpenPatientCard(sickLeave: SickLeave) {
    setLocalError('')

    try {
      const patient = await findXRayPatient(sickLeave)

      if (!patient) {
        setLocalError('Пациент не найден в карточках.')
        return
      }

      onSelectPatient(patient)
      onOpenPatient()
    } catch {
      setLocalError('Не удалось открыть карточку пациента.')
    }
  }

  async function handleOpenPatientLink(sickLeave: SickLeave) {
    setLocalError('')

    try {
      const patient = await findXRayPatient(sickLeave)

      if (!patient?.rmisUrl || !window.electronAPI?.xray?.openLink) {
        return
      }

      await window.electronAPI.xray.openLink(patient.rmisUrl)
    } catch {
      setLocalError('Не удалось открыть ссылку пациента.')
    }
  }

  async function handleCopyPatientKey(sickLeave: SickLeave) {
    try {
      await navigator.clipboard.writeText(getPatientClipboardKey(sickLeave))
      setCopiedSickLeaveId(sickLeave.id)
      window.setTimeout(() => {
        setCopiedSickLeaveId((currentId) => (currentId === sickLeave.id ? null : currentId))
      }, 1400)
    } catch {
      setLocalError('Не удалось скопировать ключ пациента.')
    }
  }

  function getPeriodDraft(sickLeaveId: number): PeriodDraft {
    const sickLeave = sickLeaves.find((item) => item.id === sickLeaveId)
    const lastPeriodEndDate =
      sickLeave && sickLeave.periods.length > 0
        ? sickLeave.periods[sickLeave.periods.length - 1].endDate
        : ''

    return periodDrafts[sickLeaveId] ?? {
      startDate: '',
      endDate: '',
      closeDate: lastPeriodEndDate,
    }
  }

  function updatePeriodDraft(
    sickLeaveId: number,
    field: keyof PeriodDraft,
    value: string,
  ) {
    setPeriodDrafts((currentDrafts) => ({
      ...currentDrafts,
      [sickLeaveId]: {
        ...getPeriodDraft(sickLeaveId),
        [field]: value,
      },
    }))
  }

  async function handleSubmitPeriod(sickLeaveId: number) {
    const draft = getPeriodDraft(sickLeaveId)
    const isSaved = await onAddPeriod(
      sickLeaveId,
      draft.startDate,
      draft.endDate,
    )

    if (isSaved) {
      setPeriodDrafts((currentDrafts) => ({
        ...currentDrafts,
        [sickLeaveId]: {
          ...getPeriodDraft(sickLeaveId),
          startDate: '',
          endDate: '',
        },
      }))
    }
  }

  return (
    <section className="medical-layout">
      <SickLeavesForm
        lastName={lastName}
        firstName={firstName}
        patronymic={patronymic}
        birthDate={birthDate}
        periodStartDate={periodStartDate}
        periodEndDate={periodEndDate}
        diagnosis={diagnosis}
        onLastNameChange={onLastNameChange}
        onFirstNameChange={onFirstNameChange}
        onPatronymicChange={onPatronymicChange}
        onBirthDateChange={onBirthDateChange}
        onPeriodStartDateChange={onPeriodStartDateChange}
        onPeriodEndDateChange={onPeriodEndDateChange}
        onDiagnosisChange={onDiagnosisChange}
        onSubmit={onSubmit}
        isSaving={isSaving}
        lastNameFocusKey={lastNameFocusKey}
      />

      <div className="content-card list-card">
        <div className="list-head">
          <div>
            <p className="section-kicker">Список больничных листов</p>
          </div>
          <div className="patient-count">{loading ? 'Загрузка...' : `${openSickLeavesCount} открыто`}</div>
        </div>

        {error ? <div className="state-banner error-banner">{error}</div> : null}
        {localError ? <div className="state-banner error-banner">{localError}</div> : null}

        {!loading && !error && sickLeaves.length === 0 ? (
          <div className="empty-state">
            Больничных листов пока нет. Добавьте первый лист через форму слева.
          </div>
        ) : null}

        {sickLeaves.length > 0 ? (
          <div className="patient-list">
            {sickLeaves.map((sickLeave) => {
              const periodDraft = getPeriodDraft(sickLeave.id)
              const fullName = `${sickLeave.lastName} ${sickLeave.firstName} ${sickLeave.patronymic}`
              const patientLink = patientLinkMap[sickLeave.id] ?? ''
              const hasPatientLink = patientLink.length > 0

              return (
                <article key={sickLeave.id} className="patient-item sick-leave-item">
                  <div className="patient-main">
                    <div className="sick-leave-head">
                      <div className="xray-fl-journal-patient-line">
                        <button
                          type="button"
                          className="xray-fl-journal-copy-button"
                          onClick={() => {
                            void handleOpenPatientCard(sickLeave)
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
                        <div
                          className={`patient-name xray-fl-journal-name${hasPatientLink ? ' has-link' : ''}`}
                          onClick={() => {
                            if (hasPatientLink) {
                              void handleOpenPatientLink(sickLeave)
                            }
                          }}
                          role={hasPatientLink ? 'button' : undefined}
                          tabIndex={hasPatientLink ? 0 : undefined}
                          onKeyDown={(event) => {
                            if (hasPatientLink && (event.key === 'Enter' || event.key === ' ')) {
                              event.preventDefault()
                              void handleOpenPatientLink(sickLeave)
                            }
                          }}
                        >
                          {fullName}
                        </div>
                        <button
                          type="button"
                          className={`xray-fl-journal-copy-button${copiedSickLeaveId === sickLeave.id ? ' is-copied' : ''}`}
                          onClick={() => {
                            void handleCopyPatientKey(sickLeave)
                          }}
                          aria-label="Скопировать ключ пациента"
                          title="Скопировать ключ пациента"
                        >
                          {copiedSickLeaveId === sickLeave.id ? (
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
                            <svg viewBox="0 0 20 20" aria-hidden="true">
                              <path
                                d="M7 3.5a2 2 0 0 1 2-2h5.5A2.5 2.5 0 0 1 17 4v9.5a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2z"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M5 5.5H4A2 2 0 0 0 2 7.5V16a2.5 2.5 0 0 0 2.5 2.5H11A2 2 0 0 0 13 16v-1"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                      <span
                        className={`status-indicator${sickLeave.status === 'closed' ? ' is-closed' : ''}`}
                        aria-label={
                          sickLeave.status === 'open'
                            ? 'Больничный открыт'
                            : 'Больничный закрыт'
                        }
                        title={
                          sickLeave.status === 'open'
                            ? 'Больничный открыт'
                            : 'Больничный закрыт'
                        }
                      />
                    </div>

                    <div className="patient-meta">
                      Дата рождения: {formatBirthDate(sickLeave.birthDate)}
                    </div>
                    <div className="patient-meta">Диагноз: {sickLeave.diagnosis}</div>
                    <div className="patient-meta">
                      Создан: {formatPatientCreatedAt(sickLeave.createdAt)}
                    </div>
                    {sickLeave.closedAt ? (
                      <div className="patient-meta">
                        Закрыт: {formatStoredDate(sickLeave.closedAt)}
                      </div>
                    ) : null}

                    <div className="periods-block">
                      <div className="periods-title">Периоды</div>
                      <div className="periods-list">
                        {sickLeave.periods.map((period, index) => (
                          <div key={period.id} className="period-chip">
                            {index + 1}. {formatDateRange(period.startDate, period.endDate)}
                          </div>
                        ))}
                      </div>
                    </div>

                    {sickLeave.status === 'open' ? (
                      <div className="extend-form">
                        <div className="period-inline-row">
                          <label className="field field-wide">
                            <span>Продлить с</span>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={periodDraft.startDate}
                              onChange={(event) =>
                                updatePeriodDraft(
                                  sickLeave.id,
                                  'startDate',
                                  normalizeBirthDateInput(event.target.value),
                                )
                              }
                              placeholder="ДДММГГГГ"
                            />
                          </label>

                          <label className="field field-wide">
                            <span>по</span>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={periodDraft.endDate}
                              onChange={(event) =>
                                updatePeriodDraft(
                                  sickLeave.id,
                                  'endDate',
                                  normalizeBirthDateInput(event.target.value),
                                )
                              }
                              placeholder="ДДММГГГГ"
                            />
                          </label>

                          <button
                            type="button"
                            className="secondary-button period-submit-button"
                            onClick={() => {
                              void handleSubmitPeriod(sickLeave.id)
                            }}
                            disabled={savingPeriodLeaveId === sickLeave.id}
                          >
                            {savingPeriodLeaveId === sickLeave.id
                              ? 'Сохранение периода...'
                              : 'Добавить период'}
                          </button>
                        </div>

                        <div className="sick-leave-actions">
                          <div className="close-leave-group">
                            <label className="field field-wide close-date-field">
                              <span>Дата закрытия</span>
                              <input
                                type="text"
                                inputMode="numeric"
                                value={periodDraft.closeDate}
                                onChange={(event) =>
                                  updatePeriodDraft(
                                    sickLeave.id,
                                    'closeDate',
                                    normalizeBirthDateInput(event.target.value),
                                  )
                                }
                                placeholder="ДДММГГГГ"
                              />
                            </label>

                            <button
                              type="button"
                              className="danger-button"
                              onClick={() => {
                                void onCloseSickLeave(
                                  sickLeave.id,
                                  periodDraft.closeDate,
                                )
                              }}
                              disabled={closingLeaveId === sickLeave.id}
                            >
                              {closingLeaveId === sickLeave.id
                                ? 'Закрытие...'
                                : 'Закрыть больничный'}
                            </button>

                            <button
                              type="button"
                              className="ghost-danger-button"
                              onClick={() => {
                                void onDeleteSickLeave(sickLeave.id)
                              }}
                              disabled={deletingLeaveId === sickLeave.id}
                            >
                              {deletingLeaveId === sickLeave.id
                                ? 'Удаление...'
                                : 'Удалить'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="sick-leave-actions sick-leave-actions-closed">
                        <button
                          type="button"
                          className="ghost-danger-button"
                          onClick={() => {
                            void onDeleteSickLeave(sickLeave.id)
                          }}
                          disabled={deletingLeaveId === sickLeave.id}
                        >
                          {deletingLeaveId === sickLeave.id
                            ? 'Удаление...'
                            : 'Удалить'}
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        ) : null}
      </div>
    </section>
  )
}
