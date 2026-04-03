import { useEffect, useState } from 'react'
import type {
  ImportXRayFlJournalResult,
  UpdateXRayFlJournalRmisUrlPayload,
  XRayPatient,
  XRayFlJournalEntry,
} from '../../../types/xray'

const ELECTRON_API_UNAVAILABLE =
  'API Electron недоступно. Откройте приложение через dev:electron.'
const FL_JOURNAL_API_UNAVAILABLE =
  'Импорт Фл журнала недоступен. Полностью перезапустите Electron-приложение, чтобы подтянуть новый preload.'
const JOURNAL_LOAD_ERROR = 'Не удалось загрузить флюорографический журнал за выбранную дату.'
const IMPORT_ERROR = 'Не удалось импортировать файл журнала.'
const RMIS_SAVE_ERROR = 'Не удалось сохранить ссылку РМИС.'
const PATIENT_OPEN_ERROR = 'Не удалось открыть карточку пациента.'
const VIEWED_FL_PATIENTS_STORAGE_KEY = 'xray-fl-viewed-patients'
const VIEWED_FL_PATIENTS_STORAGE_UNINITIALIZED = '__UNINITIALIZED__'

function getTodayIsoDate() {
  const now = new Date()
  const timezoneOffset = now.getTimezoneOffset() * 60_000
  return new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 10)
}

function shiftIsoDate(value: string, days: number) {
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  date.setDate(date.getDate() + days)
  const nextYear = String(date.getFullYear())
  const nextMonth = String(date.getMonth() + 1).padStart(2, '0')
  const nextDay = String(date.getDate()).padStart(2, '0')
  return `${nextYear}-${nextMonth}-${nextDay}`
}

