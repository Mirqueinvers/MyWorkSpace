import { useMemo, useState } from 'react'
import bones from '../data/bones.json'

function normalizeValue(value) {
  return String(value ?? '').trim().toLowerCase()
}

export function BoneSearch({ selectedBoneId = null, onSelectBone }) {
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
        placeholder={
          '\u041f\u043e\u0438\u0441\u043a \u043a\u043e\u0441\u0442\u0438'
        }
      />

      {normalizedQuery ? (
        <div className="atlas-bone-search__results">
          {filteredBones.length > 0 ? (
            filteredBones.map((bone) => (
              <button
                key={bone.id}
                type="button"
                className={`atlas-bone-search__item${
                  bone.id === selectedBoneId ? ' is-selected' : ''
                }`}
                onClick={() => handleSelect(bone.id)}
              >
                <span className="atlas-bone-search__item-title">
                  {bone.name_ru}
                </span>
                <span className="atlas-bone-search__item-subtitle">
                  {bone.name_la}
                </span>
              </button>
            ))
          ) : (
            <div className="atlas-bone-search__empty">
              {
                '\u041d\u0438\u0447\u0435\u0433\u043e \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u043e'
              }
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}

export default BoneSearch
