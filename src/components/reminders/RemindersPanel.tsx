import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import type { ReminderRecurrence, Reminder } from '../../types/reminders'
import type { SickLeave } from '../../types/sickLeaves'
import { formatPatientCreatedAt, formatReminderSchedule } from '../../utils/date'

interface RemindersPanelProps {
  currentDateDigits: string
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
  { value: 'weekly', label: '\u043d\u0435\u0434' },
  { value: 'monthly', label: '\u043c\u0435\u0441' },
  { value: 'yearly', label: '\u0433\u043e\u0434' },
]

const PANEL_TITLE = '\u041d\u0430\u043f\u043e\u043c\u0438\u043d\u0430\u043d\u0438\u044f'
const OPEN_COMPOSER = '\u041f\u043e\u043a\u0430\u0437\u0430\u0442\u044c \u0438\u043d\u0442\u0435\u0440\u0444\u0435\u0439\u0441 \u0434\u043e\u0431\u0430\u0432\u043b\u0435\u043d\u0438\u044f \u043d\u0430\u043f\u043e\u043c\u0438\u043d\u0430\u043d\u0438\u044f'
const CLOSE_COMPOSER = '\u0421\u043a\u0440\u044b\u0442\u044c \u0438\u043d\u0442\u0435\u0440\u0444\u0435\u0439\u0441 \u0434\u043e\u0431\u0430\u0432\u043b\u0435\u043d\u0438\u044f \u043d\u0430\u043f\u043e\u043c\u0438\u043d\u0430\u043d\u0438\u044f'
const OPEN_ARCHIVE = '\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u0432\u0441\u0435 \u043d\u0430\u043f\u043e\u043c\u0438\u043d\u0430\u043d\u0438\u044f'
const TEXT_PLACEHOLDER = '\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0442\u0435\u043a\u0441\u0442 \u043d\u0430\u043f\u043e\u043c\u0438\u043d\u0430\u043d\u0438\u044f'
const DATE_PLACEHOLDER = '\u0414\u0430\u0442\u0430 \u043d\u0430\u043f\u043e\u043c\u0438\u043d\u0430\u043d\u0438\u044f (\u0414\u0414\u041c\u041c\u0413\u0413\u0413\u0413)'
const RECURRENCE_PLACEHOLDER = '\u0414\u0430\u0442\u0430 \u043f\u043e\u0432\u0442\u043e\u0440\u0435\u043d\u0438\u044f (\u0414\u0414\u041c\u041c\u0413\u0413\u0413\u0413)'
const REPEAT_LABEL = '\u041f\u043e\u0432\u0442\u043e\u0440\u044f\u0442\u044c'
const ADD_LABEL = '\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u043d\u0430\u043f\u043e\u043c\u0438\u043d\u0430\u043d\u0438\u0435'
const SAVING_LABEL = '\u0421\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u0438\u0435...'
const LOADING_LABEL = '\u0417\u0430\u0433\u0440\u0443\u0437\u043a\u0430 \u043d\u0430\u043f\u043e\u043c\u0438\u043d\u0430\u043d\u0438\u0439...'
const EMPTY_LABEL = '\u041d\u0430\u043f\u043e\u043c\u0438\u043d\u0430\u043d\u0438\u0439 \u043f\u043e\u043a\u0430 \u043d\u0435\u0442.'
const URGENT_LABEL = '\u0421\u0435\u0433\u043e\u0434\u043d\u044f \u043d\u0443\u0436\u043d\u043e \u0437\u0430\u043a\u0440\u044b\u0442\u044c \u0438\u043b\u0438 \u043f\u0440\u043e\u0434\u043b\u0438\u0442\u044c \u0431\u043e\u043b\u044c\u043d\u0438\u0447\u043d\u044b\u0439'
const DELETE_REMINDER = '\u0423\u0434\u0430\u043b\u0438\u0442\u044c \u043d\u0430\u043f\u043e\u043c\u0438\u043d\u0430\u043d\u0438\u0435'
const ARCHIVE_KICKER = '\u0412\u0441\u0435 \u043d\u0430\u043f\u043e\u043c\u0438\u043d\u0430\u043d\u0438\u044f'
const ARCHIVE_TITLE = '\u0421\u043f\u0438\u0441\u043e\u043a \u0434\u043e\u0431\u0430\u0432\u043b\u0435\u043d\u043d\u044b\u0445 \u043d\u0430\u043f\u043e\u043c\u0438\u043d\u0430\u043d\u0438\u0439'
const CLOSE_ARCHIVE = '\u0417\u0430\u043a\u0440\u044b\u0442\u044c \u043e\u043a\u043d\u043e \u043d\u0430\u043f\u043e\u043c\u0438\u043d\u0430\u043d\u0438\u0439'
const ADDED_AT_LABEL = '\u0414\u043e\u0431\u0430\u0432\u043b\u0435\u043d\u043e:'
const CLOSE_ICON = '\u00d7'

