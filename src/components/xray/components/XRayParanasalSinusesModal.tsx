import type {
  ParanasalSinusState,
  ParanasalSinusesSelectionState,
} from '../helpers/generateParanasalDescriptions'

const MUCOSA_OPTIONS: Array<ParanasalSinusState['mucosa']> = ['не изменена', 'утолщена']
const FLUID_OPTIONS: Array<ParanasalSinusState['fluid']> = ['не определяется', 'экссудат']
const PNEUMATIZATION_OPTIONS: Array<ParanasalSinusState['pneumatization']> = [
  'не изменена',
  'снижена',
]
const CONTOUR_OPTIONS: Array<ParanasalSinusState['contour']> = ['четкий', 'нечеткий']
const DEVELOPMENT_OPTIONS: Array<NonNullable<ParanasalSinusState['development']>> = [
  'недоразвита',
  'не развита',
]
const CYST_OPTIONS: Array<NonNullable<ParanasalSinusState['cyst']>> = ['определяется']

interface XRayParanasalSinusesModalProps {
  isOpen: boolean
  values: ParanasalSinusesSelectionState
  onClose: () => void
  onChange: (
    zone: keyof ParanasalSinusesSelectionState,
    field: keyof ParanasalSinusState,
    value: string,
  ) => void
  onAdd: () => void
}

function renderOptionGroup(
  title: string,
  selectedValue: string | undefined,
  options: readonly string[],
  onSelect: (value: string) => void,
) {
  return (
    <div className="xray-joint-space-group">
      <div className="xray-joint-space-group-title">{title}</div>
      <div className="xray-joint-space-chips xray-paranasal-chip-list">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={`xray-joint-space-chip${selectedValue === option ? ' is-active' : ''}`}
            onClick={() => onSelect(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}

function SinusCard({
  title,
  values,
  isFrontal,
  onChange,
}: {
  title: string
  values: ParanasalSinusState
  isFrontal: boolean
  onChange: (field: keyof ParanasalSinusState, value: string) => void
}) {
  return (
    <div className="xray-joint-space-column xray-paranasal-card">
      <div className="xray-joint-space-column-title">{title}</div>
      {renderOptionGroup('Слизистая', values.mucosa, MUCOSA_OPTIONS, (value) =>
        onChange('mucosa', value),
      )}
      {renderOptionGroup('Жидкость', values.fluid, FLUID_OPTIONS, (value) =>
        onChange('fluid', value),
      )}
      {renderOptionGroup('Пневматизация', values.pneumatization, PNEUMATIZATION_OPTIONS, (value) =>
        onChange('pneumatization', value),
      )}
      {renderOptionGroup('Контур', values.contour, CONTOUR_OPTIONS, (value) =>
        onChange('contour', value),
      )}
      {isFrontal
        ? renderOptionGroup('Развитие', values.development, DEVELOPMENT_OPTIONS, (value) =>
            onChange('development', value),
          )
        : renderOptionGroup('Киста', values.cyst, CYST_OPTIONS, (value) =>
            onChange('cyst', value),
          )}
    </div>
  )
}

export function XRayParanasalSinusesModal({
  isOpen,
  values,
  onClose,
  onChange,
  onAdd,
}: XRayParanasalSinusesModalProps) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="reminders-modal-overlay xray-top-overlay">
      <section
        className="reminders-modal xray-study-description-modal xray-joint-space-modal xray-paranasal-modal xray-top-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Придаточные пазухи"
      >
        <button
          type="button"
          className="reminders-modal-close"
          onClick={onClose}
          aria-label="Закрыть окно придаточных пазух"
        >
          ×
        </button>

        <h3 className="xray-knee-choice-title">Пазухи</h3>

        <div className="xray-paranasal-grid">
          <SinusCard
            title="Правая лобная пазуха"
            values={values.rightFrontal}
            isFrontal
            onChange={(field, value) => onChange('rightFrontal', field, value)}
          />
          <SinusCard
            title="Левая лобная пазуха"
            values={values.leftFrontal}
            isFrontal
            onChange={(field, value) => onChange('leftFrontal', field, value)}
          />
          <SinusCard
            title="Правая гайморова пазуха"
            values={values.rightMaxillary}
            isFrontal={false}
            onChange={(field, value) => onChange('rightMaxillary', field, value)}
          />
          <SinusCard
            title="Левая гайморова пазуха"
            values={values.leftMaxillary}
            isFrontal={false}
            onChange={(field, value) => onChange('leftMaxillary', field, value)}
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
