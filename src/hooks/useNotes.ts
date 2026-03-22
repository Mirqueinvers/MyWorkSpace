import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { NoteItem } from '../types/notes'

const ELECTRON_API_UNAVAILABLE =
  'API Electron недоступно. Откройте приложение через dev:electron.'
const LOAD_ERROR = 'Не удалось загрузить заметки.'
const SAVE_ERROR = 'Не удалось сохранить заметку.'
const DELETE_ERROR = 'Не удалось удалить заметку.'

export function useNotes() {
  const [text, setText] = useState('')
  const [notes, setNotes] = useState<NoteItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [deletingNoteId, setDeletingNoteId] = useState<number | null>(null)

  useEffect(() => {
    let isCancelled = false

    async function loadNotes() {
      if (!window.electronAPI?.notes) {
        setError(ELECTRON_API_UNAVAILABLE)
        setNotes([])
        return
      }

      setLoading(true)
      setError('')

      try {
        const items = await window.electronAPI.notes.list()

        if (!isCancelled) {
          setNotes(items)
        }
      } catch {
        if (!isCancelled) {
          setNotes([])
          setError(LOAD_ERROR)
        }
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    void loadNotes()

    return () => {
      isCancelled = true
    }
  }, [])

  async function handleAddNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const normalizedText = text.trim()
    if (!normalizedText) {
      setError('Введите текст заметки.')
      return
    }

    if (!window.electronAPI?.notes) {
      setError(ELECTRON_API_UNAVAILABLE)
      return
    }

    setIsSaving(true)
    setError('')

    try {
      const createdNote = await window.electronAPI.notes.add({ text: normalizedText })
      setNotes((currentNotes) => [createdNote, ...currentNotes])
      setText('')
    } catch {
      setError(SAVE_ERROR)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDeleteNote(id: number) {
    if (!window.electronAPI?.notes) {
      setError(ELECTRON_API_UNAVAILABLE)
      return
    }

    setDeletingNoteId(id)
    setError('')

    try {
      await window.electronAPI.notes.delete(id)
      setNotes((currentNotes) => currentNotes.filter((note) => note.id !== id))
    } catch {
      setError(DELETE_ERROR)
    } finally {
      setDeletingNoteId(null)
    }
  }

  return {
    text,
    setText,
    notes,
    loading,
    error,
    isSaving,
    deletingNoteId,
    handleAddNote,
    handleDeleteNote,
  }
}