export function RemindersPanel({
  currentDateDigits,
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
  const [dismissedReminderIds, setDismissedReminderIds] = useState<number[]>([])

  useEffect(() => {
    setDismissedReminderIds([])
  }, [currentDateDigits])

  const visibleReminderItems = useMemo(
    () => reminders.filter((reminder) => !dismissedReminderIds.includes(reminder.id)),
    [dismissedReminderIds, reminders],
  )

  return (
    <>
      <section className="content-card form-card reminders-card">
        <div className="section-head reminders-head">
          <button
            type="button"
            className={`reminder-heading-button${isComposerOpen ? ' is-open' : ''}`}
            onClick={() => setIsComposerOpen((currentState) => !currentState)}
            aria-label={isComposerOpen ? CLOSE_COMPOSER : OPEN_COMPOSER}
            title={isComposerOpen ? CLOSE_COMPOSER : OPEN_COMPOSER}
          >
            <span className="section-kicker reminder-heading-label">{PANEL_TITLE}</span>
            <span className="reminder-heading-icon" aria-hidden="true">
              <svg viewBox="0 0 16 16" fill="none">
                <path
                  d="M4 6.25 8 10l4-3.75"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </button>

          <button
            type="button"
            className="reminder-calendar-button"
            onClick={() => setIsArchiveOpen(true)}
            aria-label={OPEN_ARCHIVE}
            title={OPEN_ARCHIVE}
          >
            <svg className="reminder-calendar-icon" viewBox="0 0 24 24" aria-hidden="true">
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
                placeholder={TEXT_PLACEHOLDER}
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
                placeholder={recurrence === 'none' ? DATE_PLACEHOLDER : RECURRENCE_PLACEHOLDER}
              />
            </label>

            <div className="reminder-repeat-group">
              <div className="reminder-repeat-label">{REPEAT_LABEL}</div>
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
              {isSaving ? SAVING_LABEL : ADD_LABEL}
            </button>
          </form>
        ) : null}

        {error ? <div className="state-banner error-banner">{error}</div> : null}
        {loading ? <div className="empty-state">{LOADING_LABEL}</div> : null}
        {!loading && urgentSickLeaves.length === 0 && visibleReminderItems.length === 0 ? (
          <div className="empty-state">{EMPTY_LABEL}</div>
        ) : null}

        {urgentSickLeaves.length > 0 || visibleReminderItems.length > 0 ? (
          <div className="patient-list reminders-list">
            {urgentSickLeaves.map((sickLeave) => {
              const fullName = `${sickLeave.lastName} ${sickLeave.firstName} ${sickLeave.patronymic}`

              return (
                <article
                  key={`urgent-${sickLeave.id}`}
                  className="patient-item reminder-item reminder-item-urgent"
                >
                  <div className="patient-main">
                    <div className="patient-name">{URGENT_LABEL}</div>
                    <div className="patient-meta reminder-meta">{fullName}</div>
                  </div>
                </article>
              )
            })}

            {visibleReminderItems.map((reminder) => {
              const isOneTimeReminder = reminder.recurrence === 'none'
              const isDeletingThisReminder = isOneTimeReminder && deletingReminderId === reminder.id

              return (
                <article key={reminder.id} className="patient-item reminder-item">
                  <button
                    type="button"
                    className="reminder-close-button"
                    onClick={() => {
                      if (isOneTimeReminder) {
                        void onDeleteReminder(reminder.id)
                        return
                      }

                      setDismissedReminderIds((currentIds) =>
                        currentIds.includes(reminder.id)
                          ? currentIds
                          : [...currentIds, reminder.id],
                      )
                    }}
                    aria-label="Р—Р°РєСЂС‹С‚СЊ РЅР°РїРѕРјРёРЅР°РЅРёРµ"
                    title="Р—Р°РєСЂС‹С‚СЊ РЅР°РїРѕРјРёРЅР°РЅРёРµ"
                    disabled={isDeletingThisReminder}
                  >
                    {isDeletingThisReminder ? '...' : CLOSE_ICON}
                  </button>

                  <div className="patient-main">
                    <div className="patient-name">{reminder.text}</div>
                  </div>
                </article>
              )
            })}
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
            aria-label={ARCHIVE_KICKER}
          >
            <div className="reminders-modal-head">
              <div>
                <div className="section-kicker">{ARCHIVE_KICKER}</div>
                <h3 className="reminders-modal-title">{ARCHIVE_TITLE}</h3>
              </div>

              <button
                type="button"
                className="reminders-modal-close"
                onClick={() => setIsArchiveOpen(false)}
                aria-label={CLOSE_ARCHIVE}
                title={CLOSE_ARCHIVE}
              >
                {CLOSE_ICON}
              </button>
            </div>

            {allReminders.length === 0 ? (
              <div className="empty-state reminders-modal-empty">{EMPTY_LABEL}</div>
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
                        aria-label={DELETE_REMINDER}
                        title={DELETE_REMINDER}
                      >
                        {deletingReminderId === reminder.id ? '...' : CLOSE_ICON}
                      </button>
                    </div>

                    <div className="patient-meta reminder-meta">{formatReminderSchedule(reminder)}</div>
                    <div className="patient-meta reminder-meta">
                      {ADDED_AT_LABEL} {formatPatientCreatedAt(reminder.createdAt)}
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
