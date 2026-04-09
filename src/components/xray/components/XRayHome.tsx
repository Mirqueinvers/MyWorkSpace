import { useEffect, useState } from 'react'
import { formatStudyLabel, getPatientFullName } from '../helpers'
import { useXRayHomeState } from '../hooks'
import type { XRaySectionProps } from '../types'
import {
  XRayAddPatientCard,
  XRayAnkleJointSpaceModal,
  XRayAnkleJointSurfaceModal,
  XRayAnkleOsteophytesModal,
  XRayCalcaneusOsteophytesModal,
  XRayConfirmModal,
  XRayFlatfootModal,
  XRayFootJointMapModal,
  XRayHandJointMapModal,
  XRayHipJointSpaceModal,
  XRayHipJointSurfaceModal,
  XRayHipOsteophytesModal,
  XRayJointSpaceModal,
  XRayJointSurfaceModal,
  XRayKneeChoiceModal,
  XRayKneeOsteophytesModal,
  XRayPatientCard,
  XRayPatientEditModal,
  XRayParanasalSinusesModal,
  XRayPubicSymphysisModal,
  XRaySearchPanel,
  XRayShoulderAcromioclavicularModal,
  XRayShoulderJointSpaceModal,
  XRayShoulderJointSurfaceModal,
  XRayShoulderOsteophytesModal,
  XRaySpineCurvatureModal,
  XRaySpineDiscsModal,
  XRaySpineEndplatesModal,
  XRaySpineInstabilityModal,
  XRaySpineOsteophytesModal,
  XRaySpineRangeModal,
  XRayStudyDescriptionModal,
  XRayStudyFormModal,
  XRayStudyTemplatesModal,
  XRayWristGapSurfaceModal,
  XRayWristOsteophytesModal,
} from '.'
import type { UltrasoundProtocolEntry } from '../../../types/ultrasound'
import { UltrasoundProtocolModal } from './UltrasoundProtocolModal'

import {
  XRAY_ANKLE_CONGRUENCY_OPTIONS,
  XRAY_ANKLE_INTEGRITY_OPTIONS,
  XRAY_ANKLE_PARAARTICULAR_OPTIONS,
  XRAY_FOOT_INTEGRITY_OPTIONS,
  XRAY_FOOT_PARAARTICULAR_OPTIONS,
  XRAY_HAND_INTEGRITY_OPTIONS,
  XRAY_HAND_PARAARTICULAR_OPTIONS,
  XRAY_HIP_CONGRUENCY_OPTIONS,
  XRAY_HIP_ENDOPROSTHESIS_OPTIONS,
  XRAY_HIP_INTEGRITY_OPTIONS,
  XRAY_HIP_PARAARTICULAR_OPTIONS,
  XRAY_KNEE_BUMPS_OPTIONS,
  XRAY_KNEE_CONGRUENCY_OPTIONS,
  XRAY_KNEE_ENDOPROSTHESIS_OPTIONS,
  XRAY_KNEE_INTEGRITY_OPTIONS,
  XRAY_KNEE_PARAARTICULAR_OPTIONS,
  XRAY_SHOULDER_CONGRUENCY_OPTIONS,
  XRAY_SHOULDER_INTEGRITY_OPTIONS,
  XRAY_SHOULDER_PARAARTICULAR_OPTIONS,
  XRAY_NASAL_PASSAGES_OPTIONS,
  XRAY_NASAL_SEPTUM_OPTIONS,
  XRAY_SPINE_INTEGRITY_OPTIONS,
  XRAY_SPINE_KYPHOSIS_OPTIONS,
  XRAY_SPINE_LORDOSIS_OPTIONS,
  XRAY_SPINE_PARAARTICULAR_OPTIONS,
  XRAY_WRIST_CONGRUENCY_OPTIONS,
  XRAY_WRIST_INTEGRITY_OPTIONS,
  XRAY_WRIST_PARAARTICULAR_OPTIONS,
} from '../config'

