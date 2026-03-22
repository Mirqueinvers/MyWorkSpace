import type {
  AnkleOsteophytesState,
} from '../helpers/generateAnkleDescriptions'

type AnkleOsteophyteKey = keyof AnkleOsteophytesState

const ANKLE_OSTEOPHYTE_COLUMNS: Array<{
  title: string
  items: Array<{ key: AnkleOsteophyteKey; label: string }>
}> = [
  {
    title: 'Правый голеностопный сустав',
    items: [
      { key: 'rightLateral', label: 'Латеральная поверхность' },
      { key: 'rightMedial', label: 'Медиальная поверхность' },
    ],
  },
  {
    title: 'Левый голеностопный сустав',
    items: [
      { key: 'leftLateral', label: 'Латеральная поверхность' },
      { key: 'leftMedial', label: 'Медиальная поверхность' },
    ],
  },
]

interface XRayAnkleOsteophytesModalProps {
  isOpen: boolean
  values: AnkleOsteophytesState
  onClose: () => void
  onToggle: (key: AnkleOsteophyteKey) => void
  onAdd: () => void
}

export function XRayAnkleOsteophytesModal({
  isOpen,
  values,
  onClose,
  onToggle,
  onAdd,
}: XRayAnkleOsteophytesModalProps) {
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
        aria-label="Остеофиты голеностопных суставов"
      >
        <button
          type="button"
          className="reminders-modal-close"
          onClick={onClose}
          aria-label="Закрыть окно остеофитов голеностопных суставов"
        >
          ×
        </button>

        <div className="xray-knee-choice-title">Остеофиты</div>

        <div className="xray-joint-space-layout">
          {ANKLE_OSTEOPHYTE_COLUMNS.map((column) => (
            <div key={column.title} className="xray-joint-space-column">
              <div className="xray-joint-space-column-title">{column.title}</div>
              <div className="xray-knee-osteophytes-list">
                {column.items.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    className={`xray-joint-space-chip xray-knee-osteophytes-chip${values[item.key] ? ' is-active' : ''}`}
                    onClick={() => onToggle(item.key)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
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
