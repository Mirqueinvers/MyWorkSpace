import { useEffect, useState } from 'react'
import type {
  ImportUltrasoundJournalResult,
  UltrasoundJournalEntry,
  UltrasoundProtocolEntry,
} from '../../../types/ultrasound'
import type { UpdateXRayFlJournalRmisUrlPayload, XRayPatient } from '../../../types/xray'
import { UltrasoundProtocolModal } from './UltrasoundProtocolModal'

const ELECTRON_API_UNAVAILABLE =
  'API Electron недоступно. Откройте приложение через dev:electron.'
const ULTRASOUND_JOURNAL_API_UNAVAILABLE =
  'Импорт УЗИ журнала недоступен. Полностью перезапустите Electron-приложение, чтобы подтянуть новый preload.'
const JOURNAL_LOAD_ERROR = 'Не удалось загрузить УЗИ журнал за выбранную дату.'
const IMPORT_ERROR = 'Не удалось импортировать файл УЗИ журнала.'
const PROTOCOL_LOAD_ERROR = 'Не удалось открыть протокол исследования.'
const RMIS_SAVE_ERROR = 'Не удалось сохранить ссылку РМИС.'
const PATIENT_OPEN_ERROR = 'Не удалось открыть карточку пациента.'

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

  if (digits.length === 8) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`
  }

  return String(value ?? '').trim()
}

function normalizeBirthDateDigits(value: string) {
  const digits = String(value ?? '').replace(/\D/g, '')
  return digits.length === 8 ? digits : ''
}

function formatImportResult(result: ImportUltrasoundJournalResult | null) {
  if (!result) {
    return ''
  }

  return `Импортировано: ${result.imported}, пропущено дублей: ${result.skipped}`
}

function formatStudySummary(studiesCount: number) {
  if (studiesCount % 10 === 1 && studiesCount % 100 !== 11) return `${studiesCount} исследование`
  if (
    studiesCount % 10 >= 2 &&
    studiesCount % 10 <= 4 &&
    (studiesCount % 100 < 12 || studiesCount % 100 > 14)
  ) {
    return `${studiesCount} исследования`
  }
  return `${studiesCount} исследований`
}

function getStudyTitleResearchCount(studyTitle: string) {
  const parts = String(studyTitle ?? '')
    .split('+')
    .map((part) => part.trim())
    .filter(Boolean)

  return parts.length > 0 ? parts.length : 1
}

function getEntryResearchCount(entry: UltrasoundJournalEntry) {
  return entry.studies.reduce((count, study) => count + getStudyTitleResearchCount(study.studyTitle), 0)
}

function getPatientClipboardKey(entry: UltrasoundJournalEntry) {
  const { lastName, firstName, patronymic, birthDate } = entry.patient
  const initials = `${lastName[0] ?? ''}${firstName[0] ?? ''}${patronymic[0] ?? ''}`
  return `${initials}${String(birthDate ?? '').replace(/\D/g, '')}`.toLocaleLowerCase('ru-RU')
}

function getPatientRmisUrl(entry: UltrasoundJournalEntry) {
  return entry.studies.find((study) => study.rmisUrl)?.rmisUrl ?? null
}

interface UltrasoundJournalProps {
  onSelectPatient: (patient: XRayPatient) => void
  onOpenPatient: () => void
}

export function UltrasoundJournal({ onSelectPatient, onOpenPatient }: UltrasoundJournalProps) {
  const [journalDate, setJournalDate] = useState(getTodayIsoDate)
  const [entries, setEntries] = useState<UltrasoundJournalEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedFilePath, setSelectedFilePath] = useState('')
  const [importLoading, setImportLoading] = useState(false)
  const [importResult, setImportResult] = useState<ImportUltrasoundJournalResult | null>(null)
  const [protocolId, setProtocolId] = useState<number | null>(null)
  const [protocolEntry, setProtocolEntry] = useState<UltrasoundProtocolEntry | null>(null)
  const [protocolLoading, setProtocolLoading] = useState(false)
  const [protocolError, setProtocolError] = useState('')
  const [copiedPatientKey, setCopiedPatientKey] = useState<string | null>(null)
  const [editingPatientKey, setEditingPatientKey] = useState<string | null>(null)
  const [rmisDraft, setRmisDraft] = useState('')
  const [savingRmis, setSavingRmis] = useState(false)

  const studiesCount = entries.reduce((count, entry) => count + getEntryResearchCount(entry), 0)

  async function loadJournalByDate(targetDate: string) {
    if (!window.electronAPI?.ultrasoundJournal) {
      setEntries([])
      setError(ELECTRON_API_UNAVAILABLE)
      return
    }

    setLoading(true)
    setError('')

    try {
      const items = await window.electronAPI.ultrasoundJournal.listByDate(targetDate)
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

  useEffect(() => {
    if (protocolId === null) {
      setProtocolEntry(null)
      setProtocolError('')
      setProtocolLoading(false)
      return
    }

    if (!window.electronAPI?.ultrasoundJournal?.getProtocol) {
      setProtocolEntry(null)
      setProtocolError(ULTRASOUND_JOURNAL_API_UNAVAILABLE)
      return
    }

    let isCancelled = false

    async function loadProtocol() {
      setProtocolLoading(true)
      setProtocolError('')

      try {
        const result = await window.electronAPI.ultrasoundJournal.getProtocol(protocolId)

        if (!isCancelled) {
          if (result) {
            setProtocolEntry(result)
          } else {
            setProtocolEntry(null)
            setProtocolError(PROTOCOL_LOAD_ERROR)
          }
        }
      } catch {
        if (!isCancelled) {
          setProtocolEntry(null)
          setProtocolError(PROTOCOL_LOAD_ERROR)
        }
      } finally {
        if (!isCancelled) {
          setProtocolLoading(false)
        }
      }
    }

    void loadProtocol()

    return () => {
      isCancelled = true
    }
  }, [protocolId])

  async function handleImport() {
    if (!window.electronAPI?.ultrasoundJournal) {
      setError(ELECTRON_API_UNAVAILABLE)
      return
    }

    if (!window.electronAPI.ultrasoundJournal.selectFile || !window.electronAPI.ultrasoundJournal.importFile) {
      setError(ULTRASOUND_JOURNAL_API_UNAVAILABLE)
      return
    }

    setImportLoading(true)
    setError('')
    setImportResult(null)

    try {
      const filePath = await window.electronAPI.ultrasoundJournal.selectFile()

      if (!filePath) {
        return
      }

      setSelectedFilePath(filePath)
      const result = await window.electronAPI.ultrasoundJournal.importFile(filePath)
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

  async function handleCopyPatientKey(entry: UltrasoundJournalEntry) {
    const patientKey = `${entry.patient.fullName}|${entry.patient.birthDate}`

    try {
      await navigator.clipboard.writeText(getPatientClipboardKey(entry))
      setCopiedPatientKey(patientKey)
      window.setTimeout(() => {
        setCopiedPatientKey((currentKey) => (currentKey === patientKey ? null : currentKey))
      }, 1400)
    } catch {
      setError('Не удалось скопировать ключ пациента.')
    }
  }

  async function handleOpenRmisLink(entry: UltrasoundJournalEntry) {
    const rmisUrl = getPatientRmisUrl(entry)

    if (!rmisUrl || !window.electronAPI?.xray?.openLink) {
      return
    }

    try {
      await window.electronAPI.xray.openLink(rmisUrl)
    } catch {
      setError('Не удалось открыть ссылку РМИС.')
    }
  }

  async function handleOpenPatient(entry: UltrasoundJournalEntry) {
    if (!window.electronAPI?.xray?.searchPatients) {
      setError(ELECTRON_API_UNAVAILABLE)
      return
    }

    const searchQuery = [
      entry.patient.lastName,
      entry.patient.firstName,
      entry.patient.patronymic,
      normalizeBirthDateDigits(entry.patient.birthDate),
    ]
      .filter(Boolean)
      .join(' ')

    try {
      const results = await window.electronAPI.xray.searchPatients(searchQuery)
      const birthDateDigits = normalizeBirthDateDigits(entry.patient.birthDate)
      const matchedPatient =
        results.find(
          (patient) =>
            patient.lastName === entry.patient.lastName &&
            patient.firstName === entry.patient.firstName &&
            patient.patronymic === entry.patient.patronymic &&
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

  function handleOpenRmisEditor(entry: UltrasoundJournalEntry) {
    setEditingPatientKey(`${entry.patient.fullName}|${entry.patient.birthDate}`)
    setRmisDraft(getPatientRmisUrl(entry) ?? '')
    setError('')
  }

  async function handleSaveRmis(entry: UltrasoundJournalEntry) {
    if (!window.electronAPI?.xray?.updateFlJournalRmisUrl) {
      setError(ULTRASOUND_JOURNAL_API_UNAVAILABLE)
      return
    }

    const normalizedBirthDate = normalizeBirthDateDigits(entry.patient.birthDate)

    if (!normalizedBirthDate) {
      setError(RMIS_SAVE_ERROR)
      return
    }

    setSavingRmis(true)
    setError('')

    try {
      const payload: UpdateXRayFlJournalRmisUrlPayload = {
        lastName: entry.patient.lastName,
        firstName: entry.patient.firstName,
        patronymic: entry.patient.patronymic,
        birthDate: normalizedBirthDate,
        rmisUrl: rmisDraft.trim() || null,
      }

      const updated = await window.electronAPI.xray.updateFlJournalRmisUrl(payload)

      if (!updated) {
        setError(RMIS_SAVE_ERROR)
        return
      }

      setEntries((currentEntries) =>
        currentEntries.map((currentEntry) =>
          currentEntry.patient.fullName === entry.patient.fullName &&
          currentEntry.patient.birthDate === entry.patient.birthDate
            ? {
                ...currentEntry,
                studies: currentEntry.studies.map((study) => ({
                  ...study,
                  rmisUrl: payload.rmisUrl,
                })),
              }
            : currentEntry,
        ),
      )
      setEditingPatientKey(null)
      setRmisDraft('')
    } catch {
      setError(RMIS_SAVE_ERROR)
    } finally {
      setSavingRmis(false)
    }
  }

  return (
    <>
      <section className="content-card xray-journal-card">
        <div className="xray-journal-header xray-journal-header-centered">
          <div className="xray-journal-date-nav" aria-label="Навигация по датам УЗИ журнала">
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

        <div className="xray-journal-meta xray-journal-meta-dual">
          <span>{entries.length === 0 ? 'Пациенты не найдены' : `Пациентов: ${entries.length}`}</span>
          <span>{`Исследований: ${studiesCount}`}</span>
        </div>

        {error ? <p className="xray-journal-empty">{error}</p> : null}
        {loading ? <p className="xray-journal-empty">Загружаю журнал...</p> : null}
        {!loading && !error && entries.length === 0 ? (
          <p className="xray-journal-empty">За выбранную дату исследований пока нет.</p>
        ) : null}

        {!loading && !error && entries.length > 0 ? (
          <div className="xray-journal-list">
            {entries.map((entry) => {
              const patientKey = `${entry.patient.fullName}|${entry.patient.birthDate}`
              const rmisUrl = getPatientRmisUrl(entry)

              return (
                <article key={patientKey} className="xray-journal-item xray-fl-journal-item">
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
                        className={`xray-fl-journal-name${rmisUrl ? ' has-link' : ''}`}
                        onClick={() => {
                          if (rmisUrl) {
                            void handleOpenRmisLink(entry)
                          }
                        }}
                        role={rmisUrl ? 'button' : undefined}
                        tabIndex={rmisUrl ? 0 : undefined}
                        onKeyDown={(event) => {
                          if (rmisUrl && (event.key === 'Enter' || event.key === ' ')) {
                            event.preventDefault()
                            void handleOpenRmisLink(entry)
                          }
                        }}
                      >
                        {entry.patient.fullName}
                      </strong>
                      <span className="xray-fl-journal-birth-date">
                        {formatBirthDate(entry.patient.birthDate)}
                      </span>
                      <button
                        type="button"
                        className={`xray-fl-journal-copy-button${copiedPatientKey === patientKey ? ' is-copied' : ''}`}
                        onClick={() => void handleCopyPatientKey(entry)}
                        aria-label="Скопировать ключ пациента"
                        title="Скопировать ключ пациента"
                      >
                        {copiedPatientKey === patientKey ? (
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
                    <span>{formatStudySummary(getEntryResearchCount(entry))}</span>
                  </div>

                  {editingPatientKey === patientKey ? (
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

                  <div className="xray-journal-study-list">
                    {entry.studies.map((study) => (
                      <button
                        key={study.id}
                        type="button"
                        className="xray-journal-study-chip"
                        style={{ textAlign: 'left' }}
                        onClick={() => setProtocolId(study.id)}
                      >
                        <span>{study.studyTitle}</span>
                        <span>{study.conclusion || study.doctorName || 'Открыть протокол'}</span>
                      </button>
                    ))}
                  </div>
                </article>
              )
            })}
          </div>
        ) : null}
      </section>

      <UltrasoundProtocolModal
        protocol={protocolEntry}
        loading={protocolLoading}
        error={protocolError}
        onClose={() => setProtocolId(null)}
        kicker={'УЗИ журнал'}
      />
    </>
  )
}


