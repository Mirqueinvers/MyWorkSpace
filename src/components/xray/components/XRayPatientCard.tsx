import type { XRayPatient, XRayStudy } from '../../../types/xray'
import { formatBirthDate, formatStoredDate } from '../../../utils/date'
import {
  formatStudyLabel,
  getPatientFullName,
} from '../helpers'

interface XRayPatientCardProps {
  selectedPatient: XRayPatient
  studies: XRayStudy[]
  studiesLoading: boolean
  error: string
  isDeleting: boolean
  copyFeedback: string
  onCopyPatientKey: () => void
  onOpenLink: (url: string) => Promise<boolean>
  onOpenPatientEdit: () => void
  onOpenDeletePatient: () => void
  onOpenCreateStudy: () => void
  onOpenStudyTemplates: (study: XRayStudy) => void
  onOpenEditStudy: (study: XRayStudy) => void
}

export function XRayPatientCard({
  selectedPatient,
  studies,
  studiesLoading,
  error,
  isDeleting,
  copyFeedback,
  onCopyPatientKey,
  onOpenLink,
  onOpenPatientEdit,
  onOpenDeletePatient,
  onOpenCreateStudy,
  onOpenStudyTemplates,
  onOpenEditStudy,
}: XRayPatientCardProps) {
  return (
    <section className="content-card xray-patient-card">
      <div className="section-head">
        <div>
          <p className="section-kicker">Карточка</p>
          <div className="xray-patient-title-row">
            <h3 className="xray-patient-title">
              {getPatientFullName(selectedPatient)}{' '}
              <span className="xray-patient-title-birth">
                {formatBirthDate(selectedPatient.birthDate)}
              </span>
            </h3>
            <button
              type="button"
              className="xray-patient-copy"
              onClick={onCopyPatientKey}
              aria-label="Скопировать ключ пациента"
              title="Скопировать ключ пациента"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M8 3a2 2 0 0 0-2 2v10h2V5h8V3H8Zm3 4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-8Zm0 2h8v10h-8V9Z"
                  fill="currentColor"
                />
              </svg>
            </button>
            <button
              type="button"
              className={`xray-rmis-button${selectedPatient.rmisUrl ? ' is-active' : ''}`}
              onClick={() => {
                if (selectedPatient.rmisUrl) {
                  void onOpenLink(selectedPatient.rmisUrl)
                }
              }}
              disabled={!selectedPatient.rmisUrl}
            >
              РМИС
            </button>
          </div>
          {copyFeedback ? <div className="xray-copy-feedback">{copyFeedback}</div> : null}
        </div>

        <div className="xray-card-actions">
          <button
            type="button"
            className="xray-study-edit"
            onClick={onOpenPatientEdit}
            aria-label="Редактировать пациента"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25Zm2.92 2.33H5v-.92l8.06-8.06.92.92L5.92 19.58ZM20.71 7.04a1 1 0 0 0 0-1.41L18.37 3.3a1 1 0 0 0-1.41 0l-1.5 1.5 3.75 3.75 1.5-1.51Z"
                fill="currentColor"
              />
            </svg>
          </button>
          <button
            type="button"
            className="reminder-close-button reminders-modal-delete xray-patient-delete"
            onClick={onOpenDeletePatient}
            disabled={isDeleting}
            aria-label="Удалить пациента"
          >
            ×
          </button>
        </div>
      </div>

      {error ? <div className="state-banner error-banner">{error}</div> : null}

      <p className="xray-patient-address">{selectedPatient.address}</p>

      <div className="xray-studies-head">
        <div>
          <div className="section-kicker">Исследования</div>
          <h4 className="xray-studies-title">Список исследований пациента</h4>
        </div>

        <button type="button" className="primary-button" onClick={onOpenCreateStudy}>
          Добавить исследование
        </button>
      </div>

      {studiesLoading ? <div className="empty-state">Загружаю исследования...</div> : null}

      {!studiesLoading && studies.length === 0 ? (
        <div className="empty-state">У пациента пока нет добавленных исследований.</div>
      ) : null}

      {!studiesLoading && studies.length > 0 ? (
        <div className="xray-studies-list">
          {studies.map((study) => (
            <article
              key={study.id}
              className="xray-study-item xray-study-item-clickable"
              onClick={() => onOpenStudyTemplates(study)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onOpenStudyTemplates(study)
                }
              }}
            >
              <div className="xray-study-date">{formatStoredDate(study.studyDate)}</div>
              <div className="xray-study-item-head">
                <div>
                  <div className="xray-study-item-title">{formatStudyLabel(study)}</div>
                  <div className="xray-study-item-meta">
                    Кассета {study.cassette} • Кол-во {study.studyCount}
                  </div>
                </div>

                <div className="xray-study-actions">
                  <button
                    type="button"
                    className="xray-study-edit"
                    onClick={(event) => {
                      event.stopPropagation()
                      onOpenEditStudy(study)
                    }}
                    aria-label="Редактировать исследование"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        d="M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25Zm2.92 2.33H5v-.92l8.06-8.06.92.92L5.92 19.58ZM20.71 7.04a1 1 0 0 0 0-1.41L18.37 3.3a1 1 0 0 0-1.41 0l-1.5 1.5 3.75 3.75 1.5-1.51Z"
                        fill="currentColor"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="xray-study-grid">
                <div className="xray-study-field">
                  <span>Направительный диагноз</span>
                  <strong>{study.referralDiagnosis}</strong>
                </div>
                <div className="xray-study-field">
                  <span>Тип исследования</span>
                  <strong>{study.studyType}</strong>
                </div>
                <div className="xray-study-field">
                  <span>Доза облучения</span>
                  <strong>{study.radiationDose}</strong>
                </div>
                <div className="xray-study-field">
                  <span>Направил</span>
                  <strong>{study.referredBy}</strong>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  )
}
