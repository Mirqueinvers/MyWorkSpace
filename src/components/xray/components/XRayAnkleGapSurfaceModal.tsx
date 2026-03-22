import type { AnkleGapSurfaceState } from '../helpers/generateAnkleDescriptions'

const DEGREE_OPTIONS = ['Незначительно', 'Умеренно', 'Выраженно', 'Резко'] as const
const POSITION_OPTIONS = ['Равномерно', 'Медиально', 'Латерально'] as const

interface XRayAnkleGapSurfaceModalBaseProps {
  isOpen: boolean
  title: string
  ariaLabel: string
  values: AnkleGapSurfaceState
  onClose: () => void
  onDegreeChange: (side: 'left' | 'right', value: string) => void
  onPositionChange: (side: 'left' | 'right', value: string) => void
  onAdd: () => void
}

function AnkleSideCard({
  title,
  side,
  value,
  onDegreeChange,
  onPositionChange,
}: {
  title: string
  side: 'left' | 'right'
  value: AnkleGapSurfaceState['left']
  onDegreeChange: (side: 'left' | 'right', value: string) => void
  onPositionChange: (side: 'left' | 'right', value: string) => void
}) {
  return (
    <div className="xray-joint-space-column">
      <div className="xray-joint-space-column-title">{title}</div>

      <div className="xray-joint-space-side">
        <div className="xray-joint-space-side-title">Степень</div>
        <div className="xray-knee-osteophytes-list">
          {DEGREE_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              className={`xray-joint-space-chip xray-knee-osteophytes-chip${value.degree === option ? ' is-active' : ''}`}
              onClick={() => onDegreeChange(side, option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="xray-joint-space-side">
        <div className="xray-joint-space-side-title">Расположение</div>
        <div className="xray-knee-osteophytes-list">
          {POSITION_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              className={`xray-joint-space-chip xray-knee-osteophytes-chip${value.position === option ? ' is-active' : ''}`}
              onClick={() => onPositionChange(side, option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function XRayAnkleGapSurfaceModalBase({
  isOpen,
  title,
  ariaLabel,
  values,
  onClose,
  onDegreeChange,
  onPositionChange,
  onAdd,
}: XRayAnkleGapSurfaceModalBaseProps) {
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
        aria-label={ariaLabel}
      >
        <button
          type="button"
          className="reminders-modal-close"
          onClick={onClose}
          aria-label={`Закрыть окно ${ariaLabel}`}
        >
          ×
        </button>

        <div className="xray-knee-choice-title">{title}</div>

        <div className="xray-joint-space-layout">
          <AnkleSideCard
            title="Правый голеностопный сустав"
            side="right"
            value={values.right}
            onDegreeChange={onDegreeChange}
            onPositionChange={onPositionChange}
          />
          <AnkleSideCard
            title="Левый голеностопный сустав"
            side="left"
            value={values.left}
            onDegreeChange={onDegreeChange}
            onPositionChange={onPositionChange}
          />
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

interface XRayAnkleGapSurfaceModalProps {
  isOpen: boolean
  values: AnkleGapSurfaceState
  onClose: () => void
  onDegreeChange: (side: 'left' | 'right', value: string) => void
  onPositionChange: (side: 'left' | 'right', value: string) => void
  onAdd: () => void
}

export function XRayAnkleJointSpaceModal(props: XRayAnkleGapSurfaceModalProps) {
  return (
    <XRayAnkleGapSurfaceModalBase
      {...props}
      title="Суставные щели"
      ariaLabel="Суставные щели голеностопных суставов"
    />
  )
}

export function XRayAnkleJointSurfaceModal(props: XRayAnkleGapSurfaceModalProps) {
  return (
    <XRayAnkleGapSurfaceModalBase
      {...props}
      title="Суставные поверхности"
      ariaLabel="Суставные поверхности голеностопных суставов"
    />
  )
}
