import { useState } from 'react'
import type { FormEvent } from 'react'
import type { SickLeave } from '../../types/sickLeaves'
import type { Reminder } from '../../types/reminders'

interface RemindersPanelProps {
  reminders: Reminder[]
  urgentSickLeaves: SickLeave[]
  reminderText: string
  reminderDate: string
  loading: boolean
  error: string
  isSaving: boolean
  deletingReminderId: number | null
  onReminderTextChange: (value: string) => void
  onReminderDateChange: (value: string) => void
  onAddReminder: (event: FormEvent<HTMLFormElement>) => void | Promise<void>
  onDeleteReminder: (id: number) => void | Promise<void>
}

export function RemindersPanel({
  reminders,
  urgentSickLeaves,
  reminderText,
  reminderDate,
  loading,
  error,
  isSaving,
  deletingReminderId,
  onReminderTextChange,
  onReminderDateChange,
  onAddReminder,
  onDeleteReminder,
}: RemindersPanelProps) {
  const [isComposerOpen, setIsComposerOpen] = useState(false)

  return (
    <section className="content-card form-card reminders-card">
      <div className="section-head">
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
            {isComposerOpen ? '▸' : '▾'}
          </span>
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
            <input
              type="text"
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
              onChange={(event) => onReminderDateChange(event.target.value)}
              placeholder="Дата напоминания (ДДММГГГГ)"
            />
          </label>

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
  )
}
