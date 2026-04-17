import { useState } from 'react'
import type { RefObject } from 'react'

interface XRayStudyDescriptionTool {
  label: string
  isActive?: boolean
  onClick: () => void
}

interface XRayStudyDescriptionModalProps {
  descriptionDraft: string
  diagnosisDraft: string
  isDescriptionEditing: boolean
  isSavingStudy: boolean
  descriptionInputRef: RefObject<HTMLTextAreaElement | null>
  sideTools: XRayStudyDescriptionTool[]
  onDescriptionChange: (value: string) => void
  onDiagnosisChange: (value: string) => void
  onClose: () => void
  onStartEdit: () => void
  onSave: () => void
  onDelete: () => void
}

export function XRayStudyDescriptionModal({
  descriptionDraft,
  diagnosisDraft,
  isDescriptionEditing,
  isSavingStudy,
  descriptionInputRef,
  sideTools,
  onDescriptionChange,
  onDiagnosisChange,
  onClose,
  onStartEdit,
  onSave,
  onDelete,
}: XRayStudyDescriptionModalProps) {
  const [isCopying, setIsCopying] = useState(false)

  async function handleCopyDescription() {
    const description = descriptionDraft.trim()
    const diagnosis = diagnosisDraft.trim()

    const payload = `${description ? `\n\n${description}` : ''}${diagnosis ? `\n\nЗаключение: ${diagnosis}` : ''}`

    if (!payload.trim()) {
      return
    }

    setIsCopying(true)
    try {
      await navigator.clipboard.writeText(payload)
    } finally {
      setIsCopying(false)
    }
  }

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

            <input
              type="text"
              className="input xray-study-diagnosis-input"
              value={diagnosisDraft}
              onChange={(event) => onDiagnosisChange(event.target.value)}
              readOnly={!isDescriptionEditing}
              placeholder="Диагноз"
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

              <button type="button" className="secondary-button" onClick={handleCopyDescription}>
                {isCopying ? 'Копирую...' : 'Копировать описание'}
              </button>

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
            {sideTools.map((tool) => (
              <button
                key={tool.label}
                type="button"
                className={`xray-side-tool-chip${tool.isActive ? ' is-active' : ''}`}
                onClick={tool.onClick}
              >
                {tool.label}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
