import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import type {
  ImportXRayFlPathologyResult,
  ImportXRayFlJournalResult,
  UpdateXRayFlJournalRmisUrlPayload,
  XRayPatient,
  XRayFlJournalEntry,
} from '../../../types/xray'
import { XRayConfirmModal } from './XRayConfirmModal'

const ELECTRON_API_UNAVAILABLE =
  'API Electron недоступно. Откройте приложение через dev:electron.'
const FL_JOURNAL_API_UNAVAILABLE =
  'Импорт Фл журнала недоступен. Полностью перезапустите Electron-приложение, чтобы подтянуть новый preload.'
const JOURNAL_LOAD_ERROR = 'Не удалось загрузить флюорографический журнал за выбранную дату.'
const IMPORT_ERROR = 'Не удалось импортировать файл журнала.'
const PATHOLOGY_IMPORT_ERROR = 'Не удалось импортировать патологию.'
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

function formatPathologyImportResult(result: ImportXRayFlPathologyResult | null) {
  if (!result) {
    return ''
  }

  return `Патология: ключей сопоставлено ${result.matchedKeys}, обновлено записей ${result.updatedEntries}, описаний ${result.importedDescriptions}, пропущено ${result.skippedKeys}, ошибок ${result.failedKeys}`
}

function hasPathology(entry: XRayFlJournalEntry) {
  return Boolean(entry.pathologyDescription.trim() || entry.pathologyConclusion.trim())
}

