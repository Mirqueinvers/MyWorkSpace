const JOINT_SPACE_STATUS_OPTIONS = ['Сужена', 'Расширена', 'Не изменена'] as const
const JOINT_SPACE_DEGREE_OPTIONS = [
  'Преимущественно',
  'Незначительно',
  'Умеренно',
  'Выраженно',
  'Резко',
] as const
const JOINT_SPACE_UNIFORMITY_OPTIONS = ['Равномерно', 'Не равномерно'] as const

export interface JointSpaceSelection {
  status: string
  degree: string
  uniformity: string
}

type JointSpaceSectionKey = 'rightLateral' | 'rightMedial' | 'leftLateral' | 'leftMedial'

interface XRayJointSpaceModalProps {
  isOpen: boolean
  values: Record<JointSpaceSectionKey, JointSpaceSelection>
  onClose: () => void
  onChange: (
    section: JointSpaceSectionKey,
    field: keyof JointSpaceSelection,
    value: string,
  ) => void
  onAdd: () => void
}

function OptionGroup({
  title,
  options,
  value,
  onSelect,
}: {
  title: string
  options: readonly string[]
  value: string
  onSelect: (option: string) => void
}) {
  return (
    <div className="xray-joint-space-group">
      <div className="xray-joint-space-group-title">{title}</div>
      <div className="xray-joint-space-chips">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={`xray-joint-space-chip${value === option ? ' is-active' : ''}`}
            onClick={() => onSelect(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}

function JointSideCard({
  title,
  sectionKey,
  value,
  onChange,
}: {
  title: string
  sectionKey: JointSpaceSectionKey
  value: JointSpaceSelection
  onChange: (
    section: JointSpaceSectionKey,
    field: keyof JointSpaceSelection,
    value: string,
  ) => void
}) {
  return (
    <div className="xray-joint-space-side">
      <div className="xray-joint-space-side-title">{title}</div>

      <OptionGroup
        title="Изменение"
        options={JOINT_SPACE_STATUS_OPTIONS}
        value={value.status}
        onSelect={(nextValue) => onChange(sectionKey, 'status', nextValue)}
      />

      <OptionGroup
        title="Степень"
        options={JOINT_SPACE_DEGREE_OPTIONS}
        value={value.degree}
        onSelect={(nextValue) => onChange(sectionKey, 'degree', nextValue)}
      />

      <OptionGroup
        title="Характер"
        options={JOINT_SPACE_UNIFORMITY_OPTIONS}
        value={value.uniformity}
        onSelect={(nextValue) => onChange(sectionKey, 'uniformity', nextValue)}
      />
    </div>
  )
}

function JointColumn({
  title,
  lateralKey,
  medialKey,
  lateralValue,
  medialValue,
  isRightJoint,
  onChange,
}: {
  title: string
  lateralKey: JointSpaceSectionKey
  medialKey: JointSpaceSectionKey
  lateralValue: JointSpaceSelection
  medialValue: JointSpaceSelection
  isRightJoint: boolean
  onChange: (
    section: JointSpaceSectionKey,
    field: keyof JointSpaceSelection,
    value: string,
  ) => void
}) {
  const sideCards = isRightJoint
    ? [
        {
          title: 'Латеральная',
          sectionKey: lateralKey,
          value: lateralValue,
        },
        {
          title: 'Медиальная',
          sectionKey: medialKey,
          value: medialValue,
        },
      ]
    : [
        {
          title: 'Медиальная',
          sectionKey: medialKey,
          value: medialValue,
        },
        {
          title: 'Латеральная',
          sectionKey: lateralKey,
          value: lateralValue,
        },
      ]

  return (
    <div className="xray-joint-space-column">
      <div className="xray-joint-space-column-title">{title}</div>

      <div className="xray-joint-space-sides">
        {sideCards.map((side) => (
          <JointSideCard
            key={side.sectionKey}
            title={side.title}
            sectionKey={side.sectionKey}
            value={side.value}
            onChange={onChange}
          />
        ))}
      </div>
    </div>
  )
}

export function XRayJointSpaceModal({
  isOpen,
  values,
  onClose,
  onChange,
  onAdd,
}: XRayJointSpaceModalProps) {
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
        aria-label="Суставные щели"
      >
        <button
          type="button"
          className="reminders-modal-close"
          onClick={onClose}
          aria-label="Закрыть окно суставных щелей"
        >
          ×
        </button>

        <div className="xray-joint-space-layout">
          <JointColumn
            title="Правый коленный сустав"
            lateralKey="rightLateral"
            medialKey="rightMedial"
            lateralValue={values.rightLateral}
            medialValue={values.rightMedial}
            isRightJoint
            onChange={onChange}
          />

          <JointColumn
            title="Левый коленный сустав"
            lateralKey="leftLateral"
            medialKey="leftMedial"
            lateralValue={values.leftLateral}
            medialValue={values.leftMedial}
            isRightJoint={false}
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
