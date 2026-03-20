export type ReminderRecurrence = 'none' | 'weekly' | 'monthly' | 'yearly'

export interface Reminder {
  id: number
  text: string
  reminderDate: string | null
  recurrence: ReminderRecurrence
  recurrenceDay: number | null
  createdAt: string
}

export interface AddReminderPayload {
  text: string
  reminderDate: string | null
  recurrence: ReminderRecurrence
  recurrenceDay: number | null
}

export interface RemindersApi {
  list: () => Promise<Reminder[]>
  add: (payload: AddReminderPayload) => Promise<Reminder>
  delete: (id: number) => Promise<boolean>
}
