import type { RefObject } from 'react'

interface XRayStudyDescriptionModalProps {
  descriptionDraft: string
  isDescriptionEditing: boolean
  isSavingStudy: boolean
  isDeletingStudy: boolean
  descriptionInputRef: RefObject<HTMLTextAreaElement | null>
  onDescriptionChange: (value: string) => void
  onClose: () => void
  onStartEdit: () => void
  onSave: () => void
  onDelete: () => void
}

export function XRayStudyDescriptionModal({
  descriptionDraft,
  isDescriptionEditing,
  isSavingStudy,
  isDeletingStudy,
  descriptionInputRef,
  onDescriptionChange,
  onClose,
  onStartEdit,
  onSave,
  onDelete,
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
                disabled={isDeletingStudy}
              >
                {isDeletingStudy ? 'Удаляю...' : 'Удалить исследование'}
              </button>
            </div>
          </div>

          <div className="xray-study-description-side" />
        </div>
      </section>
    </div>
  )
}
