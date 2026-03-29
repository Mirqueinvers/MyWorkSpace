import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type {
  XRayStatistics as XRayStatisticsData,
  XRayStatisticsAreaSummary,
  XRayStatisticsForm30Row,
  XRayStatisticsMonthlySummary,
  XRayStatisticsRangePayload,
  XRayStatisticsReferralSummary,
} from '../../../types/xray'

const ELECTRON_API_UNAVAILABLE =
  'API Electron \u043d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u043d\u043e. \u041e\u0442\u043a\u0440\u043e\u0439\u0442\u0435 \u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u0435 \u0447\u0435\u0440\u0435\u0437 dev:electron.'
const STATISTICS_LOAD_ERROR =
  '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c \u0441\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043a\u0443 \u0437\u0430 \u0432\u044b\u0431\u0440\u0430\u043d\u043d\u044b\u0439 \u043f\u0435\u0440\u0438\u043e\u0434.'
const EMPTY_FOR_PERIOD =
  '\u041d\u0435\u0442 \u0434\u0430\u043d\u043d\u044b\u0445 \u0437\u0430 \u0432\u044b\u0431\u0440\u0430\u043d\u043d\u044b\u0439 \u043f\u0435\u0440\u0438\u043e\u0434.'
const PERIOD_FROM =
  '\u0421\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043a\u0430 \u0437\u0430 \u043f\u0435\u0440\u0438\u043e\u0434 \u0441'
const PERIOD_TO = '\u043f\u043e'
const PATIENTS_LABEL = '\u041f\u0430\u0446\u0438\u0435\u043d\u0442\u044b'
const STUDIES_LABEL = '\u0418\u0441\u0441\u043b\u0435\u0434\u043e\u0432\u0430\u043d\u0438\u044f'
const FLUOROGRAPHY_LABEL = '\u0424\u043b\u044e\u043e\u0440\u043e\u0433\u0440\u0430\u0444\u0438\u0438'
const PROCEDURES_LABEL = '\u041f\u0440\u043e\u0446\u0435\u0434\u0443\u0440\u044b'
const TOTAL_DOSE_LABEL = '\u0421\u0443\u043c\u043c\u0430\u0440\u043d\u0430\u044f \u0434\u043e\u0437\u0430'
const MZV_LABEL = '\u043c\u0417\u0432'
const LOADING_LABEL =
  '\u0417\u0430\u0433\u0440\u0443\u0436\u0430\u044e \u0441\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043a\u0443...'
const REFERRALS_TITLE = '\u041d\u0430\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u0438\u044f \u043e\u0442 \u0432\u0440\u0430\u0447\u0435\u0439'
const REFERRALS_SUBTITLE_PREFIX =
  '\u0412\u0441\u0435\u0433\u043e \u043d\u0430\u043f\u0440\u0430\u0432\u043b\u044f\u044e\u0449\u0438\u0445: '
const AREAS_TITLE = '\u041e\u0431\u043b\u0430\u0441\u0442\u0438 \u0438\u0441\u0441\u043b\u0435\u0434\u043e\u0432\u0430\u043d\u0438\u0439'
const AREAS_SUBTITLE_PREFIX =
  '\u0410\u043a\u0442\u0438\u0432\u043d\u044b\u0445 \u043e\u0431\u043b\u0430\u0441\u0442\u0435\u0439: '
const MONTHLY_TITLE = '\u041f\u0430\u0446\u0438\u0435\u043d\u0442\u044b \u043f\u043e \u043c\u0435\u0441\u044f\u0446\u0430\u043c'
const MONTHLY_SUBTITLE_PREFIX =
  '\u041c\u0435\u0441\u044f\u0446\u0435\u0432 \u0432 \u043f\u0435\u0440\u0438\u043e\u0434\u0435: '
