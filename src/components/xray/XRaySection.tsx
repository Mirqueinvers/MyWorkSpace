import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import type { XRayPatient, XRaySearchResult, XRayStudy } from '../../types/xray'
import { formatBirthDate, formatStoredDate } from '../../utils/date'
import {
  normalizeBirthDateInput,
  normalizePersonNameInput,
} from '../../utils/patient'

const XRAY_TABS = ['Главная', 'Журнал', 'Статистика'] as const
const XRAY_STUDY_AREAS = [
  'Органы грудной клетки',
  'Верхние конечности',
  'Нижние конечности',
  'Шейный отдел позвоночника',
  'Грудной отдел позвоночника',
  'Поясничный отдел позвоночника',
  'Тазобедренные суставы',
  'Ребра и грудина',
  'Череп, гол. мозг, ЧЛО',
  'Органы брюшной полости',
  'Почки, мочевыводящая система',
] as const
const XRAY_STUDY_TYPES = ['Рентген', 'Урография'] as const
const XRAY_CASSETTES = ['13х18', '18х24', '24х30', '30х40', '35х35'] as const
const XRAY_STUDY_COUNTS = [1, 2, 3, 4, 5, 6] as const
const XRAY_REFERRED_BY_STORAGE_KEY = 'xray-referred-by-history'
const XRAY_STUDY_TEMPLATES = [
  'Универсальный',
  'Рентгенография коленных суставов',
  'Рентгенография тазобедренных суставов',
  'Рентгенография голеностопных суставов',
  'Рентгенография стоп',
  'Плоскостопие',
  'Рентгенография пяточных костей',
  'Рентгенография поясничного отдела позвоночника',
  'Рентгенография грудного отдела позвоночника',
  'Рентгенография грудопоясничного отдела позвоночника',
  'Рентгенография шейного отдела позвоночника',
  'Рентгенография плечевых суставов',
  'Рентгенография луче-запястных суставов',
  'Рентгенография кистей',
  'Рентгенография придаточных пазух носа',
  'Рентгенография органов грудной клетки',
  'Рентгенография грудной клетки',
  'Рентгенография обзорная брюшной полости',
] as const

type XRayTab = (typeof XRAY_TABS)[number]

interface XRaySectionProps {
  query: string
  results: XRaySearchResult[]
  selectedPatient: XRayPatient | null
  studies: XRayStudy[]
  lastSubmittedQuery: string
  loading: boolean
  error: string
  isSaving: boolean
  isDeleting: boolean
  studiesLoading: boolean
  isSavingStudy: boolean
  deletingStudyId: number | null
  onQueryChange: (value: string) => void
  onSearch: (event?: FormEvent<HTMLFormElement>) => Promise<void>
  onSelectPatient: (patient: XRayPatient) => void
  onAddPatient: (payload: {
    lastName: string
    firstName: string
    patronymic: string
    birthDate: string
    address: string
    rmisUrl: string | null
  }) => Promise<XRayPatient | null>
  onUpdatePatient: (payload: {
    id: number
    lastName: string
    firstName: string
    patronymic: string
    birthDate: string
    address: string
    rmisUrl: string | null
  }) => Promise<XRayPatient | null>
  onDeletePatient: (id: number) => Promise<boolean>
  onOpenLink: (url: string) => Promise<boolean>
  onAddStudy: (payload: {
    patientId: number
    studyDate: string
    description: string
    referralDiagnosis: string
    studyArea: string
    studyType: 'Рентген' | 'Урография'
    cassette: '13х18' | '18х24' | '24х30' | '30х40' | '35х35'
    studyCount: 1 | 2 | 3 | 4 | 5 | 6
    radiationDose: string
    referredBy: string
  }) => Promise<XRayStudy | null>
  onUpdateStudy: (payload: {
    id: number
    patientId: number
    studyDate: string
    description: string
    referralDiagnosis: string
    studyArea: string
    studyType: 'Рентген' | 'Урография'
    cassette: '13х18' | '18х24' | '24х30' | '30х40' | '35х35'
    studyCount: 1 | 2 | 3 | 4 | 5 | 6
    radiationDose: string
    referredBy: string
  }) => Promise<XRayStudy | null>
  onDeleteStudy: (id: number) => Promise<boolean>
  onReset: () => void
}

interface PatientFormState {
  lastName: string
  firstName: string
  patronymic: string
  birthDate: string
  address: string
  rmisUrl: string
}

interface StudyFormState {
  studyDate: string
  description: string
  referralDiagnosis: string
  studyArea: string
  studyType: 'Рентген' | 'Урография'
  cassette: '13х18' | '18х24' | '24х30' | '30х40' | '35х35'
  studyCount: 1 | 2 | 3 | 4 | 5 | 6
  radiationDose: string
  referredBy: string
}

interface XRaySelectFieldProps<T extends string | number> {
  label: string
  value: T
  options: readonly T[]
  isOpen: boolean
  onToggle: () => void
  onSelect: (value: T) => void
}

function getTodayIsoDate() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function createInitialStudyFormState(): StudyFormState {
  return {
    studyDate: getTodayIsoDate(),
    description: '',
    referralDiagnosis: '',
    studyArea: XRAY_STUDY_AREAS[0],
    studyType: 'Рентген',
    cassette: XRAY_CASSETTES[0],
    studyCount: 2,
    radiationDose: '',
    referredBy: '',
  }
}

function createPatientFormState(patient: XRayPatient): PatientFormState {
  return {
    lastName: patient.lastName,
    firstName: patient.firstName,
    patronymic: patient.patronymic,
    birthDate: patient.birthDate,
    address: patient.address,
    rmisUrl: patient.rmisUrl ?? '',
  }
}

