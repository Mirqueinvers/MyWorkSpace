import { useEffect, useMemo, useState } from 'react'
import type { UpdateXRayPatientPayload, XRayPatient } from '../../types/xray'
import { formatBirthDate } from '../../utils/date'
import { getPatientClipboardValue } from '../../utils/patient'

const STORAGE_KEY = 'plan-generated-patient-ids-v1'
const VIEWED_PATIENTS_STORAGE_KEY = 'plan-viewed-patients'
const VIEWED_PATIENTS_STORAGE_UNINITIALIZED = '__UNINITIALIZED__'
const ELECTRON_API_UNAVAILABLE =
  'API Electron недоступно. Откройте приложение через dev:electron.'
const LOAD_ERROR = 'Не удалось загрузить список пациентов.'
const UPDATE_ERROR = 'Не удалось обновить карточку пациента.'
const EMPTY_HINT = 'Нажмите «Сгенерировать», чтобы выбрать случайную группу пациентов.'
const TARGET_COUNT = 60

type PatientGender = 'male' | 'female' | 'unknown'

interface PlanSectionProps {
  onSelectPatient: (patient: XRayPatient) => void
  onOpenPatient: () => void
  onUpdatePatient?: (payload: UpdateXRayPatientPayload) => Promise<XRayPatient | null>
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

function getViewedPatientKey(patient: XRayPatient) {
  return `${patient.lastName}|${patient.firstName}|${patient.patronymic}|${patient.birthDate}`.toLocaleLowerCase(
    'ru-RU',
  )
}

function loadGeneratedPatientIds() {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY)
    if (!storedValue) {
      return []
    }

    const parsedValue = JSON.parse(storedValue)
    if (!Array.isArray(parsedValue)) {
      return []
    }

    return parsedValue
      .map((value) => Number(value))
      .filter((value) => Number.isInteger(value) && value > 0)
  } catch {
    return []
  }
}

