interface FlatfootSideValues {
  angle: string
  height: string
}

interface FlatfootValues {
  right: FlatfootSideValues
  left: FlatfootSideValues
}

interface XRayFlatfootModalProps {
  isOpen: boolean
  values: FlatfootValues
  onClose: () => void
  onChange: (side: 'left' | 'right', field: 'angle' | 'height', value: string) => void
  onAdd: () => void
}

function getDegreeByAngle(angle: string) {
  const value = Number.parseFloat(angle)
  if (Number.isNaN(value)) return 0
  if (value <= 130) return 0
  if (value <= 140) return 1
  if (value <= 155) return 2
  return 3
}

function getDegreeByHeight(height: string) {
  const value = Number.parseFloat(height)
  if (Number.isNaN(value)) return 0
  if (value >= 36) return 0
  if (value >= 25) return 1
  if (value >= 17) return 2
  return 3
}

function degreeText(degree: number) {
  switch (degree) {
    case 0:
      return 'норме'
    case 1:
      return 'I степени плоскостопия'
    case 2:
      return 'II степени плоскостопия'
    case 3:
      return 'III степени плоскостопия'
    default:
      return ''
  }
}

function FlatfootSideCard({
  side,
  values,
  onChange,
}: {
  side: 'left' | 'right'
  values: FlatfootSideValues
  onChange: (field: 'angle' | 'height', value: string) => void
}) {
  const degree =
    values.angle || values.height
      ? Math.max(getDegreeByAngle(values.angle), getDegreeByHeight(values.height))
      : null

  return (
    <div className="xray-joint-space-column">
      <div className="xray-joint-space-column-title">
        {side === 'left' ? 'Левая стопа' : 'Правая стопа'}
      </div>

      <label className="field">
        <span>Угол свода (°)</span>
        <input
          type="number"
          value={values.angle}
          onChange={(event) => onChange('angle', event.target.value)}
        />
      </label>

      <label className="field">
        <span>Высота свода (мм)</span>
        <input
          type="number"
          value={values.height}
          onChange={(event) => onChange('height', event.target.value)}
        />
      </label>

      {degree !== null ? (
        <div className="xray-flatfoot-degree">Соответствует {degreeText(degree)}</div>
      ) : null}
    </div>
  )
}

export function XRayFlatfootModal({
  isOpen,
  values,
  onClose,
  onChange,
  onAdd,
}: XRayFlatfootModalProps) {
  if (!isOpen) return null

  return (
    <div className="reminders-modal-overlay xray-top-overlay">
      <section
        className="reminders-modal xray-study-description-modal xray-joint-space-modal xray-flatfoot-modal xray-top-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Оценка плоскостопия"
      >
        <button
          type="button"
          className="reminders-modal-close"
          onClick={onClose}
          aria-label="Закрыть окно оценки плоскостопия"
        >
          ×
        </button>

        <div className="xray-knee-choice-title">Плоскостопие</div>

        <div className="xray-joint-space-layout">
          <FlatfootSideCard
            side="right"
            values={values.right}
            onChange={(field, value) => onChange('right', field, value)}
          />
          <FlatfootSideCard
            side="left"
            values={values.left}
            onChange={(field, value) => onChange('left', field, value)}
          />
        </div>

        <div className="xray-flatfoot-table-wrap">
          <table className="xray-flatfoot-table">
            <thead>
              <tr>
                <th>Степень</th>
                <th>Угол свода</th>
                <th>Высота свода</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Норма</td>
                <td>&le;130°</td>
                <td>&ge;36 мм</td>
              </tr>
              <tr>
                <td>I ст.</td>
                <td>131-140°</td>
                <td>25-35 мм</td>
              </tr>
              <tr>
                <td>II ст.</td>
                <td>141-155°</td>
                <td>17-24 мм</td>
              </tr>
              <tr>
                <td>III ст.</td>
                <td>&gt;155°</td>
                <td>&lt;17 мм</td>
              </tr>
            </tbody>
          </table>
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
