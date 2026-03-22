import type { FormEvent } from 'react'
import type { XRaySearchResult } from '../../../types/xray'
import { formatBirthDate } from '../../../utils/date'
import { getPatientFullName } from '../helpers'

interface XRaySearchPanelProps {
  query: string
  error: string
  loading: boolean
  results: XRaySearchResult[]
  showAddSuggestion: boolean
  onQueryChange: (value: string) => void
  onSearch: (event?: FormEvent<HTMLFormElement>) => Promise<void>
  onSelectPatient: (patient: XRaySearchResult) => void
  onShowAddForm: () => void
}

export function XRaySearchPanel({
  query,
  error,
  loading,
  results,
  showAddSuggestion,
  onQueryChange,
  onSearch,
  onSelectPatient,
  onShowAddForm,
}: XRaySearchPanelProps) {
  return (
    <section className="content-card xray-search-card">
      <form className="xray-search-form" onSubmit={onSearch}>
        <label className="xray-search-shell" aria-label="Поиск пациента X-ray">
          <svg className="xray-search-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M10.5 4a6.5 6.5 0 1 0 4.03 11.6l4.43 4.43a1 1 0 0 0 1.41-1.41l-4.43-4.43A6.5 6.5 0 0 0 10.5 4Zm0 2a4.5 4.5 0 1 1 0 9a4.5 4.5 0 0 1 0-9Z"
              fill="currentColor"
            />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Поиск пациента"
            autoComplete="off"
          />
          <button type="submit" className="xray-search-submit">
            Найти
          </button>
        </label>
      </form>

      {error ? <div className="state-banner error-banner">{error}</div> : null}

      <div className="xray-search-results">
        {loading ? <div className="empty-state">Ищу пациента в журнале X-ray...</div> : null}

        {!loading && results.length > 0 ? (
          <div className="xray-result-list">
            {results.map((patient) => (
              <button
                key={patient.id}
                type="button"
                className="xray-result-item"
                onClick={() => onSelectPatient(patient)}
              >
                <span className="xray-result-name">{getPatientFullName(patient)}</span>
                <span className="xray-result-meta">
                  {formatBirthDate(patient.birthDate)} • {patient.address}
                </span>
              </button>
            ))}
          </div>
        ) : null}

        {!loading && showAddSuggestion ? (
          <div className="xray-no-results">
            <div>
              <div className="xray-no-results-title">Пациент не найден</div>
              <div className="xray-no-results-copy">
                Можно сразу добавить его в X-ray журнал и открыть карточку.
              </div>
            </div>

            <button type="button" className="primary-button" onClick={onShowAddForm}>
              Добавить пациента
            </button>
          </div>
        ) : null}
      </div>
    </section>
  )
}
