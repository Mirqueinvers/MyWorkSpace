import { useState } from 'react'
import type { FormEvent } from 'react'
import type { ReminderRecurrence, Reminder } from '../../types/reminders'
import type { SickLeave } from '../../types/sickLeaves'
import { formatPatientCreatedAt, formatReminderSchedule } from '../../utils/date'

interface RemindersPanelProps {
  reminders: Reminder[]
  allReminders: Reminder[]
  urgentSickLeaves: SickLeave[]
  reminderText: string
  reminderDate: string
  recurrence: ReminderRecurrence
  loading: boolean
  error: string
  isSaving: boolean
  deletingReminderId: number | null
  onReminderTextChange: (value: string) => void
  onReminderDateChange: (value: string) => void
  onRecurrenceChange: (value: ReminderRecurrence) => void
  onRecurrenceDayChange: (value: string) => void
  onAddReminder: (event: FormEvent<HTMLFormElement>) => void | Promise<void>
  onDeleteReminder: (id: number) => void | Promise<void>
}

const REPEAT_OPTIONS: Array<{ value: ReminderRecurrence; label: string }> = [
  { value: 'weekly', label: 'нед' },
  { value: 'monthly', label: 'мес' },
  { value: 'yearly', label: 'год' },
]

export function RemindersPanel({
  reminders,
  allReminders,
  urgentSickLeaves,
  reminderText,
  reminderDate,
  recurrence,
  loading,
  error,
  isSaving,
  deletingReminderId,
  onReminderTextChange,
  onReminderDateChange,
  onRecurrenceChange,
  onRecurrenceDayChange,
  onAddReminder,
  onDeleteReminder,
}: RemindersPanelProps) {
  const [isComposerOpen, setIsComposerOpen] = useState(false)
  const [isArchiveOpen, setIsArchiveOpen] = useState(false)

  return (
    <>
      <section className="content-card form-card reminders-card">
        <div className="section-head reminders-head">
          <button
            type="button"
            className="reminder-heading-button"
            onClick={() => setIsComposerOpen((currentState) => !currentState)}
            aria-label={
              isComposerOpen
                ? 'Скрыть интерфейс добавления напоминания'
                : 'Показать интерфейс добавления напоминания'
            }
            title={
              isComposerOpen
                ? 'Скрыть интерфейс добавления напоминания'
                : 'Показать интерфейс добавления напоминания'
            }
          >
            <span className="section-kicker reminder-heading-label">Напоминания</span>
            <span className="reminder-heading-icon" aria-hidden="true">
              {isComposerOpen ? '▾' : '▸'}
            </span>
          </button>

          <button
            type="button"
            className="reminder-calendar-button"
            onClick={() => setIsArchiveOpen(true)}
            aria-label="Открыть все напоминания"
            title="Открыть все напоминания"
          >
            <svg
              className="reminder-calendar-icon"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v11a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1Zm13 8H4v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8ZM6 6a1 1 0 0 0-1 1v1h15V7a1 1 0 0 0-1-1H6Zm2 7h3v3H8v-3Zm5 0h3v3h-3v-3Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>

        {isComposerOpen ? (
          <form
            className="reminder-form"
            onSubmit={(event) => {
              void onAddReminder(event)
            }}
          >
            <label className="field field-wide">
              <textarea
                className="reminder-textarea"
                value={reminderText}
                onChange={(event) => onReminderTextChange(event.target.value)}
                placeholder="Введите текст напоминания"
              />
            </label>

            <label className="field field-wide">
              <input
                type="text"
                inputMode="numeric"
                value={reminderDate}
                onChange={(event) => {
                  onReminderDateChange(event.target.value)
                  onRecurrenceDayChange(event.target.value)
                }}
                placeholder={
                  recurrence === 'none'
                    ? 'Дата напоминания (ДДММГГГГ)'
                    : 'Дата повторения (ДДММГГГГ)'
                }
              />
            </label>

            <div className="reminder-repeat-group">
              <div className="reminder-repeat-label">Повторять</div>
              <div className="reminder-repeat-buttons">
                {REPEAT_OPTIONS.map((option) => {
                  const isActive = recurrence === option.value

                  return (
                    <button
                      key={option.value}
                      type="button"
                      className={`reminder-repeat-button${isActive ? ' reminder-repeat-button-active' : ''}`}
                      onClick={() => onRecurrenceChange(isActive ? 'none' : option.value)}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <button type="submit" className="primary-button" disabled={isSaving}>
              {isSaving ? 'Сохранение...' : 'Добавить напоминание'}
            </button>
          </form>
        ) : null}

        {error ? <div className="state-banner error-banner">{error}</div> : null}

        {loading ? <div className="empty-state">Загрузка напоминаний...</div> : null}

        {!loading && urgentSickLeaves.length === 0 && reminders.length === 0 ? (
          <div className="empty-state">Напоминаний пока нет.</div>
        ) : null}

        {urgentSickLeaves.length > 0 || reminders.length > 0 ? (
          <div className="patient-list reminders-list">
            {urgentSickLeaves.map((sickLeave) => {
              const fullName = `${sickLeave.lastName} ${sickLeave.firstName} ${sickLeave.patronymic}`

              return (
                <article
                  key={`urgent-${sickLeave.id}`}
                  className="patient-item reminder-item reminder-item-urgent"
                >
                  <div className="patient-main">
                    <div className="patient-name">
                      Сегодня нужно закрыть или продлить больничный
                    </div>
                    <div className="patient-meta reminder-meta">{fullName}</div>
                  </div>
                </article>
              )
            })}

            {reminders.map((reminder) => (
              <article key={reminder.id} className="patient-item reminder-item">
                <button
                  type="button"
                  className="reminder-close-button"
                  onClick={() => {
                    void onDeleteReminder(reminder.id)
                  }}
                  disabled={deletingReminderId === reminder.id}
                  aria-label="Удалить напоминание"
                  title="Удалить напоминание"
                >
                  {deletingReminderId === reminder.id ? '...' : '×'}
                </button>

                <div className="patient-main">
                  <div className="patient-name">{reminder.text}</div>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>

      {isArchiveOpen ? (
        <div className="reminders-modal-overlay" role="presentation">
          <div
            className="reminders-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Все напоминания"
          >
            <div className="reminders-modal-head">
              <div>
                <div className="section-kicker">Все напоминания</div>
                <h3 className="reminders-modal-title">Список добавленных напоминаний</h3>
              </div>

              <button
                type="button"
                className="reminders-modal-close"
                onClick={() => setIsArchiveOpen(false)}
                aria-label="Закрыть окно напоминаний"
                title="Закрыть"
              >
                ×
              </button>
            </div>

            {allReminders.length === 0 ? (
              <div className="empty-state reminders-modal-empty">
                Напоминаний пока нет.
              </div>
            ) : (
              <div className="reminders-modal-list">
                {allReminders.map((reminder) => (
                  <article key={`modal-${reminder.id}`} className="reminders-modal-item">
                    <div className="reminders-modal-item-head">
                      <div className="patient-name">{reminder.text}</div>
                      <button
                        type="button"
                        className="reminder-close-button reminders-modal-delete"
                        onClick={() => {
                          void onDeleteReminder(reminder.id)
                        }}
                        disabled={deletingReminderId === reminder.id}
                        aria-label="Удалить напоминание"
                        title="Удалить напоминание"
                      >
                        {deletingReminderId === reminder.id ? '...' : '×'}
                      </button>
                    </div>

                    <div className="patient-meta reminder-meta">
                      {formatReminderSchedule(reminder)}
                    </div>
                    <div className="patient-meta reminder-meta">
                      Добавлено: {formatPatientCreatedAt(reminder.createdAt)}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  )
}
