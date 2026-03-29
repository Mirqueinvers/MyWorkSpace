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

const PLACEHOLDER = '\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0437\u0430\u043c\u0435\u0442\u043a\u0443'
const SAVE_LABEL = '\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u0437\u0430\u043c\u0435\u0442\u043a\u0443'
const SAVING_LABEL = '\u0421\u043e\u0445\u0440\u0430\u043d\u044f\u044e...'
const LOADING_LABEL = '\u0417\u0430\u0433\u0440\u0443\u0436\u0430\u044e \u0437\u0430\u043c\u0435\u0442\u043a\u0438...'
const LIST_LABEL = '\u0421\u043f\u0438\u0441\u043e\u043a \u0437\u0430\u043c\u0435\u0442\u043e\u043a'
const EMPTY_LABEL = '\u041f\u043e\u043a\u0430 \u043d\u0435\u0442 \u043d\u0438 \u043e\u0434\u043d\u043e\u0439 \u0437\u0430\u043c\u0435\u0442\u043a\u0438.'
const DELETE_ARIA = '\u0423\u0434\u0430\u043b\u0438\u0442\u044c \u0437\u0430\u043c\u0435\u0442\u043a\u0443'
const DELETE_ICON = '\u00d7'

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
        <form className="notes-form" onSubmit={onAddNote}>
          <label className="field field-wide">
            <textarea
              className="notes-textarea"
              value={text}
              onChange={(event) => onTextChange(event.target.value)}
              placeholder={PLACEHOLDER}
            />
          </label>

          <button type="submit" className="primary-button" disabled={isSaving}>
            {isSaving ? SAVING_LABEL : SAVE_LABEL}
          </button>
        </form>

        {error ? <p className="notes-empty">{error}</p> : null}
        {loading ? <p className="notes-empty">{LOADING_LABEL}</p> : null}
      </div>

      <div className="content-card notes-card">
        <div className="list-head">
          <div>
            <p className="section-kicker">{LIST_LABEL}</p>
          </div>
        </div>

        {!loading && notes.length === 0 ? <p className="notes-empty">{EMPTY_LABEL}</p> : null}

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
                    aria-label={DELETE_ARIA}
                  >
                    {DELETE_ICON}
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
