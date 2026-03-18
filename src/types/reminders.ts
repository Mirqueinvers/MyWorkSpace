export interface Reminder {
  id: number
  text: string
  reminderDate: string | null
  createdAt: string
}

export interface AddReminderPayload {
  text: string
  reminderDate: string | null
}

export interface RemindersApi {
  list: () => Promise<Reminder[]>
  add: (payload: AddReminderPayload) => Promise<Reminder>
  delete: (id: number) => Promise<boolean>
}