const SHORT_STUDIES_LABEL = '\u0438\u0441\u0441\u043b.'
const SHORT_PROCEDURES_LABEL = '\u043f\u0440\u043e\u0446.'
const SHORT_PATIENTS_LABEL = '\u043f\u0430\u0446.'
const DOZ3_DOSES_TITLE = '\u0414\u041e\u0417-3 (\u0434\u043e\u0437\u044b)'
const DOZ3_RESEARCH_TITLE = '\u0414\u041e\u0417-3 (\u0438\u0441\u0441\u043b\u0435\u0434\u043e\u0432\u0430\u043d\u0438\u044f)'
const FORM30_TITLE = '\u0424\u043e\u0440\u043c\u0430 30'
const TOTAL_LABEL = '\u0412\u0441\u0435\u0433\u043e'
const DOZES_COLUMNS = [
  '\u041e\u0440\u0433\u0430\u043d\u044b / \u0438\u0441\u0441\u043b\u0435\u0434\u043e\u0432\u0430\u043d\u0438\u0435',
  '\u0412\u0437\u0440\u043e\u0441\u043b\u044b\u0435, \u043c\u0417\u0432',
  '\u0414\u0435\u0442\u0438, \u043c\u0417\u0432',
  '\u0421\u0443\u043c\u043c\u0430\u0440\u043d\u0430\u044f \u0434\u043e\u0437\u0430, \u043c\u0417\u0432',
] as const
const RESEARCH_COLUMNS = [
  '\u041e\u0440\u0433\u0430\u043d\u044b / \u0438\u0441\u0441\u043b\u0435\u0434\u043e\u0432\u0430\u043d\u0438\u0435',
  '\u0418\u0441\u0441\u043b\u0435\u0434\u043e\u0432\u0430\u043d\u0438\u044f',
  '\u041f\u0440\u043e\u0446\u0435\u0434\u0443\u0440\u044b',
] as const
const FORM30_COLUMNS = [
  '\u041e\u0440\u0433\u0430\u043d\u044b / \u0438\u0441\u0441\u043b\u0435\u0434\u043e\u0432\u0430\u043d\u0438\u0435',
  '\u0418\u0441\u0441\u043b\u0435\u0434\u043e\u0432\u0430\u043d\u0438\u044f',
  '\u041f\u0440\u043e\u0446\u0435\u0434\u0443\u0440\u044b',
  '\u0410\u043c\u0431\u0443\u043b\u0430\u0442\u043e\u0440\u043d\u043e',
  '\u0414\u043d\u0435\u0432\u043d\u043e\u0439 \u0441\u0442\u0430\u0446\u0438\u043e\u043d\u0430\u0440',
  '\u041a\u0440\u0443\u0433\u043b\u043e\u0441\u0443\u0442\u043e\u0447\u043d\u044b\u0439 \u0441\u0442\u0430\u0446\u0438\u043e\u043d\u0430\u0440',
] as const

function getTodayIsoDate() {
  const now = new Date()
  const timezoneOffset = now.getTimezoneOffset() * 60_000
  return new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 10)
}

function getMonthStartIsoDate() {
  const today = getTodayIsoDate()
  return `${today.slice(0, 8)}01`
}

function formatInteger(value: number) {
  return new Intl.NumberFormat('ru-RU').format(value)
}

function formatDose(value: number) {
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(value)
}

function formatPercent(value: number) {
  return `${Math.round(value)}%`
}

function getMaxValue<T>(items: T[], getValue: (item: T) => number) {
  return items.reduce((maxValue, item) => Math.max(maxValue, getValue(item)), 0)
}

