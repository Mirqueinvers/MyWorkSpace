import { useEffect, useRef } from 'react'

interface XRayDiagnosisModalProps {
  isOpen: boolean
  value: string
  onClose: () => void
  onChange: (value: string) => void
  onAdd: () => void
}

export function XRayDiagnosisModal({
  isOpen,
  value,
  onClose,
  onChange,
  onAdd,
}: XRayDiagnosisModalProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    window.requestAnimationFrame(() => {
      textareaRef.current?.focus()
    })
  }, [isOpen])

  if (!isOpen) {
    return null
  }

  return (
    <div className="reminders-modal-overlay xray-top-overlay">
      <section
        className="reminders-modal xray-study-description-modal xray-knee-choice-modal xray-top-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Заключение"
      >
        <button
          type="button"
          className="reminders-modal-close"
          onClick={onClose}
          aria-label="Закрыть окно заключения"
        >
          ×
        </button>

        <h3 className="xray-knee-choice-title">Заключение</h3>

        <textarea
          ref={textareaRef}
          className="xray-study-description-input xray-diagnosis-input"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Введите заключение"
        />

        <div className="xray-joint-space-actions">
          <button type="button" className="primary-button" onClick={onAdd}>
            Добавить
          </button>
        </div>
      </section>
    </div>
  )
}
