import { useEffect, useMemo, useRef, useState } from 'react'
import type { XRayStudy } from '../../../types/xray'
import {
  XRAY_KNEE_STUDY_OPTION_DESCRIPTIONS,
  XRAY_KNEE_STUDY_OPTIONS,
  XRAY_KNEE_STUDY_TEMPLATE,
  XRAY_STUDY_TEMPLATES,
} from '../config'
import type { XRaySectionProps } from '../types'

interface UseXRayStudyDescriptionStateArgs {
  onUpdateStudy: XRaySectionProps['onUpdateStudy']
}

interface JointSpaceSelection {
  status: string
  degree: string
  uniformity: string
}

const EMPTY_JOINT_SPACE_SELECTION: JointSpaceSelection = {
  status: '',
  degree: '',
  uniformity: '',
}

function createInitialJointSpaceState() {
  return {
    rightLateral: { ...EMPTY_JOINT_SPACE_SELECTION },
    rightMedial: { ...EMPTY_JOINT_SPACE_SELECTION },
    leftLateral: { ...EMPTY_JOINT_SPACE_SELECTION },
    leftMedial: { ...EMPTY_JOINT_SPACE_SELECTION },
  }
}

export function useXRayStudyDescriptionState({
  onUpdateStudy,
}: UseXRayStudyDescriptionStateArgs) {
  const [templateStudy, setTemplateStudy] = useState<XRayStudy | null>(null)
  const [templateQuery, setTemplateQuery] = useState('')
  const [templateStep, setTemplateStep] = useState<'root' | 'knees'>('root')
  const [descriptionStudy, setDescriptionStudy] = useState<XRayStudy | null>(null)
  const [descriptionDraft, setDescriptionDraft] = useState('')
  const [isDescriptionEditing, setIsDescriptionEditing] = useState(false)
  const [isJointSpaceModalOpen, setIsJointSpaceModalOpen] = useState(false)
  const [jointSpaceState, setJointSpaceState] = useState(createInitialJointSpaceState)
  const descriptionInputRef = useRef<HTMLTextAreaElement | null>(null)
  const pendingDescriptionRef = useRef<string | null>(null)

  const filteredStudyTemplates = useMemo(() => {
    const sourceTemplates =
      templateStep === 'knees' ? XRAY_KNEE_STUDY_OPTIONS : XRAY_STUDY_TEMPLATES
    const normalizedQuery = templateQuery.trim().toLocaleLowerCase('ru-RU')

    if (!normalizedQuery) {
      return sourceTemplates
    }

    return sourceTemplates.filter((template) =>
      template.toLocaleLowerCase('ru-RU').includes(normalizedQuery),
    )
  }, [templateQuery, templateStep])

  useEffect(() => {
    if (!templateStudy) {
      setTemplateQuery('')
      setTemplateStep('root')
    }
  }, [templateStudy])

  useEffect(() => {
    if (!descriptionStudy) {
      setDescriptionDraft('')
      setIsDescriptionEditing(false)
      setIsJointSpaceModalOpen(false)
      setJointSpaceState(createInitialJointSpaceState())
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

  function handleJointSpaceChange(
    section: 'rightLateral' | 'rightMedial' | 'leftLateral' | 'leftMedial',
    field: keyof JointSpaceSelection,
    value: string,
  ) {
    setJointSpaceState((currentState) => ({
      ...currentState,
      [section]: {
        ...currentState[section],
        [field]: currentState[section][field] === value ? '' : value,
      },
    }))
  }

  function buildJointSpaceSegment(
    jointLabel: string,
    sideLabel: string,
    selection: JointSpaceSelection,
  ) {
    if (!selection.status) {
      return ''
    }

    const details = [selection.status.toLowerCase()]

    if (selection.degree) {
      details.push(selection.degree.toLowerCase())
    }

    if (selection.uniformity) {
      details.push(selection.uniformity.toLowerCase())
    }

    return `${jointLabel}, ${sideLabel}: суставная щель ${details.join(', ')}`
  }

  function handleAddJointSpaceDescription() {
    const parts = [
      buildJointSpaceSegment('Правый коленный сустав', 'латерально', jointSpaceState.rightLateral),
      buildJointSpaceSegment('Правый коленный сустав', 'медиально', jointSpaceState.rightMedial),
      buildJointSpaceSegment('Левый коленный сустав', 'латерально', jointSpaceState.leftLateral),
      buildJointSpaceSegment('Левый коленный сустав', 'медиально', jointSpaceState.leftMedial),
    ].filter(Boolean)

    if (parts.length === 0) {
      return
    }

    setDescriptionDraft((currentDraft) =>
      currentDraft ? `${currentDraft.trimEnd()}\n${parts.join('; ')}.` : `${parts.join('; ')}.`,
    )
    setIsDescriptionEditing(true)
    setIsJointSpaceModalOpen(false)
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

  async function handleDeleteStudyDescription() {
    if (!descriptionStudy) {
      return
    }

    const updatedStudy = await onUpdateStudy({
      id: descriptionStudy.id,
      patientId: descriptionStudy.patientId,
      studyDate: descriptionStudy.studyDate,
      description: '',
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
      setDescriptionDraft('')
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

    if (templateStep === 'root' && template === XRAY_KNEE_STUDY_TEMPLATE) {
      setTemplateStep('knees')
      setTemplateQuery('')
      return
    }

    if (templateStep === 'knees' && templateStudy) {
      const baseDescription =
        XRAY_KNEE_STUDY_OPTION_DESCRIPTIONS[
          template as keyof typeof XRAY_KNEE_STUDY_OPTION_DESCRIPTIONS
        ]
      openStudyDescriptionModal(
        templateStudy,
        true,
        `${baseDescription}\n`,
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
    isJointSpaceModalOpen,
    descriptionInputRef,
    filteredStudyTemplates,
    jointSpaceState,
    setTemplateStudy,
    setTemplateQuery,
    setDescriptionStudy,
    setDescriptionDraft,
    setIsDescriptionEditing,
    setIsJointSpaceModalOpen,
    openStudyTemplatesModal,
    handleSaveStudyDescription,
    handleDeleteStudyDescription,
    handleStudyTemplateSelect,
    handleDeletedStudy,
    handleJointSpaceChange,
    handleAddJointSpaceDescription,
  }
}