export function XRayHome(props: XRaySectionProps) {
  const state = useXRayHomeState(props)
  const [ultrasoundProtocolId, setUltrasoundProtocolId] = useState<number | null>(null)
  const [ultrasoundProtocolEntry, setUltrasoundProtocolEntry] = useState<UltrasoundProtocolEntry | null>(null)
  const [ultrasoundProtocolLoading, setUltrasoundProtocolLoading] = useState(false)
  const [ultrasoundProtocolError, setUltrasoundProtocolError] = useState('')

  useEffect(() => {
    if (ultrasoundProtocolId === null) {
      setUltrasoundProtocolEntry(null)
      setUltrasoundProtocolError('')
      setUltrasoundProtocolLoading(false)
      return
    }

    if (!window.electronAPI?.ultrasoundJournal?.getProtocol) {
      setUltrasoundProtocolEntry(null)
      setUltrasoundProtocolError('РџСЂРѕСЃРјРѕС‚СЂ РЈР—Р-РїСЂРѕС‚РѕРєРѕР»Р° РЅРµРґРѕСЃС‚СѓРїРµРЅ.')
      setUltrasoundProtocolLoading(false)
      return
    }

    let isCancelled = false

    async function loadUltrasoundProtocol() {
      setUltrasoundProtocolLoading(true)
      setUltrasoundProtocolError('')

      try {
        const result = await window.electronAPI.ultrasoundJournal.getProtocol(ultrasoundProtocolId)

        if (!isCancelled) {
          if (result) {
            setUltrasoundProtocolEntry(result)
          } else {
            setUltrasoundProtocolEntry(null)
            setUltrasoundProtocolError('РќРµ СѓРґР°Р»РѕСЃСЊ РѕС‚РєСЂС‹С‚СЊ РЈР—Р-РїСЂРѕС‚РѕРєРѕР».')
          }
        }
      } catch {
        if (!isCancelled) {
          setUltrasoundProtocolEntry(null)
          setUltrasoundProtocolError('РќРµ СѓРґР°Р»РѕСЃСЊ РѕС‚РєСЂС‹С‚СЊ РЈР—Р-РїСЂРѕС‚РѕРєРѕР».')
        }
      } finally {
        if (!isCancelled) {
          setUltrasoundProtocolLoading(false)
        }
      }
    }

    void loadUltrasoundProtocol()

    return () => {
      isCancelled = true
    }
  }, [ultrasoundProtocolId])

  return (
    <div className="xray-home">
      {!props.selectedPatient ? (
        <XRaySearchPanel
          query={props.query}
          error={props.error}
          loading={props.loading}
          results={props.results}
          showAddSuggestion={state.showAddSuggestion}
          onQueryChange={props.onQueryChange}
          onSearch={props.onSearch}
          onSelectPatient={props.onSelectPatient}
          onShowAddForm={state.handleShowAddForm}
        />
      ) : null}

      {state.isAddFormVisible && !props.selectedPatient ? (
        <XRayAddPatientCard
          lastName={state.lastName}
          firstName={state.firstName}
          patronymic={state.patronymic}
          birthDate={state.birthDate}
          address={state.address}
          formError={state.formError}
          isSaving={props.isSaving}
          onLastNameChange={state.handleLastNameChange}
          onFirstNameChange={state.handleFirstNameChange}
          onPatronymicChange={state.handlePatronymicChange}
          onBirthDateChange={state.handleBirthDateChange}
          onAddressChange={state.handleAddressChange}
          onSubmit={state.handleSubmitPatient}
          onCancel={state.handleCancelAddForm}
        />
      ) : null}

      {props.selectedPatient ? (
        <XRayPatientCard
          selectedPatient={props.selectedPatient}
          studies={props.studies}
          flStudies={props.flStudies}
          ultrasoundStudies={props.ultrasoundStudies}
          studiesLoading={props.studiesLoading}
          flStudiesLoading={props.flStudiesLoading}
          ultrasoundStudiesLoading={props.ultrasoundStudiesLoading}
          error={props.error}
          copyFeedback={state.copyFeedback}
          onCopyPatientKey={state.handleCopyPatientKey}
          onOpenLink={props.onOpenLink}
          onOpenPatientEdit={state.handleOpenPatientEdit}
          onOpenCreateStudy={state.openCreateStudyModal}
          onOpenStudyTemplates={state.openStudyTemplatesModal}
          onOpenEditStudy={state.openEditStudyModal}
          onOpenUltrasoundProtocol={setUltrasoundProtocolId}
        />
      ) : null}

      <UltrasoundProtocolModal
        protocol={ultrasoundProtocolEntry}
        loading={ultrasoundProtocolLoading}
        error={ultrasoundProtocolError}
        onClose={() => setUltrasoundProtocolId(null)}
        kicker={'УЗИ протокол'}
      />

      {props.selectedPatient && state.isDeleteConfirmOpen ? (
        <XRayConfirmModal
          kicker="РЈРґР°Р»РµРЅРёРµ РїР°С†РёРµРЅС‚Р°"
          title="РЈРґР°Р»РёС‚СЊ РєР°СЂС‚РѕС‡РєСѓ РїР°С†РёРµРЅС‚Р°?"
          description={
            <>
              РџР°С†РёРµРЅС‚ <strong>{getPatientFullName(props.selectedPatient)}</strong> Р±СѓРґРµС‚ СѓРґР°Р»С‘РЅ РёР·
              Р¶СѓСЂРЅР°Р»Р° X-ray Р±РµР· РІРѕР·РјРѕР¶РЅРѕСЃС‚Рё РІРѕСЃСЃС‚Р°РЅРѕРІР»РµРЅРёСЏ.
            </>
          }
          confirmLabel="РЈРґР°Р»РёС‚СЊ"
          confirmBusyLabel="РЈРґР°Р»СЏСЋ..."
          isBusy={props.isDeleting}
          dialogLabelId="xray-delete-title"
          closeAriaLabel="Р—Р°РєСЂС‹С‚СЊ РѕРєРЅРѕ РїРѕРґС‚РІРµСЂР¶РґРµРЅРёСЏ"
          onClose={() => state.setIsDeleteConfirmOpen(false)}
          onConfirm={state.handleDeleteCurrentPatient}
        />
      ) : null}

      {props.selectedPatient && state.isPatientEditOpen && state.patientEditForm ? (
        <XRayPatientEditModal
          patientEditForm={state.patientEditForm}
          patientEditError={state.patientEditError}
          isSaving={props.isSaving}
          onFormChange={state.handlePatientEditFormChange}
          onClose={() => state.setIsPatientEditOpen(false)}
          onSubmit={state.handleSubmitPatientEdit}
          onDelete={() => {
            state.setIsPatientEditOpen(false)
            state.setIsDeleteConfirmOpen(true)
          }}
        />
      ) : null}

      {props.selectedPatient && state.isStudyModalOpen ? (
        <XRayStudyFormModal
          editingStudy={Boolean(state.editingStudy)}
          studyForm={state.studyForm}
          studyFormError={state.studyFormError}
          isSavingStudy={props.isSavingStudy}
          openStudySelect={state.openStudySelect}
          referredByHistory={state.referredByHistory}
          isReferredByOpen={state.isReferredByOpen}
          onClose={() => state.setIsStudyModalOpen(false)}
          onSubmit={state.handleSubmitStudy}
          onStudyFormChange={(updater) => state.setStudyForm((currentForm) => updater(currentForm))}
          onToggleSelect={state.setOpenStudySelect}
          onReferredByOpenChange={state.setIsReferredByOpen}
          onDelete={() => {
            if (state.editingStudy) {
              state.setDeleteStudyCandidate(state.editingStudy)
            }
          }}
        />
      ) : null}

      {state.descriptionStudy ? (
        <XRayStudyDescriptionModal
          descriptionDraft={state.descriptionDraft}
          diagnosisDraft={state.diagnosisDraft}
          isDescriptionEditing={state.isDescriptionEditing}
          isSavingStudy={props.isSavingStudy}
          descriptionInputRef={state.descriptionInputRef}
          sideTools={
            state.isKneeStudyContext
              ? [
                  {
                    label: 'Эндопротезирование',
                    isActive: state.isEndoprosthesisModalOpen,
                    onClick: () => state.setIsEndoprosthesisModalOpen(true),
                  },
                  {
                    label: 'Суставные щели',
                    isActive: state.isJointSpaceModalOpen,
                    onClick: () => state.setIsJointSpaceModalOpen(true),
                  },
                  {
                    label: 'Суставные поверхности',
                    isActive: state.isJointSurfaceModalOpen,
                    onClick: () => state.setIsJointSurfaceModalOpen(true),
                  },
                  {
                    label: 'Остеофиты',
                    isActive: state.isOsteophytesModalOpen,
                    onClick: () => state.setIsOsteophytesModalOpen(true),
                  },
                  {
                    label: 'Бугорки',
                    isActive: state.isBumpsModalOpen,
                    onClick: () => state.setIsBumpsModalOpen(true),
                  },
                  {
                    label: 'Конгруэнтность',
                    isActive: state.isCongruencyModalOpen,
                    onClick: () => state.setIsCongruencyModalOpen(true),
                  },
                  {
                    label: 'Целостность',
                    isActive: state.isIntegrityModalOpen,
                    onClick: () => state.setIsIntegrityModalOpen(true),
                  },
                  {
                    label: 'Параартикулярные ткани',
                    isActive: state.isParaarticularModalOpen,
                    onClick: () => state.setIsParaarticularModalOpen(true),
                  },
                  {
                    label: 'Норма',
                    onClick: state.handleInsertKneeNormal,
                  },
                ]
              : state.isHipStudyContext
                ? [
                    {
                      label: 'Эндопротез',
                      isActive: state.isHipEndoprosthesisModalOpen,
                      onClick: () => state.setIsHipEndoprosthesisModalOpen(true),
                    },
                    {
                      label: 'Суставные щели',
                      isActive: state.isHipJointSpaceModalOpen,
                      onClick: () => state.setIsHipJointSpaceModalOpen(true),
                    },
                    {
                      label: 'Суставные поверхности',
                      isActive: state.isHipJointSurfaceModalOpen,
                      onClick: () => state.setIsHipJointSurfaceModalOpen(true),
                    },
                    {
                      label: 'Остеофиты',
                      isActive: state.isHipOsteophytesModalOpen,
                      onClick: () => state.setIsHipOsteophytesModalOpen(true),
                    },
                    {
                      label: 'Лонное сочленение',
                      isActive: state.isPubicSymphysisModalOpen,
                      onClick: () => state.setIsPubicSymphysisModalOpen(true),
                    },
                    {
                      label: 'Флеболиты',
                      onClick: state.handleInsertHipPhlebolites,
                    },
                    {
                      label: 'Конгруэнтность',
                      isActive: state.isHipCongruencyModalOpen,
                      onClick: () => state.setIsHipCongruencyModalOpen(true),
                    },
                    {
                      label: 'Целостность',
                      isActive: state.isHipIntegrityModalOpen,
                      onClick: () => state.setIsHipIntegrityModalOpen(true),
                    },
                    {
                      label: 'Параартикулярные ткани',
                      isActive: state.isHipParaarticularModalOpen,
                      onClick: () => state.setIsHipParaarticularModalOpen(true),
                    },
                    {
                      label: 'Норма',
                      onClick: state.handleInsertHipNormal,
                    },
                  ]
                : state.isAnkleStudyContext
                  ? [
                      {
                        label: 'Суставные щели',
                        isActive: state.isAnkleJointSpaceModalOpen,
                        onClick: () => state.setIsAnkleJointSpaceModalOpen(true),
                      },
                      {
                        label: 'Суставные поверхности',
                        isActive: state.isAnkleJointSurfaceModalOpen,
                        onClick: () => state.setIsAnkleJointSurfaceModalOpen(true),
                      },
                      {
                        label: 'Остеофиты',
                        isActive: state.isAnkleOsteophytesModalOpen,
                        onClick: () => state.setIsAnkleOsteophytesModalOpen(true),
                      },
                      {
                        label: 'Конгруэнтность',
                        isActive: state.isAnkleCongruencyModalOpen,
                        onClick: () => state.setIsAnkleCongruencyModalOpen(true),
                      },
                      {
                        label: 'Целостность',
                        isActive: state.isAnkleIntegrityModalOpen,
                        onClick: () => state.setIsAnkleIntegrityModalOpen(true),
                      },
                      {
                        label: 'Параартикулярные ткани',
                        isActive: state.isAnkleParaarticularModalOpen,
                        onClick: () => state.setIsAnkleParaarticularModalOpen(true),
                      },
                      {
                        label: 'Норма',
                        onClick: state.handleInsertAnkleNormal,
                      },
                    ]
                : state.isShoulderStudyContext
                    ? [
                        {
                          label: 'Суставные щели',
                          isActive: state.isShoulderJointSpaceModalOpen,
                          onClick: () => state.setIsShoulderJointSpaceModalOpen(true),
                        },
                        {
                          label: 'Суставные поверхности',
                          isActive: state.isShoulderJointSurfaceModalOpen,
                          onClick: () => state.setIsShoulderJointSurfaceModalOpen(true),
                        },
                        {
                          label: 'Остеофиты',
                          isActive: state.isShoulderOsteophytesModalOpen,
                          onClick: () => state.setIsShoulderOsteophytesModalOpen(true),
                        },
                        {
                          label: 'Ключично-акромиальные сочленения',
                          isActive: state.isShoulderAcromioclavicularModalOpen,
                          onClick: () => state.setIsShoulderAcromioclavicularModalOpen(true),
                        },
                        {
                          label: 'Конгруэнтность',
                          isActive: state.isShoulderCongruencyModalOpen,
                          onClick: () => state.setIsShoulderCongruencyModalOpen(true),
                        },
                        {
                          label: 'Целостность',
                          isActive: state.isShoulderIntegrityModalOpen,
                          onClick: () => state.setIsShoulderIntegrityModalOpen(true),
                        },
                        {
                          label: 'Параартикулярные ткани',
                          isActive: state.isShoulderParaarticularModalOpen,
                          onClick: () => state.setIsShoulderParaarticularModalOpen(true),
                        },
                        {
                          label: 'Норма',
                          onClick: state.handleInsertShoulderNormal,
                        },
                      ]
                : state.isWristStudyContext
                    ? [
                        {
                          label: 'Суставные щели',
                          isActive: state.isWristJointSpaceModalOpen,
                          onClick: () => state.setIsWristJointSpaceModalOpen(true),
                        },
                        {
                          label: 'Суставные поверхности',
                          isActive: state.isWristJointSurfaceModalOpen,
                          onClick: () => state.setIsWristJointSurfaceModalOpen(true),
                        },
                        {
                          label: 'Остеофиты',
                          isActive: state.isWristOsteophytesModalOpen,
                          onClick: () => state.setIsWristOsteophytesModalOpen(true),
                        },
                        {
                          label: 'Конгруэнтность',
                          isActive: state.isWristCongruencyModalOpen,
                          onClick: () => state.setIsWristCongruencyModalOpen(true),
                        },
                        {
                          label: 'Целостность',
                          isActive: state.isWristIntegrityModalOpen,
                          onClick: () => state.setIsWristIntegrityModalOpen(true),
                        },
                        {
                          label: 'Параартикулярные ткани',
                          isActive: state.isWristParaarticularModalOpen,
                          onClick: () => state.setIsWristParaarticularModalOpen(true),
                        },
                        {
                          label: 'Норма',
                          onClick: state.handleInsertWristNormal,
                        },
                      ]
                : state.isHandStudyContext
                    ? [
                        {
                          label: 'Суставные щели',
                          isActive: state.isHandJointSpaceModalOpen,
                          onClick: () => state.setIsHandJointSpaceModalOpen(true),
                        },
                        {
                          label: 'Суставные поверхности',
                          isActive: state.isHandJointSurfaceModalOpen,
                          onClick: () => state.setIsHandJointSurfaceModalOpen(true),
                        },
                        {
                          label: 'Остеофиты',
                          isActive: state.isHandOsteophytesModalOpen,
                          onClick: () => state.setIsHandOsteophytesModalOpen(true),
                        },
                        {
                          label: 'Конгруэнтность',
                          isActive: state.isHandCongruencyModalOpen,
                          onClick: () => state.setIsHandCongruencyModalOpen(true),
                        },
                        {
                          label: 'Целостность',
                          isActive: state.isHandIntegrityModalOpen,
                          onClick: () => state.setIsHandIntegrityModalOpen(true),
                        },
                        {
                          label: 'Параартикулярные ткани',
                          isActive: state.isHandParaarticularModalOpen,
                          onClick: () => state.setIsHandParaarticularModalOpen(true),
                        },
                        {
                          label: 'Норма',
                          onClick: state.handleInsertHandNormal,
                        },
                      ]
                : state.isCalcaneusStudyContext
                    ? [
                        {
                          label: 'Остеофиты',
                          isActive: state.isCalcaneusOsteophytesModalOpen,
                          onClick: () => state.setIsCalcaneusOsteophytesModalOpen(true),
                        },
                        {
                          label: 'Норма',
                          onClick: state.handleInsertCalcaneusNormal,
                        },
                      ]
                : state.isParanasalStudyContext
                    ? [
                        {
                          label: 'Пазухи',
                          isActive: state.isParanasalSinusesModalOpen,
                          onClick: () => state.setIsParanasalSinusesModalOpen(true),
                        },
                        {
                          label: 'Носовые ходы',
                          isActive: state.isNasalPassagesModalOpen,
                          onClick: () => state.setIsNasalPassagesModalOpen(true),
                        },
                        {
                          label: 'Носовая перегородка',
                          isActive: state.isNasalSeptumModalOpen,
                          onClick: () => state.setIsNasalSeptumModalOpen(true),
                        },
                        {
                          label: 'Норма',
                          onClick: state.handleInsertParanasalNormal,
                        },
                      ]
                : state.isSpineStudyContext
                    ? [
                        {
                          label: 'Позвоночный столб',
                          isActive: state.isSpineRangeModalOpen,
                          onClick: () => state.setIsSpineRangeModalOpen(true),
                        },
                        ...(state.isLumbarSpineStudyContext || state.isThoracicSpineStudyContext
                          ? [
                              {
                                label: 'Искривление позвоночника',
                                isActive: state.isSpineCurvatureModalOpen,
                                onClick: () => state.setIsSpineCurvatureModalOpen(true),
                              },
                            ]
                          : []),
                        ...(state.isLumbarSpineStudyContext
                          ? [
                              {
                                label: 'Лордоз',
                                isActive: state.isSpineLordosisModalOpen,
                                onClick: () => state.setIsSpineLordosisModalOpen(true),
                              },
                            ]
                          : []),
                        ...(state.isThoracicSpineStudyContext
                          ? [
                              {
                                label: 'Кифоз',
                                isActive: state.isSpineKyphosisModalOpen,
                                onClick: () => state.setIsSpineKyphosisModalOpen(true),
                              },
                            ]
                          : []),
                        {
                          label: 'Межпозвонковые диски',
                          isActive: state.isSpineDiscsModalOpen,
                          onClick: () => state.setIsSpineDiscsModalOpen(true),
                        },
                        {
                          label: 'Замыкательные пластинки',
                          isActive: state.isSpineEndplatesModalOpen,
                          onClick: () => state.setIsSpineEndplatesModalOpen(true),
                        },
                        {
                          label: 'Остеофиты',
                          isActive: state.isSpineOsteophytesModalOpen,
                          onClick: () => state.setIsSpineOsteophytesModalOpen(true),
                        },
                        {
                          label: 'Нестабильность',
                          isActive: state.isSpineInstabilityModalOpen,
                          onClick: () => state.setIsSpineInstabilityModalOpen(true),
                        },
                        {
                          label: 'Целостность',
                          isActive: state.isSpineIntegrityModalOpen,
                          onClick: () => state.setIsSpineIntegrityModalOpen(true),
                        },
                        {
                          label: 'Параартикулярные ткани',
                          isActive: state.isSpineParaarticularModalOpen,
                          onClick: () => state.setIsSpineParaarticularModalOpen(true),
                        },
                        {
                          label: 'Норма',
                          onClick: state.handleInsertSpineNormal,
                        },
                      ]
                : state.isFlatfootStudyContext
                    ? [
                        {
                          label: 'Плоскостопие',
                          isActive: state.isFlatfootModalOpen,
                          onClick: () => state.setIsFlatfootModalOpen(true),
                        },
                        {
                          label: 'Норма',
                          onClick: state.handleInsertFlatfootNormal,
                        },
                      ]
                : state.isFootStudyContext
                    ? [
                        {
                          label: 'Суставные щели',
                          isActive: state.isFootJointSpaceModalOpen,
                          onClick: () => state.setIsFootJointSpaceModalOpen(true),
                        },
                        {
                          label: 'Суставные поверхности',
                          isActive: state.isFootJointSurfaceModalOpen,
                          onClick: () => state.setIsFootJointSurfaceModalOpen(true),
                        },
                        {
                          label: 'Остеофиты',
                          isActive: state.isFootOsteophytesModalOpen,
                          onClick: () => state.setIsFootOsteophytesModalOpen(true),
                        },
                        {
                          label: 'Конгруэнтность',
                          isActive: state.isFootCongruencyModalOpen,
                          onClick: () => state.setIsFootCongruencyModalOpen(true),
                        },
                        {
                          label: 'Целостность',
                          isActive: state.isFootIntegrityModalOpen,
                          onClick: () => state.setIsFootIntegrityModalOpen(true),
                        },
                        {
                          label: 'Параартикулярные ткани',
                          isActive: state.isFootParaarticularModalOpen,
                          onClick: () => state.setIsFootParaarticularModalOpen(true),
                        },
                        {
                          label: 'Норма',
                          onClick: state.handleInsertFootNormal,
                        },
                      ]
              : []
          }
          onDescriptionChange={state.handleDescriptionDraftChange}
          onDiagnosisChange={state.setDiagnosisDraft}
          onClose={() => state.setDescriptionStudy(null)}
          onStartEdit={() => state.setIsDescriptionEditing(true)}
          onSave={() => void state.handleSaveStudyDescription()}
          onDelete={() => void state.handleDeleteStudyDescription()}
        />
      ) : null}

      {state.isKneeStudyContext ? (
        <>
          <XRayJointSpaceModal
            isOpen={state.isJointSpaceModalOpen}
            values={state.jointSpaceState}
            onClose={() => state.setIsJointSpaceModalOpen(false)}
            onDegreeChange={state.handleJointSpaceDegreeChange}
            onTogglePredominantly={state.handleJointSpacePredominantlyToggle}
            onAdd={state.handleAddJointSpaceDescription}
          />

          <XRayJointSurfaceModal
            isOpen={state.isJointSurfaceModalOpen}
            values={state.jointSurfaceState}
            onClose={() => state.setIsJointSurfaceModalOpen(false)}
            onDegreeChange={state.handleJointSurfaceDegreeChange}
            onTogglePredominantly={state.handleJointSurfacePredominantlyToggle}
            onAdd={state.handleAddJointSurfaceDescription}
          />

          <XRayKneeOsteophytesModal
            isOpen={state.isOsteophytesModalOpen}
            values={state.osteophytesState}
            onClose={() => state.setIsOsteophytesModalOpen(false)}
            onToggle={state.handleOsteophyteToggle}
            onAdd={state.handleAddOsteophytesDescription}
          />

          <XRayKneeChoiceModal
            isOpen={state.isEndoprosthesisModalOpen}
            title={'\u042d\u043d\u0434\u043e\u043f\u0440\u043e\u0442\u0435\u0437\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u0435'}
            options={XRAY_KNEE_ENDOPROSTHESIS_OPTIONS}
            onClose={() => state.setIsEndoprosthesisModalOpen(false)}
            onSelect={state.handleEndoprosthesisSelect}
          />

          <XRayKneeChoiceModal
            isOpen={state.isBumpsModalOpen}
            title={'\u0411\u0443\u0433\u043e\u0440\u043a\u0438'}
            options={XRAY_KNEE_BUMPS_OPTIONS}
            onClose={() => state.setIsBumpsModalOpen(false)}
            onSelect={state.handleBumpsSelect}
          />

          <XRayKneeChoiceModal
            isOpen={state.isCongruencyModalOpen}
            title={'\u041a\u043e\u043d\u0433\u0440\u0443\u044d\u043d\u0442\u043d\u043e\u0441\u0442\u044c'}
            options={XRAY_KNEE_CONGRUENCY_OPTIONS}
            onClose={() => state.setIsCongruencyModalOpen(false)}
            onSelect={state.handleCongruencySelect}
          />

          <XRayKneeChoiceModal
            isOpen={state.isIntegrityModalOpen}
            title={'\u0426\u0435\u043b\u043e\u0441\u0442\u043d\u043e\u0441\u0442\u044c'}
            options={XRAY_KNEE_INTEGRITY_OPTIONS}
            onClose={() => state.setIsIntegrityModalOpen(false)}
            onSelect={state.handleIntegritySelect}
          />

          <XRayKneeChoiceModal
            isOpen={state.isParaarticularModalOpen}
            title={'\u041f\u0430\u0440\u0430\u0430\u0440\u0442\u0438\u043a\u0443\u043b\u044f\u0440\u043d\u044b\u0435 \u0442\u043a\u0430\u043d\u0438'}
            options={XRAY_KNEE_PARAARTICULAR_OPTIONS}
            onClose={() => state.setIsParaarticularModalOpen(false)}
            onSelect={state.handleParaarticularSelect}
          />
        </>
      ) : null}

      {state.isHipStudyContext ? (
        <>
          <XRayHipJointSpaceModal
            isOpen={state.isHipJointSpaceModalOpen}
            values={state.hipJointSpaceState}
            onClose={() => state.setIsHipJointSpaceModalOpen(false)}
            onDegreeChange={state.handleHipJointSpaceDegreeChange}
            onUniformityChange={state.handleHipJointSpaceUniformityChange}
            onAdd={state.handleAddHipJointSpaceDescription}
          />

          <XRayHipJointSurfaceModal
            isOpen={state.isHipJointSurfaceModalOpen}
            values={state.hipJointSurfaceState}
            onClose={() => state.setIsHipJointSurfaceModalOpen(false)}
            onChange={state.handleHipJointSurfaceChange}
            onAdd={state.handleAddHipJointSurfaceDescription}
          />

          <XRayHipOsteophytesModal
            isOpen={state.isHipOsteophytesModalOpen}
            values={state.hipOsteophytesState}
            onClose={() => state.setIsHipOsteophytesModalOpen(false)}
            onToggle={state.handleHipOsteophyteToggle}
            onAdd={state.handleAddHipOsteophytesDescription}
          />

          <XRayPubicSymphysisModal
            isOpen={state.isPubicSymphysisModalOpen}
            values={state.pubicSymphysisState}
            onClose={() => state.setIsPubicSymphysisModalOpen(false)}
            onNormalToggle={state.handleHipPubicNormalToggle}
            onSymmetryChange={state.handleHipPubicSymmetryChange}
            onOsteophyteToggle={state.handleHipPubicOsteophyteToggle}
            onSurfaceChange={state.handleHipPubicSurfaceChange}
            onAdd={state.handleAddPubicSymphysisDescription}
          />

          <XRayKneeChoiceModal
            isOpen={state.isHipEndoprosthesisModalOpen}
            title={'\u042d\u043d\u0434\u043e\u043f\u0440\u043e\u0442\u0435\u0437'}
            options={XRAY_HIP_ENDOPROSTHESIS_OPTIONS}
            onClose={() => state.setIsHipEndoprosthesisModalOpen(false)}
            onSelect={state.handleHipEndoprosthesisSelect}
          />

          <XRayKneeChoiceModal
            isOpen={state.isHipCongruencyModalOpen}
            title={'\u041a\u043e\u043d\u0433\u0440\u0443\u044d\u043d\u0442\u043d\u043e\u0441\u0442\u044c'}
            options={XRAY_HIP_CONGRUENCY_OPTIONS}
            onClose={() => state.setIsHipCongruencyModalOpen(false)}
            onSelect={state.handleHipCongruencySelect}
          />

          <XRayKneeChoiceModal
            isOpen={state.isHipIntegrityModalOpen}
            title={'\u0426\u0435\u043b\u043e\u0441\u0442\u043d\u043e\u0441\u0442\u044c'}
            options={XRAY_HIP_INTEGRITY_OPTIONS}
            onClose={() => state.setIsHipIntegrityModalOpen(false)}
            onSelect={state.handleHipIntegritySelect}
          />

          <XRayKneeChoiceModal
            isOpen={state.isHipParaarticularModalOpen}
            title={'\u041f\u0430\u0440\u0430\u0430\u0440\u0442\u0438\u043a\u0443\u043b\u044f\u0440\u043d\u044b\u0435 \u0442\u043a\u0430\u043d\u0438'}
            options={XRAY_HIP_PARAARTICULAR_OPTIONS}
            onClose={() => state.setIsHipParaarticularModalOpen(false)}
            onSelect={state.handleHipParaarticularSelect}
          />
        </>
      ) : null}

      {state.isAnkleStudyContext ? (
        <>
          <XRayAnkleJointSpaceModal
            isOpen={state.isAnkleJointSpaceModalOpen}
            values={state.ankleJointSpaceState}
            onClose={() => state.setIsAnkleJointSpaceModalOpen(false)}
            onDegreeChange={(side, value) =>
              state.handleAnkleGapSurfaceDegreeChange('jointSpace', side, value)
            }
            onPositionChange={(side, value) =>
              state.handleAnkleGapSurfacePositionChange('jointSpace', side, value)
            }
            onAdd={state.handleAddAnkleJointSpaceDescription}
          />

          <XRayAnkleJointSurfaceModal
            isOpen={state.isAnkleJointSurfaceModalOpen}
            values={state.ankleJointSurfaceState}
            onClose={() => state.setIsAnkleJointSurfaceModalOpen(false)}
            onDegreeChange={(side, value) =>
              state.handleAnkleGapSurfaceDegreeChange('jointSurface', side, value)
            }
            onPositionChange={(side, value) =>
              state.handleAnkleGapSurfacePositionChange('jointSurface', side, value)
            }
            onAdd={state.handleAddAnkleJointSurfaceDescription}
          />

          <XRayAnkleOsteophytesModal
            isOpen={state.isAnkleOsteophytesModalOpen}
            values={state.ankleOsteophytesState}
            onClose={() => state.setIsAnkleOsteophytesModalOpen(false)}
            onToggle={state.handleAnkleOsteophyteToggle}
            onAdd={state.handleAddAnkleOsteophytesDescription}
          />

          <XRayKneeChoiceModal
            isOpen={state.isAnkleCongruencyModalOpen}
            title={'\u041a\u043e\u043d\u0433\u0440\u0443\u044d\u043d\u0442\u043d\u043e\u0441\u0442\u044c'}
            options={XRAY_ANKLE_CONGRUENCY_OPTIONS}
            onClose={() => state.setIsAnkleCongruencyModalOpen(false)}
            onSelect={state.handleAnkleCongruencySelect}
          />

          <XRayKneeChoiceModal
            isOpen={state.isAnkleIntegrityModalOpen}
            title={'\u0426\u0435\u043b\u043e\u0441\u0442\u043d\u043e\u0441\u0442\u044c'}
            options={XRAY_ANKLE_INTEGRITY_OPTIONS}
            onClose={() => state.setIsAnkleIntegrityModalOpen(false)}
            onSelect={state.handleAnkleIntegritySelect}
          />

          <XRayKneeChoiceModal
            isOpen={state.isAnkleParaarticularModalOpen}
            title={'\u041f\u0430\u0440\u0430\u0430\u0440\u0442\u0438\u043a\u0443\u043b\u044f\u0440\u043d\u044b\u0435 \u0442\u043a\u0430\u043d\u0438'}
            options={XRAY_ANKLE_PARAARTICULAR_OPTIONS}
            onClose={() => state.setIsAnkleParaarticularModalOpen(false)}
            onSelect={state.handleAnkleParaarticularSelect}
          />
        </>
      ) : null}

      {state.isShoulderStudyContext ? (
        <>
          <XRayShoulderJointSpaceModal
            isOpen={state.isShoulderJointSpaceModalOpen}
            values={state.shoulderJointSpaceState}
            onClose={() => state.setIsShoulderJointSpaceModalOpen(false)}
            onDegreeChange={state.handleShoulderJointSpaceDegreeChange}
            onUniformityChange={state.handleShoulderJointSpaceUniformityChange}
            onAdd={state.handleAddShoulderJointSpaceDescription}
          />

          <XRayShoulderJointSurfaceModal
            isOpen={state.isShoulderJointSurfaceModalOpen}
            values={state.shoulderJointSurfaceState}
            onClose={() => state.setIsShoulderJointSurfaceModalOpen(false)}
            onChange={state.handleShoulderJointSurfaceChange}
            onAdd={state.handleAddShoulderJointSurfaceDescription}
          />

          <XRayShoulderOsteophytesModal
            isOpen={state.isShoulderOsteophytesModalOpen}
            values={state.shoulderOsteophytesState}
            onClose={() => state.setIsShoulderOsteophytesModalOpen(false)}
            onToggle={state.handleShoulderOsteophyteToggle}
            onAdd={state.handleAddShoulderOsteophytesDescription}
          />

          <XRayShoulderAcromioclavicularModal
            isOpen={state.isShoulderAcromioclavicularModalOpen}
            values={state.shoulderAcromioclavicularState}
            onClose={() => state.setIsShoulderAcromioclavicularModalOpen(false)}
            onNormalToggle={state.handleShoulderAcromioclavicularNormalToggle}
            onJointSpaceChange={state.handleShoulderAcromioclavicularJointSpaceChange}
            onJointSurfaceChange={state.handleShoulderAcromioclavicularJointSurfaceChange}
            onOsteophytesToggle={state.handleShoulderAcromioclavicularOsteophytesToggle}
            onAdd={state.handleAddShoulderAcromioclavicularDescription}
          />

          <XRayKneeChoiceModal
            isOpen={state.isShoulderCongruencyModalOpen}
            title={'\u041a\u043e\u043d\u0433\u0440\u0443\u044d\u043d\u0442\u043d\u043e\u0441\u0442\u044c'}
            options={XRAY_SHOULDER_CONGRUENCY_OPTIONS}
            onClose={() => state.setIsShoulderCongruencyModalOpen(false)}
            onSelect={state.handleShoulderCongruencySelect}
          />

          <XRayKneeChoiceModal
            isOpen={state.isShoulderIntegrityModalOpen}
            title={'\u0426\u0435\u043b\u043e\u0441\u0442\u043d\u043e\u0441\u0442\u044c'}
            options={XRAY_SHOULDER_INTEGRITY_OPTIONS}
            onClose={() => state.setIsShoulderIntegrityModalOpen(false)}
            onSelect={state.handleShoulderIntegritySelect}
          />

          <XRayKneeChoiceModal
            isOpen={state.isShoulderParaarticularModalOpen}
            title={'\u041f\u0430\u0440\u0430\u0430\u0440\u0442\u0438\u043a\u0443\u043b\u044f\u0440\u043d\u044b\u0435 \u0442\u043a\u0430\u043d\u0438'}
            options={XRAY_SHOULDER_PARAARTICULAR_OPTIONS}
            onClose={() => state.setIsShoulderParaarticularModalOpen(false)}
            onSelect={state.handleShoulderParaarticularSelect}
          />
        </>
      ) : null}

      {state.isWristStudyContext ? (
        <>
          <XRayWristGapSurfaceModal
            isOpen={state.isWristJointSpaceModalOpen}
            title="РЎСѓСЃС‚Р°РІРЅС‹Рµ С‰РµР»Рё"
            values={state.wristJointSpaceState}
            onClose={() => state.setIsWristJointSpaceModalOpen(false)}
            onSideToggle={(side) => state.handleWristGapSurfaceSideToggle('jointSpace', side)}
            onDegreeSelect={(side, value) =>
              state.handleWristGapSurfaceDegreeSelect('jointSpace', side, value)
            }
            onPositionSelect={(side, value) =>
              state.handleWristGapSurfacePositionSelect('jointSpace', side, value)
            }
            onAdd={state.handleAddWristJointSpaceDescription}
          />

          <XRayWristGapSurfaceModal
            isOpen={state.isWristJointSurfaceModalOpen}
            title="РЎСѓСЃС‚Р°РІРЅС‹Рµ РїРѕРІРµСЂС…РЅРѕСЃС‚Рё"
            values={state.wristJointSurfaceState}
            onClose={() => state.setIsWristJointSurfaceModalOpen(false)}
            onSideToggle={(side) => state.handleWristGapSurfaceSideToggle('jointSurface', side)}
            onDegreeSelect={(side, value) =>
              state.handleWristGapSurfaceDegreeSelect('jointSurface', side, value)
            }
            onPositionSelect={(side, value) =>
              state.handleWristGapSurfacePositionSelect('jointSurface', side, value)
            }
            onAdd={state.handleAddWristJointSurfaceDescription}
          />

          <XRayWristOsteophytesModal
            isOpen={state.isWristOsteophytesModalOpen}
            values={state.wristOsteophytesState}
            onClose={() => state.setIsWristOsteophytesModalOpen(false)}
            onToggle={state.handleWristOsteophyteToggle}
            onAdd={state.handleAddWristOsteophytesDescription}
          />

          <XRayKneeChoiceModal
            isOpen={state.isWristCongruencyModalOpen}
            title={'\u041a\u043e\u043d\u0433\u0440\u0443\u044d\u043d\u0442\u043d\u043e\u0441\u0442\u044c'}
            options={XRAY_WRIST_CONGRUENCY_OPTIONS}
            onClose={() => state.setIsWristCongruencyModalOpen(false)}
            onSelect={state.handleWristCongruencySelect}
          />

          <XRayKneeChoiceModal
            isOpen={state.isWristIntegrityModalOpen}
            title={'\u0426\u0435\u043b\u043e\u0441\u0442\u043d\u043e\u0441\u0442\u044c'}
            options={XRAY_WRIST_INTEGRITY_OPTIONS}
            onClose={() => state.setIsWristIntegrityModalOpen(false)}
            onSelect={state.handleWristIntegritySelect}
          />

          <XRayKneeChoiceModal
            isOpen={state.isWristParaarticularModalOpen}
            title={'\u041f\u0430\u0440\u0430\u0430\u0440\u0442\u0438\u043a\u0443\u043b\u044f\u0440\u043d\u044b\u0435 \u0442\u043a\u0430\u043d\u0438'}
            options={XRAY_WRIST_PARAARTICULAR_OPTIONS}
            onClose={() => state.setIsWristParaarticularModalOpen(false)}
            onSelect={state.handleWristParaarticularSelect}
          />
        </>
      ) : null}

      {state.isCalcaneusStudyContext ? (
        <>
          <XRayCalcaneusOsteophytesModal
            isOpen={state.isCalcaneusOsteophytesModalOpen}
            values={state.calcaneusOsteophytesState}
            onClose={() => state.setIsCalcaneusOsteophytesModalOpen(false)}
            onToggle={state.handleCalcaneusOsteophyteToggle}
            onAdd={state.handleAddCalcaneusOsteophytesDescription}
          />
        </>
      ) : null}

      {state.isParanasalStudyContext ? (
        <>
          <XRayParanasalSinusesModal
            isOpen={state.isParanasalSinusesModalOpen}
            values={state.paranasalSinusesState}
            onClose={() => state.setIsParanasalSinusesModalOpen(false)}
            onChange={state.handleParanasalSinusChange}
            onAdd={state.handleAddParanasalSinusesDescription}
          />

          <XRayKneeChoiceModal
            isOpen={state.isNasalPassagesModalOpen}
            title="РќРѕСЃРѕРІС‹Рµ С…РѕРґС‹"
            options={XRAY_NASAL_PASSAGES_OPTIONS}
            onClose={() => state.setIsNasalPassagesModalOpen(false)}
            onSelect={state.handleNasalPassagesSelect}
          />

          <XRayKneeChoiceModal
            isOpen={state.isNasalSeptumModalOpen}
            title="РќРѕСЃРѕРІР°СЏ РїРµСЂРµРіРѕСЂРѕРґРєР°"
            options={XRAY_NASAL_SEPTUM_OPTIONS}
            onClose={() => state.setIsNasalSeptumModalOpen(false)}
            onSelect={state.handleNasalSeptumSelect}
          />
        </>
      ) : null}

      {state.isSpineStudyContext ? (
        <>
          <XRaySpineRangeModal
            isOpen={state.isSpineRangeModalOpen}
            selected={state.spineRangeSelection}
            onClose={() => state.setIsSpineRangeModalOpen(false)}
            onToggle={state.handleSpineRangeToggle}
            onAdd={state.handleAddSpineRangeDescription}
          />

          <XRaySpineCurvatureModal
            isOpen={state.isSpineCurvatureModalOpen}
            values={state.spineCurvatureState}
            onClose={() => state.setIsSpineCurvatureModalOpen(false)}
            onCurveTypeChange={state.handleSpineCurveTypeChange}
            onDirectionChange={(value) =>
              state.setSpineCurvatureState((current) => ({ ...current, cCurveDirection: value }))
            }
            onCobbAngleChange={(value) =>
              state.setSpineCurvatureState((current) => ({ ...current, cobbAngle: value }))
            }
            onTorsionToggle={() =>
              state.setSpineCurvatureState((current) => ({ ...current, torsion: !current.torsion }))
            }
            onToggleVertebra={state.handleSpineCurvatureToggleVertebra}
            onAdd={state.handleAddSpineCurvatureDescription}
          />

          <XRaySpineDiscsModal
            isOpen={state.isSpineDiscsModalOpen}
            values={state.spineDiscsState}
            onClose={() => state.setIsSpineDiscsModalOpen(false)}
            onSetUnchanged={state.handleSpineDiscsSetUnchanged}
            onSetSeverity={state.handleSpineDiscsSetSeverity}
            onToggleVertebra={state.handleSpineDiscsToggleVertebra}
            onAdd={state.handleAddSpineDiscsDescription}
          />

          <XRaySpineEndplatesModal
            isOpen={state.isSpineEndplatesModalOpen}
            values={state.spineEndplatesState}
            onClose={() => state.setIsSpineEndplatesModalOpen(false)}
            onSetUnchanged={state.handleSpineEndplatesSetUnchanged}
            onSetSeverity={state.handleSpineEndplatesSetSeverity}
            onSetShmorlMode={state.handleSpineEndplatesSetShmorlMode}
            onToggleVertebra={state.handleSpineEndplatesToggleVertebra}
            onToggleShmorl={state.handleSpineEndplatesToggleShmorl}
            onAdd={state.handleAddSpineEndplatesDescription}
          />

          <XRaySpineOsteophytesModal
            isOpen={state.isSpineOsteophytesModalOpen}
            values={state.spineOsteophytesState}
            onClose={() => state.setIsSpineOsteophytesModalOpen(false)}
            onSurfaceChange={state.handleSpineOsteophytesSurfaceChange}
            onToggleVertebra={state.handleSpineOsteophytesToggleVertebra}
            onAdd={state.handleAddSpineOsteophytesDescription}
          />

          <XRaySpineInstabilityModal
            isOpen={state.isSpineInstabilityModalOpen}
            values={state.spineInstabilityState}
            onClose={() => state.setIsSpineInstabilityModalOpen(false)}
            onModeChange={state.handleSpineInstabilityModeChange}
            onDirectionChange={state.handleSpineInstabilityDirectionChange}
            onMagnitudeChange={state.handleSpineInstabilityMagnitudeChange}
            onToggleVertebra={state.handleSpineInstabilityToggleVertebra}
            onAdd={state.handleAddSpineInstabilityDescription}
          />

          <XRayKneeChoiceModal
            isOpen={state.isSpineLordosisModalOpen}
            title="Р›РѕСЂРґРѕР·"
            options={XRAY_SPINE_LORDOSIS_OPTIONS}
            onClose={() => state.setIsSpineLordosisModalOpen(false)}
            onSelect={state.handleSpineLordosisSelect}
          />

          <XRayKneeChoiceModal
            isOpen={state.isSpineKyphosisModalOpen}
            title="РљРёС„РѕР·"
            options={XRAY_SPINE_KYPHOSIS_OPTIONS}
            onClose={() => state.setIsSpineKyphosisModalOpen(false)}
            onSelect={state.handleSpineKyphosisSelect}
          />

          <XRayKneeChoiceModal
            isOpen={state.isSpineIntegrityModalOpen}
            title="Р¦РµР»РѕСЃС‚РЅРѕСЃС‚СЊ"
            options={XRAY_SPINE_INTEGRITY_OPTIONS}
            onClose={() => state.setIsSpineIntegrityModalOpen(false)}
            onSelect={state.handleSpineIntegritySelect}
          />

          <XRayKneeChoiceModal
            isOpen={state.isSpineParaarticularModalOpen}
            title="РџР°СЂР°Р°СЂС‚РёРєСѓР»СЏСЂРЅС‹Рµ С‚РєР°РЅРё"
            options={XRAY_SPINE_PARAARTICULAR_OPTIONS}
            onClose={() => state.setIsSpineParaarticularModalOpen(false)}
            onSelect={state.handleSpineParaarticularSelect}
          />
        </>
      ) : null}

      {state.isFlatfootStudyContext ? (
        <>
          <XRayFlatfootModal
            isOpen={state.isFlatfootModalOpen}
            values={state.flatfootState}
            onClose={() => state.setIsFlatfootModalOpen(false)}
            onChange={state.handleFlatfootValueChange}
            onAdd={state.handleAddFlatfootDescription}
          />
        </>
      ) : null}

      {state.isFootStudyContext ? (
        <>
          <XRayFootJointMapModal
            isOpen={state.isFootJointSpaceModalOpen}
            title="РЎСѓСЃС‚Р°РІРЅС‹Рµ С‰РµР»Рё"
            values={state.footJointSpaceState}
            mode="degrees"
            activeDegree={state.activeFootJointDegree}
            onClose={() => state.setIsFootJointSpaceModalOpen(false)}
            onActiveDegreeChange={state.setActiveFootJointDegree}
            onToggle={(key) => state.handleFootJointToggle('jointSpace', key)}
            onAdd={state.handleAddFootJointSpaceDescription}
          />

          <XRayFootJointMapModal
            isOpen={state.isFootJointSurfaceModalOpen}
            title="РЎСѓСЃС‚Р°РІРЅС‹Рµ РїРѕРІРµСЂС…РЅРѕСЃС‚Рё"
            values={state.footJointSurfaceState}
            mode="degrees"
            activeDegree={state.activeFootJointDegree}
            onClose={() => state.setIsFootJointSurfaceModalOpen(false)}
            onActiveDegreeChange={state.setActiveFootJointDegree}
            onToggle={(key) => state.handleFootJointToggle('jointSurface', key)}
            onAdd={state.handleAddFootJointSurfaceDescription}
          />

          <XRayFootJointMapModal
            isOpen={state.isFootOsteophytesModalOpen}
            title="РћСЃС‚РµРѕС„РёС‚С‹"
            values={state.footOsteophytesState}
            mode="toggle"
            onClose={() => state.setIsFootOsteophytesModalOpen(false)}
            onToggle={(key) => state.handleFootJointToggle('osteophytes', key)}
            onAdd={state.handleAddFootOsteophytesDescription}
          />

          <XRayFootJointMapModal
            isOpen={state.isFootCongruencyModalOpen}
            title="РљРѕРЅРіСЂСѓСЌРЅС‚РЅРѕСЃС‚СЊ"
            values={state.footCongruencyState}
            mode="toggle"
            onClose={() => state.setIsFootCongruencyModalOpen(false)}
            onToggle={(key) => state.handleFootJointToggle('congruency', key)}
            onAdd={state.handleAddFootCongruencyDescription}
          />

          <XRayKneeChoiceModal
            isOpen={state.isFootIntegrityModalOpen}
            title="Р¦РµР»РѕСЃС‚РЅРѕСЃС‚СЊ"
            options={XRAY_FOOT_INTEGRITY_OPTIONS}
            onClose={() => state.setIsFootIntegrityModalOpen(false)}
            onSelect={state.handleFootIntegritySelect}
          />

          <XRayKneeChoiceModal
            isOpen={state.isFootParaarticularModalOpen}
            title="РџР°СЂР°Р°СЂС‚РёРєСѓР»СЏСЂРЅС‹Рµ С‚РєР°РЅРё"
            options={XRAY_FOOT_PARAARTICULAR_OPTIONS}
            onClose={() => state.setIsFootParaarticularModalOpen(false)}
            onSelect={state.handleFootParaarticularSelect}
          />
        </>
      ) : null}

      {state.isHandStudyContext ? (
        <>
          <XRayHandJointMapModal
            isOpen={state.isHandJointSpaceModalOpen}
            title="РЎСѓСЃС‚Р°РІРЅС‹Рµ С‰РµР»Рё"
            values={state.handJointSpaceState}
            mode="degrees"
            activeDegree={state.activeHandJointDegree}
            onClose={() => state.setIsHandJointSpaceModalOpen(false)}
            onActiveDegreeChange={state.setActiveHandJointDegree}
            onToggle={(key) => state.handleHandJointToggle('jointSpace', key)}
            onAdd={state.handleAddHandJointSpaceDescription}
          />

          <XRayHandJointMapModal
            isOpen={state.isHandJointSurfaceModalOpen}
            title="РЎСѓСЃС‚Р°РІРЅС‹Рµ РїРѕРІРµСЂС…РЅРѕСЃС‚Рё"
            values={state.handJointSurfaceState}
            mode="degrees"
            activeDegree={state.activeHandJointDegree}
            onClose={() => state.setIsHandJointSurfaceModalOpen(false)}
            onActiveDegreeChange={state.setActiveHandJointDegree}
            onToggle={(key) => state.handleHandJointToggle('jointSurface', key)}
            onAdd={state.handleAddHandJointSurfaceDescription}
          />

          <XRayHandJointMapModal
            isOpen={state.isHandOsteophytesModalOpen}
            title="РћСЃС‚РµРѕС„РёС‚С‹"
            values={state.handOsteophytesState}
            mode="toggle"
            onClose={() => state.setIsHandOsteophytesModalOpen(false)}
            onToggle={(key) => state.handleHandJointToggle('osteophytes', key)}
            onAdd={state.handleAddHandOsteophytesDescription}
          />

          <XRayHandJointMapModal
            isOpen={state.isHandCongruencyModalOpen}
            title="РљРѕРЅРіСЂСѓСЌРЅС‚РЅРѕСЃС‚СЊ"
            values={state.handCongruencyState}
            mode="toggle"
            onClose={() => state.setIsHandCongruencyModalOpen(false)}
            onToggle={(key) => state.handleHandJointToggle('congruency', key)}
            onAdd={state.handleAddHandCongruencyDescription}
          />

          <XRayKneeChoiceModal
            isOpen={state.isHandIntegrityModalOpen}
            title="Р¦РµР»РѕСЃС‚РЅРѕСЃС‚СЊ"
            options={XRAY_HAND_INTEGRITY_OPTIONS}
            onClose={() => state.setIsHandIntegrityModalOpen(false)}
            onSelect={state.handleHandIntegritySelect}
          />

          <XRayKneeChoiceModal
            isOpen={state.isHandParaarticularModalOpen}
            title="РџР°СЂР°Р°СЂС‚РёРєСѓР»СЏСЂРЅС‹Рµ С‚РєР°РЅРё"
            options={XRAY_HAND_PARAARTICULAR_OPTIONS}
            onClose={() => state.setIsHandParaarticularModalOpen(false)}
            onSelect={state.handleHandParaarticularSelect}
          />
        </>
      ) : null}

      {state.deleteStudyCandidate ? (
        <XRayConfirmModal
          kicker="РЈРґР°Р»РµРЅРёРµ РёСЃСЃР»РµРґРѕРІР°РЅРёСЏ"
          title="РЈРґР°Р»РёС‚СЊ РёСЃСЃР»РµРґРѕРІР°РЅРёРµ?"
          description={
            <>
              РСЃСЃР»РµРґРѕРІР°РЅРёРµ <strong>{formatStudyLabel(state.deleteStudyCandidate)}</strong> Р±СѓРґРµС‚
              СѓРґР°Р»РµРЅРѕ Р±РµР· РІРѕР·РјРѕР¶РЅРѕСЃС‚Рё РІРѕСЃСЃС‚Р°РЅРѕРІР»РµРЅРёСЏ.
            </>
          }
          confirmLabel="РЈРґР°Р»РёС‚СЊ"
          confirmBusyLabel="РЈРґР°Р»СЏСЋ..."
          isBusy={props.deletingStudyId === state.deleteStudyCandidate.id}
          isTopLayer
          dialogLabelId="xray-study-delete-title"
          closeAriaLabel="Р—Р°РєСЂС‹С‚СЊ РѕРєРЅРѕ РїРѕРґС‚РІРµСЂР¶РґРµРЅРёСЏ"
          onClose={() => state.setDeleteStudyCandidate(null)}
          onConfirm={state.handleDeleteStudyConfirm}
        />
      ) : null}

      {state.templateStudy ? (
        <XRayStudyTemplatesModal
          templateQuery={state.templateQuery}
          filteredStudyTemplates={state.filteredStudyTemplates}
          onTemplateQueryChange={state.setTemplateQuery}
          onClose={() => state.setTemplateStudy(null)}
          onSelectTemplate={state.handleStudyTemplateSelect}
        />
      ) : null}
    </div>
  )
}



