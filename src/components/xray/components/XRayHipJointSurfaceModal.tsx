import type { HipJointSurfaceState } from '../helpers/generateHipDescriptions'

const HIP_SURFACE_OPTIONS = [
  'незначительно изменены',
  'умеренно изменены',
  'выраженно изменены',
] as const

interface XRayHipJointSurfaceModalProps {
  isOpen: boolean
  values: HipJointSurfaceState
  onClose: () => void
  onChange: (section: 'left' | 'right', value: string) => void
  onAdd: () => void
}

function HipSurfaceCard({
  title,
  sectionKey,
  values,
  onChange,
}: {
  title: string
  sectionKey: 'left' | 'right'
  values: HipJointSurfaceState
  onChange: (section: 'left' | 'right', value: string) => void
}) {
  return (
    <div className="xray-joint-space-column">
      <div className="xray-joint-space-column-title">{title}</div>

      <div className="xray-joint-space-chips">
        {HIP_SURFACE_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            className={`xray-joint-space-chip${values[sectionKey] === option ? ' is-active' : ''}`}
            onClick={() => onChange(sectionKey, option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}

export function XRayHipJointSurfaceModal({
  isOpen,
  values,
  onClose,
  onChange,
  onAdd,
}: XRayHipJointSurfaceModalProps) {
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
        aria-label="Суставные поверхности тазобедренных суставов"
      >
        <button type="button" className="reminders-modal-close" onClick={onClose} aria-label="Закрыть окно">
          ×
        </button>

        <div className="xray-joint-space-layout">
          <HipSurfaceCard
            title="Правый тазобедренный сустав"
            sectionKey="right"
            values={values}
            onChange={onChange}
          />
          <HipSurfaceCard
            title="Левый тазобедренный сустав"
            sectionKey="left"
            values={values}
            onChange={onChange}
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
