interface CalcaneusOsteophytesState {
  rightPlantar: boolean
  rightPosterior: boolean
  leftPlantar: boolean
  leftPosterior: boolean
}

interface XRayCalcaneusOsteophytesModalProps {
  isOpen: boolean
  values: CalcaneusOsteophytesState
  onClose: () => void
  onToggle: (key: keyof CalcaneusOsteophytesState) => void
  onAdd: () => void
}

const CALCANEUS_OPTIONS: Array<{
  key: keyof CalcaneusOsteophytesState
  label: string
}> = [
  { key: 'rightPlantar', label: 'Подошвенная поверхность правой пяточной кости' },
  { key: 'rightPosterior', label: 'Задняя поверхность правой пяточной кости' },
  { key: 'leftPlantar', label: 'Подошвенная поверхность левой пяточной кости' },
  { key: 'leftPosterior', label: 'Задняя поверхность левой пяточной кости' },
]

export function XRayCalcaneusOsteophytesModal({
  isOpen,
  values,
  onClose,
  onToggle,
  onAdd,
}: XRayCalcaneusOsteophytesModalProps) {
  if (!isOpen) return null

  return (
    <div className="reminders-modal-overlay xray-top-overlay">
      <section
        className="reminders-modal xray-study-description-modal xray-joint-space-modal xray-top-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Остеофиты пяточных костей"
      >
        <button
          type="button"
          className="reminders-modal-close"
          onClick={onClose}
          aria-label="Закрыть окно остеофитов пяточных костей"
        >
          ×
        </button>

        <div className="xray-knee-choice-title">Остеофиты пяточных костей</div>

        <div className="xray-knee-osteophytes-list">
          {CALCANEUS_OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              className={`xray-joint-space-chip xray-knee-osteophytes-chip${values[option.key] ? ' is-active' : ''}`}
              onClick={() => onToggle(option.key)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="xray-joint-space-actions">
          <button type="button" className="primary-button" onClick={onAdd}>
            Добавить
          </button>
        </div>
      </section>
    </div>
  )
}
