export interface NoteItem {
  id: number
  text: string
  createdAt: string
}

export interface NotesApi {
  list: () => Promise<NoteItem[]>
  add: (payload: { text: string }) => Promise<NoteItem>
  delete: (id: number) => Promise<boolean>
}
