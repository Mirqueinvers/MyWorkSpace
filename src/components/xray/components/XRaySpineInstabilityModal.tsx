import {
  SPINE_DIRECTIONS,
  SPINE_MAGNITUDES,
  SPINE_VERTEBRAE_GROUPS,
  type SpineDirection,
  type SpineInstabilityState,
  type SpineMagnitude,
} from '../helpers/generateSpineDescriptions'

interface XRaySpineInstabilityModalProps {
  isOpen: boolean
  values: SpineInstabilityState
  onClose: () => void
  onModeChange: (value: SpineInstabilityState['mode']) => void
  onDirectionChange: (value: SpineDirection) => void
  onMagnitudeChange: (value: SpineMagnitude) => void
  onToggleVertebra: (vertebra: string) => void
  onAdd: () => void
}

export function XRaySpineInstabilityModal({
  isOpen,
  values,
  onClose,
  onModeChange,
  onDirectionChange,
  onMagnitudeChange,
  onToggleVertebra,
  onAdd,
}: XRaySpineInstabilityModalProps) {
  if (!isOpen) return null

  const canAdd =
    values.mode === 'Норма' ||
    Boolean(values.selectedDirection && values.selectedMagnitude && values.selectedVertebrae.length)

  return (
    <div className="reminders-modal-overlay xray-top-overlay">
      <section
        className="reminders-modal xray-study-description-modal xray-spine-modal xray-top-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Нестабильность"
      >
        <button type="button" className="reminders-modal-close" onClick={onClose} aria-label="Закрыть окно нестабильности">
          ×
        </button>

        <h3 className="xray-knee-choice-title">Нестабильность</h3>

        <div className="xray-knee-choice-list">
          {(['Норма', 'Нестабильность'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              className={`xray-side-tool-chip xray-knee-choice-chip ${values.mode === mode ? 'is-active' : ''}`}
              onClick={() => onModeChange(mode)}
            >
              {mode}
            </button>
          ))}
        </div>

        {values.mode === 'Нестабильность' ? (
          <>
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
                          values.selectedVertebrae.includes(vertebra) ? 'is-active' : ''
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

            <div className="xray-knee-choice-list">
              {SPINE_DIRECTIONS.map((direction) => (
                <button
                  key={direction}
                  type="button"
                  className={`xray-side-tool-chip xray-knee-choice-chip ${
                    values.selectedDirection === direction ? 'is-active' : ''
                  }`}
                  onClick={() => onDirectionChange(direction)}
                >
                  {direction}
                </button>
              ))}
            </div>

            <div className="xray-knee-choice-list">
              {SPINE_MAGNITUDES.map((magnitude) => (
                <button
                  key={magnitude}
                  type="button"
                  className={`xray-side-tool-chip xray-knee-choice-chip ${
                    values.selectedMagnitude === magnitude ? 'is-active' : ''
                  }`}
                  onClick={() => onMagnitudeChange(magnitude)}
                >
                  {magnitude}
                </button>
              ))}
            </div>
          </>
        ) : null}

        <button type="button" className="primary-button xray-spine-add-button" onClick={onAdd} disabled={!canAdd}>
          Добавить
        </button>
      </section>
    </div>
  )
}
