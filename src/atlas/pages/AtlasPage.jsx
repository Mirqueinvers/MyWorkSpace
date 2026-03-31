import { useState } from 'react'
import skeletonFrontSvg from '../assets/atlas/skeleton-front.svg?raw'
import BoneInfoPanel from '../components/BoneInfoPanel'
import BoneSearch from '../components/BoneSearch'
import SkeletonAtlas from '../components/SkeletonAtlas'

const ATLAS_GROUP_OPTIONS = [
  { id: 'all', label: 'Все' },
  { id: 'axial', label: 'Осевой скелет' },
  { id: 'upper_limb', label: 'Верхняя конечность' },
  { id: 'lower_limb', label: 'Нижняя конечность' },
]

export function AtlasPage() {
  const [selectedBoneId, setSelectedBoneId] = useState(null)
  const [activeGroup, setActiveGroup] = useState('all')

  return (
    <section className="atlas-page">
      <div className="content-card atlas-card atlas-card-compact">
        <div className="atlas-layout">
          <div className="atlas-main">
            <div className="atlas-group-filter" role="tablist" aria-label="Фильтр костей по группам">
              {ATLAS_GROUP_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={
                    activeGroup === option.id
                      ? 'atlas-group-filter__button is-active'
                      : 'atlas-group-filter__button'
                  }
                  onClick={() => setActiveGroup(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <SkeletonAtlas
              svgMarkup={skeletonFrontSvg}
              activeGroup={activeGroup}
              selectedBoneId={selectedBoneId}
              onBoneSelect={(boneId) => setSelectedBoneId(boneId)}
            />
          </div>
          <div className="atlas-side">
            <BoneSearch
              selectedBoneId={selectedBoneId}
              onSelectBone={setSelectedBoneId}
            />
            <BoneInfoPanel selectedBoneId={selectedBoneId} />
          </div>
        </div>
      </div>
    </section>
  )
}

export default AtlasPage
