import type { ShoulderJointSpaceState, ShoulderSide } from '../helpers/generateShoulderDescriptions'

const DEGREE_OPTIONS: Array<ShoulderJointSpaceState['left']['degree']> = [
  'не изменена',
  'незначительно',
  'умеренно',
  'выраженно',
  'резко',
]

const UNIFORMITY_OPTIONS: Array<ShoulderJointSpaceState['left']['uniformity']> = [
  'равномерно',
  'неравномерно',
]

interface XRayShoulderJointSpaceModalProps {
  isOpen: boolean
  values: ShoulderJointSpaceState
  onClose: () => void
  onDegreeChange: (side: ShoulderSide, value: ShoulderJointSpaceState['left']['degree']) => void
  onUniformityChange: (
    side: ShoulderSide,
    value: ShoulderJointSpaceState['left']['uniformity'],
  ) => void
  onAdd: () => void
}

export function XRayShoulderJointSpaceModal({
  isOpen,
  values,
  onClose,
  onDegreeChange,
  onUniformityChange,
  onAdd,
}: XRayShoulderJointSpaceModalProps) {
  if (!isOpen) return null

  const renderSide = (side: ShoulderSide, title: string) => (
    <div className="xray-joint-space-column">
      <div className="xray-joint-space-column-title">{title}</div>
      <div className="xray-knee-choice-list">
        {DEGREE_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            className={`xray-side-tool-chip xray-knee-choice-chip ${
              values[side].degree === option ? 'is-active' : ''
            }`}
            onClick={() => onDegreeChange(side, option)}
          >
            {option}
          </button>
        ))}
      </div>
      <div className="xray-knee-choice-list">
        {UNIFORMITY_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            className={`xray-side-tool-chip xray-knee-choice-chip ${
              values[side].uniformity === option ? 'is-active' : ''
            }`}
            onClick={() => onUniformityChange(side, option)}
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
        aria-label="Суставные щели"
      >
        <button type="button" className="reminders-modal-close" onClick={onClose} aria-label="Закрыть окно суставных щелей">
          ×
        </button>
        <h3 className="xray-knee-choice-title">Суставные щели</h3>
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
