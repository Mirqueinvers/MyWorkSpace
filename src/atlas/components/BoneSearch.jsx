import { useMemo, useState } from 'react'
import bones from '../data/bones.json'

function normalizeValue(value) {
  return String(value ?? '').trim().toLowerCase()
}

function getBoneDisplayName(bone, displayLanguage) {
  return displayLanguage === 'la' ? bone.name_la : bone.name_ru
}

function getBoneSecondaryName(bone, displayLanguage) {
  return displayLanguage === 'la' ? bone.name_ru : bone.name_la
}

export function BoneSearch({
  displayLanguage = 'ru',
  selectedBoneId = null,
  onSelectBone,
}) {
  const [query, setQuery] = useState('')

  const normalizedQuery = normalizeValue(query)

  const filteredBones = useMemo(() => {
    if (!normalizedQuery) {
      return []
    }

    return bones.filter((bone) => {
      const nameRu = normalizeValue(bone.name_ru)
      const nameLa = normalizeValue(bone.name_la)

      return (
        nameRu.includes(normalizedQuery) || nameLa.includes(normalizedQuery)
      )
    })
  }, [normalizedQuery])

  const handleSelect = (boneId) => {
    if (typeof onSelectBone === 'function') {
      onSelectBone(boneId)
    }
  }

  return (
    <div className="atlas-bone-search">
      <input
        type="text"
        className="atlas-bone-search__input"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={'Поиск кости'}
      />

      {normalizedQuery ? (
        <div className="atlas-bone-search__results">
          {filteredBones.length > 0 ? (
            filteredBones.map((bone) => {
              const primaryName = getBoneDisplayName(bone, displayLanguage)
              const secondaryName = getBoneSecondaryName(
                bone,
                displayLanguage,
              )

              return (
                <button
                  key={bone.id}
                  type="button"
                  className={`atlas-bone-search__item${
                    bone.id === selectedBoneId ? ' is-selected' : ''
                  }`}
                  onClick={() => handleSelect(bone.id)}
                >
                  <span className="atlas-bone-search__item-title">
                    {primaryName}
                  </span>
                  {secondaryName ? (
                    <span className="atlas-bone-search__item-subtitle">
                      {secondaryName}
                    </span>
                  ) : null}
                </button>
              )
            })
          ) : (
            <div className="atlas-bone-search__empty">Ничего не найдено</div>
          )}
        </div>
      ) : null}
    </div>
  )
}

export default BoneSearch
