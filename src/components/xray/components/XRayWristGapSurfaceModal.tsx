import type {
  WristDegree,
  WristGapSurfaceState,
  WristPosition,
  WristSide,
} from '../helpers/generateWristDescriptions'

const WRIST_DEGREES: WristDegree[] = ['незначительно', 'умеренно', 'выраженно', 'резко']
const WRIST_POSITIONS: WristPosition[] = ['равномерно', 'медиально', 'латерально']

interface XRayWristGapSurfaceModalProps {
  isOpen: boolean
  title: string
  values: WristGapSurfaceState
  onClose: () => void
  onSideToggle: (side: WristSide) => void
  onDegreeSelect: (side: WristSide, value: WristDegree) => void
  onPositionSelect: (side: WristSide, value: WristPosition) => void
  onAdd: () => void
}

export function XRayWristGapSurfaceModal({
  isOpen,
  title,
  values,
  onClose,
  onSideToggle,
  onDegreeSelect,
  onPositionSelect,
  onAdd,
}: XRayWristGapSurfaceModalProps) {
  if (!isOpen) return null

  const renderSide = (side: WristSide, titleText: string) => (
    <div className="xray-joint-space-column">
      <button
        type="button"
        className={`xray-side-tool-chip xray-knee-choice-chip ${
          values.selectedSides.includes(side) ? 'is-active' : ''
        }`}
        onClick={() => onSideToggle(side)}
      >
        {titleText}
      </button>

      {values.selectedSides.includes(side) ? (
        <>
          <div className="xray-knee-choice-list">
            {WRIST_DEGREES.map((option) => (
              <button
                key={option}
                type="button"
                className={`xray-side-tool-chip xray-knee-choice-chip ${
                  values.selectedOptions[side].includes(option) ? 'is-active' : ''
                }`}
                onClick={() => onDegreeSelect(side, option)}
              >
                {option}
              </button>
            ))}
          </div>
          <div className="xray-knee-choice-list">
            {WRIST_POSITIONS.map((option) => (
              <button
                key={option}
                type="button"
                className={`xray-side-tool-chip xray-knee-choice-chip ${
                  values.selectedPositions[side] === option ? 'is-active' : ''
                }`}
                onClick={() => onPositionSelect(side, option)}
              >
                {option}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  )

  return (
    <div className="reminders-modal-overlay xray-top-overlay">
      <section
        className="reminders-modal xray-study-description-modal xray-joint-space-modal xray-top-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <button
          type="button"
          className="reminders-modal-close"
          onClick={onClose}
          aria-label={`Закрыть окно ${title}`}
        >
          ×
        </button>
        <h3 className="xray-knee-choice-title">{title}</h3>
        <div className="xray-joint-space-layout">
          {renderSide('right', 'Правый сустав')}
          {renderSide('left', 'Левый сустав')}
        </div>
        <button type="button" className="primary-button xray-spine-add-button" onClick={onAdd}>
          Добавить
        </button>
      </section>
    </div>
  )
}
