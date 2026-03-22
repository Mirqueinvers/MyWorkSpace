import { useEffect, useMemo, useRef, useState } from 'react'
import type { XRayStudy } from '../../../types/xray'
import {
  XRAY_KNEE_BUMPS_OPTIONS,
  XRAY_KNEE_CONGRUENCY_OPTIONS,
  XRAY_KNEE_ENDOPROSTHESIS_OPTIONS,
  XRAY_KNEE_INTEGRITY_OPTIONS,
  XRAY_KNEE_NORMAL_DESCRIPTION,
  XRAY_KNEE_PARAARTICULAR_OPTIONS,
  XRAY_KNEE_STUDY_OPTION_DESCRIPTIONS,
  XRAY_KNEE_STUDY_OPTIONS,
  XRAY_KNEE_STUDY_TEMPLATE,
  XRAY_STUDY_TEMPLATES,
} from '../config'
import {
  createInitialKneeJointSurfaceState,
  createInitialKneeJointSpaceState,
  generateKneeJointSurfaceDescription,
  generateKneeJointSpaceDescription,
} from '../helpers/generateKneeJointSpaceDescription'
import {
  createInitialKneeOsteophytesState,
  generateKneeOsteophytesDescription,
} from '../helpers/generateKneeOsteophytesDescription'
import type { XRaySectionProps } from '../types'

interface UseXRayStudyDescriptionStateArgs {
  onUpdateStudy: XRaySectionProps['onUpdateStudy']
}

function splitStudyDescription(value: string) {
  const source = String(value ?? '').trim()

  if (!source) {
    return { description: '', diagnosis: '' }
  }

  const diagnosisMarker = '\n\nЗаключение: '
  const markerIndex = source.lastIndexOf(diagnosisMarker)

  if (markerIndex === -1) {
    return { description: source, diagnosis: '' }
  }

  return {
    description: source.slice(0, markerIndex).trim(),
    diagnosis: source.slice(markerIndex + diagnosisMarker.length).trim(),
  }
}

function normalizeStudyDescription(value: string) {
  const trimmed = String(value ?? '').trim()

  if (!trimmed) {
    return ''
  }

  const [titleLine = '', ...restLines] = trimmed.split('\n')
  const rest = restLines.join('\n').trim()

  if (!rest) {
    return titleLine.trim()
  }

  return `${titleLine.trim()}\n\n${rest}`
}

function normalizeStudyDescriptionOnChange(value: string) {
  const source = String(value ?? '')

  if (!source.trim()) {
    return ''
  }

  const lines = source.split('\n')
  const titleLine = lines[0]?.trim() ?? ''

  if (!titleLine) {
    return source
  }

  const rest = lines.slice(1).join('\n')

  if (!rest.trim()) {
    return titleLine
  }

  return `${titleLine}\n\n${rest.replace(/^\n+/, '')}`
}

function hasOnlyStudyTitle(value: string) {
  const normalized = normalizeStudyDescription(value)

  if (!normalized) {
    return false
  }

  return !normalized.includes('\n\n')
}

function composeStudyDescription(description: string, diagnosis: string) {
  const normalizedDescription = normalizeStudyDescription(description)
  const normalizedDiagnosis = String(diagnosis ?? '').trim()

  if (!normalizedDiagnosis) {
    return normalizedDescription
  }

  if (!normalizedDescription) {
    return `Заключение: ${normalizedDiagnosis}`
  }

  return `${normalizedDescription}\n\nЗаключение: ${normalizedDiagnosis}`
}

