import {
  KNEE_OSTEOPHYTE_ZONES,
  type KneeOsteophytesState,
  type KneeOsteophyteZoneKey,
} from '../helpers/generateKneeOsteophytesDescription'

interface XRayKneeOsteophytesModalProps {
  isOpen: boolean
  values: KneeOsteophytesState
  onClose: () => void
  onToggle: (key: KneeOsteophyteZoneKey) => void
  onAdd: () => void
}

function OsteophyteColumn({
  title,
  side,
  values,
  onToggle,
}: {
  title: string
  side: 'left' | 'right'
  values: KneeOsteophytesState
  onToggle: (key: KneeOsteophyteZoneKey) => void
}) {
  const zones = KNEE_OSTEOPHYTE_ZONES.filter((zone) => zone.side === side)

  return (
    <div className="xray-joint-space-column">
      <div className="xray-joint-space-column-title">{title}</div>
      <div className="xray-knee-osteophytes-list">
        {zones.map((zone) => (
          <button
            key={zone.key}
            type="button"
            className={`xray-joint-space-chip xray-knee-osteophytes-chip${values[zone.key] ? ' is-active' : ''}`}
            onClick={() => onToggle(zone.key)}
          >
            {zone.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function XRayKneeOsteophytesModal({
  isOpen,
  values,
  onClose,
  onToggle,
  onAdd,
}: XRayKneeOsteophytesModalProps) {
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
        aria-label="Остеофиты"
      >
        <button
          type="button"
          className="reminders-modal-close"
          onClick={onClose}
          aria-label="Закрыть окно остеофитов"
        >
          ×
        </button>

        <div className="xray-joint-space-layout">
          <OsteophyteColumn
            title="Правый коленный сустав"
            side="right"
            values={values}
            onToggle={onToggle}
          />
          <OsteophyteColumn
            title="Левый коленный сустав"
            side="left"
            values={values}
            onToggle={onToggle}
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
