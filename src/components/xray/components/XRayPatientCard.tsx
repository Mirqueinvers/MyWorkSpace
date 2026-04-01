import { useState } from 'react'
import type { XRayFlJournalEntry, XRayPatient, XRayStudy } from '../../../types/xray'
import type { UltrasoundJournalStudy } from '../../../types/ultrasound'
import { formatBirthDate, formatStoredDate } from '../../../utils/date'
import { formatStudyLabel, getPatientFullName } from '../helpers'

interface XRayPatientCardProps {
  selectedPatient: XRayPatient
  studies: XRayStudy[]
  flStudies: XRayFlJournalEntry[]
  ultrasoundStudies: UltrasoundJournalStudy[]
  studiesLoading: boolean
  flStudiesLoading: boolean
  ultrasoundStudiesLoading: boolean
  error: string
  copyFeedback: string
  onCopyPatientKey: () => void
  onOpenLink: (url: string) => Promise<boolean>
  onOpenPatientEdit: () => void
  onOpenCreateStudy: () => void
  onOpenStudyTemplates: (study: XRayStudy) => void
  onOpenEditStudy: (study: XRayStudy) => void
  onOpenUltrasoundProtocol: (studyId: number) => void
}

const CARD_LABEL = '\u041a\u0430\u0440\u0442\u043e\u0447\u043a\u0430'
const COPY_PATIENT_KEY = '\u0421\u043a\u043e\u043f\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u043a\u043b\u044e\u0447 \u043f\u0430\u0446\u0438\u0435\u043d\u0442\u0430'
const RMIS_LABEL = '\u0420\u041c\u0418\u0421'
const EDIT_PATIENT_LABEL = '\u0420\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u043f\u0430\u0446\u0438\u0435\u043d\u0442\u0430'
const FLUOROGRAPHY_LABEL = '\u0424\u043b\u044e\u043e\u0440\u043e\u0433\u0440\u0430\u0444\u0438\u044f'
const ULTRASOUND_LABEL = '\u0423\u0417\u0418'
const ULTRASOUND_LOADING = '\u0417\u0430\u0433\u0440\u0443\u0436\u0430\u044e \u0423\u0417\u0418-\u0438\u0441\u0441\u043b\u0435\u0434\u043e\u0432\u0430\u043d\u0438\u044f...'
const ULTRASOUND_EMPTY =
  '\u0423 \u043f\u0430\u0446\u0438\u0435\u043d\u0442\u0430 \u043f\u043e\u043a\u0430 \u043d\u0435\u0442 \u0438\u043c\u043f\u043e\u0440\u0442\u0438\u0440\u043e\u0432\u0430\u043d\u043d\u044b\u0445 \u0423\u0417\u0418-\u0438\u0441\u0441\u043b\u0435\u0434\u043e\u0432\u0430\u043d\u0438\u0439.'
