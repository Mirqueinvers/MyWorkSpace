import type {
  ShoulderAcromioclavicularSideState,
  ShoulderAcromioclavicularState,
} from '../helpers/generateShoulderDescriptions'

const JOINT_SPACE_OPTIONS: Array<ShoulderAcromioclavicularSideState['jointSpace']> = [
  'незначительно сужена',
  'умеренно сужена',
  'выраженно сужена',
  'резко сужена',
]

const JOINT_SURFACE_OPTIONS: Array<ShoulderAcromioclavicularSideState['jointSurface']> = [
  'незначительно склерозированы',
  'умеренно склерозированы',
  'выраженно склерозированы',
]

const OSTEOPHYTE_OPTIONS: Array<NonNullable<ShoulderAcromioclavicularSideState['osteophytes'][number]>> = [
  'по верхнему краю',
  'по нижнему краю',
]

interface XRayShoulderAcromioclavicularModalProps {
  isOpen: boolean
  values: ShoulderAcromioclavicularState
  onClose: () => void
  onNormalToggle: (side: 'left' | 'right') => void
  onJointSpaceChange: (
    side: 'left' | 'right',
    value: ShoulderAcromioclavicularSideState['jointSpace'],
  ) => void
  onJointSurfaceChange: (
    side: 'left' | 'right',
    value: ShoulderAcromioclavicularSideState['jointSurface'],
  ) => void
  onOsteophytesToggle: (
    side: 'left' | 'right',
    value: NonNullable<ShoulderAcromioclavicularSideState['osteophytes'][number]>,
  ) => void
  onAdd: () => void
}

export function XRayShoulderAcromioclavicularModal({
  isOpen,
  values,
  onClose,
  onNormalToggle,
  onJointSpaceChange,
  onJointSurfaceChange,
  onOsteophytesToggle,
  onAdd,
}: XRayShoulderAcromioclavicularModalProps) {
  if (!isOpen) return null

  const renderSide = (side: 'left' | 'right', title: string, data: ShoulderAcromioclavicularSideState) => (
    <div className="xray-joint-space-column">
      <div className="xray-joint-space-column-title">{title}</div>
      <button
        type="button"
        className={`xray-side-tool-chip xray-knee-choice-chip ${data.isNormal ? 'is-active' : ''}`}
        onClick={() => onNormalToggle(side)}
      >
        Норма
      </button>
      <div className="xray-knee-choice-list">
        {JOINT_SPACE_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            className={`xray-side-tool-chip xray-knee-choice-chip ${
              data.jointSpace === option ? 'is-active' : ''
            }`}
            onClick={() => onJointSpaceChange(side, option)}
          >
            {option}
          </button>
        ))}
      </div>
      <div className="xray-knee-choice-list">
        {JOINT_SURFACE_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            className={`xray-side-tool-chip xray-knee-choice-chip ${
              data.jointSurface === option ? 'is-active' : ''
            }`}
            onClick={() => onJointSurfaceChange(side, option)}
          >
            {option}
          </button>
        ))}
      </div>
      <div className="xray-knee-choice-list">
        {OSTEOPHYTE_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            className={`xray-side-tool-chip xray-knee-choice-chip ${
              data.osteophytes.includes(option) ? 'is-active' : ''
            }`}
            onClick={() => onOsteophytesToggle(side, option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div className="reminders-modal-overlay xray-top-overlay">
      <section
        className="reminders-modal xray-study-description-modal xray-joint-space-modal xray-top-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Ключично-акромиальные сочленения"
      >
        <button type="button" className="reminders-modal-close" onClick={onClose} aria-label="Закрыть окно ключично-акромиальных сочленений">
          ×
        </button>
        <h3 className="xray-knee-choice-title">Ключично-акромиальные сочленения</h3>
        <div className="xray-joint-space-layout">
          {renderSide('left', 'Левое сочленение', values.left)}
          {renderSide('right', 'Правое сочленение', values.right)}
        </div>
        <button type="button" className="primary-button xray-spine-add-button" onClick={onAdd}>
          Добавить
        </button>
      </section>
    </div>
  )
}
