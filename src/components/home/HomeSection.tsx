import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import type { AppSection } from '../../constants/navigation'
import type { Patient } from '../../types/medicalExams'
import type { NoteItem } from '../../types/notes'
import type { SchoolInstitution } from '../../types/schools'
import type { SickLeave } from '../../types/sickLeaves'
import type {
  XRayFlJournalEntry,
  XRayPatient,
  XRaySearchResult,
  XRayStudy,
} from '../../types/xray'

type HomeWidgetId =
  | 'medical'
  | 'sick-leaves'
  | 'xray'
  | 'fluorography'
  | 'notes'
type HomeWidgetSize = 'xxs' | 'xs' | 's' | 'l' | 'xl'

interface HomeSectionProps {
  isEditing: boolean
  medicalMonthKey: string
  currentMonthExamCount: number
  medicalPatients: Patient[]
  sickLeaves: SickLeave[]
  urgentSickLeavesCount: number
  schools: SchoolInstitution[]
  xraySelectedPatient: XRayPatient | null
  xrayStudies: XRayStudy[]
  xrayFlStudies: XRayFlJournalEntry[]
  fluorographyMonthCount: number
  fluorographyYearCount: number
  xrayTodayPatientsCount: number
  xrayTodayStudiesCount: number
  xrayQuery: string
  xrayResults: XRaySearchResult[]
  xrayLoading: boolean
  xrayError: string
  notes: NoteItem[]
  notesText: string
  onMedicalMonthChange: (value: string) => void
  onNotesTextChange: (value: string) => void
  onAddNote: (event: FormEvent<HTMLFormElement>) => Promise<void>
  notesIsSaving: boolean
  onXRayQueryChange: (value: string) => void
  onXRaySearch: (event?: FormEvent<HTMLFormElement>) => Promise<void>
  onSelectXRayPatient: (patient: XRaySearchResult) => void
  onOpenSection: (section: AppSection) => void
}

interface HomeWidgetDefinition {
  id: HomeWidgetId
  section: AppSection
  kicker: string
  title: string
  description: string
  defaultSize: HomeWidgetSize
  availableSizes?: HomeWidgetSize[]
  renderStats: (props: HomeSectionProps) => Array<{ label: string; value: string | number }>
  renderFooter?: (props: HomeSectionProps) => string
}

interface HomeWidgetInstance {
  instanceId: string
  widgetId: HomeWidgetId
  size: HomeWidgetSize
}

const STORAGE_KEY = 'home-widget-preferences-v1'
const ADD_WIDGET_LABEL = '\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u0432\u0438\u0434\u0436\u0435\u0442'
const OPEN_LABEL = '\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u0440\u0430\u0437\u0434\u0435\u043b'
const ADD_LABEL = '\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c'
const HIDE_LABEL = '\u0421\u043a\u0440\u044b\u0442\u044c'
const MANAGE_LABEL =
  '\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0432\u0438\u0434\u0436\u0435\u0442 \u0438 \u0435\u0433\u043e \u0440\u0430\u0437\u043c\u0435\u0440'
const EMPTY_VALUE = '\u2014'

const SIZE_LABELS: Record<HomeWidgetSize, string> = {
  xxs: 'XXS',
  xs: 'XS',
  s: 'S',
  l: 'L',
  xl: 'XL',
}

function formatMonthKey(monthKey: string) {
  if (!monthKey) {
    return EMPTY_VALUE
  }

  const [year, month] = monthKey.split('-')
  if (!year || !month) {
    return monthKey
  }

  return `${month}.${year}`
}

function formatBirthDate(value: string) {
  if (!value || value.length !== 8) {
    return value || EMPTY_VALUE
  }

  return `${value.slice(0, 2)}.${value.slice(2, 4)}.${value.slice(4, 8)}`
}

function getOpenSickLeavePreviews(sickLeaves: SickLeave[]) {
  return sickLeaves
    .filter((item) => item.status === 'open')
    .map((item) => {
      const lastPeriod = item.periods[item.periods.length - 1]

      return {
        id: item.id,
        fullName: `${item.lastName} ${item.firstName} ${item.patronymic}`.trim(),
        birthDate: formatBirthDate(item.birthDate),
        endDate: lastPeriod ? formatBirthDate(lastPeriod.endDate) : EMPTY_VALUE,
      }
    })
}

