import { formatStudyLabel, getPatientFullName } from '../helpers'
import { useXRayHomeState } from '../hooks'
import type { XRaySectionProps } from '../types'
import {
  XRayAddPatientCard,
  XRayConfirmModal,
  XRayJointSpaceModal,
  XRayJointSurfaceModal,
  XRayKneeChoiceModal,
  XRayKneeOsteophytesModal,
  XRayPatientCard,
  XRayPatientEditModal,
  XRaySearchPanel,
  XRayStudyDescriptionModal,
  XRayStudyFormModal,
  XRayStudyTemplatesModal,
} from '.'
import {
  XRAY_KNEE_BUMPS_OPTIONS,
  XRAY_KNEE_CONGRUENCY_OPTIONS,
  XRAY_KNEE_ENDOPROSTHESIS_OPTIONS,
  XRAY_KNEE_INTEGRITY_OPTIONS,
  XRAY_KNEE_PARAARTICULAR_OPTIONS,
} from '../config'

export function XRayHome(props: XRaySectionProps) {
  const state = useXRayHomeState(props)

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
          studiesLoading={props.studiesLoading}
          error={props.error}
          isDeleting={props.isDeleting}
          copyFeedback={state.copyFeedback}
          onCopyPatientKey={state.handleCopyPatientKey}
          onOpenLink={props.onOpenLink}
          onOpenPatientEdit={state.handleOpenPatientEdit}
          onOpenDeletePatient={() => state.setIsDeleteConfirmOpen(true)}
          onOpenCreateStudy={state.openCreateStudyModal}
          onOpenStudyTemplates={state.openStudyTemplatesModal}
          onOpenEditStudy={state.openEditStudyModal}
        />
      ) : null}

      {props.selectedPatient && state.isDeleteConfirmOpen ? (
        <XRayConfirmModal
          kicker="Удаление пациента"
          title="Удалить карточку пациента?"
          description={
            <>
              Пациент <strong>{getPatientFullName(props.selectedPatient)}</strong> будет удалён из
              журнала X-ray без возможности восстановления.
            </>
          }
          confirmLabel="Удалить"
          confirmBusyLabel="Удаляю..."
          isBusy={props.isDeleting}
          dialogLabelId="xray-delete-title"
          closeAriaLabel="Закрыть окно подтверждения"
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
            title="Эндопротезирование"
            options={XRAY_KNEE_ENDOPROSTHESIS_OPTIONS}
            onClose={() => state.setIsEndoprosthesisModalOpen(false)}
            onSelect={state.handleEndoprosthesisSelect}
          />

          <XRayKneeChoiceModal
            isOpen={state.isBumpsModalOpen}
            title="Бугорки"
            options={XRAY_KNEE_BUMPS_OPTIONS}
            onClose={() => state.setIsBumpsModalOpen(false)}
            onSelect={state.handleBumpsSelect}
          />

          <XRayKneeChoiceModal
            isOpen={state.isCongruencyModalOpen}
            title="Конгруэнтность"
            options={XRAY_KNEE_CONGRUENCY_OPTIONS}
            onClose={() => state.setIsCongruencyModalOpen(false)}
            onSelect={state.handleCongruencySelect}
          />

          <XRayKneeChoiceModal
            isOpen={state.isIntegrityModalOpen}
            title="Целостность"
            options={XRAY_KNEE_INTEGRITY_OPTIONS}
            onClose={() => state.setIsIntegrityModalOpen(false)}
            onSelect={state.handleIntegritySelect}
          />

          <XRayKneeChoiceModal
            isOpen={state.isParaarticularModalOpen}
            title="Параартикулярные ткани"
            options={XRAY_KNEE_PARAARTICULAR_OPTIONS}
            onClose={() => state.setIsParaarticularModalOpen(false)}
            onSelect={state.handleParaarticularSelect}
          />
        </>
      ) : null}

      {state.deleteStudyCandidate ? (
        <XRayConfirmModal
          kicker="Удаление исследования"
          title="Удалить исследование?"
          description={
            <>
              Исследование <strong>{formatStudyLabel(state.deleteStudyCandidate)}</strong> будет
              удалено без возможности восстановления.
            </>
          }
          confirmLabel="Удалить"
          confirmBusyLabel="Удаляю..."
          isBusy={props.deletingStudyId === state.deleteStudyCandidate.id}
          isTopLayer
          dialogLabelId="xray-study-delete-title"
          closeAriaLabel="Закрыть окно подтверждения"
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
