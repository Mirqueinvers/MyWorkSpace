import type { HipJointSpaceState } from '../helpers/generateHipDescriptions'

const HIP_SPACE_DEGREE_OPTIONS = [
  'незначительно',
  'умеренно',
  'выраженно',
] as const

const HIP_SPACE_UNIFORMITY_OPTIONS = ['равномерно', 'неравномерно'] as const

interface XRayHipJointSpaceModalProps {
  isOpen: boolean
  values: HipJointSpaceState
  onClose: () => void
  onDegreeChange: (section: 'left' | 'right', value: string) => void
  onUniformityChange: (section: 'left' | 'right', value: string) => void
  onAdd: () => void
}

function HipSpaceCard({
  title,
  sectionKey,
  values,
  onDegreeChange,
  onUniformityChange,
}: {
  title: string
  sectionKey: 'left' | 'right'
  values: HipJointSpaceState
  onDegreeChange: (section: 'left' | 'right', value: string) => void
  onUniformityChange: (section: 'left' | 'right', value: string) => void
}) {
  return (
    <div className="xray-joint-space-column">
      <div className="xray-joint-space-column-title">{title}</div>

      <div className="xray-joint-space-group">
        <div className="xray-joint-space-group-title">Степень сужения</div>
        <div className="xray-joint-space-chips">
          {HIP_SPACE_DEGREE_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              className={`xray-joint-space-chip${values[sectionKey].degree === option ? ' is-active' : ''}`}
              onClick={() => onDegreeChange(sectionKey, option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="xray-joint-space-group">
        <div className="xray-joint-space-group-title">Характер сужения</div>
        <div className="xray-joint-space-chips">
          {HIP_SPACE_UNIFORMITY_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              className={`xray-joint-space-chip${values[sectionKey].uniformity === option ? ' is-active' : ''}`}
              onClick={() => onUniformityChange(sectionKey, option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export function XRayHipJointSpaceModal({
  isOpen,
  values,
  onClose,
  onDegreeChange,
  onUniformityChange,
  onAdd,
}: XRayHipJointSpaceModalProps) {
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
        aria-label="Суставные щели тазобедренных суставов"
      >
        <button type="button" className="reminders-modal-close" onClick={onClose} aria-label="Закрыть окно">
          ×
        </button>

        <div className="xray-joint-space-layout">
          <HipSpaceCard
            title="Правый тазобедренный сустав"
            sectionKey="right"
            values={values}
            onDegreeChange={onDegreeChange}
            onUniformityChange={onUniformityChange}
          />
          <HipSpaceCard
            title="Левый тазобедренный сустав"
            sectionKey="left"
            values={values}
            onDegreeChange={onDegreeChange}
            onUniformityChange={onUniformityChange}
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
