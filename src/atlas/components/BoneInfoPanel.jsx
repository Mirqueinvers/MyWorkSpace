import { useMemo } from 'react'
import bones from '../data/bones.json'

function formatGroupLabel(group) {
  switch (group) {
    case 'axial':
      return '\u041e\u0441\u0435\u0432\u043e\u0439 \u0441\u043a\u0435\u043b\u0435\u0442'
    case 'upper_limb':
      return '\u0412\u0435\u0440\u0445\u043d\u044f\u044f \u043a\u043e\u043d\u0435\u0447\u043d\u043e\u0441\u0442\u044c'
    case 'lower_limb':
      return '\u041d\u0438\u0436\u043d\u044f\u044f \u043a\u043e\u043d\u0435\u0447\u043d\u043e\u0441\u0442\u044c'
    default:
      return group ?? '\u2014'
  }
}

export function BoneInfoPanel({ selectedBoneId = null }) {
  const selectedBone = useMemo(
    () => bones.find((bone) => bone.id === selectedBoneId) ?? null,
    [selectedBoneId],
  )

  if (!selectedBone) {
    return (
      <aside className="atlas-bone-info" aria-live="polite">
        <p className="atlas-bone-info__empty">
          {'\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u043a\u043e\u0441\u0442\u044c'}
        </p>
      </aside>
    )
  }

  return (
    <aside className="atlas-bone-info" aria-live="polite">
      <div className="atlas-bone-info__section">
        <div className="atlas-bone-info__label">
          {'\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435'}
        </div>
        <div className="atlas-bone-info__title">{selectedBone.name_ru}</div>
      </div>

      <div className="atlas-bone-info__section">
        <div className="atlas-bone-info__label">
          {'\u041b\u0430\u0442\u0438\u043d\u0441\u043a\u043e\u0435 \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435'}
        </div>
        <div className="atlas-bone-info__value atlas-bone-info__value--latin">
          {selectedBone.name_la}
        </div>
      </div>

      <div className="atlas-bone-info__section">
        <div className="atlas-bone-info__label">
          {'\u0413\u0440\u0443\u043f\u043f\u0430'}
        </div>
        <div className="atlas-bone-info__value">
          {formatGroupLabel(selectedBone.group)}
        </div>
      </div>

      <div className="atlas-bone-info__section">
        <div className="atlas-bone-info__label">
          {'\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435'}
        </div>
        <p className="atlas-bone-info__description">
          {selectedBone.description}
        </p>
      </div>
    </aside>
  )
}

export default BoneInfoPanel
