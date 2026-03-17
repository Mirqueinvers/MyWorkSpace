import { useEffect, useState } from 'react'
import './App.css'

const NAV_ITEMS = [
  'Главная',
  'Мед осмотры',
  'Больничные листы',
  'Школы',
  'Справки',
]

const WEATHER_LABELS = {
  0: 'Ясно',
  1: 'Преимущественно ясно',
  2: 'Переменная облачность',
  3: 'Пасмурно',
  45: 'Туман',
  48: 'Туман с инеем',
  51: 'Легкая морось',
  53: 'Морось',
  55: 'Сильная морось',
  56: 'Ледяная морось',
  57: 'Сильная ледяная морось',
  61: 'Небольшой дождь',
  63: 'Дождь',
  65: 'Сильный дождь',
  66: 'Ледяной дождь',
  67: 'Сильный ледяной дождь',
  71: 'Небольшой снег',
  73: 'Снег',
  75: 'Сильный снег',
  77: 'Снежные зерна',
  80: 'Небольшой ливень',
  81: 'Ливень',
  82: 'Сильный ливень',
  85: 'Небольшой снегопад',
  86: 'Сильный снегопад',
  95: 'Гроза',
  96: 'Гроза с градом',
  99: 'Сильная гроза с градом',
}

function getCurrentMonthKey() {
  return new Date().toISOString().slice(0, 7)
}

function formatMonthLabel(monthKey) {
  const [year, month] = monthKey.split('-').map(Number)
  return new Intl.DateTimeFormat('ru-RU', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, 1))
}

function formatPatientCreatedAt(value) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function formatPatientName(value) {
  const normalized = String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()

  if (!normalized) {
    return ''
  }

  const parts = normalized.split(' ')
  const lastName = parts[0]
  const initialsSource = parts.slice(1).join('')

  const formattedLastName =
    lastName.charAt(0).toUpperCase() + lastName.slice(1)

  const initials = initialsSource
    .slice(0, 2)
    .split('')
    .map((letter) => `${letter.toUpperCase()}.`)
    .join('')

  return `${formattedLastName}${initials ? ` ${initials}` : ''}`
}

function formatBirthDate(value) {
  if (!/^\d{8}$/.test(value)) {
    return 'Не указана'
  }

  return `${value.slice(0, 2)}.${value.slice(2, 4)}.${value.slice(4, 8)}`
}

function normalizeBirthDateInput(value) {
  return value.replace(/\D/g, '').slice(0, 8)
}

function PlaceholderSection({ title }) {
  return (
    <section className="content-card placeholder-card">
      <p className="section-kicker">Раздел</p>
      <h2>{title}</h2>
      <p className="section-copy">
        Этот экран ещё не настроен. Сейчас полностью рабочим сделан раздел
        «Мед осмотры» с сохранением пациентов в SQLite.
      </p>
    </section>
  )
}

function MedicalExamsForm({
  currentMonthExamCount,
  monthKey,
  onMonthChange,
  patientName,
  birthDate,
  onPatientNameChange,
  onBirthDateChange,
  onAddPatient,
  isSaving,
}) {
  return (
    <div className="content-card form-card">
      <div className="section-head">
        <div>
          <p className="section-kicker">Мед осмотры</p>
        </div>
        <div
          className="panel-counter"
          aria-label="Количество медосмотров за текущий месяц"
          title="Количество медосмотров за текущий месяц"
        >
          {currentMonthExamCount}
        </div>
      </div>

      <label className="month-picker inline-month-picker">
        <span>Месяц</span>
        <input
          type="month"
          value={monthKey}
          onChange={(event) => onMonthChange(event.target.value)}
        />
      </label>

      <form className="patient-form" onSubmit={onAddPatient}>
        <label className="field field-wide">
          <span>Пациент</span>
          <input
            type="text"
            value={patientName}
            onChange={(event) => onPatientNameChange(event.target.value)}
            placeholder="Введите ФИО пациента"
          />
        </label>

        <label className="field field-wide">
          <span>Дата рождения</span>
          <input
            type="text"
            inputMode="numeric"
            value={birthDate}
            onChange={(event) =>
              onBirthDateChange(normalizeBirthDateInput(event.target.value))
            }
            placeholder="ДДММГГГГ"
          />
        </label>

        <button type="submit" className="primary-button" disabled={isSaving}>
          {isSaving ? 'Сохранение...' : 'Добавить пациента'}
        </button>
      </form>
    </div>
  )
}

