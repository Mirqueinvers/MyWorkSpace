import {
  HAND_DEGREES,
  HAND_JOINTS,
  type HandDegree,
  type HandJointKey,
  type HandSelectionState,
} from '../helpers/generateHandDescriptions'

interface XRayHandJointMapModalProps {
  isOpen: boolean
  title: string
  values: HandSelectionState
  mode: 'degrees' | 'toggle'
  activeDegree?: HandDegree
  onClose: () => void
  onActiveDegreeChange?: (value: HandDegree) => void
  onToggle: (key: HandJointKey) => void
  onAdd: () => void
}

function HandJointColumn({
  title,
  side,
  values,
  mode,
  activeDegree,
  onToggle,
}: {
  title: string
  side: 'left' | 'right'
  values: HandSelectionState
  mode: 'degrees' | 'toggle'
  activeDegree?: HandDegree
  onToggle: (key: HandJointKey) => void
}) {
  const joints = HAND_JOINTS.filter((joint) => joint.side === side)
  const groups = ['Cmc', 'Mcp', 'Pip', 'Dip', 'Ip', 'Wrist'] as const
  const groupLabels = {
    Cmc: 'Пястно-запястные',
    Mcp: 'Пястно-фаланговые',
    Pip: 'Проксимальные межфаланговые',
    Dip: 'Дистальные межфаланговые',
    Ip: 'Межфаланговый I пальца',
    Wrist: 'Лучезапястный',
  } as const

  return (
    <div className="xray-joint-space-column">
      <div className="xray-joint-space-column-title">{title}</div>
      {groups.map((group) => {
        const groupJoints = joints.filter((joint) => joint.group === group)
        if (!groupJoints.length) return null

        return (
          <div key={group} className="xray-joint-space-side">
            <div className="xray-joint-space-side-title">{groupLabels[group]}</div>
            <div className="xray-knee-osteophytes-list xray-foot-joint-list">
              {groupJoints.map((joint) => {
                const isActive =
                  mode === 'degrees'
                    ? Boolean(activeDegree && values[joint.key][activeDegree])
                    : Boolean(values[joint.key].selected)

                return (
                  <button
                    key={joint.key}
                    type="button"
                    className={`xray-joint-space-chip xray-knee-osteophytes-chip xray-foot-joint-chip${isActive ? ' is-active' : ''}`}
                    onClick={() => onToggle(joint.key)}
                  >
                    {joint.label}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function XRayHandJointMapModal({
  isOpen,
  title,
  values,
  mode,
  activeDegree,
  onClose,
  onActiveDegreeChange,
  onToggle,
  onAdd,
}: XRayHandJointMapModalProps) {
  if (!isOpen) return null

  return (
    <div className="reminders-modal-overlay xray-top-overlay">
      <section
        className="reminders-modal xray-study-description-modal xray-joint-space-modal xray-foot-joint-modal xray-top-modal"
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

        <div className="xray-knee-choice-title">{title}</div>

        {mode === 'degrees' ? (
          <div className="xray-knee-osteophytes-list">
            {HAND_DEGREES.map((degree) => (
              <button
                key={degree}
                type="button"
                className={`xray-joint-space-chip xray-knee-osteophytes-chip${activeDegree === degree ? ' is-active' : ''}`}
                onClick={() => onActiveDegreeChange?.(degree)}
              >
                {degree}
              </button>
            ))}
          </div>
        ) : null}

        <div className="xray-joint-space-layout">
          <HandJointColumn
            title="Правая кисть"
            side="right"
            values={values}
            mode={mode}
            activeDegree={activeDegree}
            onToggle={onToggle}
          />
          <HandJointColumn
            title="Левая кисть"
            side="left"
            values={values}
            mode={mode}
            activeDegree={activeDegree}
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
