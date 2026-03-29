import skeletonFrontSvg from '../assets/atlas/skeleton-front.svg?raw'
import SkeletonAtlas from '../components/SkeletonAtlas'

export function AtlasPage() {
  return (
    <section className="atlas-page">
      <div className="content-card atlas-card atlas-card-compact">
        <SkeletonAtlas svgMarkup={skeletonFrontSvg} />
      </div>
    </section>
  )
}

export default AtlasPage