function formatBirthDate(value: string) {
  const digits = String(value ?? '').replace(/\D/g, '')
  if (digits.length !== 8) return value
  return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`
}

function normalizeBirthDateDigits(value: string) {
  const digits = String(value ?? '').replace(/\D/g, '')
  return digits.length === 8 ? digits : ''
}

function getFullName(entry: XRayFlJournalEntry) {
  return [entry.lastName, entry.firstName, entry.patronymic].filter(Boolean).join(' ')
}

function getPatientClipboardKey(entry: XRayFlJournalEntry) {
  const initials = `${entry.lastName[0] ?? ''}${entry.firstName[0] ?? ''}${entry.patronymic[0] ?? ''}`
  const birthDateDigits = String(entry.birthDate ?? '').replace(/\D/g, '')
  return `${initials}${birthDateDigits}`.toLocaleLowerCase('ru-RU')
}

function getViewedPatientKey(entry: XRayFlJournalEntry) {
  return `${entry.lastName}|${entry.firstName}|${entry.patronymic}|${entry.birthDate}`.toLocaleLowerCase(
    'ru-RU',
  )
}

function formatImportResult(result: ImportXRayFlJournalResult | null) {
  if (!result) {
    return ''
  }

  return `Импортировано: ${result.imported}, пропущено дублей: ${result.skipped}`
}

interface XRayFlJournalProps {
  onSelectPatient: (patient: XRayPatient) => void
  onOpenPatient: () => void
}

export function XRayFlJournal({ onSelectPatient, onOpenPatient }: XRayFlJournalProps) {
  const [journalDate, setJournalDate] = useState(getTodayIsoDate)
  const [entries, setEntries] = useState<XRayFlJournalEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedFilePath, setSelectedFilePath] = useState('')
  const [importLoading, setImportLoading] = useState(false)
  const [importResult, setImportResult] = useState<ImportXRayFlJournalResult | null>(null)
  const [copiedEntryId, setCopiedEntryId] = useState<number | null>(null)
  const [editingEntryId, setEditingEntryId] = useState<number | null>(null)
  const [rmisDraft, setRmisDraft] = useState('')
  const [savingRmis, setSavingRmis] = useState(false)
  const [viewedPatients, setViewedPatients] = useState<
    Record<string, boolean> | typeof VIEWED_FL_PATIENTS_STORAGE_UNINITIALIZED
  >(VIEWED_FL_PATIENTS_STORAGE_UNINITIALIZED)

  useEffect(() => {
    try {
      const savedValue = window.sessionStorage.getItem(VIEWED_FL_PATIENTS_STORAGE_KEY)

      if (!savedValue) {
        setViewedPatients({})
        return
      }

      const parsedValue = JSON.parse(savedValue) as Record<string, boolean>
      setViewedPatients(parsedValue)
    } catch {
      setViewedPatients({})
    }
  }, [])

  useEffect(() => {
    if (viewedPatients === VIEWED_FL_PATIENTS_STORAGE_UNINITIALIZED) {
      return
    }

    try {
      window.sessionStorage.setItem(VIEWED_FL_PATIENTS_STORAGE_KEY, JSON.stringify(viewedPatients))
    } catch {
      // Ignore session storage write errors.
    }
  }, [viewedPatients])

  async function loadJournalByDate(targetDate: string) {
    if (!window.electronAPI?.xray) {
      setEntries([])
      setError(ELECTRON_API_UNAVAILABLE)
      return
    }

    if (!window.electronAPI.xray.listFlJournalByDate) {
      setEntries([])
      setError(FL_JOURNAL_API_UNAVAILABLE)
      return
    }

    setLoading(true)
    setError('')

    try {
      const items = await window.electronAPI.xray.listFlJournalByDate(targetDate)
      setEntries(items)
    } catch {
      setEntries([])
      setError(JOURNAL_LOAD_ERROR)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadJournalByDate(journalDate)
  }, [journalDate])

  async function handleImport() {
    if (!window.electronAPI?.xray) {
      setError(ELECTRON_API_UNAVAILABLE)
      return
    }

    if (!window.electronAPI.xray.importFlJournalFile || !window.electronAPI.xray.selectFlJournalFile) {
      setError(FL_JOURNAL_API_UNAVAILABLE)
      return
    }

    setImportLoading(true)
    setError('')
    setImportResult(null)

    try {
      const filePath = await window.electronAPI.xray.selectFlJournalFile()

      if (!filePath) {
        return
      }

      setSelectedFilePath(filePath)
      const result = await window.electronAPI.xray.importFlJournalFile(filePath)
      setImportResult(result)
      await loadJournalByDate(journalDate)
    } catch (importError) {
      if (importError instanceof Error && importError.message) {
        setError(`${IMPORT_ERROR} ${importError.message}`)
      } else {
        setError(IMPORT_ERROR)
      }
    } finally {
      setImportLoading(false)
    }
  }

  async function handleCopyPatientKey(entry: XRayFlJournalEntry) {
    try {
      await navigator.clipboard.writeText(getPatientClipboardKey(entry))
      setViewedPatients((currentValue) => {
        const nextValue =
          currentValue === VIEWED_FL_PATIENTS_STORAGE_UNINITIALIZED ? {} : currentValue
        return {
          ...nextValue,
          [getViewedPatientKey(entry)]: true,
        }
      })
      setCopiedEntryId(entry.id)
      window.setTimeout(() => {
        setCopiedEntryId((currentId) => (currentId === entry.id ? null : currentId))
      }, 1400)
    } catch {
      setError('Не удалось скопировать ключ пациента.')
    }
  }

  async function handleOpenRmisLink(entry: XRayFlJournalEntry) {
    if (!entry.rmisUrl || !window.electronAPI?.xray?.openLink) {
      return
    }

    try {
      await window.electronAPI.xray.openLink(entry.rmisUrl)
      setViewedPatients((currentValue) => {
        const nextValue =
          currentValue === VIEWED_FL_PATIENTS_STORAGE_UNINITIALIZED ? {} : currentValue
        return {
          ...nextValue,
          [getViewedPatientKey(entry)]: true,
        }
      })
    } catch {
      setError('Не удалось открыть ссылку РМИС.')
    }
  }

  async function handleOpenPatient(entry: XRayFlJournalEntry) {
    if (!window.electronAPI?.xray?.searchPatients) {
      setError(ELECTRON_API_UNAVAILABLE)
      return
    }

    const searchQuery = [
      entry.lastName,
      entry.firstName,
      entry.patronymic,
      normalizeBirthDateDigits(entry.birthDate),
    ]
      .filter(Boolean)
      .join(' ')

    try {
      const results = await window.electronAPI.xray.searchPatients(searchQuery)
      const birthDateDigits = normalizeBirthDateDigits(entry.birthDate)
      const matchedPatient =
        results.find(
          (patient) =>
            patient.lastName === entry.lastName &&
            patient.firstName === entry.firstName &&
            patient.patronymic === entry.patronymic &&
            normalizeBirthDateDigits(patient.birthDate) === birthDateDigits,
        ) ?? null

      if (!matchedPatient) {
        setError('Пациент не найден в карточках.')
        return
      }

      onSelectPatient(matchedPatient)
      onOpenPatient()
    } catch {
      setError(PATIENT_OPEN_ERROR)
    }
  }

  function handleOpenRmisEditor(entry: XRayFlJournalEntry) {
    setEditingEntryId(entry.id)
    setRmisDraft(entry.rmisUrl ?? '')
    setError('')
  }

  async function handleSaveRmis(entry: XRayFlJournalEntry) {
    if (!window.electronAPI?.xray?.updateFlJournalRmisUrl) {
      setError(FL_JOURNAL_API_UNAVAILABLE)
      return
    }

    setSavingRmis(true)
    setError('')

    try {
      const payload: UpdateXRayFlJournalRmisUrlPayload = {
        lastName: entry.lastName,
        firstName: entry.firstName,
        patronymic: entry.patronymic,
        birthDate: entry.birthDate,
        rmisUrl: rmisDraft.trim() || null,
      }

      const updated = await window.electronAPI.xray.updateFlJournalRmisUrl(payload)

      if (!updated) {
        setError(RMIS_SAVE_ERROR)
        return
      }

      setEntries((currentEntries) =>
        currentEntries.map((currentEntry) =>
          currentEntry.lastName === entry.lastName &&
          currentEntry.firstName === entry.firstName &&
          currentEntry.patronymic === entry.patronymic &&
          currentEntry.birthDate === entry.birthDate
            ? { ...currentEntry, rmisUrl: payload.rmisUrl }
            : currentEntry,
        ),
      )
      setEditingEntryId(null)
      setRmisDraft('')
    } catch {
      setError(RMIS_SAVE_ERROR)
    } finally {
      setSavingRmis(false)
    }
  }

  return (
    <section className="content-card xray-journal-card">
      <div className="xray-journal-header xray-journal-header-centered">
        <div className="xray-journal-date-nav" aria-label="Навигация по датам фл журнала">
          <button
            type="button"
            className="xray-journal-date-arrow"
            onClick={() => setJournalDate((currentDate) => shiftIsoDate(currentDate, -1))}
            aria-label="Предыдущий день"
          >
            ‹
          </button>

          <label className="xray-journal-date-field xray-journal-date-field-centered">
            <input
              type="date"
              className="input xray-journal-date-input xray-journal-date-input-centered"
              value={journalDate}
              onChange={(event) => setJournalDate(event.target.value)}
            />
          </label>

          <button
            type="button"
            className="xray-journal-date-arrow"
            onClick={() => setJournalDate((currentDate) => shiftIsoDate(currentDate, 1))}
            aria-label="Следующий день"
          >
            ›
          </button>
        </div>
      </div>

      <div className="xray-fl-journal-import">
        <button
          type="button"
          className="primary-button"
          onClick={() => void handleImport()}
          disabled={importLoading}
        >
          {importLoading ? 'Импортирую...' : 'Импорт'}
        </button>

        {selectedFilePath ? (
          <div className="xray-journal-meta xray-fl-journal-selected-file">
            <span>{selectedFilePath}</span>
          </div>
        ) : null}
      </div>

      {importResult ? (
        <div className="xray-journal-meta">
          <span>{formatImportResult(importResult)}</span>
        </div>
      ) : null}

      {entries.length > 0 ? (
        <div className="xray-journal-meta">
          <span>{`Записей: ${entries.length}`}</span>
        </div>
      ) : null}

      {error ? <p className="xray-journal-empty">{error}</p> : null}
      {loading ? <p className="xray-journal-empty">Загружаю журнал...</p> : null}
      {!loading && !error && entries.length === 0 ? (
        <p className="xray-journal-empty">За выбранную дату записей пока нет.</p>
      ) : null}

      {!loading && !error && entries.length > 0 ? (
        <div className="xray-journal-list">
          {entries.map((entry) => {
            const isViewed =
              viewedPatients !== VIEWED_FL_PATIENTS_STORAGE_UNINITIALIZED &&
              Boolean(viewedPatients[getViewedPatientKey(entry)])

            return (
              <article key={entry.id} className="xray-journal-item xray-fl-journal-item">
                <div className="xray-journal-item-head">
                  <div className="xray-fl-journal-patient-line">
                    <button
                      type="button"
                      className="xray-fl-journal-copy-button"
                      onClick={() => void handleOpenPatient(entry)}
                      aria-label="Открыть карточку пациента"
                      title="Открыть карточку пациента"
                    >
                      <svg viewBox="0 0 20 20" aria-hidden="true">
                        <path
                          d="M10 3.25a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        />
                        <path
                          d="M4.5 16.25a5.5 5.5 0 0 1 11 0"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                    <strong
                      className={`xray-fl-journal-name${entry.rmisUrl ? ' has-link' : ''}${isViewed ? ' is-viewed' : ''}`}
                      onClick={() => {
                        if (entry.rmisUrl) {
                          void handleOpenRmisLink(entry)
                        }
                      }}
                      role={entry.rmisUrl ? 'button' : undefined}
                      tabIndex={entry.rmisUrl ? 0 : undefined}
                      onKeyDown={(event) => {
                        if (entry.rmisUrl && (event.key === 'Enter' || event.key === ' ')) {
                          event.preventDefault()
                          void handleOpenRmisLink(entry)
                        }
                      }}
                    >
                      {getFullName(entry)}
                    </strong>
                    <span className={`xray-fl-journal-birth-date${isViewed ? ' is-viewed' : ''}`}>
                      {formatBirthDate(entry.birthDate)}
                    </span>
                    <button
                      type="button"
                      className={`xray-fl-journal-copy-button${copiedEntryId === entry.id ? ' is-copied' : ''}`}
                      onClick={() => void handleCopyPatientKey(entry)}
                      aria-label="Скопировать ключ пациента"
                      title="Скопировать ключ пациента"
                    >
                      {copiedEntryId === entry.id ? (
                        <svg viewBox="0 0 20 20" aria-hidden="true">
                          <path
                            d="M4.5 10.5 8 14l7.5-8"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 20 20" aria-hidden="true">
                          <path
                            d="M7 3.5a2 2 0 0 1 2-2h5.5A2.5 2.5 0 0 1 17 4v9.5a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2z"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M5 5.5H4A2 2 0 0 0 2 7.5V16a2.5 2.5 0 0 0 2.5 2.5H11A2 2 0 0 0 13 16v-1"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </button>
                    <button
                      type="button"
                      className="xray-fl-journal-add-button"
                      onClick={() => handleOpenRmisEditor(entry)}
                      aria-label="Добавить или изменить ссылку РМИС"
                      title="Добавить или изменить ссылку РМИС"
                    >
                      +
                    </button>
                  </div>
                  <span>{entry.dose} мЗв</span>
                </div>

                {editingEntryId === entry.id ? (
                  <div className="xray-fl-journal-rmis-editor">
                    <input
                      type="text"
                      className="input"
                      value={rmisDraft}
                      onChange={(event) => setRmisDraft(event.target.value)}
                      placeholder="Ссылка на РМИС"
                    />
                    <button
                      type="button"
                      className="primary-button"
                      onClick={() => void handleSaveRmis(entry)}
                      disabled={savingRmis}
                    >
                      {savingRmis ? 'Сохраняю...' : 'Сохранить'}
                    </button>
                  </div>
                ) : null}
              </article>
            )
          })}
        </div>
      ) : null}
    </section>
  )
}
