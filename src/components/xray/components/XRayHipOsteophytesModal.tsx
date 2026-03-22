import type { HipOsteophytesState } from '../helpers/generateHipDescriptions'

const HIP_OSTEOPHYTE_ZONES = [
  { key: 'rightLateral', label: 'Латеральная поверхность крыши правой вертлужной впадины' },
  { key: 'rightMedial', label: 'Медиальная поверхность правой вертлужной впадины' },
  { key: 'leftMedial', label: 'Медиальная поверхность левой вертлужной впадины' },
  { key: 'leftLateral', label: 'Латеральная поверхность крыши левой вертлужной впадины' },
  { key: 'rightGreaterTrochanter', label: 'Край большого вертела правой бедренной кости' },
  { key: 'leftGreaterTrochanter', label: 'Край большого вертела левой бедренной кости' },
] as const

interface XRayHipOsteophytesModalProps {
  isOpen: boolean
  values: HipOsteophytesState
  onClose: () => void
  onToggle: (key: keyof HipOsteophytesState) => void
  onAdd: () => void
}

export function XRayHipOsteophytesModal({
  isOpen,
  values,
  onClose,
  onToggle,
  onAdd,
}: XRayHipOsteophytesModalProps) {
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
        aria-label="Остеофиты тазобедренных суставов"
      >
        <button type="button" className="reminders-modal-close" onClick={onClose} aria-label="Закрыть окно">
          ×
        </button>

        <div className="xray-knee-osteophytes-list">
          {HIP_OSTEOPHYTE_ZONES.map((zone) => (
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

        <div className="xray-joint-space-actions">
          <button type="button" className="primary-button" onClick={onAdd}>
            Добавить
          </button>
        </div>
      </section>
    </div>
  )
}
