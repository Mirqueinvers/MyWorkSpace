import {
  SPINE_SEVERITIES,
  SPINE_VERTEBRAE_GROUPS,
  type SpineEndplatesState,
  type SpineSeverity,
} from '../helpers/generateSpineDescriptions'

interface XRaySpineEndplatesModalProps {
  isOpen: boolean
  values: SpineEndplatesState
  onClose: () => void
  onSetUnchanged: () => void
  onSetSeverity: (severity: SpineSeverity) => void
  onSetShmorlMode: () => void
  onToggleVertebra: (vertebra: string) => void
  onToggleShmorl: (vertebra: string, side: 'верхней' | 'нижней') => void
  onAdd: () => void
}

export function XRaySpineEndplatesModal({
  isOpen,
  values,
  onClose,
  onSetUnchanged,
  onSetSeverity,
  onSetShmorlMode,
  onToggleVertebra,
  onToggleShmorl,
  onAdd,
}: XRaySpineEndplatesModalProps) {
  if (!isOpen) return null

  const canAdd =
    values.unchanged ||
    SPINE_SEVERITIES.some((severity) => values.selected[severity].length > 0) ||
    values.shmorl.length > 0

  return (
    <div className="reminders-modal-overlay xray-top-overlay">
      <section
        className="reminders-modal xray-study-description-modal xray-spine-modal xray-top-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Замыкательные пластинки"
      >
        <button type="button" className="reminders-modal-close" onClick={onClose} aria-label="Закрыть окно пластинок">
          ×
        </button>

        <h3 className="xray-knee-choice-title">Замыкательные пластинки</h3>

        <div className="xray-knee-choice-list">
          <button
            type="button"
            className={`xray-side-tool-chip xray-knee-choice-chip ${
              values.unchanged && !values.activeShmorl ? 'is-active' : ''
            }`}
            onClick={onSetUnchanged}
          >
            Не изменены
          </button>
          {SPINE_SEVERITIES.map((severity) => (
            <button
              key={severity}
              type="button"
              className={`xray-side-tool-chip xray-knee-choice-chip ${
                !values.unchanged && !values.activeShmorl && values.activeSeverity === severity
                  ? 'is-active'
                  : ''
              }`}
              onClick={() => onSetSeverity(severity)}
            >
              {severity}
            </button>
          ))}
          <button
            type="button"
            className={`xray-side-tool-chip xray-knee-choice-chip ${values.activeShmorl ? 'is-active' : ''}`}
            onClick={onSetShmorlMode}
          >
            Грыжи Шморля
          </button>
        </div>

        {!values.unchanged && !values.activeShmorl ? (
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

        {values.activeShmorl ? (
          <div className="xray-spine-shmorl-grid">
            {Object.values(SPINE_VERTEBRAE_GROUPS)
              .flat()
              .map((vertebra) => (
                <div key={vertebra} className="xray-spine-shmorl-card">
                  <div className="xray-spine-group-title">{vertebra}</div>
                  <button
                    type="button"
                    className={`xray-side-tool-chip xray-spine-shmorl-chip ${
                      values.shmorl.some((item) => item.vertebra === vertebra && item.side === 'верхней')
                        ? 'is-active'
                        : ''
                    }`}
                    onClick={() => onToggleShmorl(vertebra, 'верхней')}
                  >
                    Верхняя
                  </button>
                  <button
                    type="button"
                    className={`xray-side-tool-chip xray-spine-shmorl-chip ${
                      values.shmorl.some((item) => item.vertebra === vertebra && item.side === 'нижней')
                        ? 'is-active'
                        : ''
                    }`}
                    onClick={() => onToggleShmorl(vertebra, 'нижней')}
                  >
                    Нижняя
                  </button>
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