const HOME_WIDGETS: HomeWidgetDefinition[] = [
  {
    id: 'medical',
    section: '\u041c\u0435\u0434 \u043e\u0441\u043c\u043e\u0442\u0440\u044b',
    kicker: '\u041c\u0435\u0434 \u043e\u0441\u043c\u043e\u0442\u0440\u044b',
    title: '\u0421\u0432\u043e\u0434\u043a\u0430 \u043f\u043e \u043f\u0430\u0446\u0438\u0435\u043d\u0442\u0430\u043c',
    description:
      '\u0422\u0435\u043a\u0443\u0449\u0438\u0439 \u043c\u0435\u0441\u044f\u0446, \u0432\u044b\u0431\u0440\u0430\u043d\u043d\u044b\u0439 \u043f\u0435\u0440\u0438\u043e\u0434 \u0438 \u0447\u0438\u0441\u043b\u043e \u0437\u0430\u043f\u0438\u0441\u0435\u0439.',
    defaultSize: 'l',
    availableSizes: ['l'],
    renderStats: (props) => [
      {
        label: '\u0417\u0430 \u0442\u0435\u043a\u0443\u0449\u0438\u0439 \u043c\u0435\u0441\u044f\u0446',
        value: props.currentMonthExamCount,
      },
      {
        label: '\u0412 \u0432\u044b\u0431\u0440\u0430\u043d\u043d\u043e\u043c \u043c\u0435\u0441\u044f\u0446\u0435',
        value: props.medicalPatients.length,
      },
      {
        label: '\u041c\u0435\u0441\u044f\u0446',
        value: formatMonthKey(props.medicalMonthKey),
      },
    ],
    renderFooter: (props) =>
      props.medicalPatients[0]?.fullName ||
      '\u041f\u043e\u043a\u0430 \u043d\u0435\u0442 \u043f\u0430\u0446\u0438\u0435\u043d\u0442\u043e\u0432 \u0432 \u0432\u044b\u0431\u0440\u0430\u043d\u043d\u043e\u043c \u043c\u0435\u0441\u044f\u0446\u0435.',
  },
  {
    id: 'sick-leaves',
    section: '\u0411\u043e\u043b\u044c\u043d\u0438\u0447\u043d\u044b\u0435 \u043b\u0438\u0441\u0442\u044b',
    kicker: '\u0411\u043e\u043b\u044c\u043d\u0438\u0447\u043d\u044b\u0435',
    title: '\u041e\u0442\u043a\u0440\u044b\u0442\u044b\u0435 \u0438 \u0441\u0440\u043e\u0447\u043d\u044b\u0435',
    description:
      '\u0412\u0438\u0434\u043d\u043e, \u0441\u043a\u043e\u043b\u044c\u043a\u043e \u0431\u043e\u043b\u044c\u043d\u0438\u0447\u043d\u044b\u0445 \u043e\u0442\u043a\u0440\u044b\u0442\u043e \u0438 \u0447\u0442\u043e \u043d\u0443\u0436\u043d\u043e \u0437\u0430\u043a\u0440\u044b\u0442\u044c \u0441\u0435\u0433\u043e\u0434\u043d\u044f.',
    defaultSize: 'xs',
    availableSizes: ['xxs', 'xs'],
    renderStats: (props) => [
      {
        label: '\u041e\u0442\u043a\u0440\u044b\u0442\u044b',
        value: props.sickLeaves.filter((item) => item.status === 'open').length,
      },
      {
        label: '\u0412\u0441\u0435\u0433\u043e',
        value: props.sickLeaves.length,
      },
      {
        label: '\u0421\u0440\u043e\u0447\u043d\u043e \u0441\u0435\u0433\u043e\u0434\u043d\u044f',
        value: props.urgentSickLeavesCount,
      },
    ],
    renderFooter: (props) =>
      props.sickLeaves[0]
        ? `${props.sickLeaves[0].lastName} ${props.sickLeaves[0].firstName} ${props.sickLeaves[0].patronymic}`
        : '\u0421\u043f\u0438\u0441\u043e\u043a \u0431\u043e\u043b\u044c\u043d\u0438\u0447\u043d\u044b\u0445 \u043f\u043e\u043a\u0430 \u043f\u0443\u0441\u0442.',
  },
  {
    id: 'xray',
    section: 'Пациенты',
    kicker: 'Пациенты',
    title: '\u041a\u0430\u0440\u0442\u043e\u0447\u043a\u0430 \u0438 \u0438\u0441\u0441\u043b\u0435\u0434\u043e\u0432\u0430\u043d\u0438\u044f',
    description:
      '\u041d\u0430 \u0433\u043b\u0430\u0432\u043d\u043e\u0439 \u0432\u0438\u0434\u043d\u043e \u0442\u0435\u043a\u0443\u0449\u0435\u0435 \u0441\u043e\u0441\u0442\u043e\u044f\u043d\u0438\u0435 \u043e\u0442\u043a\u0440\u044b\u0442\u043e\u0439 \u043a\u0430\u0440\u0442\u043e\u0447\u043a\u0438 \u043f\u0430\u0446\u0438\u0435\u043d\u0442\u0430.',
    defaultSize: 'xl',
    availableSizes: ['xxs', 'xl'],
    renderStats: (props) => [
      {
        label: '\u041f\u0430\u0446\u0438\u0435\u043d\u0442',
        value: props.xraySelectedPatient ? '\u041e\u0442\u043a\u0440\u044b\u0442' : '\u041d\u0435\u0442',
      },
      {
        label: '\u0418\u0441\u0441\u043b\u0435\u0434\u043e\u0432\u0430\u043d\u0438\u044f',
        value: props.xrayStudies.length,
      },
      {
        label: '\u0424\u043b\u044e\u043e\u0440\u043e\u0433\u0440\u0430\u0444\u0438\u0438',
        value: props.xrayFlStudies.length,
      },
      {
        label: '\u0414\u0430\u0442\u0430 \u0440\u043e\u0436\u0434\u0435\u043d\u0438\u044f',
        value: props.xraySelectedPatient
          ? formatBirthDate(props.xraySelectedPatient.birthDate)
          : EMPTY_VALUE,
      },
    ],
    renderFooter: (props) =>
      props.xraySelectedPatient
        ? `${props.xraySelectedPatient.lastName} ${props.xraySelectedPatient.firstName} ${props.xraySelectedPatient.patronymic}`.trim()
        : '\u041a\u0430\u0440\u0442\u043e\u0447\u043a\u0430 \u043f\u0430\u0446\u0438\u0435\u043d\u0442\u0430 \u043f\u043e\u043a\u0430 \u043d\u0435 \u043e\u0442\u043a\u0440\u044b\u0442\u0430.',
  },
  {
    id: 'fluorography',
    section: 'Журналы',
    kicker: '\u0424\u043b\u044e\u043e\u0440\u043e\u0433\u0440\u0430\u0444\u0438\u044f',
    title: '\u0421\u0432\u043e\u0434\u043a\u0430 \u043f\u043e \u0436\u0443\u0440\u043d\u0430\u043b\u0443',
    description:
      '\u0411\u044b\u0441\u0442\u0440\u044b\u0439 \u0441\u0447\u0451\u0442\u0447\u0438\u043a \u0444\u043b\u044e\u043e\u0440\u043e\u0433\u0440\u0430\u0444\u0438\u0439 \u0437\u0430 \u0442\u0435\u043a\u0443\u0449\u0438\u0439 \u043c\u0435\u0441\u044f\u0446 \u0438 \u0433\u043e\u0434.',
    defaultSize: 'xxs',
    availableSizes: ['xxs'],
    renderStats: (props) => [
      {
        label: '\u0417\u0430 \u0442\u0435\u043a\u0443\u0449\u0438\u0439 \u043c\u0435\u0441\u044f\u0446',
        value: props.fluorographyMonthCount,
      },
      {
        label: '\u0417\u0430 \u0442\u0435\u043a\u0443\u0449\u0438\u0439 \u0433\u043e\u0434',
        value: props.fluorographyYearCount,
      },
    ],
  },
  {
    id: 'notes',
    section: '\u0417\u0430\u043c\u0435\u0442\u043a\u0438',
    kicker: '\u0417\u0430\u043c\u0435\u0442\u043a\u0438',
    title: '\u0411\u044b\u0441\u0442\u0440\u044b\u0435 \u0437\u0430\u043f\u0438\u0441\u0438',
    description:
      '\u0412\u0438\u0436\u0443 \u043a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u043e \u0437\u0430\u043c\u0435\u0442\u043e\u043a \u0438 \u043f\u043e\u0441\u043b\u0435\u0434\u043d\u044e\u044e \u0437\u0430\u043f\u0438\u0441\u044c.',
    defaultSize: 's',
    availableSizes: ['xs', 's', 'l'],
    renderStats: (props) => [
      { label: '\u0412\u0441\u0435\u0433\u043e', value: props.notes.length },
      {
        label: '\u041f\u043e\u0441\u043b\u0435\u0434\u043d\u044f\u044f',
        value: props.notes[0] ? props.notes[0].createdAt.slice(0, 10) : EMPTY_VALUE,
      },
    ],
    renderFooter: (props) =>
      props.notes[0]?.text || '\u041f\u043e\u043a\u0430 \u043d\u0435\u0442 \u043d\u0438 \u043e\u0434\u043d\u043e\u0439 \u0437\u0430\u043c\u0435\u0442\u043a\u0438.',
  },
]

