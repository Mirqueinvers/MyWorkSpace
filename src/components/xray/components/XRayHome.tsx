import {
  formatStudyLabel,
  getPatientFullName,
} from '../helpers'
import type { XRaySectionProps } from '../types'
import { useXRayHomeState } from '../hooks'
import {
  XRayAddPatientCard,
  XRayConfirmModal,
  XRayJointSpaceModal,
  XRayPatientCard,
  XRayPatientEditModal,
  XRaySearchPanel,
  XRayStudyDescriptionModal,
  XRayStudyFormModal,
  XRayStudyTemplatesModal,
} from '.'

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
          isDescriptionEditing={state.isDescriptionEditing}
          isSavingStudy={props.isSavingStudy}
          descriptionInputRef={state.descriptionInputRef}
          isJointSpaceOpen={state.isJointSpaceModalOpen}
          onDescriptionChange={state.setDescriptionDraft}
          onClose={() => state.setDescriptionStudy(null)}
          onStartEdit={() => state.setIsDescriptionEditing(true)}
          onSave={() => void state.handleSaveStudyDescription()}
          onDelete={() => void state.handleDeleteStudyDescription()}
          onOpenJointSpace={() => state.setIsJointSpaceModalOpen(true)}
        />
      ) : null}

      <XRayJointSpaceModal
        isOpen={state.isJointSpaceModalOpen}
        values={state.jointSpaceState}
        onClose={() => state.setIsJointSpaceModalOpen(false)}
        onChange={state.handleJointSpaceChange}
        onAdd={state.handleAddJointSpaceDescription}
      />

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
