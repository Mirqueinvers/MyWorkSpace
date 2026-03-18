import { useState } from 'react'
import type { FormEvent } from 'react'
import type { SickLeave } from '../../types/sickLeaves'
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
            <p className="section-kicker">Список</p>
            <h3>Все больничные листы</h3>
          </div>
          <div className="patient-count">{loading ? 'Загрузка...' : `${openSickLeavesCount} открыто`}</div>
        </div>

        {error ? <div className="state-banner error-banner">{error}</div> : null}

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

              return (
                <article key={sickLeave.id} className="patient-item sick-leave-item">
                  <div className="patient-main">
                    <div className="sick-leave-head">
                      <div className="patient-name">{fullName}</div>
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