function createWidgetInstance(widgetId: HomeWidgetId, size: HomeWidgetSize): HomeWidgetInstance {
  return {
    instanceId: `${widgetId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    widgetId,
    size,
  }
}

function getDefaultWidgetInstances(): HomeWidgetInstance[] {
  return HOME_WIDGETS.map((widget) => createWidgetInstance(widget.id, widget.defaultSize))
}

function normalizeWidgetSize(rawSize: unknown, fallback: HomeWidgetSize): HomeWidgetSize {
  if (rawSize === 'xxs' || rawSize === 'xs' || rawSize === 's' || rawSize === 'l' || rawSize === 'xl') {
    return rawSize
  }

  if (rawSize === 'small') {
    return 's'
  }

  if (rawSize === 'medium') {
    return 'l'
  }

  if (rawSize === 'large') {
    return 'xl'
  }

  return fallback
}

function normalizeWidgetInstances(value: unknown): HomeWidgetInstance[] {
  if (!value) {
    return getDefaultWidgetInstances()
  }

  if (Array.isArray(value)) {
    const items = value
      .map((item) => {
        if (!item || typeof item !== 'object') {
          return null
        }

        const rawItem = item as Record<string, unknown>
        const widgetId = rawItem.widgetId
        if (!HOME_WIDGETS.some((widget) => widget.id === widgetId)) {
          return null
        }

        return {
          instanceId:
            typeof rawItem.instanceId === 'string' && rawItem.instanceId
              ? rawItem.instanceId
              : createWidgetInstance(widgetId as HomeWidgetId, 'l').instanceId,
          widgetId: widgetId as HomeWidgetId,
          size: normalizeWidgetSize(rawItem.size, 'l'),
        } satisfies HomeWidgetInstance
      })
      .filter((item): item is HomeWidgetInstance => item !== null)

    return items.length > 0 ? items : getDefaultWidgetInstances()
  }

  if (typeof value === 'object') {
    const raw = value as Record<string, unknown>

    return HOME_WIDGETS.map((widget) => {
      const item = raw[widget.id]
      if (!item || typeof item !== 'object') {
        return createWidgetInstance(widget.id, widget.defaultSize)
      }

      const rawItem = item as Record<string, unknown>
      return createWidgetInstance(widget.id, normalizeWidgetSize(rawItem.size, widget.defaultSize))
    })
  }

  return getDefaultWidgetInstances()
}

export function HomeSection(props: HomeSectionProps) {
  const [isAddPanelOpen, setIsAddPanelOpen] = useState(false)
  const [widgetInstances, setWidgetInstances] = useState<HomeWidgetInstance[]>(() => {
    if (typeof window === 'undefined') {
      return getDefaultWidgetInstances()
    }

    try {
      const storedValue = window.localStorage.getItem(STORAGE_KEY)
      if (!storedValue) {
        return getDefaultWidgetInstances()
      }

      return normalizeWidgetInstances(JSON.parse(storedValue))
    } catch {
      return getDefaultWidgetInstances()
    }
  })
  const [pendingSizes, setPendingSizes] = useState<Record<HomeWidgetId, HomeWidgetSize>>(() =>
    HOME_WIDGETS.reduce(
      (accumulator, widget) => {
        accumulator[widget.id] = widget.defaultSize
        return accumulator
      },
      {} as Record<HomeWidgetId, HomeWidgetSize>,
    ),
  )

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(widgetInstances))
  }, [widgetInstances])

  useEffect(() => {
    if (!props.isEditing) {
      setIsAddPanelOpen(false)
    }
  }, [props.isEditing])

  const visibleWidgets = useMemo(
    () =>
      widgetInstances
        .map((instance) => {
          const definition = HOME_WIDGETS.find((widget) => widget.id === instance.widgetId)
          if (!definition) {
            return null
          }

          return {
            instanceId: instance.instanceId,
            definition,
            size: instance.size,
          }
        })
        .filter(
          (
            item,
          ): item is {
            instanceId: string
            definition: HomeWidgetDefinition
            size: HomeWidgetSize
          } => item !== null,
        ),
    [widgetInstances],
  )

  function updatePendingSize(id: HomeWidgetId, size: HomeWidgetSize) {
    setPendingSizes((current) => ({
      ...current,
      [id]: size,
    }))
  }

  function handleAddWidget(id: HomeWidgetId, size: HomeWidgetSize) {
    setWidgetInstances((current) => [...current, createWidgetInstance(id, size)])
  }

  function handleRemoveWidget(instanceId: string) {
    setWidgetInstances((current) => current.filter((item) => item.instanceId !== instanceId))
  }

  function renderXRayWidgetSearch() {
    const hasTooManyResults = props.xrayResults.length > 2

    return (
      <div className="home-xray-widget-search">
        <form className="xray-search-form home-xray-widget-search-form" onSubmit={props.onXRaySearch}>
          <label
            className="xray-search-shell home-xray-widget-search-shell"
            aria-label={'\u041f\u043e\u0438\u0441\u043a \u043f\u0430\u0446\u0438\u0435\u043d\u0442\u0430 X-ray'}
          >
            <svg className="xray-search-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M10.5 4a6.5 6.5 0 1 0 4.03 11.6l4.43 4.43a1 1 0 0 0 1.41-1.41l-4.43-4.43A6.5 6.5 0 0 0 10.5 4Zm0 2a4.5 4.5 0 1 1 0 9a4.5 4.5 0 0 1 0-9Z"
                fill="currentColor"
              />
            </svg>
            <input
              type="text"
              value={props.xrayQuery}
              onChange={(event) => props.onXRayQueryChange(event.target.value)}
              placeholder={'\u041f\u043e\u0438\u0441\u043a \u043f\u0430\u0446\u0438\u0435\u043d\u0442\u0430'}
              autoComplete="off"
            />
            <button type="submit" className="xray-search-submit">
              {'\u041d\u0430\u0439\u0442\u0438'}
            </button>
          </label>
        </form>

        {props.xrayError ? <div className="state-banner error-banner">{props.xrayError}</div> : null}

        <div className="xray-search-results home-xray-widget-search-results">
          {props.xrayLoading ? (
            <div className="empty-state">
              {'\u0418\u0449\u0443 \u043f\u0430\u0446\u0438\u0435\u043d\u0442\u0430 \u0432 \u0436\u0443\u0440\u043d\u0430\u043b\u0435 X-ray...'}
            </div>
          ) : null}

          {!props.xrayLoading && hasTooManyResults ? (
            <div className="empty-state">
              {'\u0420\u0435\u0437\u0443\u043b\u044c\u0442\u0430\u0442 \u0441\u043e\u0434\u0435\u0440\u0436\u0438\u0442 \u0431\u043e\u043b\u0435\u0435 \u0434\u0432\u0443\u0445 \u0437\u0430\u043f\u0438\u0441\u0435\u0439, \u043b\u0443\u0447\u0448\u0435 \u043f\u0440\u043e\u0434\u043e\u043b\u0436\u0438\u0442\u044c \u043f\u043e\u0438\u0441\u043a \u043d\u0430 \u0432\u043a\u043b\u0430\u0434\u043a\u0435 X-Ray'}
            </div>
          ) : null}

          {!props.xrayLoading && props.xrayResults.length > 0 && !hasTooManyResults ? (
            <div className="xray-result-list">
              {props.xrayResults.slice(0, 2).map((patient) => (
                <button
                  key={patient.id}
                  type="button"
                  className="xray-result-item"
                  onClick={() => props.onSelectXRayPatient(patient)}
                >
                  <span className="xray-result-name">
                    {`${patient.lastName} ${patient.firstName} ${patient.patronymic}`.trim()}
                  </span>
                  <span className="xray-result-meta">
                    {formatBirthDate(patient.birthDate)} • {patient.address}
                  </span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    )
  }

  function renderNotesWidgetForm() {
    return (
      <form className="home-notes-widget-form" onSubmit={props.onAddNote}>
        <p className="section-kicker home-notes-widget-kicker">{'\u0417\u0430\u043c\u0435\u0442\u043a\u0438'}</p>

        <label className="field field-wide">
          <textarea
            className="notes-textarea home-notes-widget-textarea"
            value={props.notesText}
            onChange={(event) => props.onNotesTextChange(event.target.value)}
            placeholder={'\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0437\u0430\u043c\u0435\u0442\u043a\u0443'}
          />
        </label>

        <button type="submit" className="primary-button home-notes-widget-button" disabled={props.notesIsSaving}>
          {props.notesIsSaving
            ? '\u0421\u043e\u0445\u0440\u0430\u043d\u044f\u044e...'
            : '\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c'}
        </button>
      </form>
    )
  }

  return (
    <section className="home-dashboard">
      {props.isEditing ? (
        <div className="content-card home-hero-card">
          <div className="home-widget-toolbar">
            <button
              type="button"
              className={`home-widget-add-button${isAddPanelOpen ? ' is-open' : ''}`}
              onClick={() => setIsAddPanelOpen((current) => !current)}
            >
              {ADD_WIDGET_LABEL}
            </button>

            {isAddPanelOpen ? (
                <div className="home-widget-add-panel">
                  <div className="home-widget-toolbar-copy">{MANAGE_LABEL}</div>

                  <div className="home-widget-available-list">
                    {HOME_WIDGETS.map((widget) => {
                      const pendingSize = pendingSizes[widget.id] ?? widget.defaultSize
                      const availableSizes = widget.availableSizes ?? (['xxs', 'xs', 's', 'l', 'xl'] as HomeWidgetSize[])
                      return (
                        <div key={widget.id} className="home-widget-available-item">
                          <div className="home-widget-available-copy">
                            <span className="home-widget-available-kicker">{widget.kicker}</span>
                          </div>

                          <div className="home-widget-available-actions">
                            <div className="home-widget-size-group">
                              {availableSizes.map((size) => (
                                <button
                                  key={`${widget.id}-${size}`}
                                  type="button"
                                  className={`home-widget-size-button${pendingSize === size ? ' is-active' : ''}`}
                                  onClick={() => updatePendingSize(widget.id, size)}
                                >
                                  {SIZE_LABELS[size]}
                                </button>
                              ))}
                            </div>

                            <button
                              type="button"
                              className="home-widget-hidden-chip"
                              onClick={() => handleAddWidget(widget.id, pendingSize)}
                            >
                              <span>{ADD_LABEL}</span>
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="home-widget-grid">
        {visibleWidgets.map(({ instanceId, definition, size }) => {
          const isXRayXlWidget = definition.id === 'xray' && size === 'xl'
          const isXRayXxsWidget = definition.id === 'xray' && size === 'xxs'
          const isFluorographyWidget = definition.id === 'fluorography'
          const isSickLeavesXxsWidget = definition.id === 'sick-leaves' && size === 'xxs'
          const isSickLeavesXsWidget = definition.id === 'sick-leaves' && size === 'xs'
          const isNotesWidget = definition.id === 'notes' && (size === 'xs' || size === 's' || size === 'l')
          const isCompactXRayWidget = isFluorographyWidget || isXRayXxsWidget
          const isCompactSickLeavesWidget = isSickLeavesXxsWidget || isSickLeavesXsWidget
          const openSickLeavePreviews = isCompactSickLeavesWidget
            ? getOpenSickLeavePreviews(props.sickLeaves)
            : []

          return (
            <article
              key={instanceId}
              className={`content-card home-widget-card is-${size}${isXRayXlWidget ? ' is-xray-search-only' : ''}${isCompactXRayWidget ? ' is-fluorography-widget' : ''}${isCompactSickLeavesWidget ? ' is-sick-leaves-compact-widget' : ''}`}
            >
              {props.isEditing ? (
                <button
                  type="button"
                  className="home-widget-hide-icon"
                  onClick={() => handleRemoveWidget(instanceId)}
                  aria-label={HIDE_LABEL}
                  title={HIDE_LABEL}
                >
                  <span aria-hidden="true">-</span>
                </button>
              ) : null}

              {isNotesWidget ? (
                renderNotesWidgetForm()
              ) : (
                <>
                  <div className="home-widget-head">
                    <div>
                      <p className="section-kicker">
                        {definition.kicker}
                        {isSickLeavesXsWidget ? (
                          <span className="home-widget-inline-counter">
                            {props.sickLeaves.filter((item) => item.status === 'open').length}
                          </span>
                        ) : null}
                      </p>
                      {!isXRayXlWidget && !isCompactXRayWidget && !isCompactSickLeavesWidget ? (
                        <h3>{definition.title}</h3>
                      ) : null}
                </div>

                {!isXRayXlWidget && !isCompactXRayWidget && !isCompactSickLeavesWidget ? (
                  <button
                    type="button"
                    className="home-widget-link"
                        onClick={() => props.onOpenSection(definition.section)}
                      >
                        {OPEN_LABEL}
                      </button>
                    ) : null}
                  </div>

                  {!isXRayXlWidget && !isCompactXRayWidget && !isCompactSickLeavesWidget ? (
                    <p className="home-widget-copy">{definition.description}</p>
                  ) : null}

                  {isXRayXlWidget ? renderXRayWidgetSearch() : null}

                  {!isXRayXlWidget ? (
                    <div className="home-widget-stats">
                      {(
                        isXRayXxsWidget
                          ? [
                              {
                                label: '\u041f\u0430\u0446\u0438\u0435\u043d\u0442\u043e\u0432 \u0441\u0435\u0433\u043e\u0434\u043d\u044f',
                                value: props.xrayTodayPatientsCount,
                              },
                              {
                                label: '\u0418\u0441\u0441\u043b\u0435\u0434\u043e\u0432\u0430\u043d\u0438\u0439 \u0441\u0435\u0433\u043e\u0434\u043d\u044f',
                                value: props.xrayTodayStudiesCount,
                              },
                            ]
                          : isSickLeavesXxsWidget
                            ? [
                                {
                                  label: '\u041e\u0442\u043a\u0440\u044b\u0442\u044b\u0435 \u0431\u043e\u043b\u044c\u043d\u0438\u0447\u043d\u044b\u0435',
                                  value: props.sickLeaves.filter((item) => item.status === 'open').length,
                                },
                              ]
                            : isSickLeavesXsWidget
                              ? []
                              : definition.renderStats(props)
                      ).map((item) => (
                        <div key={`${instanceId}-${item.label}`} className="home-widget-stat">
                          <span className="home-widget-stat-value">{item.value}</span>
                          <span className="home-widget-stat-label">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {isSickLeavesXsWidget && openSickLeavePreviews.length > 0 ? (
                    <div className="home-widget-footer home-widget-sick-leaves-list">
                      {openSickLeavePreviews.map((item) => (
                        <div key={item.id} className="home-widget-sick-leaves-line">
                          {item.fullName} {item.birthDate} {'\u0434\u043e'} {item.endDate}
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {!isXRayXlWidget &&
                  !isCompactXRayWidget &&
                  !isCompactSickLeavesWidget &&
                  definition.renderFooter ? (
                    <div className="home-widget-footer">{definition.renderFooter(props)}</div>
                  ) : null}
                </>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}
