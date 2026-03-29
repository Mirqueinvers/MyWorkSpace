import { useEffect, useMemo, useState } from 'react'
import type {
  AddXRayDoseReferencePayload,
  UpdateXRayDoseReferencePayload,
  XRayDoseReference,
} from '../../../types/xray'

const ELECTRON_API_UNAVAILABLE =
  'API Electron \u043d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u043d\u043e. \u041e\u0442\u043a\u0440\u043e\u0439\u0442\u0435 \u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u0435 \u0447\u0435\u0440\u0435\u0437 dev:electron.'
const LOAD_ERROR = '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c \u0442\u0430\u0431\u043b\u0438\u0446\u0443 \u0434\u043e\u0437.'
const SAVE_ERROR = '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0441\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c \u0441\u0442\u0440\u043e\u043a\u0443 \u0434\u043e\u0437.'
const DELETE_ERROR = '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0443\u0434\u0430\u043b\u0438\u0442\u044c \u0441\u0442\u0440\u043e\u043a\u0443 \u0434\u043e\u0437.'
const ADD_ROW_LABEL = '\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u0441\u0442\u0440\u043e\u043a\u0443'
const LOADING_LABEL = '\u0417\u0430\u0433\u0440\u0443\u0436\u0430\u044e \u0442\u0430\u0431\u043b\u0438\u0446\u0443 \u0434\u043e\u0437...'
const EMPTY_LABEL = '\u0422\u0430\u0431\u043b\u0438\u0446\u0430 \u0434\u043e\u0437 \u043f\u043e\u043a\u0430 \u043f\u0443\u0441\u0442\u0430\u044f.'
const FILTER_EMPTY_LABEL = '\u0414\u043b\u044f \u0432\u044b\u0431\u0440\u0430\u043d\u043d\u043e\u0433\u043e \u0438\u0441\u0441\u043b\u0435\u0434\u043e\u0432\u0430\u043d\u0438\u044f \u0441\u0442\u0440\u043e\u043a\u0438 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u044b.'
const EDIT_TITLE = '\u0420\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u0435'
const NEW_ROW_TITLE = '\u041d\u043e\u0432\u0430\u044f \u0441\u0442\u0440\u043e\u043a\u0430'
const CLOSE_ARIA = '\u0417\u0430\u043a\u0440\u044b\u0442\u044c \u043c\u043e\u0434\u0430\u043b\u043a\u0443 \u0434\u043e\u0437'
const SAVE_LABEL = '\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c'
const SAVING_LABEL = '\u0421\u043e\u0445\u0440\u0430\u043d\u044f\u044e...'
const DELETE_ROW_LABEL = '\u0423\u0434\u0430\u043b\u0438\u0442\u044c \u0441\u0442\u0440\u043e\u043a\u0443'
const DELETING_LABEL = '\u0423\u0434\u0430\u043b\u044f\u044e...'
const EDIT_BUTTON_LABEL = '\u0420\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c'
const DASH = '\u2014'

const TABLE_HEADERS = {
  flag: '\u041f\u043e\u043c\u0435\u0442\u043a\u0430',
  title: '\u0418\u0441\u0441\u043b\u0435\u0434\u043e\u0432\u0430\u043d\u0438\u0435',
  constitution: '\u041a\u043e\u043d\u0441\u0442\u0438\u0442\u0443\u0446\u0438\u044f',
  detail: '\u041f\u0440\u043e\u0435\u043a\u0446\u0438\u044f / \u0432\u0430\u0440\u0438\u0430\u043d\u0442',
  adultKv: '\u0412\u0437\u0440\u043e\u0441\u043b\u044b\u0435 kV',
  adultMas: '\u0412\u0437\u0440\u043e\u0441\u043b\u044b\u0435 mAs',
  childKv: '\u0414\u0435\u0442\u0438 kV',
  childMas: '\u0414\u0435\u0442\u0438 mAs',
} as const

const FORM_LABELS = {
  flag: '\u041f\u043e\u043c\u0435\u0442\u043a\u0430',
  title: '\u0418\u0441\u0441\u043b\u0435\u0434\u043e\u0432\u0430\u043d\u0438\u0435',
  constitution: '\u041a\u043e\u043d\u0441\u0442\u0438\u0442\u0443\u0446\u0438\u044f',
  detail: '\u041f\u0440\u043e\u0435\u043a\u0446\u0438\u044f / \u0432\u0430\u0440\u0438\u0430\u043d\u0442',
  adultKv: '\u0412\u0437\u0440\u043e\u0441\u043b\u044b\u0435 kV',
  adultMas: '\u0412\u0437\u0440\u043e\u0441\u043b\u044b\u0435 mAs',
  childKv: '\u0414\u0435\u0442\u0438 kV',
  childMas: '\u0414\u0435\u0442\u0438 mAs',
} as const

