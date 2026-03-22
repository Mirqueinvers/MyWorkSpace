import {
  SPINE_SEVERITIES,
  SPINE_VERTEBRAE_GROUPS,
  type SpineDiscsState,
  type SpineSeverity,
} from '../helpers/generateSpineDescriptions'

interface XRaySpineDiscsModalProps {
  isOpen: boolean
  values: SpineDiscsState
  onClose: () => void
  onSetUnchanged: () => void
  onSetSeverity: (severity: SpineSeverity) => void
  onToggleVertebra: (vertebra: string) => void
  onAdd: () => void
}

export function XRaySpineDiscsModal({
  isOpen,
  values,
  onClose,
  onSetUnchanged,
  onSetSeverity,
  onToggleVertebra,
  onAdd,
}: XRaySpineDiscsModalProps) {
  if (!isOpen) return null

  const canAdd =
    values.unchanged || SPINE_SEVERITIES.some((severity) => values.selected[severity].length > 0)

  return (
    <div className="reminders-modal-overlay xray-top-overlay">
      <section
        className="reminders-modal xray-study-description-modal xray-spine-modal xray-top-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Межпозвонковые диски"
      >
        <button type="button" className="reminders-modal-close" onClick={onClose} aria-label="Закрыть окно дисков">
          ×
        </button>

        <h3 className="xray-knee-choice-title">Межпозвонковые диски</h3>

        <div className="xray-knee-choice-list">
          <button
            type="button"
            className={`xray-side-tool-chip xray-knee-choice-chip ${values.unchanged ? 'is-active' : ''}`}
            onClick={onSetUnchanged}
          >
            Не изменена
          </button>
          {SPINE_SEVERITIES.map((severity) => (
            <button
              key={severity}
              type="button"
              className={`xray-side-tool-chip xray-knee-choice-chip ${
                !values.unchanged && values.activeSeverity === severity ? 'is-active' : ''
              }`}
              onClick={() => onSetSeverity(severity)}
            >
              {severity}
            </button>
          ))}
        </div>

        {!values.unchanged ? (
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
                        values.activeSeverity && values.selected[values.activeSeverity].includes(vertebra)
                          ? 'is-active'
                          : ''
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
        ) : null}

        <button type="button" className="primary-button xray-spine-add-button" onClick={onAdd} disabled={!canAdd}>
          Добавить
        </button>
      </section>
    </div>
  )
}