export function useXRayStudyDescriptionState({
  onUpdateStudy,
}: UseXRayStudyDescriptionStateArgs) {
  const [templateStudy, setTemplateStudy] = useState<XRayStudy | null>(null)
  const [templateQuery, setTemplateQuery] = useState('')
  const [templateStep, setTemplateStep] = useState<'root' | 'knees'>('root')
  const [descriptionStudy, setDescriptionStudy] = useState<XRayStudy | null>(null)
  const [descriptionDraft, setDescriptionDraft] = useState('')
  const [diagnosisDraft, setDiagnosisDraft] = useState('')
  const [isDescriptionEditing, setIsDescriptionEditing] = useState(false)
  const [isJointSpaceModalOpen, setIsJointSpaceModalOpen] = useState(false)
  const [isJointSurfaceModalOpen, setIsJointSurfaceModalOpen] = useState(false)
  const [isBumpsModalOpen, setIsBumpsModalOpen] = useState(false)
  const [isCongruencyModalOpen, setIsCongruencyModalOpen] = useState(false)
  const [isIntegrityModalOpen, setIsIntegrityModalOpen] = useState(false)
  const [isParaarticularModalOpen, setIsParaarticularModalOpen] = useState(false)
  const [isEndoprosthesisModalOpen, setIsEndoprosthesisModalOpen] = useState(false)
  const [isOsteophytesModalOpen, setIsOsteophytesModalOpen] = useState(false)
  const [jointSpaceState, setJointSpaceState] = useState(createInitialKneeJointSpaceState)
  const [jointSurfaceState, setJointSurfaceState] = useState(createInitialKneeJointSurfaceState)
  const [osteophytesState, setOsteophytesState] = useState(createInitialKneeOsteophytesState)
  const descriptionInputRef = useRef<HTMLTextAreaElement | null>(null)
  const pendingDescriptionRef = useRef<string | null>(null)

  const isKneeStudyContext = useMemo(() => {
    if (!descriptionStudy) {
      return false
    }

    const source = [descriptionStudy.description, descriptionStudy.referralDiagnosis, descriptionDraft]
      .join(' ')
      .toLocaleLowerCase('ru-RU')

    return source.includes('коленн')
  }, [descriptionStudy, descriptionDraft])

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
      setDiagnosisDraft('')
      setIsDescriptionEditing(false)
      setIsJointSpaceModalOpen(false)
      setIsJointSurfaceModalOpen(false)
      setIsBumpsModalOpen(false)
      setIsCongruencyModalOpen(false)
      setIsIntegrityModalOpen(false)
      setIsParaarticularModalOpen(false)
      setIsEndoprosthesisModalOpen(false)
      setIsOsteophytesModalOpen(false)
      setJointSpaceState(createInitialKneeJointSpaceState())
      setJointSurfaceState(createInitialKneeJointSurfaceState())
      setOsteophytesState(createInitialKneeOsteophytesState())
      return
    }

    const nextDescription = pendingDescriptionRef.current ?? descriptionStudy.description
    pendingDescriptionRef.current = null
    const parsed = splitStudyDescription(nextDescription)
    setDescriptionDraft(normalizeStudyDescription(parsed.description))
    setDiagnosisDraft(parsed.diagnosis)
  }, [descriptionStudy])

  useEffect(() => {
    if (!isKneeStudyContext) {
      setIsJointSpaceModalOpen(false)
      setIsJointSurfaceModalOpen(false)
      setIsBumpsModalOpen(false)
      setIsCongruencyModalOpen(false)
      setIsIntegrityModalOpen(false)
      setIsParaarticularModalOpen(false)
      setIsEndoprosthesisModalOpen(false)
      setIsOsteophytesModalOpen(false)
    }
  }, [isKneeStudyContext])

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

  function appendToDescription(text: string, mode: 'line' | 'paragraph' = 'line') {
    const normalizedText = text.trim()

    if (!normalizedText) {
      return
    }

    setDescriptionDraft((currentDraft) => {
      const trimmedDraft = currentDraft.trimEnd()

      if (!trimmedDraft) {
        return normalizedText
      }

      if (mode === 'line' && hasOnlyStudyTitle(trimmedDraft)) {
        return `${trimmedDraft}\n\n${normalizedText}`
      }

      return `${trimmedDraft}${mode === 'paragraph' ? '\n\n' : '\n'}${normalizedText}`
    })
    setIsDescriptionEditing(true)
  }

  function handleDescriptionDraftChange(value: string) {
    setDescriptionDraft(normalizeStudyDescriptionOnChange(value))
  }

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

  function handleJointSpaceDegreeChange(
    section: 'rightLateral' | 'rightMedial' | 'leftLateral' | 'leftMedial',
    value: string,
  ) {
    setJointSpaceState((currentState) => ({
      ...currentState,
      [section]: {
        ...currentState[section],
        degree: currentState[section].degree === value ? '' : value,
        predominantly: value === 'Равномерной высоты' ? false : currentState[section].predominantly,
      },
    }))
  }

  function handleJointSpacePredominantlyToggle(
    section: 'rightLateral' | 'rightMedial' | 'leftLateral' | 'leftMedial',
  ) {
    setJointSpaceState((currentState) => ({
      ...currentState,
      [section]: {
        ...currentState[section],
        predominantly:
          currentState[section].degree && currentState[section].degree !== 'Равномерной высоты'
            ? !currentState[section].predominantly
            : false,
      },
    }))
  }

  function handleJointSurfaceDegreeChange(
    section: 'rightLateral' | 'rightMedial' | 'leftLateral' | 'leftMedial',
    value: string,
  ) {
    setJointSurfaceState((currentState) => ({
      ...currentState,
      [section]: {
        ...currentState[section],
        degree: currentState[section].degree === value ? '' : value,
        predominantly: value === 'Поверхность гладкая' ? false : currentState[section].predominantly,
      },
    }))
  }

  function handleJointSurfacePredominantlyToggle(
    section: 'rightLateral' | 'rightMedial' | 'leftLateral' | 'leftMedial',
  ) {
    setJointSurfaceState((currentState) => ({
      ...currentState,
      [section]: {
        ...currentState[section],
        predominantly:
          currentState[section].degree && currentState[section].degree !== 'Поверхность гладкая'
            ? !currentState[section].predominantly
            : false,
      },
    }))
  }

  function handleAddJointSpaceDescription() {
    appendToDescription(generateKneeJointSpaceDescription(jointSpaceState))
    setIsDescriptionEditing(true)
    setIsJointSpaceModalOpen(false)
  }

  function handleAddJointSurfaceDescription() {
    appendToDescription(generateKneeJointSurfaceDescription(jointSurfaceState))
    setIsDescriptionEditing(true)
    setIsJointSurfaceModalOpen(false)
  }

  function handleInsertKneeNormal() {
    appendToDescription(XRAY_KNEE_NORMAL_DESCRIPTION)
  }

  function handleBumpsSelect(value: (typeof XRAY_KNEE_BUMPS_OPTIONS)[number]) {
    appendToDescription(`Бугорки межмыщелковых возвышений ${value}.`)
    setIsBumpsModalOpen(false)
  }

  function handleCongruencySelect(value: (typeof XRAY_KNEE_CONGRUENCY_OPTIONS)[number]) {
    appendToDescription(`Конгруэнтность суставных поверхностей ${value.toLowerCase()}.`)
    setIsCongruencyModalOpen(false)
  }

  function handleIntegritySelect(value: (typeof XRAY_KNEE_INTEGRITY_OPTIONS)[number]) {
    appendToDescription(
      value === 'Не нарушена'
        ? 'Костно-травматических и костно-деструктивных изменений не выявлено.'
        : 'Определяется нарушение целостности костной ткани в',
    )
    setIsIntegrityModalOpen(false)
  }

  function handleParaarticularSelect(
    value: (typeof XRAY_KNEE_PARAARTICULAR_OPTIONS)[number],
  ) {
    appendToDescription(
      value === 'Без изменений'
        ? 'Параартикулярные ткани не имеют рентгено-позитивных признаков изменений.'
        : 'Определяются образования костной плотности в параартикулярных тканях.',
    )
    setIsParaarticularModalOpen(false)
  }

  function handleEndoprosthesisSelect(
    value: (typeof XRAY_KNEE_ENDOPROSTHESIS_OPTIONS)[number],
  ) {
    if (value === 'обоих коленных суставов') {
      appendToDescription(
        'Определяются эндопротезы обоих коленных суставов при удовлетворительном стоянии металлоконструкций.',
      )
      setIsEndoprosthesisModalOpen(false)
      return
    }

    appendToDescription(
      `Определяется эндопротез ${value} при удовлетворительном стоянии металлоконструкции.${value === 'правого коленного сустава' ? '\nЛевый коленный сустав:' : '\nПравый коленный сустав:'}`,
    )
    setIsEndoprosthesisModalOpen(false)
  }

  function handleOsteophyteToggle(
    section: keyof ReturnType<typeof createInitialKneeOsteophytesState>,
  ) {
    setOsteophytesState((currentState) => ({
      ...currentState,
      [section]: !currentState[section],
    }))
  }

  function handleAddOsteophytesDescription() {
    appendToDescription(generateKneeOsteophytesDescription(osteophytesState))
    setIsOsteophytesModalOpen(false)
  }

  async function handleSaveStudyDescription() {
    if (!descriptionStudy) {
      return
    }

    const updatedStudy = await onUpdateStudy({
      id: descriptionStudy.id,
      patientId: descriptionStudy.patientId,
      studyDate: descriptionStudy.studyDate,
      description: composeStudyDescription(descriptionDraft, diagnosisDraft),
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
      const parsed = splitStudyDescription(updatedStudy.description)
      setDescriptionDraft(normalizeStudyDescription(parsed.description))
      setDiagnosisDraft(parsed.diagnosis)
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
      setDiagnosisDraft('')
      setIsDescriptionEditing(false)
    }
  }

  function handleStudyTemplateSelect(template: string) {
    if (template === XRAY_STUDY_TEMPLATES[0] && templateStudy) {
      openStudyDescriptionModal(templateStudy, true, templateStudy.description || 'Рентгенография ')
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
      openStudyDescriptionModal(templateStudy, true, `${baseDescription}\n\n`)
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
    diagnosisDraft,
    isDescriptionEditing,
    isKneeStudyContext,
    isJointSpaceModalOpen,
    isJointSurfaceModalOpen,
    isBumpsModalOpen,
    isCongruencyModalOpen,
    isIntegrityModalOpen,
    isParaarticularModalOpen,
    isEndoprosthesisModalOpen,
    isOsteophytesModalOpen,
    descriptionInputRef,
    filteredStudyTemplates,
    jointSpaceState,
    jointSurfaceState,
    osteophytesState,
    setTemplateStudy,
    setTemplateQuery,
    setDescriptionStudy,
    handleDescriptionDraftChange,
    setDiagnosisDraft,
    setIsDescriptionEditing,
    setIsJointSpaceModalOpen,
    setIsJointSurfaceModalOpen,
    setIsBumpsModalOpen,
    setIsCongruencyModalOpen,
    setIsIntegrityModalOpen,
    setIsParaarticularModalOpen,
    setIsEndoprosthesisModalOpen,
    setIsOsteophytesModalOpen,
    openStudyTemplatesModal,
    handleSaveStudyDescription,
    handleDeleteStudyDescription,
    handleStudyTemplateSelect,
    handleDeletedStudy,
    handleJointSpaceDegreeChange,
    handleJointSpacePredominantlyToggle,
    handleAddJointSpaceDescription,
    handleJointSurfaceDegreeChange,
    handleJointSurfacePredominantlyToggle,
    handleAddJointSurfaceDescription,
    handleInsertKneeNormal,
    handleBumpsSelect,
    handleCongruencySelect,
    handleIntegritySelect,
    handleParaarticularSelect,
    handleEndoprosthesisSelect,
    handleOsteophyteToggle,
    handleAddOsteophytesDescription,
  }
}
