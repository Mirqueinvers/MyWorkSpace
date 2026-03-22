import type { ShoulderOsteophytesState } from '../helpers/generateShoulderDescriptions'

const SHOULDER_OSTEOPHYTE_ZONES = [
  { key: 'rightUpper', label: 'Правый верхний край' },
  { key: 'rightLower', label: 'Правый нижний край' },
  { key: 'leftUpper', label: 'Левый верхний край' },
  { key: 'leftLower', label: 'Левый нижний край' },
] as const

interface XRayShoulderOsteophytesModalProps {
  isOpen: boolean
  values: ShoulderOsteophytesState
  onClose: () => void
  onToggle: (key: keyof ShoulderOsteophytesState) => void
  onAdd: () => void
}

export function XRayShoulderOsteophytesModal({
  isOpen,
  values,
  onClose,
  onToggle,
  onAdd,
}: XRayShoulderOsteophytesModalProps) {
  if (!isOpen) return null

  return (
    <div className="reminders-modal-overlay xray-top-overlay">
      <section
        className="reminders-modal xray-study-description-modal xray-knee-choice-modal xray-top-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Остеофиты"
      >
        <button type="button" className="reminders-modal-close" onClick={onClose} aria-label="Закрыть окно остеофитов">
          ×
        </button>
        <h3 className="xray-knee-choice-title">Остеофиты</h3>
        <div className="xray-knee-choice-list">
          {SHOULDER_OSTEOPHYTE_ZONES.map((zone) => (
            <button
              key={zone.key}
              type="button"
              className={`xray-side-tool-chip xray-knee-choice-chip ${
                values[zone.key] ? 'is-active' : ''
              }`}
              onClick={() => onToggle(zone.key)}
            >
              {zone.label}
            </button>
          ))}
        </div>
        <button type="button" className="primary-button xray-spine-add-button" onClick={onAdd}>
          Добавить
        </button>
      </section>
    </div>
  )
}
