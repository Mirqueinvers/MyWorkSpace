import { useMemo } from 'react'
import bones from '../data/bones.json'

function formatGroupLabel(group) {
  switch (group) {
    case 'axial':
      return 'Осевой скелет'
    case 'upper_limb':
      return 'Верхняя конечность'
    case 'lower_limb':
      return 'Нижняя конечность'
    default:
      return group ?? '—'
  }
}

function getBoneDisplayName(bone, displayLanguage) {
  return displayLanguage === 'la' ? bone.name_la : bone.name_ru
}

function getBoneSecondaryName(bone, displayLanguage) {
  return displayLanguage === 'la' ? bone.name_ru : bone.name_la
}

export function BoneInfoPanel({
  displayLanguage = 'ru',
  selectedBoneId = null,
}) {
  const selectedBone = useMemo(
    () => bones.find((bone) => bone.id === selectedBoneId) ?? null,
    [selectedBoneId],
  )

  if (!selectedBone) {
    return (
      <aside className="atlas-bone-info" aria-live="polite">
        <p className="atlas-bone-info__empty">Выберите кость</p>
      </aside>
    )
  }

  const primaryName = getBoneDisplayName(selectedBone, displayLanguage)
  const secondaryName = getBoneSecondaryName(selectedBone, displayLanguage)

  return (
    <aside className="atlas-bone-info" aria-live="polite">
      <div className="atlas-bone-info__section">
        <div className="atlas-bone-info__label">
          {displayLanguage === 'la' ? 'Латинское название' : 'Русское название'}
        </div>
        <div className="atlas-bone-info__title">{primaryName}</div>
      </div>

      {secondaryName ? (
        <div className="atlas-bone-info__section">
          <div className="atlas-bone-info__label">
            {displayLanguage === 'la'
              ? 'Русское название'
              : 'Латинское название'}
          </div>
          <div className="atlas-bone-info__value atlas-bone-info__value--latin">
            {secondaryName}
          </div>
        </div>
      ) : null}

      <div className="atlas-bone-info__section">
        <div className="atlas-bone-info__label">Группа</div>
        <div className="atlas-bone-info__value">
          {formatGroupLabel(selectedBone.group)}
        </div>
      </div>

      <div className="atlas-bone-info__section">
        <div className="atlas-bone-info__label">Описание</div>
        <p className="atlas-bone-info__description">
          {selectedBone.description}
        </p>
      </div>
    </aside>
  )
}

export default BoneInfoPanel
