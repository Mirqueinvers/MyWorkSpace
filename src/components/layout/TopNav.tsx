import type { AppSection } from '../../constants/navigation'
import { NAV_ITEMS } from '../../constants/navigation'

interface TopNavProps {
  activeSection: AppSection
  isHomeEditing: boolean
  onSectionChange: (section: AppSection) => void
  onToggleHomeEditing: () => void
}

export function TopNav({
  activeSection,
  isHomeEditing,
  onSectionChange,
  onToggleHomeEditing,
}: TopNavProps) {
  return (
    <nav
      className="top-hud"
      aria-label="\u041e\u0441\u043d\u043e\u0432\u043d\u044b\u0435 \u0440\u0430\u0437\u0434\u0435\u043b\u044b"
    >
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

      <button
        type="button"
        className={`hud-settings-button${isHomeEditing ? ' is-active' : ''}`}
        onClick={onToggleHomeEditing}
        aria-label="\u041d\u0430\u0441\u0442\u0440\u043e\u0438\u0442\u044c \u0432\u0438\u0434\u0436\u0435\u0442\u044b"
        title="\u041d\u0430\u0441\u0442\u0440\u043e\u0438\u0442\u044c \u0432\u0438\u0434\u0436\u0435\u0442\u044b"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M19.4 13.5c.05-.5.08-1 .08-1.5s-.03-1-.08-1.5l1.73-1.35a.5.5 0 0 0 .12-.64l-1.64-2.84a.5.5 0 0 0-.6-.22l-2.04.82a7.6 7.6 0 0 0-2.59-1.5l-.31-2.17a.5.5 0 0 0-.49-.42h-3.28a.5.5 0 0 0-.49.42l-.31 2.17a7.6 7.6 0 0 0-2.59 1.5l-2.04-.82a.5.5 0 0 0-.6.22L2.75 8.51a.5.5 0 0 0 .12.64L4.6 10.5c-.05.5-.08 1-.08 1.5s.03 1 .08 1.5l-1.73 1.35a.5.5 0 0 0-.12.64l1.64 2.84a.5.5 0 0 0 .6.22l2.04-.82c.77.63 1.65 1.14 2.59 1.5l.31 2.17a.5.5 0 0 0 .49.42h3.28a.5.5 0 0 0 .49-.42l.31-2.17a7.6 7.6 0 0 0 2.59-1.5l2.04.82a.5.5 0 0 0 .6-.22l1.64-2.84a.5.5 0 0 0-.12-.64L19.4 13.5ZM12 16.25A4.25 4.25 0 1 1 12 7.75a4.25 4.25 0 0 1 0 8.5Z"
            className="hud-settings-gear-outline"
          />
        </svg>
      </button>
    </nav>
  )
}