const EMPTY_DRAFT: AddXRayDoseReferencePayload = {
  flag: '',
  title: '',
  constitution: '',
  detail: '',
  adultKv: '',
  adultMas: '',
  childKv: '',
  childMas: '',
}

export function XRayDoses() {
  const [entries, setEntries] = useState<XRayDoseReference[]>([])
  const [selectedStudy, setSelectedStudy] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [editingEntry, setEditingEntry] = useState<XRayDoseReference | null>(null)
  const [draft, setDraft] = useState<AddXRayDoseReferencePayload | UpdateXRayDoseReferencePayload | null>(
    null,
  )

  useEffect(() => {
    let isCancelled = false

    async function loadEntries() {
      if (!window.electronAPI?.xray?.listDoseReference) {
        setEntries([])
        setError(ELECTRON_API_UNAVAILABLE)
        return
      }

      setLoading(true)
      setError('')

      try {
        const items = await window.electronAPI.xray.listDoseReference()

        if (!isCancelled) {
          setEntries(items)
        }
      } catch {
        if (!isCancelled) {
          setEntries([])
          setError(LOAD_ERROR)
        }
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    void loadEntries()

    return () => {
      isCancelled = true
    }
  }, [])

  const studies = useMemo(
    () =>
      Array.from(
        new Set(entries.map((entry) => entry.title).filter((title) => title.trim().length > 0)),
      ),
    [entries],
  )

  useEffect(() => {
    if (studies.length === 0) {
      if (selectedStudy) {
        setSelectedStudy('')
      }
      return
    }

    if (!selectedStudy || !studies.includes(selectedStudy)) {
      setSelectedStudy(studies[0])
    }
  }, [selectedStudy, studies])

  const filteredEntries = useMemo(() => {
    if (!selectedStudy) {
      return []
    }

    return entries.filter((entry) => entry.title === selectedStudy)
  }, [entries, selectedStudy])

  function updateDraftField<K extends keyof AddXRayDoseReferencePayload>(
    field: K,
    value: AddXRayDoseReferencePayload[K],
  ) {
    setDraft((currentDraft) =>
      currentDraft
        ? {
            ...currentDraft,
            [field]: value,
          }
        : currentDraft,
    )
  }

  function handleOpenCreate() {
    setEditingEntry(null)
    setDraft({
      ...EMPTY_DRAFT,
      title: selectedStudy,
    })
    setError('')
  }

  function handleOpenEdit(entry: XRayDoseReference) {
    setEditingEntry(entry)
    setDraft({
      id: entry.id,
      flag: entry.flag,
      title: entry.title,
      constitution: entry.constitution,
      detail: entry.detail,
      adultKv: entry.adultKv,
      adultMas: entry.adultMas,
      childKv: entry.childKv,
      childMas: entry.childMas,
    })
    setError('')
  }

  function handleCloseEdit() {
    setEditingEntry(null)
    setDraft(null)
    setError('')
  }

  async function handleSave() {
    if (!draft) {
      return
    }

    setSaving(true)
    setError('')

    try {
      if (editingEntry && window.electronAPI?.xray?.updateDoseReference) {
        const updatedEntry = await window.electronAPI.xray.updateDoseReference(
          draft as UpdateXRayDoseReferencePayload,
        )

        setEntries((currentEntries) =>
          currentEntries.map((entry) => (entry.id === updatedEntry.id ? updatedEntry : entry)),
        )
        setSelectedStudy(updatedEntry.title)
      } else if (!editingEntry && window.electronAPI?.xray?.addDoseReference) {
        const createdEntry = await window.electronAPI.xray.addDoseReference(
          draft as AddXRayDoseReferencePayload,
        )

        setEntries((currentEntries) => [...currentEntries, createdEntry])
        setSelectedStudy(createdEntry.title)
      }

      handleCloseEdit()
    } catch {
      setError(SAVE_ERROR)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!editingEntry || !window.electronAPI?.xray?.deleteDoseReference) {
      return
    }

    setDeleting(true)
    setError('')

    try {
      const deleted = await window.electronAPI.xray.deleteDoseReference(editingEntry.id)

      if (deleted) {
        setEntries((currentEntries) =>
          currentEntries.filter((entry) => entry.id !== editingEntry.id),
        )
        handleCloseEdit()
      }
    } catch {
      setError(DELETE_ERROR)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <section className="xray-doses-layout">
      <section className="content-card xray-doses-card">
        <div className="xray-doses-head">
          <label className="xray-doses-filter">
            <select
              className="input xray-doses-select"
              value={selectedStudy}
              onChange={(event) => setSelectedStudy(event.target.value)}
            >
              {studies.map((study) => (
                <option key={study} value={study}>
                  {study}
                </option>
              ))}
            </select>
          </label>

          <button type="button" className="primary-button" onClick={handleOpenCreate}>
            {ADD_ROW_LABEL}
          </button>
        </div>

        {error && !draft ? <div className="state-banner error-banner">{error}</div> : null}
        {loading ? <p className="xray-journal-empty">{LOADING_LABEL}</p> : null}
        {!loading && studies.length === 0 ? <p className="xray-journal-empty">{EMPTY_LABEL}</p> : null}

        {!loading && studies.length > 0 && filteredEntries.length === 0 ? (
          <p className="xray-journal-empty">{FILTER_EMPTY_LABEL}</p>
        ) : null}

        {!loading && filteredEntries.length > 0 ? (
          <div className="xray-doses-table-wrap">
            <table className="xray-doses-table">
              <thead>
                <tr>
                  <th>{TABLE_HEADERS.flag}</th>
                  <th>{TABLE_HEADERS.title}</th>
                  <th>{TABLE_HEADERS.constitution}</th>
                  <th>{TABLE_HEADERS.detail}</th>
                  <th>{TABLE_HEADERS.adultKv}</th>
                  <th>{TABLE_HEADERS.adultMas}</th>
                  <th>{TABLE_HEADERS.childKv}</th>
                  <th>{TABLE_HEADERS.childMas}</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {filteredEntries.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.flag || DASH}</td>
                    <td>{entry.title || DASH}</td>
                    <td>{entry.constitution || DASH}</td>
                    <td>{entry.detail || DASH}</td>
                    <td>{entry.adultKv || DASH}</td>
                    <td>{entry.adultMas || DASH}</td>
                    <td>{entry.childKv || DASH}</td>
                    <td>{entry.childMas || DASH}</td>
                    <td>
                      <button
                        type="button"
                        className="secondary-button xray-doses-edit-button"
                        onClick={() => handleOpenEdit(entry)}
                      >
                        {EDIT_BUTTON_LABEL}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      {draft ? (
        <div className="reminders-modal-overlay">
          <div className="reminders-modal xray-doses-modal" role="dialog" aria-modal="true">
            <div className="reminders-modal-head">
              <div className="xray-doses-modal-title-wrap">
                <h3 className="reminders-modal-title">
                  {editingEntry ? EDIT_TITLE : NEW_ROW_TITLE}
                </h3>
              </div>

              <button
                type="button"
                className="reminders-modal-close"
                onClick={handleCloseEdit}
                aria-label={CLOSE_ARIA}
              >
                {'\u00d7'}
              </button>
            </div>

            <div className="xray-doses-form-grid">
              <label className="xray-doses-form-field">
                <span>{FORM_LABELS.flag}</span>
                <input
                  type="text"
                  className="input"
                  value={draft.flag}
                  onChange={(event) => updateDraftField('flag', event.target.value)}
                />
              </label>

              <label className="xray-doses-form-field xray-doses-form-field-wide">
                <span>{FORM_LABELS.title}</span>
                <input
                  type="text"
                  className="input"
                  value={draft.title}
                  onChange={(event) => updateDraftField('title', event.target.value)}
                />
              </label>

              <label className="xray-doses-form-field">
                <span>{FORM_LABELS.constitution}</span>
                <input
                  type="text"
                  className="input"
                  value={draft.constitution}
                  onChange={(event) => updateDraftField('constitution', event.target.value)}
                />
              </label>

              <label className="xray-doses-form-field xray-doses-form-field-wide">
                <span>{FORM_LABELS.detail}</span>
                <input
                  type="text"
                  className="input"
                  value={draft.detail}
                  onChange={(event) => updateDraftField('detail', event.target.value)}
                />
              </label>

              <label className="xray-doses-form-field">
                <span>{FORM_LABELS.adultKv}</span>
                <input
                  type="text"
                  className="input"
                  value={draft.adultKv}
                  onChange={(event) => updateDraftField('adultKv', event.target.value)}
                />
              </label>

              <label className="xray-doses-form-field">
                <span>{FORM_LABELS.adultMas}</span>
                <input
                  type="text"
                  className="input"
                  value={draft.adultMas}
                  onChange={(event) => updateDraftField('adultMas', event.target.value)}
                />
              </label>

              <label className="xray-doses-form-field">
                <span>{FORM_LABELS.childKv}</span>
                <input
                  type="text"
                  className="input"
                  value={draft.childKv}
                  onChange={(event) => updateDraftField('childKv', event.target.value)}
                />
              </label>

              <label className="xray-doses-form-field">
                <span>{FORM_LABELS.childMas}</span>
                <input
                  type="text"
                  className="input"
                  value={draft.childMas}
                  onChange={(event) => updateDraftField('childMas', event.target.value)}
                />
              </label>
            </div>

            {error ? <div className="state-banner error-banner">{error}</div> : null}

            <div className="xray-doses-modal-actions">
              <button
                type="button"
                className="primary-button"
                onClick={() => void handleSave()}
                disabled={saving || deleting}
              >
                {saving ? SAVING_LABEL : SAVE_LABEL}
              </button>

              {editingEntry ? (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => void handleDelete()}
                  disabled={saving || deleting}
                >
                  {deleting ? DELETING_LABEL : DELETE_ROW_LABEL}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
