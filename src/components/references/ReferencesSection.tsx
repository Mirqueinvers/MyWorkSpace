import { useMemo, useState } from 'react'

type ReferenceKey = 'infectious-diseases' | 'not-registered' | 'school-certificate'
type PatientGender = 'male' | 'female'

interface InfectiousDiseasesForm {
  lastName: string
  firstName: string
  patronymic: string
  birthDate: string
  address: string
  inspectionDate: string
  gender: PatientGender
  illnessStartDate: string
  illnessEndDate: string
  diagnosis: string
  physicalEducationStartDate: string
  physicalEducationEndDate: string
}

const SECTION_KICKER = '\u0421\u043f\u0440\u0430\u0432\u043a\u0438'
const NAV_TITLE = '\u0428\u0430\u0431\u043b\u043e\u043d\u044b'
const FORM_KICKER = '\u0424\u043e\u0440\u043c\u0430'
const PRINT_BUTTON = '\u041f\u0435\u0447\u0430\u0442\u044c'
const TEMPLATE_LABEL = '\u041e\u0431 \u043e\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0438\u0438 \u0437\u0430\u0440\u0430\u0437\u043d\u044b\u0445 \u0437\u0430\u0431\u043e\u043b\u0435\u0432\u0430\u043d\u0438\u0439'
const NOT_REGISTERED_LABEL = '\u041d\u0430 \u0443\u0447\u0435\u0442\u0435 \u043d\u0435 \u0441\u043e\u0441\u0442\u043e\u0438\u0442'
const SCHOOL_CERTIFICATE_LABEL = '\u0421\u043f\u0440\u0430\u0432\u043a\u0430 \u0432 \u0448\u043a\u043e\u043b\u0443'
const FULL_NAME_LABEL = '\u0424\u0418\u041e'
const LAST_NAME_LABEL = '\u0424\u0430\u043c\u0438\u043b\u0438\u044f'
const FIRST_NAME_LABEL = '\u0418\u043c\u044f'
const PATRONYMIC_LABEL = '\u041e\u0442\u0447\u0435\u0441\u0442\u0432\u043e'
const BIRTH_DATE_LABEL = '\u0414\u0430\u0442\u0430 \u0440\u043e\u0436\u0434\u0435\u043d\u0438\u044f'
const ADDRESS_LABEL = '\u0410\u0434\u0440\u0435\u0441'
const GENDER_LABEL = '\u041f\u043e\u043b'
const CERTIFICATE_DATE_LABEL = '\u0414\u0430\u0442\u0430 \u0441\u043f\u0440\u0430\u0432\u043a\u0438'
const ILLNESS_START_LABEL = '\u0411\u043e\u043b\u0435\u043b \u0441'
const ILLNESS_END_LABEL = '\u041f\u043e'
const DIAGNOSIS_FIELD_LABEL = '\u0414\u0438\u0430\u0433\u043d\u043e\u0437'
const PE_START_LABEL = '\u0424\u0438\u0437\u043a\u0443\u043b\u044c\u0442\u0443\u0440\u0430 \u0441'
const PE_END_LABEL = '\u041f\u043e'
const LAST_NAME_PLACEHOLDER = '\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0444\u0430\u043c\u0438\u043b\u0438\u044e'
const FIRST_NAME_PLACEHOLDER = '\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0438\u043c\u044f'
const PATRONYMIC_PLACEHOLDER = '\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043e\u0442\u0447\u0435\u0441\u0442\u0432\u043e'
const BIRTH_DATE_PLACEHOLDER = '\u0434\u0434\u043c\u043c\u0433\u0433\u0433\u0433'
const ADDRESS_PLACEHOLDER = '\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0430\u0434\u0440\u0435\u0441'
const MALE_LABEL = '\u041c\u0443\u0436\u0441\u043a\u043e\u0439'
const FEMALE_LABEL = '\u0416\u0435\u043d\u0441\u043a\u0438\u0439'
const GENDER_ARIA = '\u041f\u043e\u043b'
const PAGE_TITLE = '\u0421\u041f\u0420\u0410\u0412\u041a\u0410'
const DISTRICT_TAIL = '\u0421\u0430\u043c\u043f\u0443\u0440\u0441\u043a\u0438\u0439 \u0440\u0430\u0439\u043e\u043d, \u0422\u0430\u043c\u0431\u043e\u0432\u0441\u043a\u0430\u044f \u043e\u0431\u043b\u0430\u0441\u0442\u044c.'
const EXAMINATION_TEXT = '\u0412 \u0442\u043e\u043c, \u0447\u0442\u043e'
const DERMATOVENEROLOGIST_TEXT =
  '\u0432\u0440\u0430\u0447\u043e\u043c \u0434\u0435\u0440\u043c\u0430\u0442\u043e\u0432\u0435\u043d\u0435\u0440\u043e\u043b\u043e\u0433\u043e\u043c'
