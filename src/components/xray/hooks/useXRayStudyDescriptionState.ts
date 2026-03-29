import { useEffect, useMemo, useRef, useState } from 'react'
import type { XRayStudy } from '../../../types/xray'
import {
  XRAY_ANKLE_STUDY_OPTION_DESCRIPTIONS,
  XRAY_ANKLE_STUDY_OPTIONS,
  XRAY_ANKLE_STUDY_TEMPLATE,
  XRAY_CALCANEUS_STUDY_DESCRIPTION,
  XRAY_CALCANEUS_NORMAL_DESCRIPTION,
  XRAY_CALCANEUS_STUDY_TEMPLATE,
  XRAY_CERVICAL_SPINE_STUDY_TEMPLATE,
  XRAY_ANKLE_CONGRUENCY_OPTIONS,
  XRAY_ANKLE_INTEGRITY_OPTIONS,
  XRAY_ANKLE_NORMAL_DESCRIPTION,
  XRAY_ANKLE_PARAARTICULAR_OPTIONS,
  XRAY_FOOT_STUDY_DESCRIPTION,
  XRAY_FOOT_STUDY_TEMPLATE,
  XRAY_FLATFOOT_STUDY_DESCRIPTION,
  XRAY_FLATFOOT_NORMAL_DESCRIPTION,
  XRAY_FLATFOOT_STUDY_TEMPLATE,
  XRAY_FOOT_INTEGRITY_OPTIONS,
  XRAY_FOOT_NORMAL_DESCRIPTION,
  XRAY_FOOT_PARAARTICULAR_OPTIONS,
  XRAY_HAND_INTEGRITY_OPTIONS,
  XRAY_HAND_NORMAL_DESCRIPTION,
  XRAY_HAND_PARAARTICULAR_OPTIONS,
  XRAY_HAND_STUDY_DESCRIPTION,
  XRAY_HAND_STUDY_TEMPLATE,
  XRAY_HIP_CONGRUENCY_OPTIONS,
  XRAY_HIP_ENDOPROSTHESIS_OPTIONS,
  XRAY_HIP_INTEGRITY_OPTIONS,
  XRAY_HIP_NORMAL_DESCRIPTION,
  XRAY_HIP_PARAARTICULAR_OPTIONS,
  XRAY_HIP_PHLEBOLITES_DESCRIPTION,
  XRAY_HIP_STUDY_DESCRIPTION,
  XRAY_HIP_STUDY_TEMPLATE,
  XRAY_KNEE_BUMPS_OPTIONS,
  XRAY_KNEE_CONGRUENCY_OPTIONS,
  XRAY_KNEE_ENDOPROSTHESIS_OPTIONS,
  XRAY_KNEE_INTEGRITY_OPTIONS,
  XRAY_KNEE_NORMAL_DESCRIPTION,
  XRAY_KNEE_PARAARTICULAR_OPTIONS,
  XRAY_KNEE_STUDY_OPTION_DESCRIPTIONS,
  XRAY_KNEE_STUDY_OPTIONS,
  XRAY_KNEE_STUDY_TEMPLATE,
  XRAY_LUMBAR_SPINE_STUDY_TEMPLATE,
  XRAY_NASAL_PASSAGES_OPTIONS,
  XRAY_NASAL_SEPTUM_OPTIONS,
  XRAY_PARANASAL_NORMAL_DESCRIPTION,
  XRAY_PARANASAL_STUDY_DESCRIPTION,
  XRAY_PARANASAL_STUDY_TEMPLATE,
  XRAY_SHOULDER_STUDY_OPTION_DESCRIPTIONS,
  XRAY_SHOULDER_STUDY_OPTIONS,
  XRAY_SHOULDER_CONGRUENCY_OPTIONS,
  XRAY_SHOULDER_INTEGRITY_OPTIONS,
  XRAY_SHOULDER_NORMAL_DESCRIPTION,
  XRAY_SHOULDER_PARAARTICULAR_OPTIONS,
  XRAY_SHOULDER_STUDY_TEMPLATE,
  XRAY_SPINE_INTEGRITY_OPTIONS,
  XRAY_SPINE_KYPHOSIS_OPTIONS,
  XRAY_SPINE_LORDOSIS_OPTIONS,
  XRAY_SPINE_NORMAL_DESCRIPTION,
  XRAY_SPINE_PARAARTICULAR_OPTIONS,
  XRAY_SPINE_STUDY_OPTION_DESCRIPTIONS,
  XRAY_SPINE_STUDY_OPTIONS,
  XRAY_STUDY_TEMPLATES,
  XRAY_THORACIC_SPINE_STUDY_TEMPLATE,
  XRAY_THORACOLUMBAR_SPINE_STUDY_TEMPLATE,
  XRAY_WRIST_CONGRUENCY_OPTIONS,
  XRAY_WRIST_INTEGRITY_OPTIONS,
  XRAY_WRIST_NORMAL_DESCRIPTION,
  XRAY_WRIST_PARAARTICULAR_OPTIONS,
  XRAY_WRIST_STUDY_DESCRIPTION,
  XRAY_WRIST_STUDY_TEMPLATE,
} from '../config'
import {
  createInitialAnkleGapSurfaceState,
  createInitialAnkleOsteophytesState,
  generateAnkleGapSurfaceDescription,
  generateAnkleOsteophytesDescription,
} from '../helpers/generateAnkleDescriptions'
import {
  FOOT_DEGREES,
  createInitialFootSelectionState,
  generateFootCongruencyDescription,
  generateFootJointDescription,
  generateFootOsteophytesDescription,
  type FootDegree,
  type FootJointKey,
} from '../helpers/generateFootDescriptions'
import {
  HAND_DEGREES,
  createInitialHandSelectionState,
  generateHandCongruencyDescription,
  generateHandJointDescription,
  generateHandOsteophytesDescription,
  type HandDegree,
  type HandJointKey,
} from '../helpers/generateHandDescriptions'
import {
  createInitialHipJointSpaceState,
  createInitialHipJointSurfaceState,
  createInitialHipOsteophytesState,
  createInitialPubicSymphysisState,
  generateHipJointSpaceDescription,
  generateHipJointSurfaceDescription,
  generateHipOsteophytesDescription,
  generatePubicSymphysisDescription,
} from '../helpers/generateHipDescriptions'
import {
  createInitialKneeJointSurfaceState,
  createInitialKneeJointSpaceState,
  generateKneeJointSurfaceDescription,
  generateKneeJointSpaceDescription,
} from '../helpers/generateKneeJointSpaceDescription'
import {
  createInitialParanasalSinusesState,
  generateParanasalSinusesDescription,
  type ParanasalSinusState,
  type ParanasalSinusesSelectionState,
} from '../helpers/generateParanasalDescriptions'
import {
  createInitialShoulderAcromioclavicularSideState,
  createInitialShoulderAcromioclavicularState,
  createInitialShoulderJointSpaceState,
  createInitialShoulderJointSurfaceState,
  createInitialShoulderOsteophytesState,
  generateShoulderAcromioclavicularDescription,
  generateShoulderJointSpaceDescription,
  generateShoulderJointSurfaceDescription,
  generateShoulderOsteophytesDescription,
  type ShoulderAcromioclavicularSideState,
  type ShoulderJointSpaceState,
  type ShoulderJointSurfaceState,
  type ShoulderSide,
} from '../helpers/generateShoulderDescriptions'
import {
  createInitialWristGapSurfaceState,
  createInitialWristOsteophytesState,
  generateWristGapSurfaceDescription,
  generateWristOsteophytesDescription,
  type WristDegree,
  type WristPosition,
  type WristSide,
} from '../helpers/generateWristDescriptions'
import {
  createInitialSpineCurvatureState,
  createInitialSpineDiscsState,
  createInitialSpineEndplatesState,
  createInitialSpineInstabilityState,
  createInitialSpineOsteophytesState,
  generateSpineCurvatureDescription,
  generateSpineDiscsDescription,
  generateSpineEndplatesDescription,
  generateSpineInstabilityDescription,
  generateSpineOsteophytesDescription,
  generateSpineRangeDescription,
  type SpineDirection,
  type SpineMagnitude,
  type SpineSeverity,
  type SpineSurface,
} from '../helpers/generateSpineDescriptions'
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
  if (!source) return { description: '', diagnosis: '' }
  const diagnosisMarker = '\n\nЗаключение: '
  const markerIndex = source.lastIndexOf(diagnosisMarker)
  if (markerIndex === -1) return { description: source, diagnosis: '' }
  return {
    description: source.slice(0, markerIndex).trim(),
    diagnosis: source.slice(markerIndex + diagnosisMarker.length).trim(),
  }
}

function normalizeStudyDescription(value: string) {
  return String(value ?? '').replace(/\r/g, '').trim()
}

function normalizeStudyDescriptionOnChange(value: string) {
  return String(value ?? '').replace(/\r/g, '')
}

function composeStudyDescription(description: string, diagnosis: string) {
  const normalizedDescription = normalizeStudyDescription(description)
  const normalizedDiagnosis = String(diagnosis ?? '').trim()
  if (!normalizedDiagnosis) return normalizedDescription
  if (!normalizedDescription) return `Заключение: ${normalizedDiagnosis}`
  return `${normalizedDescription}\n\nЗаключение: ${normalizedDiagnosis}`
}

