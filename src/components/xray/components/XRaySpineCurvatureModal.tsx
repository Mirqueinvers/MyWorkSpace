import {
  SPINE_CURVE_TYPES,
  SPINE_VERTEBRAE_GROUPS,
  type SpineCurvatureState,
} from '../helpers/generateSpineDescriptions'

interface XRaySpineCurvatureModalProps {
  isOpen: boolean
  values: SpineCurvatureState
  onClose: () => void
  onCurveTypeChange: (value: SpineCurvatureState['curveType']) => void
  onDirectionChange: (value: SpineCurvatureState['cCurveDirection']) => void
  onCobbAngleChange: (value: string) => void
  onTorsionToggle: () => void
  onToggleVertebra: (vertebra: string) => void
  onAdd: () => void
}

export function XRaySpineCurvatureModal({
  isOpen,
  values,
  onClose,
  onCurveTypeChange,
  onDirectionChange,
  onCobbAngleChange,
  onTorsionToggle,
  onToggleVertebra,
  onAdd,
}: XRaySpineCurvatureModalProps) {
  if (!isOpen) return null

  const maxSelect =
    values.curveType === 'C-образно' ? 3 : values.curveType === 'S-образно' ? 4 : 0
  const canAdd = values.curveType === 'не искривлена' || values.selected.length === maxSelect

  return (
    <div className="reminders-modal-overlay xray-top-overlay">
      <section
        className="reminders-modal xray-study-description-modal xray-spine-modal xray-spine-curvature-modal xray-top-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Искривление позвоночника"
      >
        <button type="button" className="reminders-modal-close" onClick={onClose} aria-label="Закрыть окно искривления">
          ×
        </button>

        <h3 className="xray-knee-choice-title">Искривление позвоночника</h3>

        <div className="xray-knee-choice-list">
          {SPINE_CURVE_TYPES.map((curveType) => (
            <button
              key={curveType}
              type="button"
              className={`xray-side-tool-chip xray-knee-choice-chip ${
                values.curveType === curveType ? 'is-active' : ''
              }`}
              onClick={() => onCurveTypeChange(curveType)}
            >
              {curveType}
            </button>
          ))}
        </div>

        {values.curveType === 'C-образно' ? (
          <div className="xray-knee-choice-list">
            {(['влево', 'вправо'] as const).map((direction) => (
              <button
                key={direction}
                type="button"
                className={`xray-side-tool-chip xray-knee-choice-chip ${
                  values.cCurveDirection === direction ? 'is-active' : ''
                }`}
                onClick={() => onDirectionChange(direction)}
              >
                {direction}
              </button>
            ))}
            <button
              type="button"
              className={`xray-side-tool-chip xray-knee-choice-chip ${values.torsion ? 'is-active' : ''}`}
              onClick={onTorsionToggle}
            >
              Торсия
            </button>
            <input
              className="xray-field"
              value={values.cobbAngle}
              onChange={(event) => onCobbAngleChange(event.target.value)}
              placeholder="Угол Кобба"
            />
          </div>
        ) : null}

        {values.curveType !== 'не искривлена' ? (
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
                        values.selected.includes(vertebra) ? 'is-active' : ''
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