const SCHOOL_ILLNESS_TEXT = '\u0412 \u0442\u043e\u043c \u0447\u0442\u043e'
const SCHOOL_TREATMENT_TEXT = '\u041b\u0435\u0447\u0435\u043d\u0438\u0435: \u0410\u043c\u0431\u0443\u043b\u0430\u0442\u043e\u0440\u043d\u043e.'
const SCHOOL_DIAGNOSIS_TEXT = '\u0414\u0438\u0430\u0433\u043d\u043e\u0437:'
const SCHOOL_PE_TEXT = '\u041e\u0441\u0432\u043e\u0431\u043e\u0436\u0434\u0430\u0435\u0442\u0441\u044f \u043e\u0442 \u0443\u0440\u043e\u043a\u043e\u0432 \u0444\u0438\u0437\u043a\u0443\u043b\u044c\u0442\u0443\u0440\u044b \u0441'
const FROM_TEXT = '\u0441'
const TO_TEXT = '\u043f\u043e'
const CONCLUSION_LABEL = '\u0417\u0430\u043a\u043b\u044e\u0447\u0435\u043d\u0438\u0435:'
const CONCLUSION_TEXT = '\u0437\u0430\u0440\u0430\u0437\u043d\u044b\u0445 \u043a\u043e\u0436\u043d\u044b\u0445 \u0437\u0430\u0431\u043e\u043b\u0435\u0432\u0430\u043d\u0438\u0439 \u043d\u0435 \u0432\u044b\u044f\u0432\u043b\u0435\u043d\u043e.'
const DATE_LABEL = '\u0414\u0430\u0442\u0430'
const SIGNATURE_LABEL = '\u041f\u043e\u0434\u043f\u0438\u0441\u044c'
const LINE_SIGNATURE = '____________'

function capitalizeWords(value: string) {
  return value.replace(/[^\s]+/g, (word) => {
    if (!word) {
      return word
    }

    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  })
}