function StatisticsBarList<T>({
  title,
  subtitle,
  items,
  getLabel,
  getValue,
  formatValue,
}: {
  title: string
  subtitle: string
  items: T[]
  getLabel: (item: T) => string
  getValue: (item: T) => number
  formatValue: (item: T) => string
}) {
  const maxValue = getMaxValue(items, getValue)

  return (
    <section className="content-card xray-statistics-panel">
      <div className="xray-statistics-panel-head">
        <h3>{title}</h3>
        <span>{subtitle}</span>
      </div>

      {items.length === 0 ? (
        <div className="xray-statistics-empty">{EMPTY_FOR_PERIOD}</div>
      ) : (
        <div className="xray-statistics-bars">
          {items.map((item) => {
            const value = getValue(item)
            const width = maxValue > 0 ? (value / maxValue) * 100 : 0

            return (
              <div key={getLabel(item)} className="xray-statistics-bar-row">
                <div className="xray-statistics-bar-copy">
                  <span className="xray-statistics-bar-label">{getLabel(item)}</span>
                  <strong>{formatValue(item)}</strong>
                </div>

                <div className="xray-statistics-bar-track">
                  <div
                    className="xray-statistics-bar-fill"
                    style={{ width: formatPercent(width) }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

function StatisticsTable<T>({
  title,
  columns,
  rows,
  getRowKey,
  renderRow,
}: {
  title: string
  columns: readonly string[]
  rows: T[]
  getRowKey: (row: T) => string
  renderRow: (row: T) => ReactNode
}) {
  return (
    <section className="content-card xray-statistics-panel xray-statistics-table-panel">
      <div className="xray-statistics-panel-head">
        <h3>{title}</h3>
      </div>

      <div className="xray-statistics-table-wrap">
        <table className="xray-statistics-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr key={getRowKey(row)}>{renderRow(row)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export function XRayStatistics() {
  const [range, setRange] = useState<XRayStatisticsRangePayload>({
    startDate: getMonthStartIsoDate(),
    endDate: getTodayIsoDate(),
  })
  const [statistics, setStatistics] = useState<XRayStatisticsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let isCancelled = false

    async function loadStatistics() {
      if (!window.electronAPI?.xray?.getStatistics) {
        setStatistics(null)
        setError(ELECTRON_API_UNAVAILABLE)
        return
      }

      setLoading(true)
      setError('')

      try {
        const nextStatistics = await window.electronAPI.xray.getStatistics(range)

        if (!isCancelled) {
          setStatistics(nextStatistics)
        }
      } catch {
        if (!isCancelled) {
          setStatistics(null)
          setError(STATISTICS_LOAD_ERROR)
        }
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    void loadStatistics()

    return () => {
      isCancelled = true
    }
  }, [range])

  const visibleReferrals = useMemo(
    () => statistics?.referrals.slice(0, 12) ?? [],
    [statistics?.referrals],
  )

  const visibleStudyAreas = useMemo(
    () => (statistics?.studyAreas ?? []).filter((item) => item.researchCount > 0),
    [statistics?.studyAreas],
  )

  const monthlyPatients = statistics?.monthlyPatients ?? []
  const doseRows = statistics?.studyAreas ?? []
  const form30Rows = statistics?.form30Rows ?? []

  const doseTableRows: XRayStatisticsAreaSummary[] = [
    ...doseRows,
    {
      label: TOTAL_LABEL,
      researchCount: doseRows.reduce((sum, row) => sum + row.researchCount, 0),
      procedureCount: doseRows.reduce((sum, row) => sum + row.procedureCount, 0),
      adultDose: doseRows.reduce((sum, row) => sum + row.adultDose, 0),
      childDose: doseRows.reduce((sum, row) => sum + row.childDose, 0),
      totalDose: doseRows.reduce((sum, row) => sum + row.totalDose, 0),
    },
  ]

  const researchTableRows: XRayStatisticsAreaSummary[] = [
    ...doseRows,
    {
      label: TOTAL_LABEL,
      researchCount: doseRows.reduce((sum, row) => sum + row.researchCount, 0),
      procedureCount: doseRows.reduce((sum, row) => sum + row.procedureCount, 0),
      adultDose: 0,
      childDose: 0,
      totalDose: 0,
    },
  ]

  return (
    <section className="xray-statistics-layout">
      <section className="content-card xray-statistics-period-card">
        <div className="xray-statistics-period">
          <span className="xray-statistics-period-copy">{PERIOD_FROM}</span>

          <label className="xray-journal-date-field">
            <input
              type="date"
              className="input xray-journal-date-input"
              value={range.startDate}
              onChange={(event) =>
                setRange((currentRange) => ({
                  ...currentRange,
                  startDate: event.target.value,
                }))
              }
            />
          </label>

          <span className="xray-statistics-period-copy">{PERIOD_TO}</span>

          <label className="xray-journal-date-field">
            <input
              type="date"
              className="input xray-journal-date-input"
              value={range.endDate}
              onChange={(event) =>
                setRange((currentRange) => ({
                  ...currentRange,
                  endDate: event.target.value,
                }))
              }
            />
          </label>
        </div>

        {statistics ? (
          <div className="xray-statistics-summary">
            <article className="xray-statistics-summary-card">
              <span>{PATIENTS_LABEL}</span>
              <strong>{formatInteger(statistics.totals.uniquePatients)}</strong>
            </article>
            <article className="xray-statistics-summary-card">
              <span>{STUDIES_LABEL}</span>
              <strong>{formatInteger(statistics.totals.researchCount)}</strong>
            </article>
            <article className="xray-statistics-summary-card">
              <span>{FLUOROGRAPHY_LABEL}</span>
              <strong>{formatInteger(statistics.totals.fluorographyCount)}</strong>
            </article>
            <article className="xray-statistics-summary-card">
              <span>{PROCEDURES_LABEL}</span>
              <strong>{formatInteger(statistics.totals.procedureCount)}</strong>
            </article>
            <article className="xray-statistics-summary-card">
              <span>{TOTAL_DOSE_LABEL}</span>
              <strong>{formatDose(statistics.totals.totalDose)} {MZV_LABEL}</strong>
            </article>
          </div>
        ) : null}
      </section>

      {error ? <div className="state-banner error-banner">{error}</div> : null}
      {loading ? <div className="xray-statistics-empty">{LOADING_LABEL}</div> : null}

      {!loading && !error && statistics ? (
        <>
          <div className="xray-statistics-grid">
            <StatisticsBarList<XRayStatisticsReferralSummary>
              title={REFERRALS_TITLE}
              subtitle={`${REFERRALS_SUBTITLE_PREFIX}${formatInteger(statistics.referrals.length)}`}
              items={visibleReferrals}
              getLabel={(item) => item.label}
              getValue={(item) => item.researchCount}
              formatValue={(item) => `${formatInteger(item.researchCount)} ${SHORT_STUDIES_LABEL}`}
            />

            <StatisticsBarList<XRayStatisticsAreaSummary>
              title={AREAS_TITLE}
              subtitle={`${AREAS_SUBTITLE_PREFIX}${formatInteger(visibleStudyAreas.length)}`}
              items={visibleStudyAreas}
              getLabel={(item) => item.label}
              getValue={(item) => item.researchCount}
              formatValue={(item) =>
                `${formatInteger(item.researchCount)} ${SHORT_STUDIES_LABEL} / ${formatInteger(item.procedureCount)} ${SHORT_PROCEDURES_LABEL}`
              }
            />
          </div>

          <StatisticsBarList<XRayStatisticsMonthlySummary>
            title={MONTHLY_TITLE}
            subtitle={`${MONTHLY_SUBTITLE_PREFIX}${formatInteger(monthlyPatients.length)}`}
            items={monthlyPatients}
            getLabel={(item) => item.monthLabel}
            getValue={(item) => item.uniquePatients}
            formatValue={(item) =>
              `${formatInteger(item.uniquePatients)} ${SHORT_PATIENTS_LABEL} / ${formatInteger(item.studiesCount)} ${SHORT_STUDIES_LABEL}`
            }
          />

          <StatisticsTable<XRayStatisticsAreaSummary>
            title={DOZ3_DOSES_TITLE}
            columns={DOZES_COLUMNS}
            rows={doseTableRows}
            getRowKey={(row) => row.label}
            renderRow={(row) => (
              <>
                <td>{row.label}</td>
                <td>{formatDose(row.adultDose)}</td>
                <td>{formatDose(row.childDose)}</td>
                <td>{formatDose(row.totalDose)}</td>
              </>
            )}
          />

          <StatisticsTable<XRayStatisticsAreaSummary>
            title={DOZ3_RESEARCH_TITLE}
            columns={RESEARCH_COLUMNS}
            rows={researchTableRows}
            getRowKey={(row) => row.label}
            renderRow={(row) => (
              <>
                <td>{row.label}</td>
                <td>{formatInteger(row.researchCount)}</td>
                <td>{formatInteger(row.procedureCount)}</td>
              </>
            )}
          />

          <StatisticsTable<XRayStatisticsForm30Row>
            title={FORM30_TITLE}
            columns={FORM30_COLUMNS}
            rows={form30Rows}
            getRowKey={(row) => row.label}
            renderRow={(row) => (
              <>
                <td>{row.label}</td>
                <td>{formatInteger(row.researchCount)}</td>
                <td>{formatInteger(row.procedureCount)}</td>
                <td>{formatInteger(row.ambulatoryCount)}</td>
                <td>{formatInteger(row.dayHospitalCount)}</td>
                <td>{formatInteger(row.inpatientCount)}</td>
              </>
            )}
          />
        </>
      ) : null}
    </section>
  )
}
