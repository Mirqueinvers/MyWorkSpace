import { useEffect, useRef, useState } from 'react'
import type { AppSection } from '../../constants/navigation'
import { NAV_ITEMS } from '../../constants/navigation'

type AppTheme = 'light' | 'dark' | 'cartoon' | 'paper' | 'notebook'

interface TopNavProps {
  activeSection: AppSection
  isHomeEditing: boolean
  theme: AppTheme
  onSectionChange: (section: AppSection) => void
  onToggleHomeEditing: () => void
  onThemeChange: (theme: AppTheme) => void
}

const THEME_OPTIONS: Array<{ id: AppTheme; label: string }> = [
  { id: 'light', label: '\u0421\u0432\u0435\u0442\u043b\u0430\u044f \u0442\u0435\u043c\u0430' },
  { id: 'dark', label: '\u0422\u0451\u043c\u043d\u0430\u044f \u0442\u0435\u043c\u0430' },
  { id: 'cartoon', label: '\u041c\u0443\u043b\u044c\u0442\u044f\u0448\u043d\u0430\u044f \u0442\u0435\u043c\u0430' },
  { id: 'paper', label: '\u0411\u0443\u043c\u0430\u0436\u043d\u0430\u044f \u0442\u0435\u043c\u0430' },
  { id: 'notebook', label: '\u0422\u0435\u0442\u0440\u0430\u0434\u043d\u0430\u044f \u0442\u0435\u043c\u0430' },
]

