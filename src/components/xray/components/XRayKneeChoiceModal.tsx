interface XRayKneeChoiceModalProps<T extends string> {
  isOpen: boolean
  title: string
  options: readonly T[]
  onClose: () => void
  onSelect: (value: T) => void
}

export function XRayKneeChoiceModal<T extends string>({
  isOpen,
  title,
  options,
  onClose,
  onSelect,
}: XRayKneeChoiceModalProps<T>) {
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
        aria-label={title}
      >
        <button
          type="button"
          className="reminders-modal-close"
          onClick={onClose}
          aria-label={`Закрыть окно ${title}`}
        >
          ×
        </button>

        <h3 className="xray-knee-choice-title">{title}</h3>

        <div className="xray-knee-choice-list">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              className="xray-side-tool-chip xray-knee-choice-chip"
              onClick={() => onSelect(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
