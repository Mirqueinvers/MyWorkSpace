import { useEffect, useState } from 'react'
import type { XRayStudy } from '../../../types/xray'
import { XRAY_REFERRED_BY_STORAGE_KEY } from '../config'
import { createInitialStudyFormState } from '../helpers'
import type { StudyFormState, StudySelectFieldKey, XRaySectionProps } from '../types'

interface UseXRayStudyStateArgs {
  selectedPatient: XRaySectionProps['selectedPatient']
  onAddStudy: XRaySectionProps['onAddStudy']
  onUpdateStudy: XRaySectionProps['onUpdateStudy']
  onDeleteStudy: XRaySectionProps['onDeleteStudy']
  onDeletedStudy?: (deletedStudyId: number) => void
}

export function useXRayStudyState({
  selectedPatient,
  onAddStudy,
  onUpdateStudy,
  onDeleteStudy,
  onDeletedStudy,
}: UseXRayStudyStateArgs) {
  const [deleteStudyCandidate, setDeleteStudyCandidate] = useState<XRayStudy | null>(null)
  const [editingStudy, setEditingStudy] = useState<XRayStudy | null>(null)
  const [isStudyModalOpen, setIsStudyModalOpen] = useState(false)
  const [studyForm, setStudyForm] = useState<StudyFormState>(createInitialStudyFormState)
  const [studyFormError, setStudyFormError] = useState('')
  const [openStudySelect, setOpenStudySelect] = useState<StudySelectFieldKey>(null)
  const [referredByHistory, setReferredByHistory] = useState<string[]>([])
  const [isReferredByOpen, setIsReferredByOpen] = useState(false)

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

  async function handleSubmitStudy(event: React.FormEvent<HTMLFormElement>) {
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
      window.localStorage.setItem(XRAY_REFERRED_BY_STORAGE_KEY, JSON.stringify(nextHistory))
      setIsStudyModalOpen(false)
    }
  }

  async function handleDeleteStudyConfirm() {
    if (!deleteStudyCandidate) {
      return
    }

    const deletedStudyId = deleteStudyCandidate.id
    await onDeleteStudy(deletedStudyId)
    onDeletedStudy?.(deletedStudyId)
    setDeleteStudyCandidate(null)
  }

  return {
    deleteStudyCandidate,
    editingStudy,
    isStudyModalOpen,
    studyForm,
    studyFormError,
    openStudySelect,
    referredByHistory,
    isReferredByOpen,
    setDeleteStudyCandidate,
    setIsStudyModalOpen,
    setStudyForm,
    setOpenStudySelect,
    setIsReferredByOpen,
    openCreateStudyModal,
    openEditStudyModal,
    handleSubmitStudy,
    handleDeleteStudyConfirm,
  }
}