function ThemeIcon({ theme }: { theme: AppTheme }) {
  const isDarkTheme = theme === 'dark'
  const isCartoonTheme = theme === 'cartoon'
  const isPaperTheme = theme === 'paper'
  const isNotebookTheme = theme === 'notebook'

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {isNotebookTheme ? (
        <path
          d="M7.25 3.75A2.25 2.25 0 0 0 5 6v12a2.25 2.25 0 0 0 2.25 2.25h9.5A2.25 2.25 0 0 0 19 18V6a2.25 2.25 0 0 0-2.25-2.25h-9.5Zm0 1.5h9.5c.41 0 .75.34.75.75v12a.75.75 0 0 1-.75.75h-9.5A.75.75 0 0 1 6.5 18V6c0-.41.34-.75.75-.75Zm2 2.75a.75.75 0 0 1 .75-.75h5a.75.75 0 0 1 0 1.5h-5A.75.75 0 0 1 9.25 8Zm0 3a.75.75 0 0 1 .75-.75h5a.75.75 0 0 1 0 1.5h-5a.75.75 0 0 1-.75-.75Zm0 3a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 0 1.5H10a.75.75 0 0 1-.75-.75ZM7.5 6.5a.75.75 0 0 1 .75.75v.5a.75.75 0 0 1-1.5 0v-.5A.75.75 0 0 1 7.5 6.5Zm0 3a.75.75 0 0 1 .75.75v.5a.75.75 0 0 1-1.5 0v-.5A.75.75 0 0 1 7.5 9.5Zm0 3a.75.75 0 0 1 .75.75v.5a.75.75 0 0 1-1.5 0v-.5A.75.75 0 0 1 7.5 12.5Z"
          fill="currentColor"
        />
      ) : isPaperTheme ? (
        <path
          d="M7.75 3.75A2.75 2.75 0 0 0 5 6.5v11A2.75 2.75 0 0 0 7.75 20.25h8.5A2.75 2.75 0 0 0 19 17.5v-8.3a2.75 2.75 0 0 0-.8-1.95l-2.45-2.45a2.75 2.75 0 0 0-1.95-.8h-6.05Zm0 1.5h5.5v2.5c0 1.24 1.01 2.25 2.25 2.25H17.5v7.5c0 .69-.56 1.25-1.25 1.25h-8.5c-.69 0-1.25-.56-1.25-1.25v-11c0-.69.56-1.25 1.25-1.25Zm7 1.06l1.69 1.69h-.94a.75.75 0 0 1-.75-.75v-.94Zm-5.5 6.94a.75.75 0 0 1 .75-.75h4a.75.75 0 0 1 0 1.5h-4a.75.75 0 0 1-.75-.75Zm0 3a.75.75 0 0 1 .75-.75h4.75a.75.75 0 0 1 0 1.5H10a.75.75 0 0 1-.75-.75Z"
          fill="currentColor"
        />
      ) : isCartoonTheme ? (
        <path
          d="M12 3.25c1.16 0 2.1.94 2.1 2.1c0 .19-.03.38-.08.56l.87.24c.4-.48 1-.79 1.67-.79c1.21 0 2.19.98 2.19 2.19c0 .31-.07.62-.2.89l.7.55c.18-.08.37-.12.56-.12c1.16 0 2.1.94 2.1 2.1s-.94 2.1-2.1 2.1c-.19 0-.38-.03-.56-.08l-.25.87c.48.4.79 1 .79 1.67c0 1.21-.98 2.19-2.19 2.19c-.31 0-.62-.07-.89-.2l-.55.7c.08.18.12.37.12.56c0 1.16-.94 2.1-2.1 2.1s-2.1-.94-2.1-2.1c0-.19.03-.38.08-.56l-.87-.25c-.4.48-1 .79-1.67.79c-1.21 0-2.19-.98-2.19-2.19c0-.31.07-.62.2-.89l-.7-.55c-.18.08-.37.12-.56.12c-1.16 0-2.1-.94-2.1-2.1s.94-2.1 2.1-2.1c.19 0 .38.03.56.08l.24-.87c-.48-.4-.79-1-.79-1.67c0-1.21.98-2.19 2.19-2.19c.31 0 .62.07.89.2l.55-.7a2.08 2.08 0 0 1-.12-.56c0-1.16.94-2.1 2.1-2.1Zm0 5.25a3.5 3.5 0 1 0 0 7a3.5 3.5 0 0 0 0-7Z"
          fill="currentColor"
        />
      ) : isDarkTheme ? (
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
  )
}

export function TopNav({
  activeSection,
  isHomeEditing,
  theme,
  onSectionChange,
  onToggleHomeEditing,
  onThemeChange,
}: TopNavProps) {
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false)
  const themePickerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!themePickerRef.current?.contains(event.target as Node)) {
        setIsThemeMenuOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsThemeMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  return (
    <nav className="top-hud" aria-label="\u041e\u0441\u043d\u043e\u0432\u043d\u044b\u0435 \u0440\u0430\u0437\u0434\u0435\u043b\u044b">
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

      <div
        ref={themePickerRef}
        className={`hud-theme-picker${isThemeMenuOpen ? ' is-open' : ''}`}
      >
        <button
          type="button"
          className={`hud-theme-button${theme !== 'light' ? ' is-active' : ''}${theme === 'cartoon' ? ' is-cartoon' : ''}${theme === 'paper' ? ' is-paper' : ''}${theme === 'notebook' ? ' is-notebook' : ''}${isThemeMenuOpen ? ' is-open' : ''}`}
          onClick={() => setIsThemeMenuOpen((current) => !current)}
          aria-label="\u0412\u044b\u0431\u0440\u0430\u0442\u044c \u0442\u0435\u043c\u0443"
          title="\u0412\u044b\u0431\u0440\u0430\u0442\u044c \u0442\u0435\u043c\u0443"
          aria-expanded={isThemeMenuOpen}
          aria-haspopup="true"
        >
          <ThemeIcon theme={theme} />
        </button>

        <div className={`hud-theme-menu${isThemeMenuOpen ? ' is-open' : ''}`} role="menu">
          {THEME_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`hud-theme-option${option.id === theme ? ' is-active' : ''}${option.id === 'cartoon' ? ' is-cartoon' : ''}${option.id === 'paper' ? ' is-paper' : ''}${option.id === 'notebook' ? ' is-notebook' : ''}`}
              onClick={() => {
                onThemeChange(option.id)
                setIsThemeMenuOpen(false)
              }}
              title={option.label}
              aria-label={option.label}
              role="menuitem"
            >
              <ThemeIcon theme={option.id} />
            </button>
          ))}
        </div>
      </div>

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
