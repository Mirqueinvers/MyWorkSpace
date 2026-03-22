import {
  SPINE_SURFACES,
  SPINE_VERTEBRAE_GROUPS,
  type SpineOsteophytesState,
  type SpineSurface,
} from '../helpers/generateSpineDescriptions'

interface XRaySpineOsteophytesModalProps {
  isOpen: boolean
  values: SpineOsteophytesState
  onClose: () => void
  onSurfaceChange: (surface: SpineSurface) => void
  onToggleVertebra: (vertebra: string) => void
  onAdd: () => void
}

export function XRaySpineOsteophytesModal({
  isOpen,
  values,
  onClose,
  onSurfaceChange,
  onToggleVertebra,
  onAdd,
}: XRaySpineOsteophytesModalProps) {
  if (!isOpen) return null

  const canAdd = SPINE_SURFACES.some((surface) => values.selected[surface].length > 0)

  return (
    <div className="reminders-modal-overlay xray-top-overlay">
      <section
        className="reminders-modal xray-study-description-modal xray-spine-modal xray-top-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Остеофиты"
      >
        <button type="button" className="reminders-modal-close" onClick={onClose} aria-label="Закрыть окно остеофитов">
          ×
        </button>

        <h3 className="xray-knee-choice-title">Остеофиты</h3>

        <div className="xray-knee-choice-list">
          {SPINE_SURFACES.map((surface) => (
            <button
              key={surface}
              type="button"
              className={`xray-side-tool-chip xray-knee-choice-chip ${
                values.activeSurface === surface ? 'is-active' : ''
              }`}
              onClick={() => onSurfaceChange(surface)}
            >
              {surface}
            </button>
          ))}
        </div>

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
                      values.selected[values.activeSurface].includes(vertebra) ? 'is-active' : ''
                    }`}
                    onClick={() => onToggleVertebra(vertebra)}
                  >
                    {vertebra}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button type="button" className="primary-button xray-spine-add-button" onClick={onAdd} disabled={!canAdd}>
          Добавить
        </button>
      </section>
    </div>
  )
}
