import { useEffect, useMemo, useState } from 'react'
import type { SchoolInstitution, SchoolStudent } from '../../types/school'
import type { XRayPatient } from '../../types/xray'

const VIEWED_STUDENTS_STORAGE_KEY = 'school-viewed-students'
const VIEWED_STUDENTS_STORAGE_UNINITIALIZED = '__UNINITIALIZED__'
const PATIENT_OPEN_ERROR = 'Не удалось открыть карточку пациента.'

interface SchoolSectionProps {
  institutionName: string
  institutionType: 'school' | 'kindergarten'
  institutions: SchoolInstitution[]
  loading: boolean
  error: string
  isSavingInstitution: boolean
  savingClassInstitutionId: number | null
  savingLinkStudentId: number | null
  deletingEntityKey: string | null
  onInstitutionNameChange: (value: string) => void
  onInstitutionTypeChange: (value: 'school' | 'kindergarten') => void
  onAddInstitution: () => Promise<boolean>
  onAddClass: (institutionId: number, name: string) => Promise<boolean>
  onAddLink: (studentId: number, url: string) => Promise<boolean>
  onDeleteInstitution: (id: number) => Promise<void>
  onDeleteClass: (id: number) => Promise<void>
  onSelectPatient: (patient: XRayPatient) => void
  onOpenPatient: () => void
}