function PatientRow({
  patient,
  onSelectPatient,
  onOpenPatient,
  onOpenRmisEditor,
  isEditing,
  rmisDraft,
  onRmisDraftChange,
  onSaveRmis,
  savingRmis,
  isViewed,
  onMarkViewed,
}: {
  patient: XRayPatient
  onSelectPatient: (patient: XRayPatient) => void
  onOpenPatient: () => void
  onOpenRmisEditor: (patient: XRayPatient) => void
  isEditing: boolean
  rmisDraft: string
  onRmisDraftChange: (value: string) => void
  onSaveRmis: (patient: XRayPatient) => void
  savingRmis: boolean
  isViewed: boolean
  onMarkViewed: (patient: XRayPatient) => void
}) {
  const [isCopied, setIsCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(getPatientKey(patient))
      onMarkViewed(patient)
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

  async function handleOpenRmisLink() {
    if (!patient.rmisUrl || !window.electronAPI?.xray?.openLink) {
      return
    }

    try {
      await window.electronAPI.xray.openLink(patient.rmisUrl)
      onMarkViewed(patient)
    } catch {
      // Ignore link-open errors here; the patient card handles the same action elsewhere.
    }
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
          <strong
            className={`xray-fl-journal-name${patient.rmisUrl ? ' has-link' : ''}${isViewed ? ' is-viewed' : ''}`}
            onClick={() => {
              if (patient.rmisUrl) {
                void handleOpenRmisLink()
              }
            }}
            role={patient.rmisUrl ? 'button' : undefined}
            tabIndex={patient.rmisUrl ? 0 : undefined}
            onKeyDown={(event) => {
              if (patient.rmisUrl && (event.key === 'Enter' || event.key === ' ')) {
                event.preventDefault()
                void handleOpenRmisLink()
              }
            }}
          >
            {getPatientFullName(patient)}
          </strong>
          <span className={`xray-fl-journal-birth-date${isViewed ? ' is-viewed' : ''}`}>
            {formatBirthDate(patient.birthDate)}
          </span>
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
            onClick={() => onOpenRmisEditor(patient)}
            aria-label="Добавить ссылку в карточке пациента"
            title="Добавить ссылку в карточке пациента"
          >
            +
          </button>
        </div>
        <span>{patient.address}</span>
      </div>

      {isEditing ? (
        <div className="xray-fl-journal-rmis-editor">
          <input
            type="text"
            className="input"
            value={rmisDraft}
            onChange={(event) => onRmisDraftChange(event.target.value)}
            placeholder="Ссылка на РМИС"
          />
          <button
            type="button"
            className="primary-button"
            onClick={() => onSaveRmis(patient)}
            disabled={savingRmis}
          >
            {savingRmis ? 'Сохраняю...' : 'Сохранить'}
          </button>
        </div>
      ) : null}
    </article>
  )
}

export function PlanSection({
  onSelectPatient,
  onOpenPatient,
  onUpdatePatient,
}: PlanSectionProps) {
  const [patients, setPatients] = useState<XRayPatient[]>([])
  const [generatedPatientIds, setGeneratedPatientIds] = useState<number[]>(() =>
    loadGeneratedPatientIds(),
  )
  const [viewedPatients, setViewedPatients] = useState<
    Record<string, boolean> | typeof VIEWED_PATIENTS_STORAGE_UNINITIALIZED
  >(VIEWED_PATIENTS_STORAGE_UNINITIALIZED)
  const [editingPatientId, setEditingPatientId] = useState<number | null>(null)
  const [rmisDraft, setRmisDraft] = useState('')
  const [savingRmis, setSavingRmis] = useState(false)
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

  const generatedPatients = useMemo(() => {
    const patientsById = new Map(patients.map((patient) => [patient.id, patient]))

    return generatedPatientIds
      .map((patientId) => patientsById.get(patientId))
      .filter((patient): patient is XRayPatient => Boolean(patient))
  }, [generatedPatientIds, patients])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(generatedPatientIds))
    } catch {
      // Ignore storage write failures.
    }
  }, [generatedPatientIds])

  useEffect(() => {
    try {
      const savedValue = window.sessionStorage.getItem(VIEWED_PATIENTS_STORAGE_KEY)

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
    if (viewedPatients === VIEWED_PATIENTS_STORAGE_UNINITIALIZED) {
      return
    }

    try {
      window.sessionStorage.setItem(VIEWED_PATIENTS_STORAGE_KEY, JSON.stringify(viewedPatients))
    } catch {
      // Ignore session storage write failures.
    }
  }, [viewedPatients])

  function markPatientViewed(patient: XRayPatient) {
    setViewedPatients((currentValue) => {
      const nextValue =
        currentValue === VIEWED_PATIENTS_STORAGE_UNINITIALIZED ? {} : currentValue

      return {
        ...nextValue,
        [getViewedPatientKey(patient)]: true,
      }
    })
  }

  function handleGenerate() {
    if (eligiblePatients.length === 0) {
      setError('Не нашлось пациентов, подходящих под заданные условия.')
      return
    }

    const shuffledPatients = shufflePatients(eligiblePatients)
    setGeneratedPatientIds(
      shuffledPatients
        .slice(0, Math.min(TARGET_COUNT, shuffledPatients.length))
        .map((patient) => patient.id),
    )
    setError('')
  }

  function handleClearGeneratedList() {
    setGeneratedPatientIds([])
    setError('')
  }

  function handleOpenRmisEditor(patient: XRayPatient) {
    setEditingPatientId(patient.id)
    setRmisDraft(patient.rmisUrl ?? '')
    setError('')
  }

  async function handleSaveRmis(patient: XRayPatient) {
    const updatePatient = onUpdatePatient ?? window.electronAPI?.xray?.updatePatient

    if (!updatePatient) {
      setError(ELECTRON_API_UNAVAILABLE)
      return
    }

    setSavingRmis(true)
    setError('')

    try {
      const payload: UpdateXRayPatientPayload = {
        id: patient.id,
        lastName: patient.lastName,
        firstName: patient.firstName,
        patronymic: patient.patronymic,
        birthDate: patient.birthDate,
        address: patient.address,
        rmisUrl: rmisDraft.trim() || null,
      }

      const updatedPatient = await updatePatient(payload)

      if (!updatedPatient) {
        setError(UPDATE_ERROR)
        return
      }

      setPatients((currentPatients) =>
        currentPatients.map((currentPatient) =>
          currentPatient.id === updatedPatient.id ? updatedPatient : currentPatient,
        ),
      )
      setEditingPatientId(null)
      setRmisDraft('')
    } catch {
      setError(UPDATE_ERROR)
    } finally {
      setSavingRmis(false)
    }
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
          <button
            type="button"
            className="secondary-button"
            onClick={handleClearGeneratedList}
            disabled={loading || generatedPatientIds.length === 0}
          >
            Очистить список
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
                onOpenRmisEditor={handleOpenRmisEditor}
                isEditing={editingPatientId === patient.id}
                rmisDraft={rmisDraft}
                onRmisDraftChange={setRmisDraft}
                onSaveRmis={(currentPatient) => void handleSaveRmis(currentPatient)}
                savingRmis={savingRmis}
                isViewed={
                  viewedPatients !== VIEWED_PATIENTS_STORAGE_UNINITIALIZED &&
                  Boolean(viewedPatients[getViewedPatientKey(patient)])
                }
                onMarkViewed={markPatientViewed}
              />
            ))}
        </div>
      ) : null}
    </section>
  )
}
