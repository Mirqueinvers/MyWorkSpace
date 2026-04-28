import { useClock } from '../../hooks/useClock'
import type { WeatherState } from '../../types/medicalExams'

interface ClockPanelProps {
  weather: WeatherState
  isHomeEditing: boolean
  onToggleHomeEditing: () => void
}

export function ClockPanel({ weather, isHomeEditing, onToggleHomeEditing }: ClockPanelProps) {
  const { time, date } = useClock()

  return (
    <aside className="clock-panel" aria-label="Текущее время и дата">
      <div className="clock-panel-controls" aria-label="Настройки интерфейса">
        <button
          type="button"
          className={`clock-settings-button${isHomeEditing ? ' is-active' : ''}`}
          onClick={onToggleHomeEditing}
          aria-label="Настроить виджеты"
          title="Настроить виджеты"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M19.4 13.5c.05-.5.08-1 .08-1.5s-.03-1-.08-1.5l1.73-1.35a.5.5 0 0 0 .12-.64l-1.64-2.84a.5.5 0 0 0-.6-.22l-2.04.82a7.6 7.6 0 0 0-2.59-1.5l-.31-2.17a.5.5 0 0 0-.49-.42h-3.28a.5.5 0 0 0-.49.42l-.31 2.17a7.6 7.6 0 0 0-2.59 1.5l-2.04-.82a.5.5 0 0 0-.6.22L2.75 8.51a.5.5 0 0 0 .12.64L4.6 10.5c-.05.5-.08 1-.08 1.5s.03 1 .08 1.5l-1.73 1.35a.5.5 0 0 0-.12.64l1.64 2.84a.5.5 0 0 0 .6.22l2.04-.82c.77.63 1.65 1.14 2.59 1.5l.31 2.17a.5.5 0 0 0 .49.42h3.28a.5.5 0 0 0 .49-.42l.31-2.17a7.6 7.6 0 0 0 2.59-1.5l2.04.82a.5.5 0 0 0 .6-.22l1.64-2.84a.5.5 0 0 0-.12-.64L19.4 13.5ZM12 16.25A4.25 4.25 0 1 1 12 7.75a4.25 4.25 0 0 1 0 8.5Z"
              className="clock-settings-gear-outline"
            />
          </svg>
        </button>
      </div>

      <div className="clock-time">{time}</div>
      <div className="clock-date">{date}</div>
      <div className="weather-panel" aria-label="Погода в Тамбове">
        <div className="weather-city">Тамбов</div>
        <div className="weather-temp">
          {weather.status === 'ready' && weather.temperature !== null ? `${weather.temperature}°C` : '...'}
        </div>
        <div className="weather-description">{weather.description}</div>
      </div>
    </aside>
  )
}
