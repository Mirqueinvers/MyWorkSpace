import type { AppSection } from '../../constants/navigation'
import { NAV_ITEMS } from '../../constants/navigation'

interface TopNavProps {
  activeSection: AppSection
  isHomeEditing: boolean
  isDarkTheme: boolean
  onSectionChange: (section: AppSection) => void
  onToggleHomeEditing: () => void
  onToggleTheme: () => void
}

export function TopNav({
  activeSection,
  isHomeEditing,
  isDarkTheme,
  onSectionChange,
  onToggleHomeEditing,
  onToggleTheme,
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
        className={`hud-theme-button${isDarkTheme ? ' is-active' : ''}`}
        onClick={onToggleTheme}
        aria-label={isDarkTheme ? 'Включить светлую тему' : 'Включить тёмную тему'}
        title={isDarkTheme ? 'Включить светлую тему' : 'Включить тёмную тему'}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          {isDarkTheme ? (
            <path
              d="M12 4.25a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0V5a.75.75 0 0 1 .75-.75Zm0 11a3.25 3.25 0 1 0 0-6.5a3.25 3.25 0 0 0 0 6.5Zm0 4a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0V20a.75.75 0 0 1 .75-.75ZM4.25 12a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5H5a.75.75 0 0 1-.75-.75Zm13.25 0a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5H18.25a.75.75 0 0 1-.75-.75ZM6.47 6.47a.75.75 0 0 1 1.06 0l1.06 1.06a.75.75 0 1 1-1.06 1.06L6.47 7.53a.75.75 0 0 1 0-1.06Zm8.94 8.94a.75.75 0 0 1 1.06 0l1.06 1.06a.75.75 0 0 1-1.06 1.06l-1.06-1.06a.75.75 0 0 1 0-1.06ZM6.47 17.53a.75.75 0 0 1 0-1.06l1.06-1.06a.75.75 0 1 1 1.06 1.06l-1.06 1.06a.75.75 0 0 1-1.06 0Zm8.94-8.94a.75.75 0 0 1 0-1.06l1.06-1.06a.75.75 0 0 1 1.06 1.06l-1.06 1.06a.75.75 0 0 1-1.06 0Z"
              fill="currentColor"
            />
          ) : (
            <path
              d="M14.8 3.2a.75.75 0 0 1 .88.96a7.24 7.24 0 0 0 8.16 9.16a.75.75 0 0 1 .64 1.27A9.5 9.5 0 1 1 13.53 2.56a.75.75 0 0 1 1.27.64Zm-1.12 1.84a8 8 0 1 0 7.27 7.27a8.74 8.74 0 0 1-7.27-7.27Z"
              fill="currentColor"
            />
          )}
        </svg>
      </button>

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
