import { useEffect, useState } from 'react'
import { WEATHER_LABELS } from '../constants/weather'
import type { WeatherState } from '../types/medicalExams'

interface GeocodingResponse {
  results?: Array<{
    latitude: number
    longitude: number
  }>
}

interface ForecastResponse {
  current?: {
    temperature_2m?: number
    weather_code?: number
  }
}

export function useWeather() {
  const [weather, setWeather] = useState<WeatherState>({
    status: 'loading',
    temperature: null,
    description: '',
  })

  useEffect(() => {
    let isCancelled = false

    async function loadWeather() {
      try {
        const geoResponse = await fetch(
          'https://geocoding-api.open-meteo.com/v1/search?name=Tambov&country=RU&language=ru&count=1',
        )
        const geoData = (await geoResponse.json()) as GeocodingResponse
        const location = geoData.results?.[0]

        if (!location) {
          throw new Error('Location not found')
        }

        const weatherResponse = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,weather_code&timezone=auto`,
        )
        const weatherData = (await weatherResponse.json()) as ForecastResponse
        const current = weatherData.current

        if (!current || typeof current.temperature_2m !== 'number') {
          throw new Error('Weather not found')
        }

        if (!isCancelled) {
          setWeather({
            status: 'ready',
            temperature: Math.round(current.temperature_2m),
            description:
              WEATHER_LABELS[current.weather_code ?? -1] ?? 'Погода сейчас',
          })
        }
      } catch {
        if (!isCancelled) {
          setWeather({
            status: 'error',
            temperature: null,
            description: 'Не удалось загрузить погоду',
          })
        }
      }
    }

    void loadWeather()
    const interval = window.setInterval(() => {
      void loadWeather()
    }, 15 * 60 * 1000)

    return () => {
      isCancelled = true
      window.clearInterval(interval)
    }
  }, [])

  return weather
}
