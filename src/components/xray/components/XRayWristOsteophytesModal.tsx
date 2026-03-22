import type { WristOsteophytesState } from '../helpers/generateWristDescriptions'

const ZONES = [
  { key: 'rightLateral', label: 'Правый латеральный' },
  { key: 'rightMedial', label: 'Правый медиальный' },
  { key: 'leftMedial', label: 'Левый медиальный' },
  { key: 'leftLateral', label: 'Левый латеральный' },
] as const

interface XRayWristOsteophytesModalProps {
  isOpen: boolean
  values: WristOsteophytesState
  onClose: () => void
  onToggle: (key: keyof WristOsteophytesState) => void
  onAdd: () => void
}

export function XRayWristOsteophytesModal({
  isOpen,
  values,
  onClose,
  onToggle,
  onAdd,
}: XRayWristOsteophytesModalProps) {
  if (!isOpen) return null

  return (
    <div className="reminders-modal-overlay xray-top-overlay">
      <section
        className="reminders-modal xray-study-description-modal xray-knee-choice-modal xray-top-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Остеофиты лучезапястных суставов"
      >
        <button
          type="button"
          className="reminders-modal-close"
          onClick={onClose}
          aria-label="Закрыть окно остеофитов лучезапястных суставов"
        >
          ×
        </button>
        <h3 className="xray-knee-choice-title">Остеофиты лучезапястных суставов</h3>
        <div className="xray-knee-choice-list">
          {ZONES.map((zone) => (
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