function formatBirthDate(value: string) {
  const digits = String(value ?? '').replace(/\D/g, '')
  if (digits.length !== 8) return value
  return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`
}

function getFullName(student: SchoolStudent) {
  return student.name
}

function getViewedStudentKey(student: SchoolStudent) {
  return `${student.name}|${student.birthDate}`.toLocaleLowerCase('ru-RU')
}

function getStudentClipboardKey(student: SchoolStudent) {
  const initials = student.name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0] ?? '')
    .join('')
  const birthDateDigits = String(student.birthDate ?? '').replace(/\D/g, '')
  return `${initials}${birthDateDigits}`.toLocaleLowerCase('ru-RU')
}

function getPrimaryLink(student: SchoolStudent) {
  return student.rmisUrl ?? ''
}

function getDisplayClassName(
  rawName: string,
  currentInstitutionType: 'school' | 'kindergarten',
  index: number,
) {
  if (rawName.includes('?')) {
    return `${currentInstitutionType === 'school' ? 'Класс' : 'Группа'} ${index + 1}`
  }

  return rawName
}

function getDisplayInstitutionType(type: 'school' | 'kindergarten') {
  return type === 'school' ? 'Школа' : 'Детский сад'
}

export function SchoolSection({
  institutionName,
  institutionType,
  institutions,
  loading,
  error,
  isSavingInstitution,
  savingClassInstitutionId,
  savingLinkStudentId,
  deletingEntityKey,
  onInstitutionNameChange,
  onInstitutionTypeChange,
  onAddInstitution,
  onAddClass,
  onAddLink,
  onDeleteInstitution,
  onDeleteClass,
  onSelectPatient,
  onOpenPatient,
}: SchoolSectionProps) {
  const [classDrafts, setClassDrafts] = useState<Record<number, string>>({})
  const [linkDrafts, setLinkDrafts] = useState<Record<number, string>>({})
  const [linkFormOpenByStudentId, setLinkFormOpenByStudentId] = useState<Record<number, boolean>>(
    {},
  )
  const [expandedInstitutionId, setExpandedInstitutionId] = useState<number | null>(null)
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null)
  const [editingInstitutionIds, setEditingInstitutionIds] = useState<Record<number, boolean>>({})
  const [copiedStudentId, setCopiedStudentId] = useState<number | null>(null)
  const [viewedStudentIds, setViewedStudentIds] = useState<
    Record<string, boolean> | typeof VIEWED_STUDENTS_STORAGE_UNINITIALIZED
  >(VIEWED_STUDENTS_STORAGE_UNINITIALIZED)

  useEffect(() => {
    try {
      const savedValue = window.sessionStorage.getItem(VIEWED_STUDENTS_STORAGE_KEY)

      if (!savedValue) {
        setViewedStudentIds({})
        return
      }

      setViewedStudentIds(JSON.parse(savedValue) as Record<string, boolean>)
    } catch {
      setViewedStudentIds({})
    }
  }, [])

  useEffect(() => {
    if (viewedStudentIds === VIEWED_STUDENTS_STORAGE_UNINITIALIZED) {
      return
    }

    try {
      window.sessionStorage.setItem(VIEWED_STUDENTS_STORAGE_KEY, JSON.stringify(viewedStudentIds))
    } catch {
      // Ignore session storage write errors.
    }
  }, [viewedStudentIds])

  useEffect(() => {
    if (institutions.length === 0) {
      setExpandedInstitutionId(null)
      setSelectedClassId(null)
      return
    }

    if (expandedInstitutionId === null) {
      setExpandedInstitutionId(institutions[0].id)
    }
  }, [institutions, expandedInstitutionId])

  const selectedInstitution = useMemo(
    () =>
      institutions.find((institution) => institution.id === expandedInstitutionId) ?? null,
    [institutions, expandedInstitutionId],
  )

  const selectedClass = useMemo(() => {
    if (!selectedInstitution) {
      return null
    }

    const schoolClass =
      selectedInstitution.classes.find((item) => item.id === selectedClassId) ?? null

    return schoolClass ?? selectedInstitution.classes[0] ?? null
  }, [selectedInstitution, selectedClassId])

  useEffect(() => {
    if (selectedClass) {
      setSelectedClassId(selectedClass.id)
    } else {
      setSelectedClassId(null)
    }
  }, [selectedClass?.id])

  function handleDeleteInstitution(id: number, name: string) {
    if (!window.confirm(`Удалить учреждение "${name}"?`)) {
      return
    }

    void onDeleteInstitution(id)
  }

  function handleDeleteClass(
    id: number,
    name: string,
    currentInstitutionType: 'school' | 'kindergarten',
    index: number,
  ) {
    const displayName = getDisplayClassName(name, currentInstitutionType, index)

    if (!window.confirm(`Удалить "${displayName}"?`)) {
      return
    }

    void onDeleteClass(id)
  }

  function toggleInstitutionEditing(institutionId: number) {
    setEditingInstitutionIds((currentState) => ({
      ...currentState,
      [institutionId]: !currentState[institutionId],
    }))
  }

  async function handleOpenPatient(student: SchoolStudent) {
    if (!student.xrayPatientId || !window.electronAPI?.xray?.getPatientById) {
      alert('Пациент не найден в карточках.')
      return
    }

    try {
      const matchedPatient = await window.electronAPI.xray.getPatientById(student.xrayPatientId)

      if (!matchedPatient) {
        return
      }

      onSelectPatient(matchedPatient)
      onOpenPatient()
      setViewedStudentIds((currentValue) => {
        const nextValue =
          currentValue === VIEWED_STUDENTS_STORAGE_UNINITIALIZED ? {} : currentValue

        return {
          ...nextValue,
          [getViewedStudentKey(student)]: true,
        }
      })
    } catch {
      alert(PATIENT_OPEN_ERROR)
    }
  }

  async function handleCopyStudentKey(student: SchoolStudent) {
    try {
      await navigator.clipboard.writeText(getStudentClipboardKey(student))
      setViewedStudentIds((currentValue) => {
        const nextValue =
          currentValue === VIEWED_STUDENTS_STORAGE_UNINITIALIZED ? {} : currentValue

        return {
          ...nextValue,
          [getViewedStudentKey(student)]: true,
        }
      })
      setCopiedStudentId(student.id)
      window.setTimeout(() => {
        setCopiedStudentId((currentId) => (currentId === student.id ? null : currentId))
      }, 1400)
    } catch {
      // Copying is a convenience only.
    }
  }

  const selectedClassLabel =
    selectedInstitution && selectedClass
      ? `${selectedInstitution.name} · ${getDisplayClassName(
          selectedClass.name,
          selectedInstitution.type,
          selectedInstitution.classes.findIndex((item) => item.id === selectedClass.id),
        )}`
      : 'Выберите класс'

  return (
    <section className="medical-layout">
      <div className="content-card form-card">
        <div className="section-head">
          <div>
            <p className="section-kicker">School</p>
            <h2>Учреждения</h2>
          </div>
        </div>

        {error ? <div className="state-banner error-banner">{error}</div> : null}

        {!loading && institutions.length === 0 ? (
          <div className="empty-state">Учреждений пока нет.</div>
        ) : null}

        {institutions.length > 0 ? (
          <div className="schools-tree">
            {institutions.map((institution) => {
              const isExpanded = institution.id === expandedInstitutionId
              const isEditing = Boolean(editingInstitutionIds[institution.id])

              return (
                <div key={institution.id} className="schools-tree-item">
                  <div className="schools-tree-head">
                    <button
                      type="button"
                      className={`schools-tree-button${isExpanded ? ' is-active' : ''}`}
                      onClick={() => {
                        setExpandedInstitutionId((currentId) =>
                          currentId === institution.id ? null : institution.id,
                        )
                      }}
                    >
                      <span>{institution.name}</span>
                      <span className="schools-tree-type">
                        {getDisplayInstitutionType(institution.type)}
                      </span>
                    </button>

                    <div className="schools-tree-actions">
                      <button
                        type="button"
                        className={`schools-edit-button${isEditing ? ' is-active' : ''}`}
                        onClick={() => toggleInstitutionEditing(institution.id)}
                      >
                        {isEditing ? 'Готово' : 'Редактировать'}
                      </button>

                      {isEditing ? (
                        <button
                          type="button"
                          className="schools-tree-delete"
                          onClick={() => handleDeleteInstitution(institution.id, institution.name)}
                          disabled={deletingEntityKey === `institution-${institution.id}`}
                        >
                          {deletingEntityKey === `institution-${institution.id}` ? '...' : '×'}
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {isExpanded ? (
                    <div className="schools-tree-body">
                      {isEditing ? (
                        <div className="schools-inline-form">
                          <input
                            type="text"
                            value={classDrafts[institution.id] ?? ''}
                            onChange={(event) =>
                              setClassDrafts((currentDrafts) => ({
                                ...currentDrafts,
                                [institution.id]: event.target.value,
                              }))
                            }
                            placeholder={
                              institution.type === 'school' ? 'Добавить класс' : 'Добавить группу'
                            }
                          />
                          <button
                            type="button"
                            className="secondary-button"
                            onClick={async () => {
                              const isSaved = await onAddClass(
                                institution.id,
                                classDrafts[institution.id] ?? '',
                              )

                              if (isSaved) {
                                setClassDrafts((currentDrafts) => ({
                                  ...currentDrafts,
                                  [institution.id]: '',
                                }))
                              }
                            }}
                            disabled={savingClassInstitutionId === institution.id}
                          >
                            {savingClassInstitutionId === institution.id ? '...' : 'Добавить'}
                          </button>
                        </div>
                      ) : null}

                      <div className="schools-class-list">
                        {institution.classes.map((schoolClass, classIndex) => (
                          <div key={schoolClass.id} className="schools-class-list-item">
                            <button
                              type="button"
                              className={`schools-class-select${
                                selectedClass?.id === schoolClass.id ? ' is-active' : ''
                              }`}
                              onClick={() => {
                                setExpandedInstitutionId(institution.id)
                                setSelectedClassId(schoolClass.id)
                              }}
                            >
                              {getDisplayClassName(
                                schoolClass.name,
                                institution.type,
                                classIndex,
                              )}
                            </button>

                            {isEditing ? (
                              <button
                                type="button"
                                className="schools-tree-delete"
                                onClick={() =>
                                  handleDeleteClass(
                                    schoolClass.id,
                                    schoolClass.name,
                                    institution.type,
                                    classIndex,
                                  )
                                }
                                disabled={deletingEntityKey === `class-${schoolClass.id}`}
                              >
                                {deletingEntityKey === `class-${schoolClass.id}` ? '...' : '×'}
                              </button>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        ) : null}

        <div className="schools-creator">
          <div className="section-head">
            <div>
              <p className="section-kicker">Добавление</p>
              <h3>Новое учреждение</h3>
            </div>
          </div>

          <div className="patient-form schools-form">
            <label className="field field-wide">
              <span>Название</span>
              <input
                type="text"
                value={institutionName}
                onChange={(event) => onInstitutionNameChange(event.target.value)}
                placeholder="Введите название школы или детского сада"
              />
            </label>

            <label className="field field-wide">
              <span>Тип</span>
              <select
                className="schools-select"
                value={institutionType}
                onChange={(event) =>
                  onInstitutionTypeChange(event.target.value as 'school' | 'kindergarten')
                }
              >
                <option value="school">Школа</option>
                <option value="kindergarten">Детский сад</option>
              </select>
            </label>

            <button
              type="button"
              className="primary-button"
              onClick={() => {
                void onAddInstitution()
              }}
              disabled={isSavingInstitution}
            >
              {isSavingInstitution ? 'Сохранение...' : 'Создать учреждение'}
            </button>
          </div>
        </div>
      </div>

      <div className="content-card list-card">
        <div className="list-head">
          <div>
            <p className="section-kicker">Список</p>
            <h3>{selectedClassLabel}</h3>
          </div>
          <div className="patient-count">
            {selectedClass ? `${selectedClass.students.length} учеников` : '0 учеников'}
          </div>
        </div>

        {!selectedInstitution ? (
          <div className="empty-state">Выберите учреждение слева.</div>
        ) : null}

        {selectedInstitution && !selectedClass ? (
          <div className="empty-state">В выбранном учреждении пока нет классов или групп.</div>
        ) : null}

        {selectedClass ? (
          <>
            {selectedClass.students.length === 0 ? (
              <div className="empty-state">В этом классе пока нет учеников.</div>
            ) : (
              <div className="xray-journal-list">
                {selectedClass.students.map((student) => {
                  const isViewed =
                    viewedStudentIds !== VIEWED_STUDENTS_STORAGE_UNINITIALIZED &&
                    Boolean(viewedStudentIds[getViewedStudentKey(student)])
                  const hasLink = Boolean(getPrimaryLink(student))

                  return (
                    <article key={student.id} className="xray-journal-item xray-fl-journal-item">
                      <div className="xray-journal-item-head">
                        <div className="xray-fl-journal-patient-line">
                          <button
                            type="button"
                            className="xray-fl-journal-copy-button"
                            onClick={() => void handleOpenPatient(student)}
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
                            className={`xray-fl-journal-name${hasLink ? ' has-link' : ''}${isViewed ? ' is-viewed' : ''}`}
                            onClick={() => {
                              if (student.rmisUrl) {
                                void window.electronAPI?.xray?.openLink?.(student.rmisUrl)
                              }
                            }}
                            role={student.rmisUrl ? 'button' : undefined}
                            tabIndex={student.rmisUrl ? 0 : undefined}
                            onKeyDown={(event) => {
                              if (
                                student.rmisUrl &&
                                (event.key === 'Enter' || event.key === ' ')
                              ) {
                                event.preventDefault()
                                void window.electronAPI?.xray?.openLink?.(student.rmisUrl)
                              }
                            }}
                          >
                            {getFullName(student)}
                          </strong>
                          <span className={`xray-fl-journal-birth-date${isViewed ? ' is-viewed' : ''}`}>
                            {formatBirthDate(student.birthDate)}
                          </span>
                          <button
                            type="button"
                            className={`xray-fl-journal-copy-button${copiedStudentId === student.id ? ' is-copied' : ''}`}
                            onClick={() => void handleCopyStudentKey(student)}
                            aria-label="Скопировать ключ ученика"
                            title="Скопировать ключ ученика"
                          >
                            {copiedStudentId === student.id ? (
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
                            onClick={() => {
                              setLinkFormOpenByStudentId((currentState) => ({
                                ...currentState,
                                [student.id]: !currentState[student.id],
                              }))
                            }}
                            aria-label="Добавить ссылку ученику"
                            title="Добавить ссылку ученику"
                          >
                            +
                          </button>
                        </div>
                        <span>
                          {student.links.length > 0 ? `Ссылок: ${student.links.length}` : 'Ссылок нет'}
                        </span>
                      </div>

                      {linkFormOpenByStudentId[student.id] ? (
                        <div className="xray-fl-journal-rmis-editor">
                          <input
                            type="text"
                            className="input"
                            value={linkDrafts[student.id] ?? ''}
                            onChange={(event) =>
                              setLinkDrafts((currentDrafts) => ({
                                ...currentDrafts,
                                [student.id]: event.target.value,
                              }))
                            }
                            placeholder="Ссылка на ученика"
                          />
                          <button
                            type="button"
                            className="primary-button"
                            onClick={async () => {
                              const isSaved = await onAddLink(
                                student.id,
                                linkDrafts[student.id] ?? '',
                              )

                              if (isSaved) {
                                setLinkDrafts((currentDrafts) => ({
                                  ...currentDrafts,
                                  [student.id]: '',
                                }))
                                setLinkFormOpenByStudentId((currentState) => ({
                                  ...currentState,
                                  [student.id]: false,
                                }))
                              }
                            }}
                            disabled={savingLinkStudentId === student.id}
                          >
                            {savingLinkStudentId === student.id ? 'Сохраняю...' : 'Сохранить'}
                          </button>
                        </div>
                      ) : null}
                    </article>
                  )
                })}
              </div>
            )}
          </>
        ) : null}
      </div>
    </section>
  )
}
