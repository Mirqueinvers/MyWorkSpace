import { useEffect, useMemo, useState } from 'react'
import type { XRayPatient } from '../../types/xray'
import { formatBirthDate } from '../../utils/date'
import { getPatientClipboardValue } from '../../utils/patient'

const ELECTRON_API_UNAVAILABLE =
  'API Electron недоступно. Откройте приложение через dev:electron.'
const LOAD_ERROR = 'Не удалось загрузить список пациентов.'
const EMPTY_HINT = 'Нажмите «Сгенерировать», чтобы выбрать случайную группу пациентов.'
const TARGET_COUNT = 60

type PatientGender = 'male' | 'female' | 'unknown'

interface PlanSectionProps {
  onSelectPatient: (patient: XRayPatient) => void
  onOpenPatient: () => void
}

function parseBirthDateDigits(value: string) {
  const digits = String(value ?? '').replace(/\D/g, '')

  if (!/^\d{8}$/.test(digits)) {
    return null
  }

  const day = Number(digits.slice(0, 2))
  const month = Number(digits.slice(2, 4))
  const year = Number(digits.slice(4, 8))
  const birthDate = new Date(year, month - 1, day)

  if (
    birthDate.getFullYear() !== year ||
    birthDate.getMonth() !== month - 1 ||
    birthDate.getDate() !== day
  ) {
    return null
  }

  return birthDate
}

function getPatientAge(patient: XRayPatient, today: Date) {
  const birthDate = parseBirthDateDigits(patient.birthDate)

  if (!birthDate) {
    return null
  }

  let age = today.getFullYear() - birthDate.getFullYear()

  if (
    today.getMonth() < birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())
  ) {
    age--
  }

  return age
}

function getPatientGender(patient: XRayPatient): PatientGender {
  const patronymic = patient.patronymic.trim().toLocaleLowerCase('ru-RU')

  if (!patronymic) {
    return 'unknown'
  }

  if (patronymic.endsWith('ич') || patronymic.endsWith('ыч')) {
    return 'male'
  }

  if (patronymic.endsWith('на') || patronymic.endsWith('кызы') || patronymic.endsWith('гызы')) {
    return 'female'
  }

  return 'unknown'
}

function shufflePatients<T>(items: T[]) {
  const nextItems = [...items]

  for (let index = nextItems.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[nextItems[index], nextItems[swapIndex]] = [nextItems[swapIndex], nextItems[index]]
  }

  return nextItems
}

function getPatientFullName(patient: XRayPatient) {
  return [patient.lastName, patient.firstName, patient.patronymic].filter(Boolean).join(' ')
}

function getPatientKey(patient: XRayPatient) {
  return getPatientClipboardValue(getPatientFullName(patient), patient.birthDate)
}