const FLUOROGRAPHY_LOADING = '\u0417\u0430\u0433\u0440\u0443\u0436\u0430\u044e \u0444\u043b\u044e\u043e\u0440\u043e\u0433\u0440\u0430\u0444\u0438\u0438...'
const FLUOROGRAPHY_EMPTY = '\u0423 \u043f\u0430\u0446\u0438\u0435\u043d\u0442\u0430 \u043f\u043e\u043a\u0430 \u043d\u0435\u0442 \u0434\u043e\u0431\u0430\u0432\u043b\u0435\u043d\u043d\u044b\u0445 \u0444\u043b\u044e\u043e\u0440\u043e\u0433\u0440\u0430\u0444\u0438\u0439.'
const DOSE_LABEL = '\u0414\u043e\u0437\u0430'
const MZV_LABEL = '\u043c\u0417\u0432'
const STUDIES_LABEL = '\u0418\u0441\u0441\u043b\u0435\u0434\u043e\u0432\u0430\u043d\u0438\u044f'
const ADD_STUDY_LABEL = '\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u0438\u0441\u0441\u043b\u0435\u0434\u043e\u0432\u0430\u043d\u0438\u0435'
const STUDIES_LOADING = '\u0417\u0430\u0433\u0440\u0443\u0436\u0430\u044e \u0438\u0441\u0441\u043b\u0435\u0434\u043e\u0432\u0430\u043d\u0438\u044f...'
const STUDIES_EMPTY = '\u0423 \u043f\u0430\u0446\u0438\u0435\u043d\u0442\u0430 \u043f\u043e\u043a\u0430 \u043d\u0435\u0442 \u0434\u043e\u0431\u0430\u0432\u043b\u0435\u043d\u043d\u044b\u0445 \u0438\u0441\u0441\u043b\u0435\u0434\u043e\u0432\u0430\u043d\u0438\u0439.'
const CASSETTE_LABEL = '\u041a\u0430\u0441\u0441\u0435\u0442\u0430'
const COUNT_LABEL = '\u041a\u043e\u043b-\u0432\u043e'
const EDIT_STUDY_LABEL = '\u0420\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u0438\u0441\u0441\u043b\u0435\u0434\u043e\u0432\u0430\u043d\u0438\u0435'
const REFERRAL_DIAGNOSIS_LABEL = '\u041d\u0430\u043f\u0440\u0430\u0432\u0438\u0442\u0435\u043b\u044c\u043d\u044b\u0439 \u0434\u0438\u0430\u0433\u043d\u043e\u0437'
const STUDY_TYPE_LABEL = '\u0422\u0438\u043f \u0438\u0441\u0441\u043b\u0435\u0434\u043e\u0432\u0430\u043d\u0438\u044f'
const RADIATION_DOSE_LABEL = '\u0414\u043e\u0437\u0430 \u043e\u0431\u043b\u0443\u0447\u0435\u043d\u0438\u044f'
const REFERRED_BY_LABEL = '\u041d\u0430\u043f\u0440\u0430\u0432\u0438\u043b'

