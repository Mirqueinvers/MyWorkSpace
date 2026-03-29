import { useEffect, useState } from 'react'
import type { XRayJournalEntry, XRayPatient } from '../../../types/xray'
import { getPatientFullName } from '../helpers'

interface XRayJournalProps {
  onSelectPatient: (patient: XRayPatient) => void
  onOpenPatient: () => void
}

const ELECTRON_API_UNAVAILABLE =
  'API Electron недоступно. Откройте приложение через dev:electron.'
const JOURNAL_LOAD_ERROR = 'Не удалось загрузить пациентов за выбранную дату.'

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

export function XRayJournal({ onSelectPatient, onOpenPatient }: XRayJournalProps) {
  const [journalDate, setJournalDate] = useState(getTodayIsoDate)
  const [entries, setEntries] = useState<XRayJournalEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const studiesCount = entries.reduce((count, entry) => count + entry.studies.length, 0)

  useEffect(() => {
    let isCancelled = false

    async function loadJournal() {
      if (!window.electronAPI?.xray) {
        setEntries([])
        setError(ELECTRON_API_UNAVAILABLE)
        return
      }

      setLoading(true)
      setError('')

      try {
        const items = await window.electronAPI.xray.listJournalByDate(journalDate)

        if (!isCancelled) {
          setEntries(items)
        }
      } catch {
        if (!isCancelled) {
          setEntries([])
          setError(JOURNAL_LOAD_ERROR)
        }
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    void loadJournal()

    return () => {
      isCancelled = true
    }
  }, [journalDate])

  return (
    <section className="content-card xray-journal-card">
      <div className="xray-journal-header xray-journal-header-centered">
        <div className="xray-journal-date-nav" aria-label="Навигация по датам рентген журнала">
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
          {entries.map((entry) => (
            <button
              key={entry.patient.id}
              type="button"
              className="xray-journal-item"
              onClick={() => {
                onSelectPatient(entry.patient)
                onOpenPatient()
              }}
            >
              <div className="xray-journal-item-head">
                <div className="xray-fl-journal-patient-line">
                  <strong>{getPatientFullName(entry.patient)}</strong>
                  <span className="xray-fl-journal-birth-date">
                    {formatBirthDate(entry.patient.birthDate)}
                  </span>
                </div>
                <span>{formatStudySummary(entry.studies.length)}</span>
              </div>

              <div className="xray-journal-item-meta">
                <span>{entry.patient.address}</span>
              </div>

              <div className="xray-journal-study-list">
                {entry.studies.map((study) => (
                  <div key={study.id} className="xray-journal-study-chip">
                    <span>{study.studyArea}</span>
                    <span>{study.referralDiagnosis || 'Без диагноза'}</span>
                  </div>
                ))}
              </div>
            </button>
          ))}
        </div>
      ) : null}
    </section>
  )
}
