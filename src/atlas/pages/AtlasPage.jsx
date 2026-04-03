import { useState } from 'react'
import skeletonBackSvg from '../assets/atlas/skeleton-back.svg?raw'
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

const ATLAS_VIEW_OPTIONS = [
  { id: 'front', label: 'Спереди' },
  { id: 'back', label: 'Сзади' },
]

const ATLAS_LANGUAGE_OPTIONS = [
  { id: 'ru', label: 'RU' },
  { id: 'la', label: 'LA' },
]

export function AtlasPage() {
  const [selectedBoneId, setSelectedBoneId] = useState(null)
  const [activeGroup, setActiveGroup] = useState('all')
  const [activeView, setActiveView] = useState('front')
  const [displayLanguage, setDisplayLanguage] = useState('ru')

  const activeSvgMarkup =
    activeView === 'back' ? skeletonBackSvg : skeletonFrontSvg

  return (
    <section className="atlas-page">
      <div className="content-card atlas-card atlas-card-compact">
        <div className="atlas-layout">
          <div className="atlas-main">
            <div className="atlas-toolbar">
              <div
                className="atlas-group-filter"
                role="tablist"
                aria-label="Фильтр костей по группам"
              >
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

              <div className="atlas-toolbar__toggles">
                <div
                  className="atlas-view-toggle"
                  role="tablist"
                  aria-label="Вид атласа"
                >
                  {ATLAS_VIEW_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={
                        activeView === option.id
                          ? 'atlas-view-toggle__button is-active'
                          : 'atlas-view-toggle__button'
                      }
                      onClick={() => setActiveView(option.id)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                <div
                  className="atlas-language-toggle"
                  role="tablist"
                  aria-label="Язык названий костей"
                >
                  {ATLAS_LANGUAGE_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={
                        displayLanguage === option.id
                          ? 'atlas-language-toggle__button is-active'
                          : 'atlas-language-toggle__button'
                      }
                      onClick={() => setDisplayLanguage(option.id)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <SkeletonAtlas
              view={activeView}
              svgMarkup={activeSvgMarkup}
              activeGroup={activeGroup}
              displayLanguage={displayLanguage}
              selectedBoneId={selectedBoneId}
              onBoneSelect={(boneId) => setSelectedBoneId(boneId)}
            />
          </div>

          <div className="atlas-side">
            <BoneSearch
              displayLanguage={displayLanguage}
              selectedBoneId={selectedBoneId}
              onSelectBone={setSelectedBoneId}
            />
            <BoneInfoPanel
              displayLanguage={displayLanguage}
              selectedBoneId={selectedBoneId}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default AtlasPage