function formatPathologyMultilineText(value: string) {
  return String(value ?? '')
    .replace(/\r\n?/g, '\n')
    .replace(/\\r\\n/g, '\n')
    .replace(/\\r/g, '\n')
    .replace(/\\n/g, '\n')
    .trim()
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
  const [pathologyImportLoading, setPathologyImportLoading] = useState(false)
  const [selectedPathologyFolder, setSelectedPathologyFolder] = useState('')
  const [pathologyImportResult, setPathologyImportResult] =
    useState<ImportXRayFlPathologyResult | null>(null)
  const [pathologyModalEntry, setPathologyModalEntry] = useState<XRayFlJournalEntry | null>(null)
  const [isPathologyDeleteConfirmOpen, setIsPathologyDeleteConfirmOpen] = useState(false)
  const [isCopyingPathologyText, setIsCopyingPathologyText] = useState(false)
  const [pathologyActionLoading, setPathologyActionLoading] = useState(false)
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

  async function handleImportPathology() {
    if (!window.electronAPI?.xray) {
      setError(ELECTRON_API_UNAVAILABLE)
      return
    }

    if (
      !window.electronAPI.xray.selectFlPathologyFolder ||
      !window.electronAPI.xray.importFlPathologyFolder
    ) {
      setError(FL_JOURNAL_API_UNAVAILABLE)
      return
    }

    setPathologyImportLoading(true)
    setError('')
    setPathologyImportResult(null)

    try {
      const folderPath = await window.electronAPI.xray.selectFlPathologyFolder()

      if (!folderPath) {
        return
      }

      setSelectedPathologyFolder(folderPath)
      const result = await window.electronAPI.xray.importFlPathologyFolder({
        shotDate: journalDate,
        folderPath,
      })
      setPathologyImportResult(result)
      await loadJournalByDate(journalDate)
    } catch (importError) {
      if (importError instanceof Error && importError.message) {
        setError(`${PATHOLOGY_IMPORT_ERROR} ${importError.message}`)
      } else {
        setError(PATHOLOGY_IMPORT_ERROR)
      }
    } finally {
      setPathologyImportLoading(false)
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

  async function handleClearPathology(entryId: number) {
    if (!window.electronAPI?.xray?.updateFlJournalPathology) {
      setError(FL_JOURNAL_API_UNAVAILABLE)
      return
    }

    setPathologyActionLoading(true)
    setError('')

    try {
      const updated = await window.electronAPI.xray.updateFlJournalPathology({
        id: entryId,
        clearDescription: true,
      })

      if (!updated) {
        setError('Не удалось удалить данные патологии.')
        return
      }

      setEntries((currentEntries) =>
        currentEntries.map((entry) => {
          if (entry.id !== entryId) {
            return entry
          }

          return {
            ...entry,
            pathologyDescription: '',
            pathologyConclusion: '',
          }
        }),
      )

      setPathologyModalEntry((currentEntry) => {
        if (!currentEntry || currentEntry.id !== entryId) {
          return currentEntry
        }

        const nextEntry = {
          ...currentEntry,
          pathologyDescription: '',
          pathologyConclusion: '',
        }

        if (!hasPathology(nextEntry)) {
          return null
        }

        return nextEntry
      })
    } catch {
      setError('Не удалось удалить данные патологии.')
    } finally {
      setPathologyActionLoading(false)
    }
  }

  async function handleCopyPathology(entry: XRayFlJournalEntry) {
    const descriptionText = formatPathologyMultilineText(entry.pathologyDescription)
    const conclusionText = formatPathologyMultilineText(entry.pathologyConclusion)
    const payload = [
      descriptionText,
      conclusionText ? `Заключение: ${conclusionText}` : '',
    ]
      .filter(Boolean)
      .join('\n\n')

    if (!payload) {
      return
    }

    setIsCopyingPathologyText(true)
    try {
      await navigator.clipboard.writeText(payload)
    } finally {
      setIsCopyingPathologyText(false)
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
        <button
          type="button"
          className="secondary-button"
          onClick={() => void handleImportPathology()}
          disabled={pathologyImportLoading}
        >
          {pathologyImportLoading ? 'Импортирую патологию...' : 'Патология'}
        </button>

        {selectedFilePath ? (
          <div className="xray-journal-meta xray-fl-journal-selected-file">
            <span>{selectedFilePath}</span>
          </div>
        ) : null}
        {selectedPathologyFolder ? (
          <div className="xray-journal-meta xray-fl-journal-selected-file">
            <span>{`Папка патологии: ${selectedPathologyFolder}`}</span>
          </div>
        ) : null}
      </div>

      {importResult ? (
        <div className="xray-journal-meta">
          <span>{formatImportResult(importResult)}</span>
        </div>
      ) : null}
      {pathologyImportResult ? (
        <div className="xray-journal-meta">
          <span>{formatPathologyImportResult(pathologyImportResult)}</span>
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
            const isEntryHasPathology = hasPathology(entry)

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
                    {isEntryHasPathology ? (
                      <button
                        type="button"
                        className="xray-fl-journal-description-button"
                        onClick={() => {
                          setPathologyModalEntry(entry)
                          setIsPathologyDeleteConfirmOpen(false)
                        }}
                      >
                        Описание
                      </button>
                    ) : null}
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

      {pathologyModalEntry && typeof document !== 'undefined'
        ? createPortal(
            <div
              className="reminders-modal-overlay xray-top-overlay"
              onClick={() => {
                setPathologyModalEntry(null)
                setIsPathologyDeleteConfirmOpen(false)
              }}
            >
              <section
                className="reminders-modal xray-fl-pathology-modal xray-top-modal"
                onClick={(event) => event.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label="Описание патологии"
              >
                <div className="reminders-modal-head xray-fl-pathology-modal-head">
                  <div>
                    <h3 className="reminders-modal-title">{getFullName(pathologyModalEntry)}</h3>
                    <p className="xray-journal-meta">
                      {formatBirthDate(pathologyModalEntry.birthDate)}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="reminders-modal-close"
                    onClick={() => {
                      setPathologyModalEntry(null)
                      setIsPathologyDeleteConfirmOpen(false)
                    }}
                    aria-label="Закрыть описание патологии"
                  >
                    ×
                  </button>
                </div>

                <div className="xray-fl-pathology-modal-body">
                  <div className="xray-fl-pathology-toolbar">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => void handleCopyPathology(pathologyModalEntry)}
                      disabled={
                        !formatPathologyMultilineText(pathologyModalEntry.pathologyDescription) &&
                        !formatPathologyMultilineText(pathologyModalEntry.pathologyConclusion)
                      }
                    >
                      {isCopyingPathologyText ? 'Копирую...' : 'Скопировать описание'}
                    </button>
                  </div>

                  {formatPathologyMultilineText(pathologyModalEntry.pathologyDescription) ? (
                    <div className="xray-fl-pathology-text-block">
                      <strong>Описание</strong>
                      <pre>{formatPathologyMultilineText(pathologyModalEntry.pathologyDescription)}</pre>
                    </div>
                  ) : null}

                  {formatPathologyMultilineText(pathologyModalEntry.pathologyConclusion) ? (
                    <div className="xray-fl-pathology-text-block">
                      <strong>Заключение</strong>
                      <pre>{formatPathologyMultilineText(pathologyModalEntry.pathologyConclusion)}</pre>
                    </div>
                  ) : null}
                </div>

                <div className="xray-fl-pathology-modal-footer">
                  <button
                    type="button"
                    className="xray-fl-pathology-delete-all-button"
                    onClick={() => setIsPathologyDeleteConfirmOpen(true)}
                    disabled={pathologyActionLoading}
                  >
                    {pathologyActionLoading ? 'Удаляю...' : 'Удалить описание'}
                  </button>
                </div>
              </section>
            </div>,
            document.body,
          )
        : null}

      {isPathologyDeleteConfirmOpen && pathologyModalEntry ? (
        <XRayConfirmModal
          kicker="Патология"
          title="Удалить описание?"
          description="Описание и заключение будут удалены без возможности восстановления."
          confirmLabel="Удалить"
          confirmBusyLabel="Удаляю..."
          isBusy={pathologyActionLoading}
          isTopLayer
          dialogLabelId="xray-fl-pathology-delete-confirm-title"
          closeAriaLabel="Закрыть окно подтверждения удаления патологии"
          onClose={() => setIsPathologyDeleteConfirmOpen(false)}
          onConfirm={() => {
            if (!pathologyModalEntry) return
            void handleClearPathology(pathologyModalEntry.id)
            setIsPathologyDeleteConfirmOpen(false)
          }}
        />
      ) : null}
    </section>
  )
}






