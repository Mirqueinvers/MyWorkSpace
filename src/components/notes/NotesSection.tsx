import type { FormEvent } from 'react'
import type { NoteItem } from '../../types/notes'

interface NotesSectionProps {
  text: string
  notes: NoteItem[]
  loading: boolean
  error: string
  isSaving: boolean
  deletingNoteId: number | null
  onTextChange: (value: string) => void
  onAddNote: (event: FormEvent<HTMLFormElement>) => Promise<void>
  onDeleteNote: (id: number) => Promise<void>
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function NotesSection({
  text,
  notes,
  loading,
  error,
  isSaving,
  deletingNoteId,
  onTextChange,
  onAddNote,
  onDeleteNote,
}: NotesSectionProps) {
  return (
    <section className="notes-layout">
      <div className="content-card notes-card">
        <div className="list-head">
          <div>
            <p className="section-kicker">Заметки</p>
            <h3>Быстрые записи</h3>
          </div>
        </div>

        <form className="notes-form" onSubmit={onAddNote}>
          <label className="field field-wide">
            <span>Текст заметки</span>
            <textarea
              className="notes-textarea"
              value={text}
              onChange={(event) => onTextChange(event.target.value)}
              placeholder="Введите заметку"
            />
          </label>

          <button type="submit" className="primary-button" disabled={isSaving}>
            {isSaving ? 'Сохраняю...' : 'Добавить заметку'}
          </button>
        </form>

        {error ? <p className="notes-empty">{error}</p> : null}
        {loading ? <p className="notes-empty">Загружаю заметки...</p> : null}
      </div>

      <div className="content-card notes-card">
        <div className="list-head">
          <div>
            <p className="section-kicker">Список</p>
            <h3>Сохранённые заметки</h3>
          </div>
        </div>

        {!loading && notes.length === 0 ? (
          <p className="notes-empty">Пока нет ни одной заметки.</p>
        ) : null}

        {notes.length > 0 ? (
          <div className="notes-list">
            {notes.map((note) => (
              <article key={note.id} className="notes-item">
                <div className="notes-item-head">
                  <span>{formatDate(note.createdAt)}</span>
                  <button
                    type="button"
                    className="notes-delete"
                    onClick={() => void onDeleteNote(note.id)}
                    disabled={deletingNoteId === note.id}
                    aria-label="Удалить заметку"
                  >
                    {deletingNoteId === note.id ? '×' : '×'}
                  </button>
                </div>

                <p className="notes-item-text">{note.text}</p>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}
