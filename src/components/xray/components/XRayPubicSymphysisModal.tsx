import type { PubicSymphysisState } from '../helpers/generateHipDescriptions'

const PUBIC_SYMMETRY_OPTIONS = ['Симметрична', 'Асимметричная'] as const
const PUBIC_OSTEOPHYTE_OPTIONS = ['Верхние', 'Нижние'] as const
const PUBIC_SURFACE_OPTIONS = [
  'Не изменены',
  'Незначительно склерозированы',
  'Умеренно склерозированы',
  'Выраженно склерозированы',
] as const

interface XRayPubicSymphysisModalProps {
  isOpen: boolean
  values: PubicSymphysisState
  onClose: () => void
  onNormalToggle: () => void
  onSymmetryChange: (value: string) => void
  onOsteophyteToggle: (value: string) => void
  onSurfaceChange: (value: string) => void
  onAdd: () => void
}

export function XRayPubicSymphysisModal({
  isOpen,
  values,
  onClose,
  onNormalToggle,
  onSymmetryChange,
  onOsteophyteToggle,
  onSurfaceChange,
  onAdd,
}: XRayPubicSymphysisModalProps) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="reminders-modal-overlay xray-top-overlay">
      <section
        className="reminders-modal xray-study-description-modal xray-joint-space-modal xray-top-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Лонное сочленение"
      >
        <button type="button" className="reminders-modal-close" onClick={onClose} aria-label="Закрыть окно">
          ×
        </button>

        <div className="xray-joint-space-column">
          <div className="xray-joint-space-group">
            <div className="xray-joint-space-group-title">Норма</div>
            <button
              type="button"
              className={`xray-joint-space-chip${values.isNormal ? ' is-active' : ''}`}
              onClick={onNormalToggle}
            >
              Норма
            </button>
          </div>

          <div className="xray-joint-space-group">
            <div className="xray-joint-space-group-title">Симметричность</div>
            <div className="xray-joint-space-chips">
              {PUBIC_SYMMETRY_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`xray-joint-space-chip${values.symmetry === option ? ' is-active' : ''}`}
                  onClick={() => onSymmetryChange(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="xray-joint-space-group">
            <div className="xray-joint-space-group-title">Остеофиты</div>
            <div className="xray-joint-space-chips">
              {PUBIC_OSTEOPHYTE_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`xray-joint-space-chip${values.osteophytes.includes(option) ? ' is-active' : ''}`}
                  onClick={() => onOsteophyteToggle(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="xray-joint-space-group">
            <div className="xray-joint-space-group-title">Суставные поверхности</div>
            <div className="xray-joint-space-chips">
              {PUBIC_SURFACE_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`xray-joint-space-chip${values.surfaces === option ? ' is-active' : ''}`}
                  onClick={() => onSurfaceChange(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
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