function formatDateInput(value: string) {
  const digits = value.replace(/\D/g, '')
  if (digits.length !== 8) {
    return digits
  }

  return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4, 8)}`
}

function formatPrintDate(value: string) {
  if (!value) {
    return ''
  }

  const [year, month, day] = value.split('-')
  if (!year || !month || !day) {
    return value
  }

  return `${day}.${month}.${year}`
}

export function ReferencesSection() {
  const [activeReference, setActiveReference] = useState<ReferenceKey>('infectious-diseases')
  const [infectiousDiseasesForm, setInfectiousDiseasesForm] = useState<InfectiousDiseasesForm>({
      lastName: '',
      firstName: '',
      patronymic: '',
      birthDate: '',
      address: '',
      inspectionDate: '',
      gender: 'male',
      illnessStartDate: '',
      illnessEndDate: '',
      diagnosis: '',
      physicalEducationStartDate: '',
      physicalEducationEndDate: '',
    })

  const fullName = useMemo(
    () =>
      [
        infectiousDiseasesForm.lastName,
        infectiousDiseasesForm.firstName,
        infectiousDiseasesForm.patronymic,
      ]
        .map((value) => value.trim())
        .filter(Boolean)
        .join(' '),
    [
      infectiousDiseasesForm.firstName,
      infectiousDiseasesForm.lastName,
      infectiousDiseasesForm.patronymic,
    ],
  )

  const printableInspectionDate = useMemo(
    () => formatPrintDate(infectiousDiseasesForm.inspectionDate),
    [infectiousDiseasesForm.inspectionDate],
  )

  const genderText =
    infectiousDiseasesForm.gender === 'female'
      ? {
          pronoun: '\u043e\u043d\u0430',
          was: '\u0431\u044b\u043b\u0430',
          examined: '\u043e\u0441\u043c\u043e\u0442\u0440\u0435\u043d\u0430',
          notRegistered:
            '\u041d\u0430 \u0443\u0447\u0435\u0442\u0435 \u0443 \u0434\u0435\u0440\u043c\u0430\u0442\u043e\u0432\u0435\u043d\u0435\u0440\u043e\u043b\u043e\u0433\u0430 \u043d\u0435 \u0441\u043e\u0441\u0442\u043e\u044f\u043b\u0430 \u0438 \u043d\u0435 \u0441\u043e\u0441\u0442\u043e\u0438\u0442.',
        }
      : {
          pronoun: '\u043e\u043d',
          was: '\u0431\u044b\u043b',
          examined: '\u043e\u0441\u043c\u043e\u0442\u0440\u0435\u043d',
          notRegistered:
            '\u041d\u0430 \u0443\u0447\u0435\u0442\u0435 \u0443 \u0434\u0435\u0440\u043c\u0430\u0442\u043e\u0432\u0435\u043d\u0435\u0440\u043e\u043b\u043e\u0433\u0430 \u043d\u0435 \u0441\u043e\u0441\u0442\u043e\u044f\u043b \u0438 \u043d\u0435 \u0441\u043e\u0441\u0442\u043e\u0438\u0442.',
        }

  const activeTitle =
    activeReference === 'infectious-diseases'
      ? TEMPLATE_LABEL
      : activeReference === 'not-registered'
        ? NOT_REGISTERED_LABEL
        : SCHOOL_CERTIFICATE_LABEL
  const conclusionText =
    activeReference === 'infectious-diseases' ? CONCLUSION_TEXT : genderText.notRegistered
  const schoolIllnessStart = formatPrintDate(infectiousDiseasesForm.illnessStartDate)
  const schoolIllnessEnd = formatPrintDate(infectiousDiseasesForm.illnessEndDate)
  const schoolPeStart = formatPrintDate(infectiousDiseasesForm.physicalEducationStartDate)
  const schoolPeEnd = formatPrintDate(infectiousDiseasesForm.physicalEducationEndDate)

  return (
    <section className="references-layout">
      <div className="content-card references-nav-card">
        <div className="section-head">
          <div>
            <p className="section-kicker">{SECTION_KICKER}</p>
            <h2>{NAV_TITLE}</h2>
          </div>
        </div>

        <div className="references-nav-list">
          <button
            type="button"
            className={`references-nav-button${activeReference === 'infectious-diseases' ? ' is-active' : ''}`}
            onClick={() => setActiveReference('infectious-diseases')}
          >
            {TEMPLATE_LABEL}
          </button>
          <button
            type="button"
            className={`references-nav-button${activeReference === 'not-registered' ? ' is-active' : ''}`}
            onClick={() => setActiveReference('not-registered')}
          >
            {NOT_REGISTERED_LABEL}
          </button>
          <button
            type="button"
            className={`references-nav-button${activeReference === 'school-certificate' ? ' is-active' : ''}`}
            onClick={() => setActiveReference('school-certificate')}
          >
            {SCHOOL_CERTIFICATE_LABEL}
          </button>
        </div>
      </div>

      <div className="content-card references-workspace-card">
        <div className="list-head references-workspace-head">
          <div>
            <p className="section-kicker">{FORM_KICKER}</p>
            <h3>{activeTitle}</h3>
          </div>

          <button type="button" className="primary-button" onClick={() => window.print()}>
            {PRINT_BUTTON}
          </button>
        </div>

        {activeReference === 'infectious-diseases' ||
        activeReference === 'not-registered' ||
        activeReference === 'school-certificate' ? (
          <div className="references-workspace-body">
            <div className="references-form-panel">
              <div className="patient-form references-form">
                <div className="references-name-grid">
                  <label className="field field-wide">
                    <span>{LAST_NAME_LABEL}</span>
                    <input
                      type="text"
                      value={infectiousDiseasesForm.lastName}
                      onChange={(event) =>
                        setInfectiousDiseasesForm((current) => ({
                          ...current,
                          lastName: capitalizeWords(event.target.value),
                        }))
                      }
                      placeholder={LAST_NAME_PLACEHOLDER}
                    />
                  </label>

                  <label className="field field-wide">
                    <span>{FIRST_NAME_LABEL}</span>
                    <input
                      type="text"
                      value={infectiousDiseasesForm.firstName}
                      onChange={(event) =>
                        setInfectiousDiseasesForm((current) => ({
                          ...current,
                          firstName: capitalizeWords(event.target.value),
                        }))
                      }
                      placeholder={FIRST_NAME_PLACEHOLDER}
                    />
                  </label>

                  <label className="field field-wide">
                    <span>{PATRONYMIC_LABEL}</span>
                    <input
                      type="text"
                      value={infectiousDiseasesForm.patronymic}
                      onChange={(event) =>
                        setInfectiousDiseasesForm((current) => ({
                          ...current,
                          patronymic: capitalizeWords(event.target.value),
                        }))
                      }
                      placeholder={PATRONYMIC_PLACEHOLDER}
                    />
                  </label>
                </div>

                <label className="field field-wide">
                  <span>{BIRTH_DATE_LABEL}</span>
                  <input
                    type="text"
                    value={infectiousDiseasesForm.birthDate}
                    onChange={(event) =>
                      setInfectiousDiseasesForm((current) => ({
                        ...current,
                        birthDate: event.target.value,
                      }))
                    }
                    onBlur={(event) =>
                      setInfectiousDiseasesForm((current) => ({
                        ...current,
                        birthDate: formatDateInput(event.target.value),
                      }))
                    }
                    placeholder={BIRTH_DATE_PLACEHOLDER}
                  />
                </label>

                <label className="field field-wide">
                  <span>{ADDRESS_LABEL}</span>
                  <input
                    type="text"
                    value={infectiousDiseasesForm.address}
                    onChange={(event) =>
                      setInfectiousDiseasesForm((current) => ({
                        ...current,
                        address: event.target.value,
                      }))
                    }
                    placeholder={ADDRESS_PLACEHOLDER}
                  />
                </label>

                <div className="field field-wide">
                  <span>{GENDER_LABEL}</span>
                  <div className="reference-gender-toggle" role="radiogroup" aria-label={GENDER_ARIA}>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={infectiousDiseasesForm.gender === 'male'}
                      className={`reference-gender-button${infectiousDiseasesForm.gender === 'male' ? ' is-active' : ''}`}
                      onClick={() =>
                        setInfectiousDiseasesForm((current) => ({
                          ...current,
                          gender: 'male',
                        }))
                      }
                    >
                      {MALE_LABEL}
                    </button>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={infectiousDiseasesForm.gender === 'female'}
                      className={`reference-gender-button${infectiousDiseasesForm.gender === 'female' ? ' is-active' : ''}`}
                      onClick={() =>
                        setInfectiousDiseasesForm((current) => ({
                          ...current,
                          gender: 'female',
                        }))
                      }
                    >
                      {FEMALE_LABEL}
                    </button>
                  </div>
                </div>

                <label className="field field-wide">
                  <span>{CERTIFICATE_DATE_LABEL}</span>
                  <input
                    type="date"
                    value={infectiousDiseasesForm.inspectionDate}
                    onChange={(event) =>
                      setInfectiousDiseasesForm((current) => ({
                        ...current,
                        inspectionDate: event.target.value,
                      }))
                    }
                  />
                </label>

                {activeReference === 'school-certificate' ? (
                  <>
                    <label className="field field-wide">
                      <span>{ILLNESS_START_LABEL}</span>
                      <input
                        type="date"
                        value={infectiousDiseasesForm.illnessStartDate}
                        onChange={(event) =>
                          setInfectiousDiseasesForm((current) => ({
                            ...current,
                            illnessStartDate: event.target.value,
                          }))
                        }
                      />
                    </label>

                    <label className="field field-wide">
                      <span>{ILLNESS_END_LABEL}</span>
                      <input
                        type="date"
                        value={infectiousDiseasesForm.illnessEndDate}
                        onChange={(event) =>
                          setInfectiousDiseasesForm((current) => ({
                            ...current,
                            illnessEndDate: event.target.value,
                          }))
                        }
                      />
                    </label>

                    <label className="field field-wide">
                      <span>{DIAGNOSIS_FIELD_LABEL}</span>
                      <input
                        type="text"
                        value={infectiousDiseasesForm.diagnosis}
                        onChange={(event) =>
                          setInfectiousDiseasesForm((current) => ({
                            ...current,
                            diagnosis: event.target.value,
                          }))
                        }
                      />
                    </label>

                    <label className="field field-wide">
                      <span>{PE_START_LABEL}</span>
                      <input
                        type="date"
                        value={infectiousDiseasesForm.physicalEducationStartDate}
                        onChange={(event) =>
                          setInfectiousDiseasesForm((current) => ({
                            ...current,
                            physicalEducationStartDate: event.target.value,
                          }))
                        }
                      />
                    </label>

                    <label className="field field-wide">
                      <span>{PE_END_LABEL}</span>
                      <input
                        type="date"
                        value={infectiousDiseasesForm.physicalEducationEndDate}
                        onChange={(event) =>
                          setInfectiousDiseasesForm((current) => ({
                            ...current,
                            physicalEducationEndDate: event.target.value,
                          }))
                        }
                      />
                    </label>
                  </>
                ) : null}
              </div>
            </div>

            <div className="references-preview-panel">
              <article className="reference-page">
                <div className="reference-page__sheet">
                  <div className="reference-page__title">{PAGE_TITLE}</div>

                  <div className="reference-page__body">
                    <p className="reference-page__line reference-page__line-gap">
                      <span className="reference-page__label">{FULL_NAME_LABEL}:</span>{' '}
                      {fullName}
                    </p>

                    <p className="reference-page__line">
                      <span className="reference-page__label">{BIRTH_DATE_LABEL}:</span>{' '}
                      {infectiousDiseasesForm.birthDate}
                    </p>

                    <p className="reference-page__line">
                      <span className="reference-page__label">{ADDRESS_LABEL}:</span>{' '}
                      {infectiousDiseasesForm.address}
                    </p>

                    <p className="reference-page__line reference-page__line-address-tail">
                      {DISTRICT_TAIL}
                    </p>

                    {activeReference === 'school-certificate' ? (
                      <>
                        <p className="reference-page__line">
                          {SCHOOL_ILLNESS_TEXT} {genderText.pronoun} {infectiousDiseasesForm.gender === 'female' ? '\u0431\u044b\u043b\u0430 \u0431\u043e\u043b\u044c\u043d\u0430' : '\u0431\u044b\u043b \u0431\u043e\u043b\u0435\u043d'}{' '}
                          {FROM_TEXT} {schoolIllnessStart} {TO_TEXT} {schoolIllnessEnd}.
                        </p>

                        <p className="reference-page__line">{SCHOOL_TREATMENT_TEXT}</p>

                        <p className="reference-page__line">
                          {SCHOOL_DIAGNOSIS_TEXT} {infectiousDiseasesForm.diagnosis}
                        </p>

                        <p className="reference-page__line">
                          {SCHOOL_PE_TEXT} {schoolPeStart} {TO_TEXT} {schoolPeEnd}.
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="reference-page__line">
                          {EXAMINATION_TEXT} {genderText.pronoun} {genderText.was} {genderText.examined}{' '}
                          {DERMATOVENEROLOGIST_TEXT}. Ped ( - ), Scub ( - ).
                        </p>

                        <p className="reference-page__line">
                          <strong>{CONCLUSION_LABEL}</strong> {conclusionText}
                        </p>
                      </>
                    )}
                  </div>

                  <div className="reference-page__footer">
                    <div>
                      {DATE_LABEL} {printableInspectionDate}
                    </div>
                    <div>
                      {SIGNATURE_LABEL} {LINE_SIGNATURE}
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}