function PatientRow({
  patient,
  onSelectPatient,
  onOpenPatient,
}: {
  patient: XRayPatient
  onSelectPatient: (patient: XRayPatient) => void
  onOpenPatient: () => void
}) {
  const [isCopied, setIsCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(getPatientKey(patient))
      setIsCopied(true)
      window.setTimeout(() => setIsCopied(false), 1400)
    } catch {
      setIsCopied(false)
    }
  }

  function handleOpenPatient() {
    onSelectPatient(patient)
    onOpenPatient()
  }

  return (
    <article className="xray-journal-item xray-fl-journal-item">
      <div className="xray-journal-item-head">
        <div className="xray-fl-journal-patient-line">
          <button
            type="button"
            className="xray-fl-journal-copy-button"
            onClick={handleOpenPatient}
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
          <strong className="xray-fl-journal-name">{getPatientFullName(patient)}</strong>
          <span className="xray-fl-journal-birth-date">{formatBirthDate(patient.birthDate)}</span>
          <button
            type="button"
            className={`xray-fl-journal-copy-button${isCopied ? ' is-copied' : ''}`}
            onClick={() => {
              void handleCopy()
            }}
            aria-label="Скопировать ключ пациента"
            title="Скопировать ключ пациента"
          >
            {isCopied ? (
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
            onClick={handleOpenPatient}
            aria-label="Добавить ссылку в карточке пациента"
            title="Добавить ссылку в карточке пациента"
          >
            +
          </button>
        </div>
        <span>{patient.address}</span>
      </div>
    </article>
  )
}

export function PlanSection({ onSelectPatient, onOpenPatient }: PlanSectionProps) {
  const [patients, setPatients] = useState<XRayPatient[]>([])
  const [generatedPatients, setGeneratedPatients] = useState<XRayPatient[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let isCancelled = false

    async function loadPatients() {
      if (!window.electronAPI?.xray?.listPatients) {
        if (!isCancelled) {
          setPatients([])
          setError(ELECTRON_API_UNAVAILABLE)
        }
        return
      }

      setLoading(true)
      setError('')

      try {
        const items = await window.electronAPI.xray.listPatients()

        if (!isCancelled) {
          setPatients(items)
        }
      } catch {
        if (!isCancelled) {
          setPatients([])
          setError(LOAD_ERROR)
        }
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    void loadPatients()

    return () => {
      isCancelled = true
    }
  }, [])

  const eligiblePatients = useMemo(() => {
    const today = new Date()

    return patients.filter((patient) => {
      const gender = getPatientGender(patient)
      const age = getPatientAge(patient, today)

      if (age === null) {
        return false
      }

      if (gender === 'female') {
        return age >= 40
      }

      if (gender === 'male') {
        return age >= 55
      }

      return false
    })
  }, [patients])

  function handleGenerate() {
    if (eligiblePatients.length === 0) {
      setGeneratedPatients([])
      setError('Не нашлось пациентов, подходящих под заданные условия.')
      return
    }

    const shuffledPatients = shufflePatients(eligiblePatients)
    setGeneratedPatients(shuffledPatients.slice(0, Math.min(TARGET_COUNT, shuffledPatients.length)))
    setError('')
  }

  return (
    <section className="content-card xray-journal-card plan-card">
      <div className="xray-journal-header">
        <div>
          <p className="section-kicker">План</p>
          <h3 className="xray-plan-title">Случайная выборка пациентов</h3>
          <p className="xray-journal-meta">
            {loading
              ? 'Загружаю картотеку пациентов...'
              : `Подходящих пациентов: ${eligiblePatients.length}`}
          </p>
        </div>

        <div className="plan-toolbar">
          <button
            type="button"
            className="primary-button"
            onClick={handleGenerate}
            disabled={loading || patients.length === 0}
          >
            Сгенерировать
          </button>
        </div>
      </div>

      <div className="xray-journal-meta xray-journal-meta-dual">
        <span>{`Всего в картотеке: ${patients.length}`}</span>
        <span>{`В выборке: ${generatedPatients.length}${generatedPatients.length > 0 ? ` из ${Math.min(TARGET_COUNT, eligiblePatients.length)}` : ''}`}</span>
      </div>

      {error ? <p className="xray-journal-empty">{error}</p> : null}
      {loading ? <p className="xray-journal-empty">Загружаю список пациентов...</p> : null}
      {!loading && !error && patients.length === 0 ? (
        <p className="xray-journal-empty">Картотека пациентов пока пуста.</p>
      ) : null}
      {!loading && !error && patients.length > 0 && generatedPatients.length === 0 ? (
        <p className="xray-journal-empty">{EMPTY_HINT}</p>
      ) : null}

      {generatedPatients.length > 0 ? (
        <div className="xray-journal-list">
          {generatedPatients.map((patient) => (
            <PatientRow
              key={patient.id}
              patient={patient}
              onSelectPatient={onSelectPatient}
              onOpenPatient={onOpenPatient}
            />
          ))}
        </div>
      ) : null}
    </section>
  )
}