function MedicalExamsSection({
  currentMonthExamCount,
  monthKey,
  onMonthChange,
  patients,
  loading,
  error,
  patientName,
  birthDate,
  onPatientNameChange,
  onBirthDateChange,
  onAddPatient,
  onDeletePatient,
  isSaving,
  deletingPatientId,
}) {
  return (
    <section className="medical-layout">
      <MedicalExamsForm
        currentMonthExamCount={currentMonthExamCount}
        monthKey={monthKey}
        onMonthChange={onMonthChange}
        patientName={patientName}
        birthDate={birthDate}
        onPatientNameChange={onPatientNameChange}
        onBirthDateChange={onBirthDateChange}
        onAddPatient={onAddPatient}
        isSaving={isSaving}
      />

      <div className="content-card list-card">
        <div className="list-head">
          <div>
            <p className="section-kicker">Список</p>
            <h3>{formatMonthLabel(monthKey)}</h3>
          </div>
          <div className="patient-count">
            {loading ? 'Загрузка...' : `${patients.length} пациентов`}
          </div>
        </div>

        {error ? <div className="state-banner error-banner">{error}</div> : null}

        {!loading && !error && patients.length === 0 ? (
          <div className="empty-state">
            За выбранный месяц пациентов пока нет. Добавьте первого пациента
            через форму слева.
          </div>
        ) : null}

        {patients.length > 0 ? (
          <div className="patient-list">
            {patients.map((patient) => (
              <article key={patient.id} className="patient-item">
                <div className="patient-main">
                  <div className="patient-name">{patient.fullName}</div>
                  <div className="patient-meta">
                    Дата рождения: {formatBirthDate(patient.birthDate)}
                  </div>
                  <div className="patient-meta">
                    Добавлен: {formatPatientCreatedAt(patient.createdAt)}
                  </div>
                </div>
                <button
                  type="button"
                  className="danger-button"
                  onClick={() => onDeletePatient(patient.id)}
                  disabled={deletingPatientId === patient.id}
                >
                  {deletingPatientId === patient.id ? 'Удаление...' : 'Удалить'}
                </button>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}

function App() {
  const currentMonthKey = getCurrentMonthKey()
  const [now, setNow] = useState(() => new Date())
  const [activeSection, setActiveSection] = useState('Главная')
  const [weather, setWeather] = useState({
    status: 'loading',
    temperature: null,
    description: '',
  })
  const [monthKey, setMonthKey] = useState(currentMonthKey)
  const [patientName, setPatientName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [patients, setPatients] = useState([])
  const [patientsLoading, setPatientsLoading] = useState(false)
  const [patientsError, setPatientsError] = useState('')
  const [isSavingPatient, setIsSavingPatient] = useState(false)
  const [deletingPatientId, setDeletingPatientId] = useState(null)
  const [currentMonthExamCount, setCurrentMonthExamCount] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => window.clearInterval(timer)
  }, [])

  const time = new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(now)

  const date = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
  }).format(now)

  useEffect(() => {
    let isCancelled = false

    async function loadWeather() {
      try {
        const geoResponse = await fetch(
          'https://geocoding-api.open-meteo.com/v1/search?name=Tambov&country=RU&language=ru&count=1'
        )
        const geoData = await geoResponse.json()
        const location = geoData.results?.[0]

        if (!location) {
          throw new Error('Location not found')
        }

        const weatherResponse = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,weather_code&timezone=auto`
        )
        const weatherData = await weatherResponse.json()
        const current = weatherData.current

        if (!current || typeof current.temperature_2m !== 'number') {
          throw new Error('Weather not found')
        }

        if (!isCancelled) {
          setWeather({
            status: 'ready',
            temperature: Math.round(current.temperature_2m),
            description: WEATHER_LABELS[current.weather_code] ?? 'Погода сейчас',
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

    loadWeather()
    const interval = window.setInterval(loadWeather, 15 * 60 * 1000)

    return () => {
      isCancelled = true
      window.clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    let isCancelled = false

    async function loadPatients() {
      if (!window.electronAPI?.medicalExams) {
        setPatientsError('API Electron недоступно. Откройте экран через dev:electron.')
        setPatients([])
        return
      }

      setPatientsLoading(true)
      setPatientsError('')

      try {
        const items = await window.electronAPI.medicalExams.listPatients(monthKey)

        if (!isCancelled) {
          setPatients(items)
        }
      } catch {
        if (!isCancelled) {
          setPatients([])
          setPatientsError('Не удалось загрузить пациентов из базы SQLite.')
        }
      } finally {
        if (!isCancelled) {
          setPatientsLoading(false)
        }
      }
    }

    loadPatients()

    return () => {
      isCancelled = true
    }
  }, [monthKey])

  useEffect(() => {
    let isCancelled = false

    async function loadCurrentMonthExamCount() {
      if (!window.electronAPI?.medicalExams) {
        return
      }

      try {
        const total = await window.electronAPI.medicalExams.countPatients(
          currentMonthKey
        )

        if (!isCancelled) {
          setCurrentMonthExamCount(total)
        }
      } catch {
        if (!isCancelled) {
          setCurrentMonthExamCount(0)
        }
      }
    }

    loadCurrentMonthExamCount()

    return () => {
      isCancelled = true
    }
  }, [currentMonthKey])

  async function handleAddPatient(event) {
    event.preventDefault()

    const formattedName = formatPatientName(patientName)
    if (!formattedName) {
      setPatientsError('Введите ФИО пациента, чтобы добавить запись.')
      return
    }

    if (!/^\d{8}$/.test(birthDate)) {
      setPatientsError('Введите дату рождения в формате ДДММГГГГ.')
      return
    }

    if (!window.electronAPI?.medicalExams) {
      setPatientsError('API Electron недоступно. Откройте экран через dev:electron.')
      return
    }

    setIsSavingPatient(true)
    setPatientsError('')

    try {
      const createdPatient = await window.electronAPI.medicalExams.addPatient({
        fullName: formattedName,
        birthDate,
        monthKey,
      })

      setPatients((currentPatients) => [createdPatient, ...currentPatients])
      setPatientName('')
      setBirthDate('')

      if (monthKey === currentMonthKey) {
        setCurrentMonthExamCount((count) => count + 1)
      }
    } catch {
      setPatientsError('Не удалось сохранить пациента в SQLite.')
    } finally {
      setIsSavingPatient(false)
    }
  }

  async function handleDeletePatient(id) {
    if (!window.electronAPI?.medicalExams) {
      setPatientsError('API Electron недоступно. Откройте экран через dev:electron.')
      return
    }

    const patientToDelete = patients.find((patient) => patient.id === id)

    setDeletingPatientId(id)
    setPatientsError('')

    try {
      await window.electronAPI.medicalExams.deletePatient(id)
      setPatients((currentPatients) =>
        currentPatients.filter((patient) => patient.id !== id)
      )

      if (patientToDelete?.monthKey === currentMonthKey) {
        setCurrentMonthExamCount((count) => Math.max(0, count - 1))
      }
    } catch {
      setPatientsError('Не удалось удалить пациента из SQLite.')
    } finally {
      setDeletingPatientId(null)
    }
  }

  function renderContent() {
    if (activeSection === 'Главная') {
      return (
        <section className="home-form-wrap">
          <MedicalExamsForm
            currentMonthExamCount={currentMonthExamCount}
            monthKey={monthKey}
            onMonthChange={setMonthKey}
            patientName={patientName}
            birthDate={birthDate}
            onPatientNameChange={setPatientName}
            onBirthDateChange={setBirthDate}
            onAddPatient={handleAddPatient}
            isSaving={isSavingPatient}
          />
        </section>
      )
    }

    if (activeSection === 'Мед осмотры') {
      return (
        <MedicalExamsSection
          currentMonthExamCount={currentMonthExamCount}
          monthKey={monthKey}
          onMonthChange={setMonthKey}
          patients={patients}
          loading={patientsLoading}
          error={patientsError}
          patientName={patientName}
          birthDate={birthDate}
          onPatientNameChange={setPatientName}
          onBirthDateChange={setBirthDate}
          onAddPatient={handleAddPatient}
          onDeletePatient={handleDeletePatient}
          isSaving={isSavingPatient}
          deletingPatientId={deletingPatientId}
        />
      )
    }

    return <PlaceholderSection title={activeSection} />
  }

  return (
    <main className="app-shell">
      <nav className="top-hud" aria-label="Основные разделы">
        {NAV_ITEMS.map((item) => (
          <button
            key={item}
            type="button"
            className={`hud-button${item === activeSection ? ' is-active' : ''}`}
            onClick={() => setActiveSection(item)}
          >
            <span>{item}</span>
          </button>
        ))}
      </nav>

      <section className="content-area">{renderContent()}</section>

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
    </main>
  )
}

export default App
