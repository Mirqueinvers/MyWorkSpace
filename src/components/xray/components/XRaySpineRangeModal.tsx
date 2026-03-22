import { SPINE_VERTEBRAE_GROUPS } from '../helpers/generateSpineDescriptions'

interface XRaySpineRangeModalProps {
  isOpen: boolean
  selected: string[]
  onClose: () => void
  onToggle: (vertebra: string) => void
  onAdd: () => void
}

export function XRaySpineRangeModal({
  isOpen,
  selected,
  onClose,
  onToggle,
  onAdd,
}: XRaySpineRangeModalProps) {
  if (!isOpen) return null

  return (
    <div className="reminders-modal-overlay xray-top-overlay">
      <section
        className="reminders-modal xray-study-description-modal xray-spine-modal xray-top-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Позвоночный столб"
      >
        <button type="button" className="reminders-modal-close" onClick={onClose} aria-label="Закрыть окно позвоночника">
          ×
        </button>

        <h3 className="xray-knee-choice-title">Позвоночный столб</h3>

        <div className="xray-spine-groups">
          {Object.entries(SPINE_VERTEBRAE_GROUPS).map(([label, vertebrae]) => (
            <div key={label} className="xray-spine-group">
              <div className="xray-spine-group-title">{label}</div>
              <div className="xray-spine-vertebrae-grid">
                {vertebrae.map((vertebra) => (
                  <button
                    key={vertebra}
                    type="button"
                    className={`xray-side-tool-chip xray-spine-vertebra-chip ${
                      selected.includes(vertebra) ? 'is-active' : ''
                    }`}
                    onClick={() => onToggle(vertebra)}
                  >
                    {vertebra}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="primary-button xray-spine-add-button"
          onClick={onAdd}
          disabled={selected.length !== 2}
        >
          Добавить
        </button>
      </section>
    </div>
  )
}
