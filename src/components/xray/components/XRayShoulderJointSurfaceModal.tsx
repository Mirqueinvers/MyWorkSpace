import type { ShoulderJointSurfaceState, ShoulderSide } from '../helpers/generateShoulderDescriptions'

const SURFACE_OPTIONS: Array<ShoulderJointSurfaceState['left']> = [
  'не изменена',
  'незначительно склерозирована',
  'умеренно склерозирована',
  'выраженно склерозирована',
  'резко склерозирована',
]

interface XRayShoulderJointSurfaceModalProps {
  isOpen: boolean
  values: ShoulderJointSurfaceState
  onClose: () => void
  onChange: (side: ShoulderSide, value: ShoulderJointSurfaceState['left']) => void
  onAdd: () => void
}

export function XRayShoulderJointSurfaceModal({
  isOpen,
  values,
  onClose,
  onChange,
  onAdd,
}: XRayShoulderJointSurfaceModalProps) {
  if (!isOpen) return null

  const renderSide = (side: ShoulderSide, title: string) => (
    <div className="xray-joint-space-column">
      <div className="xray-joint-space-column-title">{title}</div>
      <div className="xray-knee-choice-list">
        {SURFACE_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            className={`xray-side-tool-chip xray-knee-choice-chip ${
              values[side] === option ? 'is-active' : ''
            }`}
            onClick={() => onChange(side, option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div className="reminders-modal-overlay xray-top-overlay">
      <section
        className="reminders-modal xray-study-description-modal xray-joint-space-modal xray-top-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Суставные поверхности"
      >
        <button type="button" className="reminders-modal-close" onClick={onClose} aria-label="Закрыть окно суставных поверхностей">
          ×
        </button>
        <h3 className="xray-knee-choice-title">Суставные поверхности</h3>
        <div className="xray-joint-space-layout">
          {renderSide('right', 'Правый плечевой сустав')}
          {renderSide('left', 'Левый плечевой сустав')}
        </div>
        <button type="button" className="primary-button xray-spine-add-button" onClick={onAdd}>
          Добавить
        </button>
      </section>
    </div>
  )
}
