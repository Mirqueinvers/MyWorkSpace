import type { RefObject } from 'react'

interface XRayStudyDescriptionModalProps {
  descriptionDraft: string
  isDescriptionEditing: boolean
  isSavingStudy: boolean
  descriptionInputRef: RefObject<HTMLTextAreaElement | null>
  isJointSpaceOpen: boolean
  onDescriptionChange: (value: string) => void
  onClose: () => void
  onStartEdit: () => void
  onSave: () => void
  onDelete: () => void
  onOpenJointSpace: () => void
}

export function XRayStudyDescriptionModal({
  descriptionDraft,
  isDescriptionEditing,
  isSavingStudy,
  descriptionInputRef,
  isJointSpaceOpen,
  onDescriptionChange,
  onClose,
  onStartEdit,
  onSave,
  onDelete,
  onOpenJointSpace,
}: XRayStudyDescriptionModalProps) {
  return (
    <div className="reminders-modal-overlay xray-top-overlay">
      <section
        className="reminders-modal xray-study-description-modal xray-top-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Описание исследования"
      >
        <button
          type="button"
          className="reminders-modal-close"
          onClick={onClose}
          disabled={isSavingStudy}
          aria-label="Закрыть окно описания"
        >
          ×
        </button>

        <div className="xray-study-description-layout">
          <div className="xray-study-description-main">
            <textarea
              ref={descriptionInputRef}
              className="xray-study-description-input"
              value={descriptionDraft}
              onChange={(event) => onDescriptionChange(event.target.value)}
              readOnly={!isDescriptionEditing}
              placeholder="Описание исследования"
            />

            <div className="xray-study-description-actions">
              {isDescriptionEditing ? (
                <button
                  type="button"
                  className="primary-button"
                  onClick={onSave}
                  disabled={isSavingStudy}
                >
                  {isSavingStudy ? 'Сохраняю...' : 'Сохранить исследование'}
                </button>
              ) : (
                <button type="button" className="secondary-button" onClick={onStartEdit}>
                  Редактировать исследование
                </button>
              )}

              <button
                type="button"
                className="danger-button"
                onClick={onDelete}
                disabled={isSavingStudy}
              >
                {isSavingStudy ? 'Удаляю...' : 'Удалить описание'}
              </button>
            </div>
          </div>

          <div className="xray-study-description-side">
            <button
              type="button"
              className={`xray-side-tool-chip${isJointSpaceOpen ? ' is-active' : ''}`}
              onClick={onOpenJointSpace}
            >
              Суставные щели
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
