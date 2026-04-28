import type { AppSection } from '../../constants/navigation'
import { NAV_ITEMS } from '../../constants/navigation'

interface TopNavProps {
  activeSection: AppSection
  onSectionChange: (section: AppSection) => void
}

export function TopNav({ activeSection, onSectionChange }: TopNavProps) {
  return (
    <nav className="top-hud" aria-label="Основные разделы">
      {NAV_ITEMS.map((item) => (
        <button
          key={item}
          type="button"
          className={`hud-button${item === activeSection ? ' is-active' : ''}`}
          onClick={() => onSectionChange(item)}
        >
          <span>{item}</span>
        </button>
      ))}
    </nav>
  )
}
