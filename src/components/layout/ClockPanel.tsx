import { useClock } from '../../hooks/useClock'
import type { WeatherState } from '../../types/medicalExams'

interface ClockPanelProps {
  weather: WeatherState
}

export function ClockPanel({ weather }: ClockPanelProps) {
  const { time, date } = useClock()

  return (
    <aside className="clock-panel" aria-label="Текущее время и дата">
      <div className="clock-time">{time}</div>
      <div className="clock-date">{date}</div>
      <div className="weather-panel" aria-label="Погода в Тамбове">
        <div className="weather-city">Тамбов</div>
        <div className="weather-temp">
          {weather.status === 'ready' && weather.temperature !== null
            ? `${weather.temperature}°C`
            : '...'}
        </div>
        <div className="weather-description">{weather.description}</div>
      </div>
    </aside>
  )
}