export function XRayPatientCard({
  selectedPatient,
  studies,
  flStudies,
  ultrasoundStudies,
  studiesLoading,
  flStudiesLoading,
  ultrasoundStudiesLoading,
  error,
  copyFeedback,
  onCopyPatientKey,
  onOpenLink,
  onOpenPatientEdit,
  onOpenCreateStudy,
  onOpenStudyTemplates,
  onOpenEditStudy,
  onOpenUltrasoundProtocol,
}: XRayPatientCardProps) {
  const [isUltrasoundSectionOpen, setIsUltrasoundSectionOpen] = useState(false)
  const [isFlSectionOpen, setIsFlSectionOpen] = useState(false)

  return (
    <section className="content-card xray-patient-card">
      <div className="section-head">
        <div>
          <p className="section-kicker">{CARD_LABEL}</p>
          <div className="xray-patient-title-row">
            <h3 className="xray-patient-title">
              {getPatientFullName(selectedPatient)}{' '}
              <span className="xray-patient-title-birth">{formatBirthDate(selectedPatient.birthDate)}</span>
            </h3>
            <button
              type="button"
              className="xray-patient-copy"
              onClick={onCopyPatientKey}
              aria-label={COPY_PATIENT_KEY}
              title={COPY_PATIENT_KEY}
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
              {RMIS_LABEL}
            </button>
          </div>
          {copyFeedback ? <div className="xray-copy-feedback">{copyFeedback}</div> : null}
        </div>

        <div className="xray-card-actions">
          <button
            type="button"
            className="xray-study-edit"
            onClick={onOpenPatientEdit}
            aria-label={EDIT_PATIENT_LABEL}
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

      {error ? <div className="state-banner error-banner">{error}</div> : null}

      <p className="xray-patient-address">{selectedPatient.address}</p>

      <div className="xray-patient-subsection">
        <button
          type="button"
          className={`xray-patient-subsection-toggle${isUltrasoundSectionOpen ? ' is-open' : ''}`}
          onClick={() => setIsUltrasoundSectionOpen((currentValue) => !currentValue)}
          aria-expanded={isUltrasoundSectionOpen}
        >
          <span className="xray-patient-subsection-line">
            <span className="section-kicker">{ULTRASOUND_LABEL}</span>
            <span className="xray-patient-subsection-meta">({ultrasoundStudies.length})</span>
            <span className="xray-patient-subsection-chevron" aria-hidden="true">
              <svg viewBox="0 0 12 12">
                <path
                  d="M3 4.5 6 7.5l3-3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </span>
        </button>

        {isUltrasoundSectionOpen ? (
          <div className="xray-patient-subsection-content">
            {ultrasoundStudiesLoading ? <div className="empty-state">{ULTRASOUND_LOADING}</div> : null}

            {!ultrasoundStudiesLoading && ultrasoundStudies.length === 0 ? (
              <div className="empty-state">{ULTRASOUND_EMPTY}</div>
            ) : null}

            {!ultrasoundStudiesLoading && ultrasoundStudies.length > 0 ? (
              <div className="xray-studies-list">
                {ultrasoundStudies.map((study) => (
                  <article
                    key={study.id}
                    className="xray-study-item xray-fl-study-item xray-study-item-clickable"
                    onClick={() => onOpenUltrasoundProtocol(study.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        onOpenUltrasoundProtocol(study.id)
                      }
                    }}
                  >
                    <div className="xray-study-date">{formatStoredDate(study.studyDate)}</div>
                    <div className="xray-study-item-head">
                      <div>
                        <div className="xray-study-item-title">{study.studyTitle}</div>
                        <div className="xray-study-item-meta">
                          {study.conclusion || study.doctorName || ULTRASOUND_LABEL}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="xray-patient-subsection">
        <button
          type="button"
          className={`xray-patient-subsection-toggle${isFlSectionOpen ? ' is-open' : ''}`}
          onClick={() => setIsFlSectionOpen((currentValue) => !currentValue)}
          aria-expanded={isFlSectionOpen}
        >
          <span className="xray-patient-subsection-line">
            <span className="section-kicker">{FLUOROGRAPHY_LABEL}</span>
            <span className="xray-patient-subsection-meta">({flStudies.length})</span>
            <span className="xray-patient-subsection-chevron" aria-hidden="true">
              <svg viewBox="0 0 12 12">
                <path
                  d="M3 4.5 6 7.5l3-3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </span>
        </button>

        {isFlSectionOpen ? (
          <div className="xray-patient-subsection-content">
            {flStudiesLoading ? <div className="empty-state">{FLUOROGRAPHY_LOADING}</div> : null}

            {!flStudiesLoading && flStudies.length === 0 ? (
              <div className="empty-state">{FLUOROGRAPHY_EMPTY}</div>
            ) : null}

            {!flStudiesLoading && flStudies.length > 0 ? (
              <div className="xray-studies-list">
                {flStudies.map((flStudy) => (
                  <article key={flStudy.id} className="xray-study-item xray-fl-study-item">
                    <div className="xray-study-date">{formatStoredDate(flStudy.shotDate)}</div>
                    <div className="xray-study-item-head">
                      <div>
                        <div className="xray-study-item-title">{FLUOROGRAPHY_LABEL}</div>
                        <div className="xray-study-item-meta">{DOSE_LABEL} {flStudy.dose} {MZV_LABEL}</div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="xray-studies-head">
        <div>
          <div className="section-kicker">{STUDIES_LABEL}</div>
        </div>

        <button type="button" className="primary-button" onClick={onOpenCreateStudy}>
          {ADD_STUDY_LABEL}
        </button>
      </div>

      {studiesLoading ? <div className="empty-state">{STUDIES_LOADING}</div> : null}

      {!studiesLoading && studies.length === 0 ? <div className="empty-state">{STUDIES_EMPTY}</div> : null}

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
                  <div className="xray-study-item-meta">{CASSETTE_LABEL} {study.cassette} {'\u2022'} {COUNT_LABEL} {study.studyCount}</div>
                </div>

                <div className="xray-study-actions">
                  <button
                    type="button"
                    className="xray-study-edit"
                    onClick={(event) => {
                      event.stopPropagation()
                      onOpenEditStudy(study)
                    }}
                    aria-label={EDIT_STUDY_LABEL}
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
                  <span>{REFERRAL_DIAGNOSIS_LABEL}</span>
                  <strong>{study.referralDiagnosis}</strong>
                </div>
                <div className="xray-study-field">
                  <span>{STUDY_TYPE_LABEL}</span>
                  <strong>{study.studyType}</strong>
                </div>
                <div className="xray-study-field">
                  <span>{RADIATION_DOSE_LABEL}</span>
                  <strong>{study.radiationDose}</strong>
                </div>
                <div className="xray-study-field">
                  <span>{REFERRED_BY_LABEL}</span>
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