export function useXRayStudyDescriptionState({
  onUpdateStudy,
}: UseXRayStudyDescriptionStateArgs) {
  const createInitialFlatfootState = () => ({
    right: { angle: '', height: '' },
    left: { angle: '', height: '' },
  })

  const getFlatfootDegreeByAngle = (angle: string) => {
    const value = Number.parseFloat(angle)
    if (Number.isNaN(value)) return 0
    if (value <= 130) return 0
    if (value <= 140) return 1
    if (value <= 155) return 2
    return 3
  }

  const getFlatfootDegreeByHeight = (height: string) => {
    const value = Number.parseFloat(height)
    if (Number.isNaN(value)) return 0
    if (value >= 36) return 0
    if (value >= 25) return 1
    if (value >= 17) return 2
    return 3
  }

  const getFlatfootDegreeText = (degree: number) => {
    switch (degree) {
      case 0:
        return 'норме (признаков плоскостопия не выявлено)'
      case 1:
        return 'I степени плоскостопия'
      case 2:
        return 'II степени плоскостопия'
      case 3:
        return 'III степени плоскостопия'
      default:
        return ''
    }
  }

  const [templateStudy, setTemplateStudy] = useState<XRayStudy | null>(null)
  const [templateQuery, setTemplateQuery] = useState('')
  const [templateStep, setTemplateStep] = useState<
    'root' | 'knees' | 'ankles' | 'spines' | 'shoulders'
  >('root')
  const [spineTemplate, setSpineTemplate] = useState<
    | typeof XRAY_LUMBAR_SPINE_STUDY_TEMPLATE
    | typeof XRAY_THORACIC_SPINE_STUDY_TEMPLATE
    | typeof XRAY_THORACOLUMBAR_SPINE_STUDY_TEMPLATE
    | typeof XRAY_CERVICAL_SPINE_STUDY_TEMPLATE
    | null
  >(null)
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

  const [isHipJointSpaceModalOpen, setIsHipJointSpaceModalOpen] = useState(false)
  const [isHipJointSurfaceModalOpen, setIsHipJointSurfaceModalOpen] = useState(false)
  const [isHipOsteophytesModalOpen, setIsHipOsteophytesModalOpen] = useState(false)
  const [isPubicSymphysisModalOpen, setIsPubicSymphysisModalOpen] = useState(false)
  const [isHipCongruencyModalOpen, setIsHipCongruencyModalOpen] = useState(false)
  const [isHipIntegrityModalOpen, setIsHipIntegrityModalOpen] = useState(false)
  const [isHipParaarticularModalOpen, setIsHipParaarticularModalOpen] = useState(false)
  const [isHipEndoprosthesisModalOpen, setIsHipEndoprosthesisModalOpen] = useState(false)

  const [isAnkleJointSpaceModalOpen, setIsAnkleJointSpaceModalOpen] = useState(false)
  const [isAnkleJointSurfaceModalOpen, setIsAnkleJointSurfaceModalOpen] = useState(false)
  const [isAnkleOsteophytesModalOpen, setIsAnkleOsteophytesModalOpen] = useState(false)
  const [isAnkleCongruencyModalOpen, setIsAnkleCongruencyModalOpen] = useState(false)
  const [isAnkleIntegrityModalOpen, setIsAnkleIntegrityModalOpen] = useState(false)
  const [isAnkleParaarticularModalOpen, setIsAnkleParaarticularModalOpen] = useState(false)

  const [isFootJointSpaceModalOpen, setIsFootJointSpaceModalOpen] = useState(false)
  const [isFootJointSurfaceModalOpen, setIsFootJointSurfaceModalOpen] = useState(false)
  const [isFootOsteophytesModalOpen, setIsFootOsteophytesModalOpen] = useState(false)
  const [isFootCongruencyModalOpen, setIsFootCongruencyModalOpen] = useState(false)
  const [isFootIntegrityModalOpen, setIsFootIntegrityModalOpen] = useState(false)
  const [isFootParaarticularModalOpen, setIsFootParaarticularModalOpen] = useState(false)
  const [isHandJointSpaceModalOpen, setIsHandJointSpaceModalOpen] = useState(false)
  const [isHandJointSurfaceModalOpen, setIsHandJointSurfaceModalOpen] = useState(false)
  const [isHandOsteophytesModalOpen, setIsHandOsteophytesModalOpen] = useState(false)
  const [isHandCongruencyModalOpen, setIsHandCongruencyModalOpen] = useState(false)
  const [isHandIntegrityModalOpen, setIsHandIntegrityModalOpen] = useState(false)
  const [isHandParaarticularModalOpen, setIsHandParaarticularModalOpen] = useState(false)
  const [isFlatfootModalOpen, setIsFlatfootModalOpen] = useState(false)
  const [isCalcaneusOsteophytesModalOpen, setIsCalcaneusOsteophytesModalOpen] = useState(false)
  const [isShoulderJointSpaceModalOpen, setIsShoulderJointSpaceModalOpen] = useState(false)
  const [isShoulderJointSurfaceModalOpen, setIsShoulderJointSurfaceModalOpen] = useState(false)
  const [isShoulderOsteophytesModalOpen, setIsShoulderOsteophytesModalOpen] = useState(false)
  const [isShoulderAcromioclavicularModalOpen, setIsShoulderAcromioclavicularModalOpen] =
    useState(false)
  const [isShoulderCongruencyModalOpen, setIsShoulderCongruencyModalOpen] = useState(false)
  const [isShoulderIntegrityModalOpen, setIsShoulderIntegrityModalOpen] = useState(false)
  const [isShoulderParaarticularModalOpen, setIsShoulderParaarticularModalOpen] = useState(false)
  const [isWristJointSpaceModalOpen, setIsWristJointSpaceModalOpen] = useState(false)
  const [isWristJointSurfaceModalOpen, setIsWristJointSurfaceModalOpen] = useState(false)
  const [isWristOsteophytesModalOpen, setIsWristOsteophytesModalOpen] = useState(false)
  const [isWristCongruencyModalOpen, setIsWristCongruencyModalOpen] = useState(false)
  const [isWristIntegrityModalOpen, setIsWristIntegrityModalOpen] = useState(false)
  const [isWristParaarticularModalOpen, setIsWristParaarticularModalOpen] = useState(false)
  const [isParanasalSinusesModalOpen, setIsParanasalSinusesModalOpen] = useState(false)
  const [isNasalPassagesModalOpen, setIsNasalPassagesModalOpen] = useState(false)
  const [isNasalSeptumModalOpen, setIsNasalSeptumModalOpen] = useState(false)
  const [isSpineRangeModalOpen, setIsSpineRangeModalOpen] = useState(false)
  const [isSpineCurvatureModalOpen, setIsSpineCurvatureModalOpen] = useState(false)
  const [isSpineDiscsModalOpen, setIsSpineDiscsModalOpen] = useState(false)
  const [isSpineEndplatesModalOpen, setIsSpineEndplatesModalOpen] = useState(false)
  const [isSpineOsteophytesModalOpen, setIsSpineOsteophytesModalOpen] = useState(false)
  const [isSpineInstabilityModalOpen, setIsSpineInstabilityModalOpen] = useState(false)
  const [isSpineLordosisModalOpen, setIsSpineLordosisModalOpen] = useState(false)
  const [isSpineKyphosisModalOpen, setIsSpineKyphosisModalOpen] = useState(false)
  const [isSpineIntegrityModalOpen, setIsSpineIntegrityModalOpen] = useState(false)
  const [isSpineParaarticularModalOpen, setIsSpineParaarticularModalOpen] = useState(false)

  const [jointSpaceState, setJointSpaceState] = useState(createInitialKneeJointSpaceState)
  const [jointSurfaceState, setJointSurfaceState] = useState(createInitialKneeJointSurfaceState)
  const [osteophytesState, setOsteophytesState] = useState(createInitialKneeOsteophytesState)

  const [hipJointSpaceState, setHipJointSpaceState] = useState(createInitialHipJointSpaceState)
  const [hipJointSurfaceState, setHipJointSurfaceState] = useState(createInitialHipJointSurfaceState)
  const [hipOsteophytesState, setHipOsteophytesState] = useState(createInitialHipOsteophytesState)
  const [pubicSymphysisState, setPubicSymphysisState] = useState(createInitialPubicSymphysisState)
  const [ankleJointSpaceState, setAnkleJointSpaceState] = useState(createInitialAnkleGapSurfaceState)
  const [ankleJointSurfaceState, setAnkleJointSurfaceState] = useState(createInitialAnkleGapSurfaceState)
  const [ankleOsteophytesState, setAnkleOsteophytesState] = useState(createInitialAnkleOsteophytesState)
  const [footJointSpaceState, setFootJointSpaceState] = useState(createInitialFootSelectionState)
  const [footJointSurfaceState, setFootJointSurfaceState] = useState(createInitialFootSelectionState)
  const [footOsteophytesState, setFootOsteophytesState] = useState(createInitialFootSelectionState)
  const [footCongruencyState, setFootCongruencyState] = useState(createInitialFootSelectionState)
  const [activeFootJointDegree, setActiveFootJointDegree] = useState<FootDegree>(FOOT_DEGREES[0])
  const [handJointSpaceState, setHandJointSpaceState] = useState(createInitialHandSelectionState)
  const [handJointSurfaceState, setHandJointSurfaceState] = useState(createInitialHandSelectionState)
  const [handOsteophytesState, setHandOsteophytesState] = useState(createInitialHandSelectionState)
  const [handCongruencyState, setHandCongruencyState] = useState(createInitialHandSelectionState)
  const [activeHandJointDegree, setActiveHandJointDegree] = useState<HandDegree>(HAND_DEGREES[0])
  const [flatfootState, setFlatfootState] = useState(createInitialFlatfootState)
  const [calcaneusOsteophytesState, setCalcaneusOsteophytesState] = useState({
    rightPlantar: false,
    rightPosterior: false,
    leftPlantar: false,
    leftPosterior: false,
  })
  const [shoulderJointSpaceState, setShoulderJointSpaceState] =
    useState(createInitialShoulderJointSpaceState)
  const [shoulderJointSurfaceState, setShoulderJointSurfaceState] =
    useState(createInitialShoulderJointSurfaceState)
  const [shoulderOsteophytesState, setShoulderOsteophytesState] =
    useState(createInitialShoulderOsteophytesState)
  const [shoulderAcromioclavicularState, setShoulderAcromioclavicularState] =
    useState(createInitialShoulderAcromioclavicularState)
  const [wristJointSpaceState, setWristJointSpaceState] = useState(createInitialWristGapSurfaceState)
  const [wristJointSurfaceState, setWristJointSurfaceState] =
    useState(createInitialWristGapSurfaceState)
  const [wristOsteophytesState, setWristOsteophytesState] =
    useState(createInitialWristOsteophytesState)
  const [paranasalSinusesState, setParanasalSinusesState] =
    useState(createInitialParanasalSinusesState)
  const [spineRangeSelection, setSpineRangeSelection] = useState<string[]>([])
  const [spineCurvatureState, setSpineCurvatureState] = useState(createInitialSpineCurvatureState)
  const [spineDiscsState, setSpineDiscsState] = useState(createInitialSpineDiscsState)
  const [spineEndplatesState, setSpineEndplatesState] = useState(createInitialSpineEndplatesState)
  const [spineOsteophytesState, setSpineOsteophytesState] = useState(createInitialSpineOsteophytesState)
  const [spineInstabilityState, setSpineInstabilityState] = useState(createInitialSpineInstabilityState)

  const descriptionInputRef = useRef<HTMLTextAreaElement | null>(null)
  const pendingDescriptionRef = useRef<string | null>(null)

  const isKneeStudyContext = useMemo(() => {
    if (!descriptionStudy) return false
    const source = [descriptionStudy.description, descriptionStudy.referralDiagnosis, descriptionDraft]
      .join(' ')
      .toLocaleLowerCase('ru-RU')
    return source.includes('коленн')
  }, [descriptionStudy, descriptionDraft])

  const isHipStudyContext = useMemo(() => {
    if (!descriptionStudy) return false
    const source = [descriptionStudy.description, descriptionStudy.referralDiagnosis, descriptionDraft]
      .join(' ')
      .toLocaleLowerCase('ru-RU')
    return source.includes('тазобедрен')
  }, [descriptionStudy, descriptionDraft])

  const isAnkleStudyContext = useMemo(() => {
    if (!descriptionStudy) return false
    const source = [descriptionStudy.description, descriptionStudy.referralDiagnosis, descriptionDraft]
      .join(' ')
      .toLocaleLowerCase('ru-RU')
    return source.includes('голеностоп')
  }, [descriptionStudy, descriptionDraft])

  const isFootStudyContext = useMemo(() => {
    if (!descriptionStudy) return false
    const source = [descriptionStudy.description, descriptionStudy.referralDiagnosis, descriptionDraft]
      .join(' ')
      .toLocaleLowerCase('ru-RU')
    return source.includes('рентгенография стоп')
  }, [descriptionStudy, descriptionDraft])

  const isHandStudyContext = useMemo(() => {
    if (!descriptionStudy) return false
    const source = [descriptionStudy.description, descriptionStudy.referralDiagnosis, descriptionDraft]
      .join(' ')
      .toLocaleLowerCase('ru-RU')
    return source.includes('кист')
  }, [descriptionStudy, descriptionDraft])

  const isFlatfootStudyContext = useMemo(() => {
    if (!descriptionStudy) return false
    const source = [descriptionStudy.description, descriptionStudy.referralDiagnosis, descriptionDraft]
      .join(' ')
      .toLocaleLowerCase('ru-RU')
    return source.includes('стоп') && source.includes('боковой проекции')
  }, [descriptionStudy, descriptionDraft])

  const isCalcaneusStudyContext = useMemo(() => {
    if (!descriptionStudy) return false
    const source = [descriptionStudy.description, descriptionStudy.referralDiagnosis, descriptionDraft]
      .join(' ')
      .toLocaleLowerCase('ru-RU')
    return source.includes('пяточных костей')
  }, [descriptionStudy, descriptionDraft])

  const isShoulderStudyContext = useMemo(() => {
    if (!descriptionStudy) return false
    const source = [descriptionStudy.description, descriptionStudy.referralDiagnosis, descriptionDraft]
      .join(' ')
      .toLocaleLowerCase('ru-RU')
    return source.includes('плечев')
  }, [descriptionStudy, descriptionDraft])

  const isWristStudyContext = useMemo(() => {
    if (!descriptionStudy) return false
    const source = [descriptionStudy.description, descriptionStudy.referralDiagnosis, descriptionDraft]
      .join(' ')
      .toLocaleLowerCase('ru-RU')
    return source.includes('луче-запяст') || source.includes('лучезапяст')
  }, [descriptionStudy, descriptionDraft])

  const isParanasalStudyContext = useMemo(() => {
    if (!descriptionStudy) return false
    const source = [descriptionStudy.description, descriptionStudy.referralDiagnosis, descriptionDraft]
      .join(' ')
      .toLocaleLowerCase('ru-RU')
    return source.includes('пазух') || source.includes('гаймор') || source.includes('лобн')
  }, [descriptionStudy, descriptionDraft])

  const isSpineStudyContext = useMemo(() => {
    if (!descriptionStudy) return false
    const source = [descriptionStudy.description, descriptionStudy.referralDiagnosis, descriptionDraft]
      .join(' ')
      .toLocaleLowerCase('ru-RU')
    return source.includes('позвоночник')
  }, [descriptionStudy, descriptionDraft])

  const isLumbarSpineStudyContext = useMemo(() => {
    if (!isSpineStudyContext) return false
    const source = [descriptionStudy?.description, descriptionStudy?.referralDiagnosis, descriptionDraft]
      .join(' ')
      .toLocaleLowerCase('ru-RU')
    return source.includes('пояснич')
  }, [descriptionStudy, descriptionDraft, isSpineStudyContext])

  const isThoracicSpineStudyContext = useMemo(() => {
    if (!isSpineStudyContext) return false
    const source = [descriptionStudy?.description, descriptionStudy?.referralDiagnosis, descriptionDraft]
      .join(' ')
      .toLocaleLowerCase('ru-RU')
    return source.includes('грудного отдела позвоночника')
  }, [descriptionStudy, descriptionDraft, isSpineStudyContext])

  const filteredStudyTemplates = useMemo(() => {
    const sourceTemplates =
      templateStep === 'knees'
        ? XRAY_KNEE_STUDY_OPTIONS
        : templateStep === 'ankles'
          ? XRAY_ANKLE_STUDY_OPTIONS
          : templateStep === 'spines'
            ? XRAY_SPINE_STUDY_OPTIONS
            : templateStep === 'shoulders'
              ? XRAY_SHOULDER_STUDY_OPTIONS
            : XRAY_STUDY_TEMPLATES
    const normalizedQuery = templateQuery.trim().toLocaleLowerCase('ru-RU')
    if (!normalizedQuery) return sourceTemplates
    return sourceTemplates.filter((template) =>
      template.toLocaleLowerCase('ru-RU').includes(normalizedQuery),
    )
  }, [templateQuery, templateStep])

  useEffect(() => {
    if (!templateStudy) {
      setTemplateQuery('')
      setTemplateStep('root')
      setSpineTemplate(null)
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
      setIsHipJointSpaceModalOpen(false)
      setIsHipJointSurfaceModalOpen(false)
      setIsHipOsteophytesModalOpen(false)
      setIsPubicSymphysisModalOpen(false)
      setIsHipCongruencyModalOpen(false)
      setIsHipIntegrityModalOpen(false)
      setIsHipParaarticularModalOpen(false)
      setIsHipEndoprosthesisModalOpen(false)
      setIsAnkleJointSpaceModalOpen(false)
      setIsAnkleJointSurfaceModalOpen(false)
      setIsAnkleOsteophytesModalOpen(false)
      setIsAnkleCongruencyModalOpen(false)
      setIsAnkleIntegrityModalOpen(false)
      setIsAnkleParaarticularModalOpen(false)
      setIsFootJointSpaceModalOpen(false)
      setIsFootJointSurfaceModalOpen(false)
      setIsFootOsteophytesModalOpen(false)
      setIsFootCongruencyModalOpen(false)
      setIsFootIntegrityModalOpen(false)
      setIsFootParaarticularModalOpen(false)
      setIsHandJointSpaceModalOpen(false)
      setIsHandJointSurfaceModalOpen(false)
      setIsHandOsteophytesModalOpen(false)
      setIsHandCongruencyModalOpen(false)
      setIsHandIntegrityModalOpen(false)
      setIsHandParaarticularModalOpen(false)
      setIsFlatfootModalOpen(false)
      setIsCalcaneusOsteophytesModalOpen(false)
      setIsShoulderJointSpaceModalOpen(false)
      setIsShoulderJointSurfaceModalOpen(false)
      setIsShoulderOsteophytesModalOpen(false)
      setIsShoulderAcromioclavicularModalOpen(false)
      setIsShoulderCongruencyModalOpen(false)
      setIsShoulderIntegrityModalOpen(false)
      setIsShoulderParaarticularModalOpen(false)
      setIsWristJointSpaceModalOpen(false)
      setIsWristJointSurfaceModalOpen(false)
      setIsWristOsteophytesModalOpen(false)
      setIsWristCongruencyModalOpen(false)
      setIsWristIntegrityModalOpen(false)
      setIsWristParaarticularModalOpen(false)
      setIsParanasalSinusesModalOpen(false)
      setIsNasalPassagesModalOpen(false)
      setIsNasalSeptumModalOpen(false)
      setIsSpineRangeModalOpen(false)
      setIsSpineCurvatureModalOpen(false)
      setIsSpineDiscsModalOpen(false)
      setIsSpineEndplatesModalOpen(false)
      setIsSpineOsteophytesModalOpen(false)
      setIsSpineInstabilityModalOpen(false)
      setIsSpineLordosisModalOpen(false)
      setIsSpineKyphosisModalOpen(false)
      setIsSpineIntegrityModalOpen(false)
      setIsSpineParaarticularModalOpen(false)
      setJointSpaceState(createInitialKneeJointSpaceState())
      setJointSurfaceState(createInitialKneeJointSurfaceState())
      setOsteophytesState(createInitialKneeOsteophytesState())
      setHipJointSpaceState(createInitialHipJointSpaceState())
      setHipJointSurfaceState(createInitialHipJointSurfaceState())
      setHipOsteophytesState(createInitialHipOsteophytesState())
      setPubicSymphysisState(createInitialPubicSymphysisState())
      setAnkleJointSpaceState(createInitialAnkleGapSurfaceState())
      setAnkleJointSurfaceState(createInitialAnkleGapSurfaceState())
      setAnkleOsteophytesState(createInitialAnkleOsteophytesState())
      setFootJointSpaceState(createInitialFootSelectionState())
      setFootJointSurfaceState(createInitialFootSelectionState())
      setFootOsteophytesState(createInitialFootSelectionState())
      setFootCongruencyState(createInitialFootSelectionState())
      setActiveFootJointDegree(FOOT_DEGREES[0])
      setHandJointSpaceState(createInitialHandSelectionState())
      setHandJointSurfaceState(createInitialHandSelectionState())
      setHandOsteophytesState(createInitialHandSelectionState())
      setHandCongruencyState(createInitialHandSelectionState())
      setActiveHandJointDegree(HAND_DEGREES[0])
      setFlatfootState(createInitialFlatfootState())
      setCalcaneusOsteophytesState({
        rightPlantar: false,
        rightPosterior: false,
        leftPlantar: false,
        leftPosterior: false,
      })
      setShoulderJointSpaceState(createInitialShoulderJointSpaceState())
      setShoulderJointSurfaceState(createInitialShoulderJointSurfaceState())
      setShoulderOsteophytesState(createInitialShoulderOsteophytesState())
      setShoulderAcromioclavicularState(createInitialShoulderAcromioclavicularState())
      setWristJointSpaceState(createInitialWristGapSurfaceState())
      setWristJointSurfaceState(createInitialWristGapSurfaceState())
      setWristOsteophytesState(createInitialWristOsteophytesState())
      setParanasalSinusesState(createInitialParanasalSinusesState())
      setSpineRangeSelection([])
      setSpineCurvatureState(createInitialSpineCurvatureState())
      setSpineDiscsState(createInitialSpineDiscsState())
      setSpineEndplatesState(createInitialSpineEndplatesState())
      setSpineOsteophytesState(createInitialSpineOsteophytesState())
      setSpineInstabilityState(createInitialSpineInstabilityState())
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
    if (!isHipStudyContext) {
      setIsHipJointSpaceModalOpen(false)
      setIsHipJointSurfaceModalOpen(false)
      setIsHipOsteophytesModalOpen(false)
      setIsPubicSymphysisModalOpen(false)
      setIsHipCongruencyModalOpen(false)
      setIsHipIntegrityModalOpen(false)
      setIsHipParaarticularModalOpen(false)
      setIsHipEndoprosthesisModalOpen(false)
    }
    if (!isAnkleStudyContext) {
      setIsAnkleJointSpaceModalOpen(false)
      setIsAnkleJointSurfaceModalOpen(false)
      setIsAnkleOsteophytesModalOpen(false)
      setIsAnkleCongruencyModalOpen(false)
      setIsAnkleIntegrityModalOpen(false)
      setIsAnkleParaarticularModalOpen(false)
    }
    if (!isFootStudyContext) {
      setIsFootJointSpaceModalOpen(false)
      setIsFootJointSurfaceModalOpen(false)
      setIsFootOsteophytesModalOpen(false)
      setIsFootCongruencyModalOpen(false)
      setIsFootIntegrityModalOpen(false)
      setIsFootParaarticularModalOpen(false)
    }
    if (!isHandStudyContext) {
      setIsHandJointSpaceModalOpen(false)
      setIsHandJointSurfaceModalOpen(false)
      setIsHandOsteophytesModalOpen(false)
      setIsHandCongruencyModalOpen(false)
      setIsHandIntegrityModalOpen(false)
      setIsHandParaarticularModalOpen(false)
    }
    if (!isFlatfootStudyContext) {
      setIsFlatfootModalOpen(false)
    }
    if (!isCalcaneusStudyContext) {
      setIsCalcaneusOsteophytesModalOpen(false)
    }
    if (!isShoulderStudyContext) {
      setIsShoulderJointSpaceModalOpen(false)
      setIsShoulderJointSurfaceModalOpen(false)
      setIsShoulderOsteophytesModalOpen(false)
      setIsShoulderAcromioclavicularModalOpen(false)
      setIsShoulderCongruencyModalOpen(false)
      setIsShoulderIntegrityModalOpen(false)
      setIsShoulderParaarticularModalOpen(false)
    }
    if (!isWristStudyContext) {
      setIsWristJointSpaceModalOpen(false)
      setIsWristJointSurfaceModalOpen(false)
      setIsWristOsteophytesModalOpen(false)
      setIsWristCongruencyModalOpen(false)
      setIsWristIntegrityModalOpen(false)
      setIsWristParaarticularModalOpen(false)
    }
    if (!isParanasalStudyContext) {
      setIsParanasalSinusesModalOpen(false)
      setIsNasalPassagesModalOpen(false)
      setIsNasalSeptumModalOpen(false)
    }
    if (!isSpineStudyContext) {
      setIsSpineRangeModalOpen(false)
      setIsSpineCurvatureModalOpen(false)
      setIsSpineDiscsModalOpen(false)
      setIsSpineEndplatesModalOpen(false)
      setIsSpineOsteophytesModalOpen(false)
      setIsSpineInstabilityModalOpen(false)
      setIsSpineLordosisModalOpen(false)
      setIsSpineKyphosisModalOpen(false)
      setIsSpineIntegrityModalOpen(false)
      setIsSpineParaarticularModalOpen(false)
    }
  }, [isKneeStudyContext, isHipStudyContext, isAnkleStudyContext, isFootStudyContext, isHandStudyContext, isFlatfootStudyContext, isCalcaneusStudyContext, isShoulderStudyContext, isWristStudyContext, isParanasalStudyContext, isSpineStudyContext])

  useEffect(() => {
    if (!descriptionStudy || !isDescriptionEditing) return
    window.requestAnimationFrame(() => {
      if (!descriptionInputRef.current) return
      descriptionInputRef.current.focus()
      const valueLength = descriptionInputRef.current.value.length
      descriptionInputRef.current.setSelectionRange(valueLength, valueLength)
    })
  }, [descriptionStudy, isDescriptionEditing])

  function appendToDescription(text: string, mode: 'line' | 'paragraph' = 'line') {
    const normalizedText = text.trim()
    if (!normalizedText) return
    setDescriptionDraft((currentDraft) => {
      const trimmedDraft = currentDraft.trimEnd()
      if (!trimmedDraft) return normalizedText
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

  function openStudyDescriptionModal(study: XRayStudy, isEditing = false, initialDescription?: string) {
    setTemplateStudy(null)
    pendingDescriptionRef.current = initialDescription ?? null
    setDescriptionStudy(study)
    setIsDescriptionEditing(isEditing)
  }

  function handleJointSpaceDegreeChange(section: 'rightLateral' | 'rightMedial' | 'leftLateral' | 'leftMedial', value: string) {
    setJointSpaceState((currentState) => ({
      ...currentState,
      [section]: {
        ...currentState[section],
        degree: currentState[section].degree === value ? '' : value,
        predominantly: value === 'Равномерной высоты' ? false : currentState[section].predominantly,
      },
    }))
  }

  function handleJointSpacePredominantlyToggle(section: 'rightLateral' | 'rightMedial' | 'leftLateral' | 'leftMedial') {
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

  function handleJointSurfaceDegreeChange(section: 'rightLateral' | 'rightMedial' | 'leftLateral' | 'leftMedial', value: string) {
    setJointSurfaceState((currentState) => ({
      ...currentState,
      [section]: {
        ...currentState[section],
        degree: currentState[section].degree === value ? '' : value,
        predominantly: value === 'Поверхность гладкая' ? false : currentState[section].predominantly,
      },
    }))
  }

  function handleJointSurfacePredominantlyToggle(section: 'rightLateral' | 'rightMedial' | 'leftLateral' | 'leftMedial') {
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
    setIsJointSpaceModalOpen(false)
  }

  function handleAddJointSurfaceDescription() {
    appendToDescription(generateKneeJointSurfaceDescription(jointSurfaceState))
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

  function handleParaarticularSelect(value: (typeof XRAY_KNEE_PARAARTICULAR_OPTIONS)[number]) {
    appendToDescription(
      value === 'Без изменений'
        ? 'Параартикулярные ткани не имеют рентгено-позитивных признаков изменений.'
        : 'Определяются образования костной плотности в параартикулярных тканях.',
    )
    setIsParaarticularModalOpen(false)
  }

  function handleEndoprosthesisSelect(value: (typeof XRAY_KNEE_ENDOPROSTHESIS_OPTIONS)[number]) {
    if (value === 'обоих коленных суставов') {
      appendToDescription('Определяются эндопротезы обоих коленных суставов при удовлетворительном стоянии металлоконструкций.')
      setIsEndoprosthesisModalOpen(false)
      return
    }
    appendToDescription(
      `Определяется эндопротез ${value} при удовлетворительном стоянии металлоконструкции.${value === 'правого коленного сустава' ? '\nЛевый коленный сустав:' : '\nПравый коленный сустав:'}`,
    )
    setIsEndoprosthesisModalOpen(false)
  }

  function handleOsteophyteToggle(section: keyof ReturnType<typeof createInitialKneeOsteophytesState>) {
    setOsteophytesState((currentState) => ({ ...currentState, [section]: !currentState[section] }))
  }

  function handleAddOsteophytesDescription() {
    appendToDescription(generateKneeOsteophytesDescription(osteophytesState))
    setIsOsteophytesModalOpen(false)
  }

  function handleHipJointSpaceDegreeChange(section: 'left' | 'right', value: string) {
    setHipJointSpaceState((current) => ({
      ...current,
      [section]: { ...current[section], degree: current[section].degree === value ? '' : value },
    }))
  }

  function handleHipJointSpaceUniformityChange(section: 'left' | 'right', value: string) {
    setHipJointSpaceState((current) => ({
      ...current,
      [section]: { ...current[section], uniformity: current[section].uniformity === value ? '' : value },
    }))
  }

  function handleAddHipJointSpaceDescription() {
    appendToDescription(
      generateHipJointSpaceDescription(hipJointSpaceState, descriptionDraft.toLocaleLowerCase('ru-RU').includes('эндопротез')),
    )
    setIsHipJointSpaceModalOpen(false)
  }

  function handleHipJointSurfaceChange(section: 'left' | 'right', value: string) {
    setHipJointSurfaceState((current) => ({
      ...current,
      [section]: current[section] === value ? '' : value,
    }))
  }

  function handleAddHipJointSurfaceDescription() {
    appendToDescription(
      generateHipJointSurfaceDescription(hipJointSurfaceState, descriptionDraft.toLocaleLowerCase('ru-RU').includes('эндопротез')),
    )
    setIsHipJointSurfaceModalOpen(false)
  }

  function handleHipOsteophyteToggle(section: keyof ReturnType<typeof createInitialHipOsteophytesState>) {
    setHipOsteophytesState((current) => ({ ...current, [section]: !current[section] }))
  }

  function handleAddHipOsteophytesDescription() {
    appendToDescription(generateHipOsteophytesDescription(hipOsteophytesState))
    setIsHipOsteophytesModalOpen(false)
  }

  function handleHipPubicNormalToggle() {
    setPubicSymphysisState((current) => ({
      ...createInitialPubicSymphysisState(),
      isNormal: !current.isNormal,
    }))
  }

  function handleHipPubicSymmetryChange(value: string) {
    setPubicSymphysisState((current) => ({ ...current, isNormal: false, symmetry: current.symmetry === value ? '' : value }))
  }

  function handleHipPubicOsteophyteToggle(value: string) {
    setPubicSymphysisState((current) => ({
      ...current,
      isNormal: false,
      osteophytes: current.osteophytes.includes(value)
        ? current.osteophytes.filter((item) => item !== value)
        : [...current.osteophytes, value],
    }))
  }

  function handleHipPubicSurfaceChange(value: string) {
    setPubicSymphysisState((current) => ({
      ...current,
      isNormal: false,
      surfaces: current.surfaces === value ? '' : value,
    }))
  }

  function handleAddPubicSymphysisDescription() {
    appendToDescription(generatePubicSymphysisDescription(pubicSymphysisState))
    setIsPubicSymphysisModalOpen(false)
  }

  function handleHipCongruencySelect(value: (typeof XRAY_HIP_CONGRUENCY_OPTIONS)[number]) {
    appendToDescription(`Конгруэнтность суставных поверхностей ${value.toLowerCase()}.`)
    setIsHipCongruencyModalOpen(false)
  }

  function handleHipIntegritySelect(value: (typeof XRAY_HIP_INTEGRITY_OPTIONS)[number]) {
    appendToDescription(
      value === 'Не нарушена'
        ? 'Костно-травматических и костно-деструктивных изменений не выявлено.'
        : 'Определяется нарушение целостности костной ткани в',
    )
    setIsHipIntegrityModalOpen(false)
  }

  function handleHipParaarticularSelect(value: (typeof XRAY_HIP_PARAARTICULAR_OPTIONS)[number]) {
    appendToDescription(
      value === 'Без изменений'
        ? 'Параартикулярные ткани не имеют рентгено-позитивных признаков изменений.'
        : 'Определяются образования костной плотности в параартикулярных тканях.',
    )
    setIsHipParaarticularModalOpen(false)
  }

  function handleHipEndoprosthesisSelect(value: (typeof XRAY_HIP_ENDOPROSTHESIS_OPTIONS)[number]) {
    appendToDescription(
      `Определяется эндопротез ${value} при удовлетворительном стоянии металлоконструкции.${value === 'правого тазобедренного сустава' ? '\nЛевый тазобедренный сустав:' : '\nПравый тазобедренный сустав:'}`,
    )
    setIsHipEndoprosthesisModalOpen(false)
  }

  function handleInsertHipNormal() {
    appendToDescription(XRAY_HIP_NORMAL_DESCRIPTION)
  }

  function handleInsertHipPhlebolites() {
    appendToDescription(XRAY_HIP_PHLEBOLITES_DESCRIPTION)
  }

  function handleAnkleGapSurfaceDegreeChange(
    type: 'jointSpace' | 'jointSurface',
    side: 'left' | 'right',
    value: string,
  ) {
    const setter =
      type === 'jointSpace' ? setAnkleJointSpaceState : setAnkleJointSurfaceState
    setter((current) => ({
      ...current,
      [side]: {
        ...current[side],
        degree: current[side].degree === value ? '' : value,
      },
    }))
  }

  function handleAnkleGapSurfacePositionChange(
    type: 'jointSpace' | 'jointSurface',
    side: 'left' | 'right',
    value: string,
  ) {
    const setter =
      type === 'jointSpace' ? setAnkleJointSpaceState : setAnkleJointSurfaceState
    setter((current) => ({
      ...current,
      [side]: {
        ...current[side],
        position: current[side].position === value ? '' : value,
      },
    }))
  }

  function handleAddAnkleJointSpaceDescription() {
    appendToDescription(generateAnkleGapSurfaceDescription(ankleJointSpaceState, 'gaps'))
    setIsAnkleJointSpaceModalOpen(false)
  }

  function handleAddAnkleJointSurfaceDescription() {
    appendToDescription(generateAnkleGapSurfaceDescription(ankleJointSurfaceState, 'surfaces'))
    setIsAnkleJointSurfaceModalOpen(false)
  }

  function handleAnkleOsteophyteToggle(section: keyof ReturnType<typeof createInitialAnkleOsteophytesState>) {
    setAnkleOsteophytesState((current) => ({ ...current, [section]: !current[section] }))
  }

  function handleAddAnkleOsteophytesDescription() {
    appendToDescription(generateAnkleOsteophytesDescription(ankleOsteophytesState))
    setIsAnkleOsteophytesModalOpen(false)
  }

  function handleAnkleCongruencySelect(value: (typeof XRAY_ANKLE_CONGRUENCY_OPTIONS)[number]) {
    appendToDescription(`Конгруэнтность суставных поверхностей ${value.toLowerCase()}.`)
    setIsAnkleCongruencyModalOpen(false)
  }

  function handleAnkleIntegritySelect(value: (typeof XRAY_ANKLE_INTEGRITY_OPTIONS)[number]) {
    appendToDescription(
      value === 'Не нарушена'
        ? 'Костно-травматических и костно-деструктивных изменений не выявлено.'
        : 'Определяется нарушение целостности костной ткани в',
    )
    setIsAnkleIntegrityModalOpen(false)
  }

  function handleAnkleParaarticularSelect(value: (typeof XRAY_ANKLE_PARAARTICULAR_OPTIONS)[number]) {
    appendToDescription(
      value === 'Без изменений'
        ? 'Параартикулярные ткани не имеют рентгено-позитивных признаков изменений.'
        : 'Определяются образования костной плотности в параартикулярных тканях.',
    )
    setIsAnkleParaarticularModalOpen(false)
  }

  function handleInsertAnkleNormal() {
    appendToDescription(XRAY_ANKLE_NORMAL_DESCRIPTION)
  }

  function handleFootJointToggle(
    kind: 'jointSpace' | 'jointSurface' | 'osteophytes' | 'congruency',
    key: FootJointKey,
  ) {
    const setter =
      kind === 'jointSpace'
        ? setFootJointSpaceState
        : kind === 'jointSurface'
          ? setFootJointSurfaceState
          : kind === 'osteophytes'
            ? setFootOsteophytesState
            : setFootCongruencyState

    setter((current) => {
      const next = { ...current, [key]: { ...current[key] } }
      if (kind === 'jointSpace' || kind === 'jointSurface') {
        if (activeFootJointDegree === 'Не изменены') {
          next[key] = {}
        } else {
          next[key][activeFootJointDegree] = !next[key][activeFootJointDegree]
        }
      } else {
        next[key].selected = !next[key].selected
      }
      return next
    })
  }

  function handleAddFootJointSpaceDescription() {
    appendToDescription(generateFootJointDescription(footJointSpaceState, 'gaps'))
    setIsFootJointSpaceModalOpen(false)
  }

  function handleAddFootJointSurfaceDescription() {
    appendToDescription(generateFootJointDescription(footJointSurfaceState, 'surfaces'))
    setIsFootJointSurfaceModalOpen(false)
  }

  function handleAddFootOsteophytesDescription() {
    appendToDescription(generateFootOsteophytesDescription(footOsteophytesState))
    setIsFootOsteophytesModalOpen(false)
  }

  function handleAddFootCongruencyDescription() {
    appendToDescription(generateFootCongruencyDescription(footCongruencyState))
    setIsFootCongruencyModalOpen(false)
  }

  function handleFootIntegritySelect(value: (typeof XRAY_FOOT_INTEGRITY_OPTIONS)[number]) {
    appendToDescription(
      value === 'Не нарушена'
        ? 'Костно-травматических и костно-деструктивных изменений не выявлено.'
        : 'Определяется нарушение целостности костной ткани в',
    )
    setIsFootIntegrityModalOpen(false)
  }

  function handleFootParaarticularSelect(value: (typeof XRAY_FOOT_PARAARTICULAR_OPTIONS)[number]) {
    appendToDescription(
      value === 'Без изменений'
        ? 'Параартикулярные ткани не имеют рентгено-позитивных признаков изменений.'
        : 'Определяются образования костной плотности в параартикулярных тканях.',
    )
    setIsFootParaarticularModalOpen(false)
  }

  function handleInsertFootNormal() {
    appendToDescription(XRAY_FOOT_NORMAL_DESCRIPTION)
  }

  function handleHandJointToggle(
    kind: 'jointSpace' | 'jointSurface' | 'osteophytes' | 'congruency',
    key: HandJointKey,
  ) {
    const setter =
      kind === 'jointSpace'
        ? setHandJointSpaceState
        : kind === 'jointSurface'
          ? setHandJointSurfaceState
          : kind === 'osteophytes'
            ? setHandOsteophytesState
            : setHandCongruencyState

    setter((current) => {
      const next = { ...current, [key]: { ...current[key] } }
      if (kind === 'jointSpace' || kind === 'jointSurface') {
        if (activeHandJointDegree === 'Не изменены') {
          next[key] = {}
        } else {
          next[key][activeHandJointDegree] = !next[key][activeHandJointDegree]
        }
      } else {
        next[key].selected = !next[key].selected
      }
      return next
    })
  }

  function handleAddHandJointSpaceDescription() {
    appendToDescription(generateHandJointDescription(handJointSpaceState, 'gaps'))
    setIsHandJointSpaceModalOpen(false)
  }

  function handleAddHandJointSurfaceDescription() {
    appendToDescription(generateHandJointDescription(handJointSurfaceState, 'surfaces'))
    setIsHandJointSurfaceModalOpen(false)
  }

  function handleAddHandOsteophytesDescription() {
    appendToDescription(generateHandOsteophytesDescription(handOsteophytesState))
    setIsHandOsteophytesModalOpen(false)
  }

  function handleAddHandCongruencyDescription() {
    appendToDescription(generateHandCongruencyDescription(handCongruencyState))
    setIsHandCongruencyModalOpen(false)
  }

  function handleHandIntegritySelect(value: (typeof XRAY_HAND_INTEGRITY_OPTIONS)[number]) {
    appendToDescription(
      value === 'Не нарушена'
        ? 'Костно-травматических и костно-деструктивных изменений не выявлено.'
        : 'Определяется нарушение целостности костной ткани в',
    )
    setIsHandIntegrityModalOpen(false)
  }

  function handleHandParaarticularSelect(
    value: (typeof XRAY_HAND_PARAARTICULAR_OPTIONS)[number],
  ) {
    appendToDescription(
      value === 'Без изменений'
        ? 'Параартикулярные ткани не имеют рентгено-позитивных признаков изменений.'
        : 'Определяются образования костной плотности в параартикулярных тканях.',
    )
    setIsHandParaarticularModalOpen(false)
  }

  function handleInsertHandNormal() {
    appendToDescription(XRAY_HAND_NORMAL_DESCRIPTION)
  }

  function handleFlatfootValueChange(
    side: 'left' | 'right',
    field: 'angle' | 'height',
    value: string,
  ) {
    setFlatfootState((current) => ({
      ...current,
      [side]: {
        ...current[side],
        [field]: value,
      },
    }))
  }

  function handleAddFlatfootDescription() {
    const baseText =
      'Структура костей сохранена, контуры их ровные, чёткие, без признаков костно-деструктивной или костно-травматической патологии.'

    const lines = [baseText]

    ;(['left', 'right'] as const).forEach((side) => {
      const { angle, height } = flatfootState[side]
      if (!angle && !height) return

      const finalDegree = Math.max(
        getFlatfootDegreeByAngle(angle),
        getFlatfootDegreeByHeight(height),
      )

      lines.push(
        `${side === 'left' ? 'Левая' : 'Правая'} стопа: угол свода - ${angle || '—'}°, высота свода - ${
          height || '—'
        } мм (соответствует ${getFlatfootDegreeText(finalDegree)}).`,
      )
    })

    if (lines.length === 1) {
      lines.push('Признаков плоскостопия не выявлено.')
    }

    appendToDescription(lines.join('\n'))
    setIsFlatfootModalOpen(false)
  }

  function handleInsertFlatfootNormal() {
    appendToDescription(XRAY_FLATFOOT_NORMAL_DESCRIPTION)
  }

  function handleCalcaneusOsteophyteToggle(
    key: keyof typeof calcaneusOsteophytesState,
  ) {
    setCalcaneusOsteophytesState((current) => ({
      ...current,
      [key]: !current[key],
    }))
  }

  function handleAddCalcaneusOsteophytesDescription() {
    const baseText =
      'Структура костей сохранена, контуры их ровные, чёткие, без признаков костно-деструктивной или костно-травматической патологии.'

    const texts: string[] = []
    const plantarBoth =
      calcaneusOsteophytesState.rightPlantar && calcaneusOsteophytesState.leftPlantar
    const posteriorBoth =
      calcaneusOsteophytesState.rightPosterior && calcaneusOsteophytesState.leftPosterior

    if (
      !calcaneusOsteophytesState.rightPlantar &&
      !calcaneusOsteophytesState.rightPosterior &&
      !calcaneusOsteophytesState.leftPlantar &&
      !calcaneusOsteophytesState.leftPosterior
    ) {
      appendToDescription(`${baseText}\nОстеофиты пяточных костей не выявлены.`)
      setIsCalcaneusOsteophytesModalOpen(false)
      return
    }

    if (plantarBoth) {
      texts.push(
        'На подошвенной поверхности пяточных костей, в области прикрепления плантарной связки, определяются остроконечные остеофиты.',
      )
    }

    if (posteriorBoth) {
      texts.push(
        'На задней поверхности пяточных костей, в области прикрепления ахиллова сухожилия, определяются остроконечные остеофиты.',
      )
    }

    if (calcaneusOsteophytesState.rightPlantar && !plantarBoth) {
      texts.push(
        'На подошвенной поверхности правой пяточной кости, в области прикрепления плантарной связки, определяется остроконечный остеофит.',
      )
    }

    if (calcaneusOsteophytesState.rightPosterior && !posteriorBoth) {
      texts.push(
        'На задней поверхности правой пяточной кости, в области прикрепления ахиллова сухожилия, определяется остроконечный остеофит.',
      )
    }

    if (calcaneusOsteophytesState.leftPlantar && !plantarBoth) {
      texts.push(
        'На подошвенной поверхности левой пяточной кости, в области прикрепления плантарной связки, определяется остроконечный остеофит.',
      )
    }

    if (calcaneusOsteophytesState.leftPosterior && !posteriorBoth) {
      texts.push(
        'На задней поверхности левой пяточной кости, в области прикрепления ахиллова сухожилия, определяется остроконечный остеофит.',
      )
    }

    appendToDescription(`${baseText}\n${texts.join('\n')}`)
    setIsCalcaneusOsteophytesModalOpen(false)
  }

  function handleInsertCalcaneusNormal() {
    appendToDescription(XRAY_CALCANEUS_NORMAL_DESCRIPTION)
  }

  function handleShoulderJointSpaceDegreeChange(
    side: ShoulderSide,
    value: ShoulderJointSpaceState['left']['degree'],
  ) {
    setShoulderJointSpaceState((current) => ({
      ...current,
      [side]: {
        ...current[side],
        degree: value,
        uniformity: value === 'не изменена' ? '' : current[side].uniformity,
      },
    }))
  }

  function handleShoulderJointSpaceUniformityChange(
    side: ShoulderSide,
    value: ShoulderJointSpaceState['left']['uniformity'],
  ) {
    setShoulderJointSpaceState((current) => ({
      ...current,
      [side]: {
        ...current[side],
        uniformity: value,
      },
    }))
  }

  function handleAddShoulderJointSpaceDescription() {
    appendToDescription(generateShoulderJointSpaceDescription(shoulderJointSpaceState))
    setIsShoulderJointSpaceModalOpen(false)
  }

  function handleShoulderJointSurfaceChange(
    side: ShoulderSide,
    value: ShoulderJointSurfaceState['left'],
  ) {
    setShoulderJointSurfaceState((current) => ({
      ...current,
      [side]: value,
    }))
  }

  function handleAddShoulderJointSurfaceDescription() {
    appendToDescription(generateShoulderJointSurfaceDescription(shoulderJointSurfaceState))
    setIsShoulderJointSurfaceModalOpen(false)
  }

  function handleShoulderOsteophyteToggle(key: keyof typeof shoulderOsteophytesState) {
    setShoulderOsteophytesState((current) => ({
      ...current,
      [key]: !current[key],
    }))
  }

  function handleAddShoulderOsteophytesDescription() {
    appendToDescription(generateShoulderOsteophytesDescription(shoulderOsteophytesState))
    setIsShoulderOsteophytesModalOpen(false)
  }

  function handleShoulderAcromioclavicularNormalToggle(side: 'left' | 'right') {
    setShoulderAcromioclavicularState((current) => ({
      ...current,
      [side]: createInitialShoulderAcromioclavicularSideState(),
    }))
  }

  function handleShoulderAcromioclavicularJointSpaceChange(
    side: 'left' | 'right',
    value: ShoulderAcromioclavicularSideState['jointSpace'],
  ) {
    setShoulderAcromioclavicularState((current) => ({
      ...current,
      [side]: {
        ...current[side],
        isNormal: false,
        jointSpace: value,
      },
    }))
  }

  function handleShoulderAcromioclavicularJointSurfaceChange(
    side: 'left' | 'right',
    value: ShoulderAcromioclavicularSideState['jointSurface'],
  ) {
    setShoulderAcromioclavicularState((current) => ({
      ...current,
      [side]: {
        ...current[side],
        isNormal: false,
        jointSurface: value,
      },
    }))
  }

  function handleShoulderAcromioclavicularOsteophytesToggle(
    side: 'left' | 'right',
    value: NonNullable<ShoulderAcromioclavicularSideState['osteophytes'][number]>,
  ) {
    setShoulderAcromioclavicularState((current) => ({
      ...current,
      [side]: {
        ...current[side],
        isNormal: false,
        osteophytes: current[side].osteophytes.includes(value)
          ? current[side].osteophytes.filter((item) => item !== value)
          : [...current[side].osteophytes, value],
      },
    }))
  }

  function handleAddShoulderAcromioclavicularDescription() {
    appendToDescription(
      generateShoulderAcromioclavicularDescription(shoulderAcromioclavicularState),
    )
    setIsShoulderAcromioclavicularModalOpen(false)
  }

  function handleShoulderCongruencySelect(
    value: (typeof XRAY_SHOULDER_CONGRUENCY_OPTIONS)[number],
  ) {
    appendToDescription(
      value === 'не нарушена'
        ? 'Конгруэнтность суставных поверхностей не нарушена.'
        : value === 'нарушена в левом'
          ? 'Конгруэнтность суставных поверхностей нарушена в левом плечевом суставе.'
          : 'Конгруэнтность суставных поверхностей нарушена в правом плечевом суставе.',
    )
    setIsShoulderCongruencyModalOpen(false)
  }

  function handleShoulderIntegritySelect(
    value: (typeof XRAY_SHOULDER_INTEGRITY_OPTIONS)[number],
  ) {
    appendToDescription(
      value === 'Не нарушена'
        ? 'Костно-травматических и костно-деструктивных изменений не выявлено.'
        : 'Определяется нарушение целостности костной ткани в',
    )
    setIsShoulderIntegrityModalOpen(false)
  }

  function handleShoulderParaarticularSelect(
    value: (typeof XRAY_SHOULDER_PARAARTICULAR_OPTIONS)[number],
  ) {
    appendToDescription(
      value === 'Без изменений'
        ? 'Параартикулярные ткани не имеют рентгено-позитивных признаков изменений.'
        : 'Определяются образования костной плотности в параартикулярных тканях.',
    )
    setIsShoulderParaarticularModalOpen(false)
  }

  function handleInsertShoulderNormal() {
    appendToDescription(XRAY_SHOULDER_NORMAL_DESCRIPTION)
  }

  function handleWristGapSurfaceSideToggle(kind: 'jointSpace' | 'jointSurface', side: WristSide) {
    const setter = kind === 'jointSpace' ? setWristJointSpaceState : setWristJointSurfaceState
    setter((current) => ({
      ...current,
      selectedSides: current.selectedSides.includes(side)
        ? current.selectedSides.filter((item) => item !== side)
        : [...current.selectedSides, side],
    }))
  }

  function handleWristGapSurfaceDegreeSelect(
    kind: 'jointSpace' | 'jointSurface',
    side: WristSide,
    value: WristDegree,
  ) {
    const setter = kind === 'jointSpace' ? setWristJointSpaceState : setWristJointSurfaceState
    setter((current) => ({
      ...current,
      selectedOptions: {
        ...current.selectedOptions,
        [side]: [value],
      },
    }))
  }

  function handleWristGapSurfacePositionSelect(
    kind: 'jointSpace' | 'jointSurface',
    side: WristSide,
    value: WristPosition,
  ) {
    const setter = kind === 'jointSpace' ? setWristJointSpaceState : setWristJointSurfaceState
    setter((current) => ({
      ...current,
      selectedPositions: {
        ...current.selectedPositions,
        [side]: current.selectedPositions[side] === value ? '' : value,
      },
    }))
  }

  function handleAddWristJointSpaceDescription() {
    appendToDescription(
      generateWristGapSurfaceDescription({
        selectedOptions: wristJointSpaceState.selectedOptions,
        selectedPositions: wristJointSpaceState.selectedPositions,
        mode: 'gaps',
      }),
    )
    setIsWristJointSpaceModalOpen(false)
  }

  function handleAddWristJointSurfaceDescription() {
    appendToDescription(
      generateWristGapSurfaceDescription({
        selectedOptions: wristJointSurfaceState.selectedOptions,
        selectedPositions: wristJointSurfaceState.selectedPositions,
        mode: 'surfaces',
      }),
    )
    setIsWristJointSurfaceModalOpen(false)
  }

  function handleWristOsteophyteToggle(key: keyof typeof wristOsteophytesState) {
    setWristOsteophytesState((current) => ({
      ...current,
      [key]: !current[key],
    }))
  }

  function handleAddWristOsteophytesDescription() {
    appendToDescription(generateWristOsteophytesDescription(wristOsteophytesState))
    setIsWristOsteophytesModalOpen(false)
  }

  function handleWristCongruencySelect(
    value: (typeof XRAY_WRIST_CONGRUENCY_OPTIONS)[number],
  ) {
    appendToDescription(
      value === 'не нарушена'
        ? 'Конгруэнтность суставных поверхностей не нарушена.'
        : value === 'нарушена в левом'
          ? 'Конгруэнтность суставных поверхностей нарушена в левом лучезапястном суставе.'
          : 'Конгруэнтность суставных поверхностей нарушена в правом лучезапястном суставе.',
    )
    setIsWristCongruencyModalOpen(false)
  }

  function handleWristIntegritySelect(
    value: (typeof XRAY_WRIST_INTEGRITY_OPTIONS)[number],
  ) {
    appendToDescription(
      value === 'Не нарушена'
        ? 'Костно-травматических и костно-деструктивных изменений не выявлено.'
        : 'Определяется нарушение целостности костной ткани в',
    )
    setIsWristIntegrityModalOpen(false)
  }

  function handleWristParaarticularSelect(
    value: (typeof XRAY_WRIST_PARAARTICULAR_OPTIONS)[number],
  ) {
    appendToDescription(
      value === 'Без изменений'
        ? 'Параартикулярные ткани не имеют рентгено-позитивных признаков изменений.'
        : 'Определяются образования костной плотности в параартикулярных тканях.',
    )
    setIsWristParaarticularModalOpen(false)
  }

  function handleInsertWristNormal() {
    appendToDescription(XRAY_WRIST_NORMAL_DESCRIPTION)
  }

  function handleParanasalSinusChange(
    zone: keyof ParanasalSinusesSelectionState,
    field: keyof ParanasalSinusState,
    value: string,
  ) {
    setParanasalSinusesState((current) => ({
      ...current,
      [zone]: {
        ...current[zone],
        [field]: current[zone][field] === value ? '' : value,
      },
    }))
  }

  function handleAddParanasalSinusesDescription() {
    appendToDescription(generateParanasalSinusesDescription(paranasalSinusesState))
    setIsParanasalSinusesModalOpen(false)
  }

  function handleNasalPassagesSelect(
    value: (typeof XRAY_NASAL_PASSAGES_OPTIONS)[number],
  ) {
    appendToDescription(
      value === 'Носовые ходы без особенностей'
        ? 'Носовые ходы без особенностей.'
        : `Носовые ходы ${value.toLowerCase()}.`,
    )
    setIsNasalPassagesModalOpen(false)
  }

  function handleNasalSeptumSelect(
    value: (typeof XRAY_NASAL_SEPTUM_OPTIONS)[number],
  ) {
    appendToDescription(`Носовая перегородка ${value.toLowerCase()}.`)
    setIsNasalSeptumModalOpen(false)
  }

  function handleInsertParanasalNormal() {
    appendToDescription(XRAY_PARANASAL_NORMAL_DESCRIPTION)
  }

  function handleSpineRangeToggle(vertebra: string) {
    setSpineRangeSelection((current) => {
      if (current.includes(vertebra)) {
        return current.filter((item) => item !== vertebra)
      }
      if (current.length < 2) {
        return [...current, vertebra]
      }
      return [current[0], vertebra]
    })
  }

  function handleAddSpineRangeDescription() {
    const text = generateSpineRangeDescription(spineRangeSelection)
    if (!text) return
    appendToDescription(text)
    setIsSpineRangeModalOpen(false)
  }

  function handleSpineCurveTypeChange(value: (typeof spineCurvatureState)['curveType']) {
    setSpineCurvatureState({
      curveType: value,
      selected: [],
      cobbAngle: '',
      cCurveDirection: 'влево',
      torsion: false,
    })
  }

  function handleSpineCurvatureToggleVertebra(vertebra: string) {
    setSpineCurvatureState((current) => {
      const maxSelect =
        current.curveType === 'C-образно' ? 3 : current.curveType === 'S-образно' ? 4 : 0
      if (current.selected.includes(vertebra)) {
        return { ...current, selected: current.selected.filter((item) => item !== vertebra) }
      }
      if (current.selected.length < maxSelect) {
        return { ...current, selected: [...current.selected, vertebra] }
      }
      return { ...current, selected: [...current.selected.slice(0, maxSelect - 1), vertebra] }
    })
  }

  function handleAddSpineCurvatureDescription() {
    const text = generateSpineCurvatureDescription(spineCurvatureState)
    if (!text) return
    appendToDescription(text)
    setIsSpineCurvatureModalOpen(false)
  }

  function handleSpineDiscsSetUnchanged() {
    setSpineDiscsState(createInitialSpineDiscsState())
  }

  function handleSpineDiscsSetSeverity(severity: SpineSeverity) {
    setSpineDiscsState((current) => ({
      ...current,
      unchanged: false,
      activeSeverity: severity,
    }))
  }

  function handleSpineDiscsToggleVertebra(vertebra: string) {
    setSpineDiscsState((current) => {
      if (!current.activeSeverity) return current
      const selected = current.selected[current.activeSeverity]
      return {
        ...current,
        selected: {
          ...current.selected,
          [current.activeSeverity]: selected.includes(vertebra)
            ? selected.filter((item) => item !== vertebra)
            : [...selected, vertebra],
        },
      }
    })
  }

  function handleAddSpineDiscsDescription() {
    const text = generateSpineDiscsDescription(spineDiscsState)
    if (!text) return
    appendToDescription(text)
    setIsSpineDiscsModalOpen(false)
  }

  function handleSpineEndplatesSetUnchanged() {
    setSpineEndplatesState(createInitialSpineEndplatesState())
  }

  function handleSpineEndplatesSetSeverity(severity: SpineSeverity) {
    setSpineEndplatesState((current) => ({
      ...current,
      unchanged: false,
      activeShmorl: false,
      activeSeverity: severity,
    }))
  }

  function handleSpineEndplatesSetShmorlMode() {
    setSpineEndplatesState((current) => ({
      ...current,
      unchanged: false,
      activeSeverity: null,
      activeShmorl: true,
    }))
  }

  function handleSpineEndplatesToggleVertebra(vertebra: string) {
    setSpineEndplatesState((current) => {
      if (!current.activeSeverity) return current
      const selected = current.selected[current.activeSeverity]
      return {
        ...current,
        selected: {
          ...current.selected,
          [current.activeSeverity]: selected.includes(vertebra)
            ? selected.filter((item) => item !== vertebra)
            : [...selected, vertebra],
        },
      }
    })
  }

  function handleSpineEndplatesToggleShmorl(vertebra: string, side: 'верхней' | 'нижней') {
    setSpineEndplatesState((current) => ({
      ...current,
      shmorl: current.shmorl.some((item) => item.vertebra === vertebra && item.side === side)
        ? current.shmorl.filter((item) => !(item.vertebra === vertebra && item.side === side))
        : [...current.shmorl, { vertebra, side }],
    }))
  }

  function handleAddSpineEndplatesDescription() {
    const text = generateSpineEndplatesDescription(spineEndplatesState)
    if (!text) return
    appendToDescription(text)
    setIsSpineEndplatesModalOpen(false)
  }

  function handleSpineOsteophytesSurfaceChange(surface: SpineSurface) {
    setSpineOsteophytesState((current) => ({ ...current, activeSurface: surface }))
  }

  function handleSpineOsteophytesToggleVertebra(vertebra: string) {
    setSpineOsteophytesState((current) => {
      const selected = current.selected[current.activeSurface]
      return {
        ...current,
        selected: {
          ...current.selected,
          [current.activeSurface]: selected.includes(vertebra)
            ? selected.filter((item) => item !== vertebra)
            : [...selected, vertebra],
        },
      }
    })
  }

  function handleAddSpineOsteophytesDescription() {
    const text = generateSpineOsteophytesDescription(spineOsteophytesState)
    if (!text) return
    appendToDescription(text)
    setIsSpineOsteophytesModalOpen(false)
  }

  function handleSpineInstabilityModeChange(mode: 'Норма' | 'Нестабильность') {
    setSpineInstabilityState({
      mode,
      selectedDirection: null,
      selectedMagnitude: null,
      selectedVertebrae: [],
    })
  }

  function handleSpineInstabilityDirectionChange(direction: SpineDirection) {
    setSpineInstabilityState((current) => ({ ...current, selectedDirection: direction }))
  }

  function handleSpineInstabilityMagnitudeChange(magnitude: SpineMagnitude) {
    setSpineInstabilityState((current) => ({ ...current, selectedMagnitude: magnitude }))
  }

  function handleSpineInstabilityToggleVertebra(vertebra: string) {
    setSpineInstabilityState((current) => ({
      ...current,
      selectedVertebrae: current.selectedVertebrae.includes(vertebra)
        ? current.selectedVertebrae.filter((item) => item !== vertebra)
        : [...current.selectedVertebrae, vertebra],
    }))
  }

  function handleAddSpineInstabilityDescription() {
    const text = generateSpineInstabilityDescription(spineInstabilityState)
    if (!text) return
    appendToDescription(text)
    setIsSpineInstabilityModalOpen(false)
  }

  function handleSpineLordosisSelect(
    value: (typeof XRAY_SPINE_LORDOSIS_OPTIONS)[number],
  ) {
    appendToDescription(`Лордоз поясничного отдела позвоночника ${value}.`)
    setIsSpineLordosisModalOpen(false)
  }

  function handleSpineKyphosisSelect(
    value: (typeof XRAY_SPINE_KYPHOSIS_OPTIONS)[number],
  ) {
    appendToDescription(`Кифоз грудного отдела позвоночника ${value}.`)
    setIsSpineKyphosisModalOpen(false)
  }

  function handleSpineIntegritySelect(
    value: (typeof XRAY_SPINE_INTEGRITY_OPTIONS)[number],
  ) {
    appendToDescription(
      value === 'Не нарушена'
        ? 'Костно-травматических и костно-деструктивных изменений не выявлено.'
        : 'Определяется нарушение целостности костной ткани в',
    )
    setIsSpineIntegrityModalOpen(false)
  }

  function handleSpineParaarticularSelect(
    value: (typeof XRAY_SPINE_PARAARTICULAR_OPTIONS)[number],
  ) {
    appendToDescription(
      value === 'Без изменений'
        ? 'Параартикулярные ткани не имеют рентгено-позитивных признаков изменений.'
        : 'Определяются образования костной плотности в параартикулярных тканях.',
    )
    setIsSpineParaarticularModalOpen(false)
  }

  function handleInsertSpineNormal() {
    appendToDescription(XRAY_SPINE_NORMAL_DESCRIPTION)
  }

  async function handleSaveStudyDescription() {
    if (!descriptionStudy) return
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
    if (!descriptionStudy) return
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
    if (templateStep === 'root' && template === XRAY_ANKLE_STUDY_TEMPLATE) {
      setTemplateStep('ankles')
      setTemplateQuery('')
      return
    }
    if (templateStep === 'root' && template === XRAY_SHOULDER_STUDY_TEMPLATE) {
      setTemplateStep('shoulders')
      setTemplateQuery('')
      return
    }
    if (
      templateStep === 'root' &&
      [
        XRAY_LUMBAR_SPINE_STUDY_TEMPLATE,
        XRAY_THORACIC_SPINE_STUDY_TEMPLATE,
        XRAY_THORACOLUMBAR_SPINE_STUDY_TEMPLATE,
        XRAY_CERVICAL_SPINE_STUDY_TEMPLATE,
      ].includes(template as typeof XRAY_LUMBAR_SPINE_STUDY_TEMPLATE)
    ) {
      setSpineTemplate(
        template as
          | typeof XRAY_LUMBAR_SPINE_STUDY_TEMPLATE
          | typeof XRAY_THORACIC_SPINE_STUDY_TEMPLATE
          | typeof XRAY_THORACOLUMBAR_SPINE_STUDY_TEMPLATE
          | typeof XRAY_CERVICAL_SPINE_STUDY_TEMPLATE,
      )
      setTemplateStep('spines')
      setTemplateQuery('')
      return
    }
    if (templateStep === 'root' && template === XRAY_HIP_STUDY_TEMPLATE && templateStudy) {
      openStudyDescriptionModal(templateStudy, true, `${XRAY_HIP_STUDY_DESCRIPTION}\n`)
      return
    }
    if (templateStep === 'root' && template === XRAY_FOOT_STUDY_TEMPLATE && templateStudy) {
      openStudyDescriptionModal(templateStudy, true, `${XRAY_FOOT_STUDY_DESCRIPTION}\n`)
      return
    }
    if (templateStep === 'root' && template === XRAY_FLATFOOT_STUDY_TEMPLATE && templateStudy) {
      openStudyDescriptionModal(templateStudy, true, `${XRAY_FLATFOOT_STUDY_DESCRIPTION}\n`)
      return
    }
    if (templateStep === 'root' && template === XRAY_CALCANEUS_STUDY_TEMPLATE && templateStudy) {
      openStudyDescriptionModal(templateStudy, true, `${XRAY_CALCANEUS_STUDY_DESCRIPTION}\n`)
      return
    }
    if (templateStep === 'root' && template === XRAY_WRIST_STUDY_TEMPLATE && templateStudy) {
      openStudyDescriptionModal(templateStudy, true, `${XRAY_WRIST_STUDY_DESCRIPTION}\n`)
      return
    }
    if (templateStep === 'root' && template === XRAY_HAND_STUDY_TEMPLATE && templateStudy) {
      openStudyDescriptionModal(templateStudy, true, `${XRAY_HAND_STUDY_DESCRIPTION}\n`)
      return
    }
    if (templateStep === 'root' && template === XRAY_PARANASAL_STUDY_TEMPLATE && templateStudy) {
      openStudyDescriptionModal(templateStudy, true, `${XRAY_PARANASAL_STUDY_DESCRIPTION}\n`)
      return
    }
    if (templateStep === 'knees' && templateStudy) {
      const baseDescription =
        XRAY_KNEE_STUDY_OPTION_DESCRIPTIONS[
          template as keyof typeof XRAY_KNEE_STUDY_OPTION_DESCRIPTIONS
        ]
      openStudyDescriptionModal(templateStudy, true, `${baseDescription}\n`)
      return
    }
    if (templateStep === 'ankles' && templateStudy) {
      const baseDescription =
        XRAY_ANKLE_STUDY_OPTION_DESCRIPTIONS[
          template as keyof typeof XRAY_ANKLE_STUDY_OPTION_DESCRIPTIONS
        ]
      openStudyDescriptionModal(templateStudy, true, `${baseDescription}\n`)
      return
    }
    if (templateStep === 'spines' && templateStudy && spineTemplate) {
      const baseDescription =
        XRAY_SPINE_STUDY_OPTION_DESCRIPTIONS[spineTemplate][
          template as keyof (typeof XRAY_SPINE_STUDY_OPTION_DESCRIPTIONS)[typeof spineTemplate]
        ]
      openStudyDescriptionModal(templateStudy, true, `${baseDescription}\n`)
      return
    }
    if (templateStep === 'shoulders' && templateStudy) {
      const baseDescription =
        XRAY_SHOULDER_STUDY_OPTION_DESCRIPTIONS[
          template as keyof typeof XRAY_SHOULDER_STUDY_OPTION_DESCRIPTIONS
        ]
      openStudyDescriptionModal(templateStudy, true, `${baseDescription}\n`)
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
    isHipStudyContext,
    isAnkleStudyContext,
    isFootStudyContext,
    isHandStudyContext,
    isFlatfootStudyContext,
    isCalcaneusStudyContext,
    isShoulderStudyContext,
    isWristStudyContext,
    isParanasalStudyContext,
    isSpineStudyContext,
    isLumbarSpineStudyContext,
    isThoracicSpineStudyContext,
    isJointSpaceModalOpen,
    isJointSurfaceModalOpen,
    isBumpsModalOpen,
    isCongruencyModalOpen,
    isIntegrityModalOpen,
    isParaarticularModalOpen,
    isEndoprosthesisModalOpen,
    isOsteophytesModalOpen,
    isHipJointSpaceModalOpen,
    isHipJointSurfaceModalOpen,
    isHipOsteophytesModalOpen,
    isPubicSymphysisModalOpen,
    isHipCongruencyModalOpen,
    isHipIntegrityModalOpen,
    isHipParaarticularModalOpen,
    isHipEndoprosthesisModalOpen,
    isAnkleJointSpaceModalOpen,
    isAnkleJointSurfaceModalOpen,
    isAnkleOsteophytesModalOpen,
    isAnkleCongruencyModalOpen,
    isAnkleIntegrityModalOpen,
    isAnkleParaarticularModalOpen,
    isFootJointSpaceModalOpen,
    isFootJointSurfaceModalOpen,
    isFootOsteophytesModalOpen,
    isFootCongruencyModalOpen,
    isFootIntegrityModalOpen,
    isFootParaarticularModalOpen,
    isHandJointSpaceModalOpen,
    isHandJointSurfaceModalOpen,
    isHandOsteophytesModalOpen,
    isHandCongruencyModalOpen,
    isHandIntegrityModalOpen,
    isHandParaarticularModalOpen,
    isFlatfootModalOpen,
    isCalcaneusOsteophytesModalOpen,
    isShoulderJointSpaceModalOpen,
    isShoulderJointSurfaceModalOpen,
    isShoulderOsteophytesModalOpen,
    isShoulderAcromioclavicularModalOpen,
    isShoulderCongruencyModalOpen,
    isShoulderIntegrityModalOpen,
    isShoulderParaarticularModalOpen,
    isWristJointSpaceModalOpen,
    isWristJointSurfaceModalOpen,
    isWristOsteophytesModalOpen,
    isWristCongruencyModalOpen,
    isWristIntegrityModalOpen,
    isWristParaarticularModalOpen,
    isParanasalSinusesModalOpen,
    isNasalPassagesModalOpen,
    isNasalSeptumModalOpen,
    isSpineRangeModalOpen,
    isSpineCurvatureModalOpen,
    isSpineDiscsModalOpen,
    isSpineEndplatesModalOpen,
    isSpineOsteophytesModalOpen,
    isSpineInstabilityModalOpen,
    isSpineLordosisModalOpen,
    isSpineKyphosisModalOpen,
    isSpineIntegrityModalOpen,
    isSpineParaarticularModalOpen,
    descriptionInputRef,
    filteredStudyTemplates,
    jointSpaceState,
    jointSurfaceState,
    osteophytesState,
    hipJointSpaceState,
    hipJointSurfaceState,
    hipOsteophytesState,
    pubicSymphysisState,
    ankleJointSpaceState,
    ankleJointSurfaceState,
    ankleOsteophytesState,
    footJointSpaceState,
    footJointSurfaceState,
    footOsteophytesState,
    footCongruencyState,
    activeFootJointDegree,
    handJointSpaceState,
    handJointSurfaceState,
    handOsteophytesState,
    handCongruencyState,
    activeHandJointDegree,
    flatfootState,
    calcaneusOsteophytesState,
    shoulderJointSpaceState,
    shoulderJointSurfaceState,
    shoulderOsteophytesState,
    shoulderAcromioclavicularState,
    wristJointSpaceState,
    wristJointSurfaceState,
    wristOsteophytesState,
    paranasalSinusesState,
    spineRangeSelection,
    spineCurvatureState,
    spineDiscsState,
    spineEndplatesState,
    spineOsteophytesState,
    spineInstabilityState,
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
    setIsHipJointSpaceModalOpen,
    setIsHipJointSurfaceModalOpen,
    setIsHipOsteophytesModalOpen,
    setIsPubicSymphysisModalOpen,
    setIsHipCongruencyModalOpen,
    setIsHipIntegrityModalOpen,
    setIsHipParaarticularModalOpen,
    setIsHipEndoprosthesisModalOpen,
    setIsAnkleJointSpaceModalOpen,
    setIsAnkleJointSurfaceModalOpen,
    setIsAnkleOsteophytesModalOpen,
    setIsAnkleCongruencyModalOpen,
    setIsAnkleIntegrityModalOpen,
    setIsAnkleParaarticularModalOpen,
    setIsFootJointSpaceModalOpen,
    setIsFootJointSurfaceModalOpen,
    setIsFootOsteophytesModalOpen,
    setIsFootCongruencyModalOpen,
    setIsFootIntegrityModalOpen,
    setIsFootParaarticularModalOpen,
    setIsHandJointSpaceModalOpen,
    setIsHandJointSurfaceModalOpen,
    setIsHandOsteophytesModalOpen,
    setIsHandCongruencyModalOpen,
    setIsHandIntegrityModalOpen,
    setIsHandParaarticularModalOpen,
    setIsFlatfootModalOpen,
    setIsCalcaneusOsteophytesModalOpen,
    setIsShoulderJointSpaceModalOpen,
    setIsShoulderJointSurfaceModalOpen,
    setIsShoulderOsteophytesModalOpen,
    setIsShoulderAcromioclavicularModalOpen,
    setIsShoulderCongruencyModalOpen,
    setIsShoulderIntegrityModalOpen,
    setIsShoulderParaarticularModalOpen,
    setIsWristJointSpaceModalOpen,
    setIsWristJointSurfaceModalOpen,
    setIsWristOsteophytesModalOpen,
    setIsWristCongruencyModalOpen,
    setIsWristIntegrityModalOpen,
    setIsWristParaarticularModalOpen,
    setIsParanasalSinusesModalOpen,
    setIsNasalPassagesModalOpen,
    setIsNasalSeptumModalOpen,
    setIsSpineRangeModalOpen,
    setIsSpineCurvatureModalOpen,
    setIsSpineDiscsModalOpen,
    setIsSpineEndplatesModalOpen,
    setIsSpineOsteophytesModalOpen,
    setIsSpineInstabilityModalOpen,
    setIsSpineLordosisModalOpen,
    setIsSpineKyphosisModalOpen,
    setIsSpineIntegrityModalOpen,
    setIsSpineParaarticularModalOpen,
    setSpineCurvatureState,
    setActiveFootJointDegree,
    setActiveHandJointDegree,
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
    handleHipJointSpaceDegreeChange,
    handleHipJointSpaceUniformityChange,
    handleAddHipJointSpaceDescription,
    handleHipJointSurfaceChange,
    handleAddHipJointSurfaceDescription,
    handleHipOsteophyteToggle,
    handleAddHipOsteophytesDescription,
    handleHipPubicNormalToggle,
    handleHipPubicSymmetryChange,
    handleHipPubicOsteophyteToggle,
    handleHipPubicSurfaceChange,
    handleAddPubicSymphysisDescription,
    handleHipCongruencySelect,
    handleHipIntegritySelect,
    handleHipParaarticularSelect,
    handleHipEndoprosthesisSelect,
    handleInsertHipNormal,
    handleInsertHipPhlebolites,
    handleAnkleGapSurfaceDegreeChange,
    handleAnkleGapSurfacePositionChange,
    handleAddAnkleJointSpaceDescription,
    handleAddAnkleJointSurfaceDescription,
    handleAnkleOsteophyteToggle,
    handleAddAnkleOsteophytesDescription,
    handleAnkleCongruencySelect,
    handleAnkleIntegritySelect,
    handleAnkleParaarticularSelect,
    handleInsertAnkleNormal,
    handleFootJointToggle,
    handleAddFootJointSpaceDescription,
    handleAddFootJointSurfaceDescription,
    handleAddFootOsteophytesDescription,
    handleAddFootCongruencyDescription,
    handleFootIntegritySelect,
    handleFootParaarticularSelect,
    handleInsertFootNormal,
    handleHandJointToggle,
    handleAddHandJointSpaceDescription,
    handleAddHandJointSurfaceDescription,
    handleAddHandOsteophytesDescription,
    handleAddHandCongruencyDescription,
    handleHandIntegritySelect,
    handleHandParaarticularSelect,
    handleInsertHandNormal,
    handleFlatfootValueChange,
    handleAddFlatfootDescription,
    handleInsertFlatfootNormal,
    handleCalcaneusOsteophyteToggle,
    handleAddCalcaneusOsteophytesDescription,
    handleInsertCalcaneusNormal,
    handleShoulderJointSpaceDegreeChange,
    handleShoulderJointSpaceUniformityChange,
    handleAddShoulderJointSpaceDescription,
    handleShoulderJointSurfaceChange,
    handleAddShoulderJointSurfaceDescription,
    handleShoulderOsteophyteToggle,
    handleAddShoulderOsteophytesDescription,
    handleShoulderAcromioclavicularNormalToggle,
    handleShoulderAcromioclavicularJointSpaceChange,
    handleShoulderAcromioclavicularJointSurfaceChange,
    handleShoulderAcromioclavicularOsteophytesToggle,
    handleAddShoulderAcromioclavicularDescription,
    handleShoulderCongruencySelect,
    handleShoulderIntegritySelect,
    handleShoulderParaarticularSelect,
    handleInsertShoulderNormal,
    handleWristGapSurfaceSideToggle,
    handleWristGapSurfaceDegreeSelect,
    handleWristGapSurfacePositionSelect,
    handleAddWristJointSpaceDescription,
    handleAddWristJointSurfaceDescription,
    handleWristOsteophyteToggle,
    handleAddWristOsteophytesDescription,
    handleWristCongruencySelect,
    handleWristIntegritySelect,
    handleWristParaarticularSelect,
    handleInsertWristNormal,
    handleParanasalSinusChange,
    handleAddParanasalSinusesDescription,
    handleNasalPassagesSelect,
    handleNasalSeptumSelect,
    handleInsertParanasalNormal,
    handleSpineRangeToggle,
    handleAddSpineRangeDescription,
    handleSpineCurveTypeChange,
    handleSpineCurvatureToggleVertebra,
    handleAddSpineCurvatureDescription,
    handleSpineDiscsSetUnchanged,
    handleSpineDiscsSetSeverity,
    handleSpineDiscsToggleVertebra,
    handleAddSpineDiscsDescription,
    handleSpineEndplatesSetUnchanged,
    handleSpineEndplatesSetSeverity,
    handleSpineEndplatesSetShmorlMode,
    handleSpineEndplatesToggleVertebra,
    handleSpineEndplatesToggleShmorl,
    handleAddSpineEndplatesDescription,
    handleSpineOsteophytesSurfaceChange,
    handleSpineOsteophytesToggleVertebra,
    handleAddSpineOsteophytesDescription,
    handleSpineInstabilityModeChange,
    handleSpineInstabilityDirectionChange,
    handleSpineInstabilityMagnitudeChange,
    handleSpineInstabilityToggleVertebra,
    handleAddSpineInstabilityDescription,
    handleSpineLordosisSelect,
    handleSpineKyphosisSelect,
    handleSpineIntegritySelect,
    handleSpineParaarticularSelect,
    handleInsertSpineNormal,
  }
}
