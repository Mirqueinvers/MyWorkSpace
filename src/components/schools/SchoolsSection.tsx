import { useEffect, useMemo, useState } from 'react'
import type { SchoolInstitution } from '../../types/schools'

const VIEWED_STUDENTS_STORAGE_KEY = 'schools-viewed-students'
const VIEWED_STUDENTS_STORAGE_UNINITIALIZED = '__UNINITIALIZED__'

interface SchoolsSectionProps {
  institutionName: string
  institutionType: 'school' | 'kindergarten'
  institutions: SchoolInstitution[]
  loading: boolean
  error: string
  isSavingInstitution: boolean
  savingClassInstitutionId: number | null
  savingStudentClassId: number | null
  savingLinkStudentId: number | null
  deletingEntityKey: string | null
  onInstitutionNameChange: (value: string) => void
  onInstitutionTypeChange: (value: 'school' | 'kindergarten') => void
  onAddInstitution: () => Promise<boolean>
  onAddClass: (institutionId: number, name: string) => Promise<boolean>
  onAddStudent: (classId: number, name: string) => Promise<boolean>
  onAddLink: (studentId: number, url: string) => Promise<boolean>
  onDeleteInstitution: (id: number) => Promise<void>
  onDeleteClass: (id: number) => Promise<void>
  onDeleteStudent: (id: number) => Promise<void>
  onDeleteLink: (id: number) => Promise<void>
}

