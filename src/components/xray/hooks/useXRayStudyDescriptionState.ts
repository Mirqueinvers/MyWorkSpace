import { useEffect, useMemo, useRef, useState } from 'react'
import type { XRayStudy } from '../../../types/xray'
import { XRAY_STUDY_TEMPLATES } from '../config'
import type { XRaySectionProps } from '../types'

interface UseXRayStudyDescriptionStateArgs {
  onUpdateStudy: XRaySectionProps['onUpdateStudy']
}

export function useXRayStudyDescriptionState({
  onUpdateStudy,
}: UseXRayStudyDescriptionStateArgs) {
  const [templateStudy, setTemplateStudy] = useState<XRayStudy | null>(null)
  const [templateQuery, setTemplateQuery] = useState('')
  const [descriptionStudy, setDescriptionStudy] = useState<XRayStudy | null>(null)
  const [descriptionDraft, setDescriptionDraft] = useState('')
  const [isDescriptionEditing, setIsDescriptionEditing] = useState(false)
  const descriptionInputRef = useRef<HTMLTextAreaElement | null>(null)
  const pendingDescriptionRef = useRef<string | null>(null)

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

  function handleStudyTemplateSelect(template: string) {
    if (template === XRAY_STUDY_TEMPLATES[0] && templateStudy) {
      openStudyDescriptionModal(
        templateStudy,
        true,
        templateStudy.description || 'Рентгенография ',
      )
      return
    }

    setTemplateQuery(template)
  }

  function handleDeletedStudy(deletedStudyId: number) {
    if (descriptionStudy?.id === deletedStudyId) {
      setDescriptionStudy(null)
    }
  }

  return {
    templateStudy,
    templateQuery,
    descriptionStudy,
    descriptionDraft,
    isDescriptionEditing,
    descriptionInputRef,
    filteredStudyTemplates,
    setTemplateStudy,
    setTemplateQuery,
    setDescriptionStudy,
    setDescriptionDraft,
    setIsDescriptionEditing,
    openStudyTemplatesModal,
    handleSaveStudyDescription,
    handleStudyTemplateSelect,
    handleDeletedStudy,
  }
}