function normalizeLeadingCapital(value: string) {
  const normalizedValue = String(value ?? '').replace(/^\s+/, '')

  if (!normalizedValue) {
    return ''
  }

  return normalizedValue.charAt(0).toLocaleUpperCase('ru-RU') + normalizedValue.slice(1)
}

function parseSearchDraft(query: string) {
  const trimmedQuery = String(query ?? '').trim()
  const birthDate = trimmedQuery.replace(/\D/g, '').slice(0, 8)
  const namesPart = trimmedQuery.replace(/\d/g, ' ').replace(/\s+/g, ' ').trim()
  const [lastName = '', firstName = '', patronymic = ''] = namesPart.split(' ')

  return {
    lastName: lastName && lastName.length > 1 ? normalizePersonNameInput(lastName) : '',
    firstName: firstName && firstName.length > 1 ? normalizePersonNameInput(firstName) : '',
    patronymic:
      patronymic && patronymic.length > 1
        ? normalizePersonNameInput(patronymic)
        : '',
    birthDate,
    address: '',
  }
}

function getPatientFullName(patient: XRayPatient) {
  return `${patient.lastName} ${patient.firstName} ${patient.patronymic}`.trim()
}

function formatStudyLabel(study: XRayStudy) {
  return study.studyArea
}

function XRaySelectField<T extends string | number>({
  label,
  value,
  options,
  isOpen,
  onToggle,
  onSelect,
}: XRaySelectFieldProps<T>) {
  return (
    <div className={`field xray-select-field${isOpen ? ' is-open' : ''}`}>
      <span>{label}</span>
      <button
        type="button"
        className="xray-select-trigger"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span>{value}</span>
        <span className="xray-select-chevron" aria-hidden="true">
          ▾
        </span>
      </button>

      {isOpen ? (
        <div className="xray-select-menu" role="listbox">
          {options.map((option) => (
            <button
              key={String(option)}
              type="button"
              className={`xray-select-option${option === value ? ' is-active' : ''}`}
              onClick={() => onSelect(option)}
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function XRayHome(props: XRaySectionProps) {
  const {
    query,
    results,
    selectedPatient,
    studies,
    lastSubmittedQuery,
    loading,
    error,
    isSaving,
    isDeleting,
    studiesLoading,
    isSavingStudy,
    deletingStudyId,
    onQueryChange,
    onSearch,
    onSelectPatient,
    onAddPatient,
    onUpdatePatient,
    onDeletePatient,
    onOpenLink,
    onAddStudy,
    onUpdateStudy,
    onDeleteStudy,
  } = props
  const [isAddFormVisible, setIsAddFormVisible] = useState(false)
  const [isPatientEditOpen, setIsPatientEditOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [deleteStudyCandidate, setDeleteStudyCandidate] = useState<XRayStudy | null>(null)
  const [editingStudy, setEditingStudy] = useState<XRayStudy | null>(null)
  const [isStudyModalOpen, setIsStudyModalOpen] = useState(false)
  const [studyForm, setStudyForm] = useState<StudyFormState>(createInitialStudyFormState)
  const [studyFormError, setStudyFormError] = useState('')
  const [openStudySelect, setOpenStudySelect] = useState<
    null | 'studyArea' | 'studyType' | 'cassette' | 'studyCount'
  >(null)
  const [referredByHistory, setReferredByHistory] = useState<string[]>([])
  const [isReferredByOpen, setIsReferredByOpen] = useState(false)
  const [templateStudy, setTemplateStudy] = useState<XRayStudy | null>(null)
  const [templateQuery, setTemplateQuery] = useState('')
  const [descriptionStudy, setDescriptionStudy] = useState<XRayStudy | null>(null)
  const [descriptionDraft, setDescriptionDraft] = useState('')
  const [isDescriptionEditing, setIsDescriptionEditing] = useState(false)
  const descriptionInputRef = useRef<HTMLTextAreaElement | null>(null)
  const pendingDescriptionRef = useRef<string | null>(null)
  const [lastName, setLastName] = useState('')
  const [firstName, setFirstName] = useState('')
  const [patronymic, setPatronymic] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [address, setAddress] = useState('')
  const [formError, setFormError] = useState('')
  const [patientEditForm, setPatientEditForm] = useState<PatientFormState | null>(null)
  const [patientEditError, setPatientEditError] = useState('')
  const [copyFeedback, setCopyFeedback] = useState('')

  const searchDraft = useMemo(() => parseSearchDraft(lastSubmittedQuery), [lastSubmittedQuery])
  const hasSearch = lastSubmittedQuery.trim().length > 0
  const hasResults = results.length > 0
  const showAddSuggestion = hasSearch && !loading && !hasResults
  const filteredStudyTemplates = useMemo(() => {
    const normalizedQuery = templateQuery.trim().toLocaleLowerCase('ru-RU')

    if (!normalizedQuery) {
      return XRAY_STUDY_TEMPLATES
    }

    return XRAY_STUDY_TEMPLATES.filter((template) =>
      template.toLocaleLowerCase('ru-RU').includes(normalizedQuery),
    )
  }, [templateQuery])

  useEffect(() => {
    try {
      const rawHistory = window.localStorage.getItem(XRAY_REFERRED_BY_STORAGE_KEY)

      if (!rawHistory) {
        return
      }

      const parsedHistory = JSON.parse(rawHistory)

      if (Array.isArray(parsedHistory)) {
        setReferredByHistory(
          parsedHistory.filter((value): value is string => typeof value === 'string'),
        )
      }
    } catch {
      setReferredByHistory([])
    }
  }, [])

  useEffect(() => {
    if (!isStudyModalOpen) {
      setStudyForm(createInitialStudyFormState())
      setStudyFormError('')
      setEditingStudy(null)
      setOpenStudySelect(null)
      setIsReferredByOpen(false)
    }
  }, [isStudyModalOpen])

  useEffect(() => {
    if (!copyFeedback) {
      return
    }

    const timeoutId = window.setTimeout(() => setCopyFeedback(''), 1600)

    return () => window.clearTimeout(timeoutId)
  }, [copyFeedback])

  useEffect(() => {
    if (!templateStudy) {
      setTemplateQuery('')
    }
  }, [templateStudy])

  useEffect(() => {
    if (!descriptionStudy) {
      setDescriptionDraft('')
      setIsDescriptionEditing(false)
      return
    }

    const nextDescription = pendingDescriptionRef.current ?? descriptionStudy.description
    pendingDescriptionRef.current = null
    setDescriptionDraft(nextDescription)
  }, [descriptionStudy])

  useEffect(() => {
    if (!descriptionStudy || !isDescriptionEditing) {
      return
    }

    window.requestAnimationFrame(() => {
      if (!descriptionInputRef.current) {
        return
      }

      descriptionInputRef.current.focus()
      const valueLength = descriptionInputRef.current.value.length
      descriptionInputRef.current.setSelectionRange(valueLength, valueLength)
    })
  }, [descriptionStudy, isDescriptionEditing])

  function openStudyTemplatesModal(study: XRayStudy) {
    if (study.description.trim()) {
      openStudyDescriptionModal(study, false)
      return
    }

    setTemplateStudy(study)
  }

  function openStudyDescriptionModal(
    study: XRayStudy,
    isEditing = false,
    initialDescription?: string,
  ) {
    setTemplateStudy(null)
    pendingDescriptionRef.current = initialDescription ?? null
    setDescriptionStudy(study)
    setIsDescriptionEditing(isEditing)
  }

  function handleShowAddForm() {
    setLastName(searchDraft.lastName)
    setFirstName(searchDraft.firstName)
    setPatronymic(searchDraft.patronymic)
    setBirthDate(searchDraft.birthDate)
    setAddress('')
    setFormError('')
    setIsAddFormVisible(true)
  }

  function openCreateStudyModal() {
    setEditingStudy(null)
    setStudyForm(createInitialStudyFormState())
    setStudyFormError('')
    setIsStudyModalOpen(true)
  }

  function openEditStudyModal(study: XRayStudy) {
    setEditingStudy(study)
    setStudyForm({
      studyDate: study.studyDate,
      description: study.description,
      referralDiagnosis: study.referralDiagnosis,
      studyArea: study.studyArea,
      studyType: study.studyType,
      cassette: study.cassette,
      studyCount: study.studyCount,
      radiationDose: study.radiationDose,
      referredBy: study.referredBy,
    })
    setStudyFormError('')
    setOpenStudySelect(null)
    setIsStudyModalOpen(true)
  }

  async function handleSubmitPatient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!lastName.trim()) {
      setFormError('Введите фамилию пациента.')
      return
    }

    if (!firstName.trim()) {
      setFormError('Введите имя пациента.')
      return
    }

    if (!patronymic.trim()) {
      setFormError('Введите отчество пациента.')
      return
    }

    if (!/^\d{8}$/.test(birthDate)) {
      setFormError('Введите дату рождения в формате ДДММГГГГ.')
      return
    }

    if (!address.trim()) {
      setFormError('Введите адрес пациента.')
      return
    }

    setFormError('')

    const createdPatient = await onAddPatient({
      lastName: normalizePersonNameInput(lastName.trim()),
      firstName: normalizePersonNameInput(firstName.trim()),
      patronymic: normalizePersonNameInput(patronymic.trim()),
      birthDate,
      address: address.trim(),
      rmisUrl: null,
    })

    if (createdPatient) {
      setIsAddFormVisible(false)
      setAddress('')
    }
  }

  async function handleSubmitPatientEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!selectedPatient || !patientEditForm) {
      return
    }

    if (!patientEditForm.lastName.trim()) {
      setPatientEditError('Введите фамилию пациента.')
      return
    }

    if (!patientEditForm.firstName.trim()) {
      setPatientEditError('Введите имя пациента.')
      return
    }

    if (!patientEditForm.patronymic.trim()) {
      setPatientEditError('Введите отчество пациента.')
      return
    }

    if (!/^\d{8}$/.test(patientEditForm.birthDate)) {
      setPatientEditError('Введите дату рождения в формате ДДММГГГГ.')
      return
    }

    if (!patientEditForm.address.trim()) {
      setPatientEditError('Введите адрес пациента.')
      return
    }

    setPatientEditError('')

    const updatedPatient = await onUpdatePatient({
      id: selectedPatient.id,
      lastName: normalizePersonNameInput(patientEditForm.lastName.trim()),
      firstName: normalizePersonNameInput(patientEditForm.firstName.trim()),
      patronymic: normalizePersonNameInput(patientEditForm.patronymic.trim()),
      birthDate: patientEditForm.birthDate,
      address: patientEditForm.address.trim(),
      rmisUrl: patientEditForm.rmisUrl.trim() || null,
    })

    if (updatedPatient) {
      setIsPatientEditOpen(false)
    }
  }

  async function handleSubmitStudy(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!selectedPatient) {
      return
    }

    if (!studyForm.referralDiagnosis.trim()) {
      setStudyFormError('Введите направительный диагноз.')
      return
    }

    if (!studyForm.studyDate) {
      setStudyFormError('Выберите дату исследования.')
      return
    }

    if (!studyForm.radiationDose.trim()) {
      setStudyFormError('Введите дозу облучения.')
      return
    }

    if (!studyForm.referredBy.trim()) {
      setStudyFormError('Введите, кто направил.')
      return
    }

    setStudyFormError('')

    const payload = {
      patientId: selectedPatient.id,
      studyDate: studyForm.studyDate,
      description: studyForm.description,
      referralDiagnosis: studyForm.referralDiagnosis.trim(),
      studyArea: studyForm.studyArea,
      studyType: studyForm.studyType,
      cassette: studyForm.cassette,
      studyCount: studyForm.studyCount,
      radiationDose: studyForm.radiationDose.trim(),
      referredBy: studyForm.referredBy.trim(),
    }

    const savedStudy = editingStudy
      ? await onUpdateStudy({ id: editingStudy.id, ...payload })
      : await onAddStudy(payload)

    if (savedStudy) {
      const normalizedReferredBy = studyForm.referredBy.trim()
      const nextHistory = [
        normalizedReferredBy,
        ...referredByHistory.filter((value) => value !== normalizedReferredBy),
      ].slice(0, 8)

      setReferredByHistory(nextHistory)
      window.localStorage.setItem(
        XRAY_REFERRED_BY_STORAGE_KEY,
        JSON.stringify(nextHistory),
      )
      setIsStudyModalOpen(false)
    }
  }

  async function handleDeleteCurrentPatient() {
    if (!selectedPatient) {
      return
    }

    await onDeletePatient(selectedPatient.id)
    setIsDeleteConfirmOpen(false)
  }

  async function handleCopyPatientKey() {
    if (!selectedPatient) {
      return
    }

    const clipboardValue = `${selectedPatient.lastName.slice(0, 1)}${selectedPatient.firstName.slice(0, 1)}${selectedPatient.patronymic.slice(0, 1)}${selectedPatient.birthDate}`
      .toLocaleLowerCase('ru-RU')
      .replaceAll('ё', 'е')

    try {
      await navigator.clipboard.writeText(clipboardValue)
      setCopyFeedback('Скопировано')
    } catch {
      setCopyFeedback('Не удалось скопировать')
    }
  }

  async function handleDeleteStudyConfirm() {
    if (!deleteStudyCandidate) {
      return
    }

    await onDeleteStudy(deleteStudyCandidate.id)
    if (descriptionStudy?.id === deleteStudyCandidate.id) {
      setDescriptionStudy(null)
    }
    setDeleteStudyCandidate(null)
  }

  async function handleSaveStudyDescription() {
    if (!descriptionStudy) {
      return
    }

    const updatedStudy = await onUpdateStudy({
      id: descriptionStudy.id,
      patientId: descriptionStudy.patientId,
      studyDate: descriptionStudy.studyDate,
      description: descriptionDraft.trim(),
      referralDiagnosis: descriptionStudy.referralDiagnosis,
      studyArea: descriptionStudy.studyArea,
      studyType: descriptionStudy.studyType,
      cassette: descriptionStudy.cassette,
      studyCount: descriptionStudy.studyCount,
      radiationDose: descriptionStudy.radiationDose,
      referredBy: descriptionStudy.referredBy,
    })

    if (updatedStudy) {
      setDescriptionStudy(updatedStudy)
      setDescriptionDraft(updatedStudy.description)
      setIsDescriptionEditing(false)
    }
  }

  return (
    <div className="xray-home">
      {!selectedPatient ? (
        <section className="content-card xray-search-card">
          <form className="xray-search-form" onSubmit={onSearch}>
            <label className="xray-search-shell" aria-label="Поиск пациента X-ray">
              <svg
                className="xray-search-icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  d="M10.5 4a6.5 6.5 0 1 0 4.03 11.6l4.43 4.43a1 1 0 0 0 1.41-1.41l-4.43-4.43A6.5 6.5 0 0 0 10.5 4Zm0 2a4.5 4.5 0 1 1 0 9a4.5 4.5 0 0 1 0-9Z"
                  fill="currentColor"
                />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                placeholder="Поиск пациента"
                autoComplete="off"
              />
              <button type="submit" className="xray-search-submit">
                Найти
              </button>
            </label>
          </form>

          {error ? <div className="state-banner error-banner">{error}</div> : null}

          <div className="xray-search-results">
            {loading ? (
              <div className="empty-state">Ищу пациента в журнале X-ray...</div>
            ) : null}

            {!loading && hasResults ? (
              <div className="xray-result-list">
                {results.map((patient) => (
                  <button
                    key={patient.id}
                    type="button"
                    className="xray-result-item"
                    onClick={() => onSelectPatient(patient)}
                  >
                    <span className="xray-result-name">{getPatientFullName(patient)}</span>
                    <span className="xray-result-meta">
                      {formatBirthDate(patient.birthDate)} • {patient.address}
                    </span>
                  </button>
                ))}
              </div>
            ) : null}

            {!loading && showAddSuggestion ? (
              <div className="xray-no-results">
                <div>
                  <div className="xray-no-results-title">Пациент не найден</div>
                  <div className="xray-no-results-copy">
                    Можно сразу добавить его в X-ray журнал и открыть карточку.
                  </div>
                </div>

                <button
                  type="button"
                  className="primary-button"
                  onClick={handleShowAddForm}
                >
                  Добавить пациента
                </button>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {isAddFormVisible && !selectedPatient ? (
        <section className="content-card xray-patient-card">
          <div className="section-head">
            <div>
              <p className="section-kicker">Новый пациент</p>
              <h3>Добавление в X-ray журнал</h3>
            </div>
          </div>

          <form className="patient-form xray-patient-form" onSubmit={handleSubmitPatient}>
            <label className="field">
              <span>Фамилия</span>
              <input
                type="text"
                value={lastName}
                onChange={(event) =>
                  setLastName(normalizePersonNameInput(event.target.value))
                }
                placeholder="Кузнецов"
              />
            </label>

            <label className="field">
              <span>Имя</span>
              <input
                type="text"
                value={firstName}
                onChange={(event) =>
                  setFirstName(normalizePersonNameInput(event.target.value))
                }
                placeholder="Дмитрий"
              />
            </label>

            <label className="field">
              <span>Отчество</span>
              <input
                type="text"
                value={patronymic}
                onChange={(event) =>
                  setPatronymic(normalizePersonNameInput(event.target.value))
                }
                placeholder="Юрьевич"
              />
            </label>

            <label className="field">
              <span>Дата рождения</span>
              <input
                type="text"
                value={birthDate}
                onChange={(event) =>
                  setBirthDate(normalizeBirthDateInput(event.target.value))
                }
                placeholder="ДДММГГГГ"
                inputMode="numeric"
              />
            </label>

            <label className="field field-wide">
              <span>Адрес</span>
              <input
                type="text"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="г. Тамбов, ул. Примерная, д. 1"
              />
            </label>

            {formError ? <div className="state-banner error-banner">{formError}</div> : null}

            <div className="xray-form-actions">
              <button type="submit" className="primary-button" disabled={isSaving}>
                {isSaving ? 'Сохраняю...' : 'Сохранить пациента'}
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={() => setIsAddFormVisible(false)}
                disabled={isSaving}
              >
                Отмена
              </button>
            </div>
          </form>
        </section>
      ) : null}

      {selectedPatient ? (
        <section className="content-card xray-patient-card">
          <div className="section-head">
            <div>
              <p className="section-kicker">Карточка</p>
              <div className="xray-patient-title-row">
                <h3 className="xray-patient-title">
                  {getPatientFullName(selectedPatient)}{' '}
                  <span className="xray-patient-title-birth">
                    {formatBirthDate(selectedPatient.birthDate)}
                  </span>
                </h3>
                <button
                  type="button"
                  className="xray-patient-copy"
                  onClick={handleCopyPatientKey}
                  aria-label="Скопировать ключ пациента"
                  title="Скопировать ключ пациента"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M8 3a2 2 0 0 0-2 2v10h2V5h8V3H8Zm3 4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-8Zm0 2h8v10h-8V9Z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  className={`xray-rmis-button${selectedPatient.rmisUrl ? ' is-active' : ''}`}
                  onClick={() => {
                    if (selectedPatient.rmisUrl) {
                      void onOpenLink(selectedPatient.rmisUrl)
                    }
                  }}
                  disabled={!selectedPatient.rmisUrl}
                >
                  РМИС
                </button>
              </div>
              {copyFeedback ? <div className="xray-copy-feedback">{copyFeedback}</div> : null}
            </div>

            <div className="xray-card-actions">
              <button
                type="button"
                className="xray-study-edit"
                onClick={() => {
                  setPatientEditForm(createPatientFormState(selectedPatient))
                  setPatientEditError('')
                  setIsPatientEditOpen(true)
                }}
                aria-label="Редактировать пациента"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25Zm2.92 2.33H5v-.92l8.06-8.06.92.92L5.92 19.58ZM20.71 7.04a1 1 0 0 0 0-1.41L18.37 3.3a1 1 0 0 0-1.41 0l-1.5 1.5 3.75 3.75 1.5-1.51Z"
                    fill="currentColor"
                  />
                </svg>
              </button>
              <button
                type="button"
                className="reminder-close-button reminders-modal-delete xray-patient-delete"
                onClick={() => setIsDeleteConfirmOpen(true)}
                disabled={isDeleting}
                aria-label="Удалить пациента"
              >
                ×
              </button>
            </div>
          </div>

          {error ? <div className="state-banner error-banner">{error}</div> : null}

          <p className="xray-patient-address">{selectedPatient.address}</p>

          <div className="xray-studies-head">
            <div>
              <div className="section-kicker">Исследования</div>
              <h4 className="xray-studies-title">Список исследований пациента</h4>
            </div>

            <button type="button" className="primary-button" onClick={openCreateStudyModal}>
              Добавить исследование
            </button>
          </div>

          {studiesLoading ? (
            <div className="empty-state">Загружаю исследования...</div>
          ) : null}

          {!studiesLoading && studies.length === 0 ? (
            <div className="empty-state">У пациента пока нет добавленных исследований.</div>
          ) : null}

          {!studiesLoading && studies.length > 0 ? (
            <div className="xray-studies-list">
              {studies.map((study) => (
                <article
                  key={study.id}
                  className="xray-study-item xray-study-item-clickable"
                  onClick={() => openStudyTemplatesModal(study)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      openStudyTemplatesModal(study)
                    }
                  }}
                >
                  <div className="xray-study-date">{formatStoredDate(study.studyDate)}</div>
                  <div className="xray-study-item-head">
                    <div>
                      <div className="xray-study-item-title">{formatStudyLabel(study)}</div>
                      <div className="xray-study-item-meta">
                        Кассета {study.cassette} • Кол-во {study.studyCount}
                      </div>
                    </div>

                    <div className="xray-study-actions">
                      <button
                        type="button"
                        className="xray-study-edit"
                        onClick={(event) => {
                          event.stopPropagation()
                          openEditStudyModal(study)
                        }}
                        aria-label="Редактировать исследование"
                      >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path
                            d="M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25Zm2.92 2.33H5v-.92l8.06-8.06.92.92L5.92 19.58ZM20.71 7.04a1 1 0 0 0 0-1.41L18.37 3.3a1 1 0 0 0-1.41 0l-1.5 1.5 3.75 3.75 1.5-1.51Z"
                            fill="currentColor"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="xray-study-grid">
                    <div className="xray-study-field">
                      <span>Направительный диагноз</span>
                      <strong>{study.referralDiagnosis}</strong>
                    </div>
                    <div className="xray-study-field">
                      <span>Тип исследования</span>
                      <strong>{study.studyType}</strong>
                    </div>
                    <div className="xray-study-field">
                      <span>Доза облучения</span>
                      <strong>{study.radiationDose}</strong>
                    </div>
                    <div className="xray-study-field">
                      <span>Направил</span>
                      <strong>{study.referredBy}</strong>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      {selectedPatient && isDeleteConfirmOpen ? (
        <div className="reminders-modal-overlay">
          <section
            className="reminders-modal xray-confirm-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="xray-delete-title"
          >
            <div className="reminders-modal-head">
              <div>
                <div className="section-kicker">Удаление пациента</div>
                <h3 id="xray-delete-title" className="reminders-modal-title">
                  Удалить карточку пациента?
                </h3>
              </div>

              <button
                type="button"
                className="reminders-modal-close"
                onClick={() => setIsDeleteConfirmOpen(false)}
                disabled={isDeleting}
                aria-label="Закрыть окно подтверждения"
              >
                ×
              </button>
            </div>

            <p className="xray-confirm-copy">
              Пациент <strong>{getPatientFullName(selectedPatient)}</strong> будет удалён из
              журнала X-ray без возможности восстановления.
            </p>

            <div className="xray-confirm-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setIsDeleteConfirmOpen(false)}
                disabled={isDeleting}
              >
                Отмена
              </button>
              <button
                type="button"
                className="danger-button"
                onClick={handleDeleteCurrentPatient}
                disabled={isDeleting}
              >
                {isDeleting ? 'Удаляю...' : 'Удалить'}
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {selectedPatient && isPatientEditOpen && patientEditForm ? (
        <div className="reminders-modal-overlay">
          <section
            className="reminders-modal xray-confirm-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="xray-patient-edit-title"
          >
            <div className="reminders-modal-head">
              <div>
                <div className="section-kicker">Редактирование пациента</div>
                <h3 id="xray-patient-edit-title" className="reminders-modal-title">
                  Карточка пациента
                </h3>
              </div>

              <button
                type="button"
                className="reminders-modal-close"
                onClick={() => setIsPatientEditOpen(false)}
                disabled={isSaving}
                aria-label="Закрыть окно редактирования пациента"
              >
                ×
              </button>
            </div>

            <form className="patient-form xray-patient-form" onSubmit={handleSubmitPatientEdit}>
              <label className="field">
                <span>Фамилия</span>
                <input
                  type="text"
                  value={patientEditForm.lastName}
                  onChange={(event) =>
                    setPatientEditForm((currentForm) =>
                      currentForm
                        ? {
                            ...currentForm,
                            lastName: normalizePersonNameInput(event.target.value),
                          }
                        : currentForm,
                    )
                  }
                />
              </label>

              <label className="field">
                <span>Имя</span>
                <input
                  type="text"
                  value={patientEditForm.firstName}
                  onChange={(event) =>
                    setPatientEditForm((currentForm) =>
                      currentForm
                        ? {
                            ...currentForm,
                            firstName: normalizePersonNameInput(event.target.value),
                          }
                        : currentForm,
                    )
                  }
                />
              </label>

              <label className="field">
                <span>Отчество</span>
                <input
                  type="text"
                  value={patientEditForm.patronymic}
                  onChange={(event) =>
                    setPatientEditForm((currentForm) =>
                      currentForm
                        ? {
                            ...currentForm,
                            patronymic: normalizePersonNameInput(event.target.value),
                          }
                        : currentForm,
                    )
                  }
                />
              </label>

              <label className="field">
                <span>Дата рождения</span>
                <input
                  type="text"
                  value={patientEditForm.birthDate}
                  onChange={(event) =>
                    setPatientEditForm((currentForm) =>
                      currentForm
                        ? {
                            ...currentForm,
                            birthDate: normalizeBirthDateInput(event.target.value),
                          }
                        : currentForm,
                    )
                  }
                  inputMode="numeric"
                />
              </label>

              <label className="field field-wide">
                <span>Адрес</span>
                <input
                  type="text"
                  value={patientEditForm.address}
                  onChange={(event) =>
                    setPatientEditForm((currentForm) =>
                      currentForm
                        ? {
                            ...currentForm,
                            address: event.target.value,
                          }
                        : currentForm,
                    )
                  }
                />
              </label>

              <label className="field field-wide">
                <span>Ссылка на РМИС</span>
                <input
                  type="text"
                  value={patientEditForm.rmisUrl}
                  onChange={(event) =>
                    setPatientEditForm((currentForm) =>
                      currentForm
                        ? {
                            ...currentForm,
                            rmisUrl: event.target.value,
                          }
                        : currentForm,
                    )
                  }
                  placeholder="Необязательно"
                />
              </label>

              {patientEditError ? (
                <div className="state-banner error-banner">{patientEditError}</div>
              ) : null}

              <div className="xray-confirm-actions">
                <button type="submit" className="primary-button" disabled={isSaving}>
                  {isSaving ? 'Сохраняю...' : 'Сохранить'}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}

      {selectedPatient && isStudyModalOpen ? (
        <div className="reminders-modal-overlay">
          <section
            className="reminders-modal xray-study-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="xray-study-modal-title"
          >
            <div className="reminders-modal-head xray-study-modal-head">
              <div className="xray-study-modal-heading">
                <h3
                  id="xray-study-modal-title"
                  className="reminders-modal-title xray-study-modal-title"
                >
                  {editingStudy ? 'Редактирование исследования' : 'Новое исследование'}
                </h3>
                <label className="xray-study-date-picker">
                <input
                  type="date"
                  value={studyForm.studyDate}
                  onChange={(event) =>
                    setStudyForm((currentForm) => ({
                      ...currentForm,
                      studyDate: event.target.value,
                    }))
                  }
                  max="2099-12-31"
                />
              </label>
              </div>

              <button
                type="button"
                className="reminders-modal-close"
                onClick={() => setIsStudyModalOpen(false)}
                disabled={isSavingStudy}
                aria-label="Закрыть окно исследования"
              >
                ×
              </button>
            </div>

            <form className="xray-study-form" onSubmit={handleSubmitStudy}>
              <label className="field field-wide xray-study-diagnosis-field">
                <span>Направительный диагноз</span>
                <textarea
                  className="xray-study-diagnosis"
                  value={studyForm.referralDiagnosis}
                  onChange={(event) =>
                    setStudyForm((currentForm) => ({
                      ...currentForm,
                      referralDiagnosis: normalizeLeadingCapital(event.target.value),
                    }))
                  }
                />
              </label>

              <XRaySelectField
                label="Область исследования"
                value={studyForm.studyArea}
                options={XRAY_STUDY_AREAS}
                isOpen={openStudySelect === 'studyArea'}
                onToggle={() =>
                  setOpenStudySelect((currentValue) =>
                    currentValue === 'studyArea' ? null : 'studyArea',
                  )
                }
                onSelect={(value) => {
                  setStudyForm((currentForm) => ({
                    ...currentForm,
                    studyArea: value,
                  }))
                  setOpenStudySelect(null)
                }}
              />

              <XRaySelectField
                label="Тип исследования"
                value={studyForm.studyType}
                options={XRAY_STUDY_TYPES}
                isOpen={openStudySelect === 'studyType'}
                onToggle={() =>
                  setOpenStudySelect((currentValue) =>
                    currentValue === 'studyType' ? null : 'studyType',
                  )
                }
                onSelect={(value) => {
                  setStudyForm((currentForm) => ({
                    ...currentForm,
                    studyType: value,
                  }))
                  setOpenStudySelect(null)
                }}
              />

              <XRaySelectField
                label="Кассета"
                value={studyForm.cassette}
                options={XRAY_CASSETTES}
                isOpen={openStudySelect === 'cassette'}
                onToggle={() =>
                  setOpenStudySelect((currentValue) =>
                    currentValue === 'cassette' ? null : 'cassette',
                  )
                }
                onSelect={(value) => {
                  setStudyForm((currentForm) => ({
                    ...currentForm,
                    cassette: value,
                  }))
                  setOpenStudySelect(null)
                }}
              />

              <XRaySelectField
                label="Количество исследований"
                value={studyForm.studyCount}
                options={XRAY_STUDY_COUNTS}
                isOpen={openStudySelect === 'studyCount'}
                onToggle={() =>
                  setOpenStudySelect((currentValue) =>
                    currentValue === 'studyCount' ? null : 'studyCount',
                  )
                }
                onSelect={(value) => {
                  setStudyForm((currentForm) => ({
                    ...currentForm,
                    studyCount: value,
                  }))
                  setOpenStudySelect(null)
                }}
              />

              <label className="field">
                <span>Доза облучения</span>
                <input
                  type="text"
                  value={studyForm.radiationDose}
                  onChange={(event) =>
                    setStudyForm((currentForm) => ({
                      ...currentForm,
                      radiationDose: event.target.value,
                    }))
                  }
                />
              </label>

              <div className="field field-wide xray-referred-by-field">
                <span>Направил</span>
                <input
                  type="text"
                  value={studyForm.referredBy}
                  onChange={(event) =>
                    setStudyForm((currentForm) => ({
                      ...currentForm,
                      referredBy: event.target.value,
                    }))
                  }
                  onFocus={() => setIsReferredByOpen(referredByHistory.length > 0)}
                  onBlur={() => {
                    window.setTimeout(() => setIsReferredByOpen(false), 120)
                  }}
                />
                {isReferredByOpen && referredByHistory.length > 0 ? (
                  <div className="xray-referred-by-menu">
                    {referredByHistory.map((value) => (
                      <button
                        key={value}
                        type="button"
                        className="xray-select-option"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => {
                          setStudyForm((currentForm) => ({
                            ...currentForm,
                            referredBy: value,
                          }))
                          setIsReferredByOpen(false)
                        }}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              {studyFormError ? (
                <div className="state-banner error-banner">{studyFormError}</div>
              ) : null}

              <div className="xray-confirm-actions">
                {editingStudy ? (
                  <button
                    type="button"
                    className="danger-button xray-study-modal-delete"
                    onClick={() => setDeleteStudyCandidate(editingStudy)}
                    disabled={isSavingStudy}
                  >
                    Удалить
                  </button>
                ) : null}
                <button type="submit" className="primary-button" disabled={isSavingStudy}>
                  {isSavingStudy
                    ? 'Сохраняю...'
                    : editingStudy
                      ? 'Сохранить изменения'
                      : 'Добавить исследование'}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}

      {descriptionStudy ? (
        <div className="reminders-modal-overlay xray-top-overlay">
          <section
            className="reminders-modal xray-study-description-modal xray-top-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Описание исследования"
          >
            <button
              type="button"
              className="reminders-modal-close"
              onClick={() => setDescriptionStudy(null)}
              disabled={isSavingStudy}
              aria-label="Закрыть окно описания"
            >
              ×
            </button>

            <div className="xray-study-description-layout">
              <div className="xray-study-description-main">
                <textarea
                  ref={descriptionInputRef}
                  className="xray-study-description-input"
                  value={descriptionDraft}
                  onChange={(event) => setDescriptionDraft(event.target.value)}
                  readOnly={!isDescriptionEditing}
                  placeholder="Описание исследования"
                />

                <div className="xray-study-description-actions">
                  {isDescriptionEditing ? (
                    <button
                      type="button"
                      className="primary-button"
                      onClick={() => void handleSaveStudyDescription()}
                      disabled={isSavingStudy}
                    >
                      {isSavingStudy ? 'Сохраняю...' : 'Сохранить исследование'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => setIsDescriptionEditing(true)}
                    >
                      Редактировать исследование
                    </button>
                  )}

                  <button
                    type="button"
                    className="danger-button"
                    onClick={() => setDeleteStudyCandidate(descriptionStudy)}
                    disabled={deletingStudyId === descriptionStudy.id}
                  >
                    {deletingStudyId === descriptionStudy.id
                      ? 'Удаляю...'
                      : 'Удалить исследование'}
                  </button>
                </div>
              </div>

              <div className="xray-study-description-side" />
            </div>
          </section>
        </div>
      ) : null}

      {deleteStudyCandidate ? (
        <div className="reminders-modal-overlay xray-top-overlay">
          <section
            className="reminders-modal xray-confirm-modal xray-top-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="xray-study-delete-title"
          >
            <div className="reminders-modal-head">
              <div>
                <div className="section-kicker">Удаление исследования</div>
                <h3 id="xray-study-delete-title" className="reminders-modal-title">
                  Удалить исследование?
                </h3>
              </div>

              <button
                type="button"
                className="reminders-modal-close"
                onClick={() => setDeleteStudyCandidate(null)}
                disabled={deletingStudyId === deleteStudyCandidate.id}
                aria-label="Закрыть окно подтверждения"
              >
                ×
              </button>
            </div>

            <p className="xray-confirm-copy">
              Исследование <strong>{formatStudyLabel(deleteStudyCandidate)}</strong> будет
              удалено без возможности восстановления.
            </p>

            <div className="xray-confirm-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setDeleteStudyCandidate(null)}
                disabled={deletingStudyId === deleteStudyCandidate.id}
              >
                Отмена
              </button>
              <button
                type="button"
                className="danger-button"
                onClick={handleDeleteStudyConfirm}
                disabled={deletingStudyId === deleteStudyCandidate.id}
              >
                {deletingStudyId === deleteStudyCandidate.id ? 'Удаляю...' : 'Удалить'}
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {templateStudy ? (
        <div className="reminders-modal-overlay xray-top-overlay">
          <section
            className="reminders-modal xray-study-templates-modal xray-top-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Шаблоны исследований"
          >
            <button
              type="button"
              className="reminders-modal-close"
              onClick={() => setTemplateStudy(null)}
              aria-label="Закрыть окно шаблонов"
            >
              ×
            </button>

            <label className="xray-template-search">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M10.5 4a6.5 6.5 0 1 0 4.03 11.6l4.43 4.43a1 1 0 0 0 1.41-1.41l-4.43-4.43A6.5 6.5 0 0 0 10.5 4Zm0 2a4.5 4.5 0 1 1 0 9a4.5 4.5 0 0 1 0-9Z"
                  fill="currentColor"
                />
              </svg>
              <input
                type="text"
                value={templateQuery}
                onChange={(event) => setTemplateQuery(event.target.value)}
                placeholder="Поиск исследования"
                autoFocus
              />
            </label>

            <div className="xray-template-grid">
              {filteredStudyTemplates.map((template) => (
                <button
                  key={template}
                  type="button"
                  className="xray-template-chip"
                  onClick={() => {
                    if (template === XRAY_STUDY_TEMPLATES[0] && templateStudy) {
                      openStudyDescriptionModal(
                        templateStudy,
                        true,
                        templateStudy.description || 'Рентгенография ',
                      )
                      return
                    }

                    setTemplateQuery(template)
                  }}
                >
                  {template}
                </button>
              ))}
            </div>

            {filteredStudyTemplates.length === 0 ? (
              <div className="empty-state">Ничего не найдено.</div>
            ) : null}
          </section>
        </div>
      ) : null}
    </div>
  )
}

export function XRaySection(props: XRaySectionProps) {
  const [activeTab, setActiveTab] = useState<XRayTab>(XRAY_TABS[0])
  const [homeResetKey, setHomeResetKey] = useState(0)

  function handleTabClick(tab: XRayTab) {
    if (tab === activeTab && tab === 'Главная') {
      props.onReset()
      setHomeResetKey((currentKey) => currentKey + 1)
      return
    }

    setActiveTab(tab)
  }

  function renderContent() {
    if (activeTab === 'Главная') {
      return <XRayHome key={homeResetKey} {...props} />
    }

    if (activeTab === 'Журнал') {
      return (
        <section className="content-card placeholder-card">
          <p className="section-kicker">X-ray</p>
          <h2>Журнал</h2>
          <p className="section-copy">
            Здесь можно будет собрать основной список исследований, статусы и историю
            работы по пациентам.
          </p>
        </section>
      )
    }

    return (
      <section className="content-card placeholder-card">
        <p className="section-kicker">X-ray</p>
        <h2>Статистика</h2>
        <p className="section-copy">
          Здесь можно будет показать сводку по выполненным исследованиям и текущей
          нагрузке.
        </p>
      </section>
    )
  }

  return (
    <section className="xray-layout">
      <nav className="xray-subnav" aria-label="Разделы X-ray">
        {XRAY_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`xray-subnav-button${tab === activeTab ? ' is-active' : ''}`}
            onClick={() => handleTabClick(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      {renderContent()}
    </section>
  )
}