export function SchoolsSection({
  institutionName,
  institutionType,
  institutions,
  loading,
  error,
  isSavingInstitution,
  savingClassInstitutionId,
  savingStudentClassId,
  savingLinkStudentId,
  deletingEntityKey,
  onInstitutionNameChange,
  onInstitutionTypeChange,
  onAddInstitution,
  onAddClass,
  onAddStudent,
  onAddLink,
  onDeleteInstitution,
  onDeleteClass,
  onDeleteStudent,
  onDeleteLink,
}: SchoolsSectionProps) {
  const [classDrafts, setClassDrafts] = useState<Record<number, string>>({})
  const [studentDrafts, setStudentDrafts] = useState<Record<number, string>>({})
  const [linkDrafts, setLinkDrafts] = useState<Record<number, string>>({})
  const [linkFormOpenByStudentId, setLinkFormOpenByStudentId] = useState<Record<number, boolean>>({})
  const [expandedInstitutionId, setExpandedInstitutionId] = useState<number | null>(null)
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null)
  const [editingInstitutionIds, setEditingInstitutionIds] = useState<Record<number, boolean>>({})
  const [viewedStudentIds, setViewedStudentIds] = useState<
    Record<number, boolean> | typeof VIEWED_STUDENTS_STORAGE_UNINITIALIZED
  >(VIEWED_STUDENTS_STORAGE_UNINITIALIZED)

  useEffect(() => {
    try {
      const savedValue = window.sessionStorage.getItem(VIEWED_STUDENTS_STORAGE_KEY)
      if (!savedValue) {
        setViewedStudentIds({})
        return
      }

      const parsedValue = JSON.parse(savedValue) as Record<string, boolean>
      const normalizedValue = Object.fromEntries(
        Object.entries(parsedValue).map(([key, value]) => [Number(key), Boolean(value)]),
      ) as Record<number, boolean>
      setViewedStudentIds(normalizedValue)
    } catch {
      setViewedStudentIds({})
    }
  }, [])

  useEffect(() => {
    if (viewedStudentIds === VIEWED_STUDENTS_STORAGE_UNINITIALIZED) {
      return
    }

    try {
      window.sessionStorage.setItem(
        VIEWED_STUDENTS_STORAGE_KEY,
        JSON.stringify(viewedStudentIds),
      )
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
      return
    }

    const hasExpandedInstitution = institutions.some(
      (institution) => institution.id === expandedInstitutionId,
    )

    if (!hasExpandedInstitution) {
      setExpandedInstitutionId(institutions[0].id)
    }
  }, [institutions, expandedInstitutionId])

  const selectedInstitution = useMemo(
    () =>
      institutions.find((institution) => institution.id === expandedInstitutionId) ??
      null,
    [institutions, expandedInstitutionId],
  )

  const selectedClass = useMemo(() => {
    if (!selectedInstitution) {
      return null
    }

    const schoolClass =
      selectedInstitution.classes.find((item) => item.id === selectedClassId) ?? null

    if (schoolClass) {
      return schoolClass
    }

    return selectedInstitution.classes[0] ?? null
  }, [selectedInstitution, selectedClassId])

  useEffect(() => {
    if (selectedClass) {
      setSelectedClassId(selectedClass.id)
    } else {
      setSelectedClassId(null)
    }
  }, [selectedClass?.id])

  async function handleOpenStudentLink(url: string | undefined) {
    if (!url) {
      return
    }

    try {
      await window.electronAPI?.schools.openLink(url)
    } catch {
      // Ignore link open errors silently in this workflow.
    }
  }

  function handleStudentClick(studentId: number, url: string | undefined) {
    setViewedStudentIds((currentState) => {
      const normalizedState =
        currentState === VIEWED_STUDENTS_STORAGE_UNINITIALIZED ? {} : currentState

      return {
        ...normalizedState,
        [studentId]: true,
      }
    })

    void handleOpenStudentLink(url)
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

  function handleDeleteInstitution(id: number, name: string) {
    const isConfirmed = window.confirm(`Удалить учреждение "${name}"?`)
    if (!isConfirmed) {
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
    const isConfirmed = window.confirm(`Удалить "${displayName}"?`)
    if (!isConfirmed) {
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

  return (
    <section className="medical-layout">
      <div className="content-card form-card">
        <div className="section-head">
          <div>
            <p className="section-kicker">Школы</p>
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
                        {institution.type === 'school' ? 'Школа' : 'Детский сад'}
                      </span>
                    </button>

                    <div className="schools-tree-actions">
                      <button
                        type="button"
                        className={`schools-edit-button${isEditing ? ' is-active' : ''}`}
                        onClick={() => {
                          toggleInstitutionEditing(institution.id)
                        }}
                      >
                        {isEditing ? 'Готово' : 'Редактировать'}
                      </button>

                      {isEditing ? (
                        <button
                          type="button"
                          className="schools-tree-delete"
                          onClick={() => {
                            handleDeleteInstitution(institution.id, institution.name)
                          }}
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
                              institution.type === 'school'
                                ? 'Добавить класс'
                                : 'Добавить группу'
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
                              className={`schools-class-select${selectedClass?.id === schoolClass.id ? ' is-active' : ''}`}
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
                                onClick={() => {
                                  handleDeleteClass(
                                    schoolClass.id,
                                    schoolClass.name,
                                    institution.type,
                                    classIndex,
                                  )
                                }}
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
                  onInstitutionTypeChange(
                    event.target.value as 'school' | 'kindergarten',
                  )
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
            <h3>
              {selectedInstitution && selectedClass
                ? `${selectedInstitution.name} · ${getDisplayClassName(
                    selectedClass.name,
                    selectedInstitution.type,
                    selectedInstitution.classes.findIndex(
                      (item) => item.id === selectedClass.id,
                    ),
                  )}`
                : 'Выберите класс или группу'}
            </h3>
          </div>
          <div className="patient-count">
            {selectedClass ? `${selectedClass.students.length} учеников` : '0 учеников'}
          </div>
        </div>

        {!selectedInstitution ? (
          <div className="empty-state">Выберите учреждение слева.</div>
        ) : null}

        {selectedInstitution && !selectedClass ? (
          <div className="empty-state">
            В выбранном учреждении пока нет классов или групп.
          </div>
        ) : null}

        {selectedClass ? (
          <>
            <div className="schools-inline-form schools-inline-form-spaced">
              <input
                type="text"
                value={studentDrafts[selectedClass.id] ?? ''}
                onChange={(event) =>
                  setStudentDrafts((currentDrafts) => ({
                    ...currentDrafts,
                    [selectedClass.id]: event.target.value,
                  }))
                }
                placeholder="Добавить ученика"
              />
              <button
                type="button"
                className="secondary-button"
                onClick={async () => {
                  const isSaved = await onAddStudent(
                    selectedClass.id,
                    studentDrafts[selectedClass.id] ?? '',
                  )

                  if (isSaved) {
                    setStudentDrafts((currentDrafts) => ({
                      ...currentDrafts,
                      [selectedClass.id]: '',
                    }))
                  }
                }}
                disabled={savingStudentClassId === selectedClass.id}
              >
                {savingStudentClassId === selectedClass.id ? 'Сохранение...' : 'Добавить'}
              </button>
            </div>

            {selectedClass.students.length === 0 ? (
              <div className="empty-state">В этом классе пока нет учеников.</div>
            ) : (
              <div className="patient-list schools-list">
                {selectedClass.students.map((student) => (
                  <div key={student.id} className="schools-student-card">
                    <div className="schools-student-head">
                      <button
                        type="button"
                        className={`schools-student-button${student.links[0] ? ' is-copyable' : ''}${viewedStudentIds !== VIEWED_STUDENTS_STORAGE_UNINITIALIZED && viewedStudentIds[student.id] ? ' is-viewed' : ''}`}
                        onClick={() => {
                          handleStudentClick(student.id, student.links[0]?.url)
                        }}
                        title={
                          student.links[0]
                            ? 'Открыть первую ссылку в браузере'
                            : 'У ученика пока нет ссылки'
                        }
                      >
                        {student.name}
                      </button>

                      <div className="schools-student-actions">
                        <button
                          type="button"
                          className={`schools-student-icon-button${linkFormOpenByStudentId[student.id] ? ' is-active' : ''}`}
                          onClick={() => {
                            setLinkFormOpenByStudentId((currentState) => ({
                              ...currentState,
                              [student.id]: !currentState[student.id],
                            }))
                          }}
                          title={
                            linkFormOpenByStudentId[student.id]
                              ? 'Скрыть добавление ссылки'
                              : 'Добавить ссылку'
                          }
                        >
                          +
                        </button>

                        <button
                          type="button"
                          className="schools-student-icon-button schools-student-icon-button-danger"
                          onClick={() => {
                            void onDeleteStudent(student.id)
                          }}
                          disabled={deletingEntityKey === `student-${student.id}`}
                          title="Удалить ученика"
                        >
                          {deletingEntityKey === `student-${student.id}` ? '...' : '×'}
                        </button>
                      </div>
                    </div>

                    {linkFormOpenByStudentId[student.id] ? (
                      <>
                        <div className="schools-inline-form">
                          <input
                            type="text"
                            value={linkDrafts[student.id] ?? ''}
                            onChange={(event) =>
                              setLinkDrafts((currentDrafts) => ({
                                ...currentDrafts,
                                [student.id]: event.target.value,
                              }))
                            }
                            placeholder="Добавить ссылку"
                          />
                          <button
                            type="button"
                            className="secondary-button"
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
                            {savingLinkStudentId === student.id ? 'Сохранение...' : 'Добавить'}
                          </button>
                        </div>

                        {student.links.length > 0 ? (
                          <div className="schools-links">
                            {student.links.map((link, index) => (
                              <div key={link.id} className="schools-link-chip">
                                <a
                                  href={link.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="schools-link-anchor"
                                >
                                  Ссылка {index + 1}
                                </a>
                                <button
                                  type="button"
                                  className="schools-link-delete"
                                  onClick={() => {
                                    void onDeleteLink(link.id)
                                  }}
                                  disabled={deletingEntityKey === `link-${link.id}`}
                                >
                                  {deletingEntityKey === `link-${link.id}` ? '...' : '×'}
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </>
        ) : null}
      </div>
    </section>
  )
}
