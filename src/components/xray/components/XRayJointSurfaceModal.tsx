import type { KneeJointSurfaceState } from '../helpers/generateKneeJointSpaceDescription'

const JOINT_SURFACE_OPTIONS = [
  'Поверхность гладкая',
  'Незначительные изменения',
  'Умеренные изменения',
  'Выраженные изменения',
  'Резкие изменения',
] as const

type JointSurfaceSectionKey = keyof KneeJointSurfaceState

interface XRayJointSurfaceModalProps {
  isOpen: boolean
  values: KneeJointSurfaceState
  onClose: () => void
  onDegreeChange: (section: JointSurfaceSectionKey, value: string) => void
  onTogglePredominantly: (section: JointSurfaceSectionKey) => void
  onAdd: () => void
}

function JointSurfaceZoneCard({
  title,
  sectionKey,
  degree,
  predominantly,
  onDegreeChange,
  onTogglePredominantly,
}: {
  title: string
  sectionKey: JointSurfaceSectionKey
  degree: string
  predominantly: boolean
  onDegreeChange: (section: JointSurfaceSectionKey, value: string) => void
  onTogglePredominantly: (section: JointSurfaceSectionKey) => void
}) {
  return (
    <div className="xray-joint-space-side">
      <div className="xray-joint-space-side-title">{title}</div>

      <div className="xray-joint-space-chips">
        {JOINT_SURFACE_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            className={`xray-joint-space-chip${degree === option ? ' is-active' : ''}`}
            onClick={() => onDegreeChange(sectionKey, option)}
          >
            {option}
          </button>
        ))}
      </div>

      <button
        type="button"
        className={`xray-joint-space-chip xray-joint-space-chip-secondary${predominantly ? ' is-active' : ''}`}
        onClick={() => onTogglePredominantly(sectionKey)}
      >
        Преимущественно
      </button>
    </div>
  )
}

function JointSurfaceColumn({
  title,
  isRightJoint,
  values,
  onDegreeChange,
  onTogglePredominantly,
}: {
  title: string
  isRightJoint: boolean
  values: KneeJointSurfaceState
  onDegreeChange: (section: JointSurfaceSectionKey, value: string) => void
  onTogglePredominantly: (section: JointSurfaceSectionKey) => void
}) {
  const sections = isRightJoint
    ? [
        { key: 'rightLateral' as const, title: 'Латеральная' },
        { key: 'rightMedial' as const, title: 'Медиальная' },
      ]
    : [
        { key: 'leftMedial' as const, title: 'Медиальная' },
        { key: 'leftLateral' as const, title: 'Латеральная' },
      ]

  return (
    <div className="xray-joint-space-column">
      <div className="xray-joint-space-column-title">{title}</div>

      <div className="xray-joint-space-sides">
        {sections.map((section) => (
          <JointSurfaceZoneCard
            key={section.key}
            title={section.title}
            sectionKey={section.key}
            degree={values[section.key].degree}
            predominantly={values[section.key].predominantly}
            onDegreeChange={onDegreeChange}
            onTogglePredominantly={onTogglePredominantly}
          />
        ))}
      </div>
    </div>
  )
}

export function XRayJointSurfaceModal({
  isOpen,
  values,
  onClose,
  onDegreeChange,
  onTogglePredominantly,
  onAdd,
}: XRayJointSurfaceModalProps) {
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
        aria-label="Суставные поверхности"
      >
        <button
          type="button"
          className="reminders-modal-close"
          onClick={onClose}
          aria-label="Закрыть окно суставных поверхностей"
        >
          ×
        </button>

        <div className="xray-joint-space-layout">
          <JointSurfaceColumn
            title="Правый коленный сустав"
            isRightJoint
            values={values}
            onDegreeChange={onDegreeChange}
            onTogglePredominantly={onTogglePredominantly}
          />
          <JointSurfaceColumn
            title="Левый коленный сустав"
            isRightJoint={false}
            values={values}
            onDegreeChange={onDegreeChange}
            onTogglePredominantly={onTogglePredominantly}
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
