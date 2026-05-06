import { useEffect, useState } from 'react'
import type { SchoolInstitution } from '../types/school'

const ELECTRON_API_UNAVAILABLE =
  'API Electron недоступно. Откройте экран через dev:electron.'
const LOAD_ERROR = 'Не удалось загрузить School из базы SQLite.'
const SAVE_ERROR = 'Не удалось сохранить запись в School.'

export function useSchool() {
  const [institutionName, setInstitutionName] = useState('')
  const [institutionType, setInstitutionType] = useState<'school' | 'kindergarten'>('school')
  const [institutions, setInstitutions] = useState<SchoolInstitution[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSavingInstitution, setIsSavingInstitution] = useState(false)
  const [savingClassInstitutionId, setSavingClassInstitutionId] = useState<number | null>(null)
  const [savingLinkStudentId, setSavingLinkStudentId] = useState<number | null>(null)
  const [deletingEntityKey, setDeletingEntityKey] = useState<string | null>(null)

  useEffect(() => {
    let isCancelled = false

    async function loadInstitutions() {
      if (!window.electronAPI?.school) {
        setError(ELECTRON_API_UNAVAILABLE)
        setInstitutions([])
        return
      }

      setLoading(true)
      setError('')

      try {
        const items = await window.electronAPI.school.list()

        if (!isCancelled) {
          setInstitutions(items)
        }
      } catch {
        if (!isCancelled) {
          setInstitutions([])
          setError(LOAD_ERROR)
        }
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    void loadInstitutions()

    return () => {
      isCancelled = true
    }
  }, [])

  async function handleAddInstitution() {
    const normalizedName = institutionName.trim()

    if (!normalizedName) {
      setError('Введите название школы или детского сада.')
      return false
    }

    if (!window.electronAPI?.school) {
      setError(ELECTRON_API_UNAVAILABLE)
      return false
    }

    setIsSavingInstitution(true)
    setError('')

    try {
      const createdInstitution = await window.electronAPI.school.addInstitution({
        name: normalizedName,
        type: institutionType,
      })

      setInstitutions((currentInstitutions) => [
        createdInstitution,
        ...currentInstitutions,
      ])
      setInstitutionName('')
      setInstitutionType('school')
      return true
    } catch {
      setError(SAVE_ERROR)
      return false
    } finally {
      setIsSavingInstitution(false)
    }
  }

  async function handleAddClass(institutionId: number, name: string) {
    const normalizedName = name.trim()

    if (!normalizedName) {
      setError('Введите название класса или группы.')
      return false
    }

    if (!window.electronAPI?.school) {
      setError(ELECTRON_API_UNAVAILABLE)
      return false
    }

    setSavingClassInstitutionId(institutionId)
    setError('')

    try {
      const createdClass = await window.electronAPI.school.addClass({
        institutionId,
        name: normalizedName,
      })

      setInstitutions((currentInstitutions) =>
        currentInstitutions.map((institution) =>
          institution.id === institutionId
            ? { ...institution, classes: [...institution.classes, createdClass] }
            : institution,
        ),
      )
      return true
    } catch {
      setError(SAVE_ERROR)
      return false
    } finally {
      setSavingClassInstitutionId(null)
    }
  }

  async function handleAddLink(studentId: number, url: string) {
    const normalizedUrl = url.trim()

    if (!normalizedUrl) {
      setError('Введите ссылку.')
      return false
    }

    if (!window.electronAPI?.school) {
      setError(ELECTRON_API_UNAVAILABLE)
      return false
    }

    setSavingLinkStudentId(studentId)
    setError('')

    try {
      const createdLink = await window.electronAPI.school.addLink({
        studentId,
        url: normalizedUrl,
      })

      setInstitutions((currentInstitutions) =>
        currentInstitutions.map((institution) => ({
          ...institution,
          classes: institution.classes.map((schoolClass) => ({
            ...schoolClass,
            students: schoolClass.students.map((student) =>
              student.id === studentId
                ? {
                    ...student,
                    links: [...student.links, createdLink],
                    rmisUrl: createdLink.url,
                  }
                : student,
            ),
          })),
        })),
      )
      return true
    } catch {
      setError(SAVE_ERROR)
      return false
    } finally {
      setSavingLinkStudentId(null)
    }
  }

  async function handleDeleteInstitution(id: number) {
    await deleteEntity(`institution-${id}`, () => window.electronAPI!.school.deleteInstitution(id))
    setInstitutions((currentInstitutions) =>
      currentInstitutions.filter((institution) => institution.id !== id),
    )
  }

  async function handleDeleteClass(id: number) {
    await deleteEntity(`class-${id}`, () => window.electronAPI!.school.deleteClass(id))
    setInstitutions((currentInstitutions) =>
      currentInstitutions.map((institution) => ({
        ...institution,
        classes: institution.classes.filter((schoolClass) => schoolClass.id !== id),
      })),
    )
  }

  async function handleDeleteStudent(id: number) {
    await deleteEntity(`student-${id}`, () => window.electronAPI!.school.deleteStudent(id))
    setInstitutions((currentInstitutions) =>
      currentInstitutions.map((institution) => ({
        ...institution,
        classes: institution.classes.map((schoolClass) => ({
          ...schoolClass,
          students: schoolClass.students.filter((student) => student.id !== id),
        })),
      })),
    )
  }

  async function handleDeleteLink(id: number) {
    await deleteEntity(`link-${id}`, () => window.electronAPI!.school.deleteLink(id))
    setInstitutions((currentInstitutions) =>
      currentInstitutions.map((institution) => ({
        ...institution,
        classes: institution.classes.map((schoolClass) => ({
          ...schoolClass,
          students: schoolClass.students.map((student) => ({
            ...student,
            links: student.links.filter((link) => link.id !== id),
          })),
        })),
      })),
    )
  }

  async function deleteEntity(key: string, action: () => Promise<boolean>) {
    if (!window.electronAPI?.school) {
      setError(ELECTRON_API_UNAVAILABLE)
      return
    }

    setDeletingEntityKey(key)
    setError('')

    try {
      await action()
    } catch {
      setError('Не удалось удалить запись в School.')
      throw new Error('DELETE_FAILED')
    } finally {
      setDeletingEntityKey(null)
    }
  }

  return {
    institutionName,
    setInstitutionName,
    institutionType,
    setInstitutionType,
    institutions,
    loading,
    error,
    isSavingInstitution,
    savingClassInstitutionId,
    savingLinkStudentId,
    deletingEntityKey,
    handleAddInstitution,
    handleAddClass,
    handleAddLink,
    handleDeleteInstitution,
    handleDeleteClass,
    handleDeleteStudent,
    handleDeleteLink,
  }
}
