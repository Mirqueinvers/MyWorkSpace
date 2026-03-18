import { useMemo, useState } from 'react'

type ReferenceKey = 'infectious-diseases'
type PatientGender = 'male' | 'female'

interface InfectiousDiseasesForm {
  fullName: string
  birthDate: string
  address: string
  inspectionDate: string
  gender: PatientGender
}

function capitalizeWords(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
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
  const [activeReference, setActiveReference] =
    useState<ReferenceKey>('infectious-diseases')
  const [infectiousDiseasesForm, setInfectiousDiseasesForm] =
    useState<InfectiousDiseasesForm>({
      fullName: '',
      birthDate: '',
      address: '',
      inspectionDate: '',
      gender: 'male',
    })

  const printableInspectionDate = useMemo(
    () => formatPrintDate(infectiousDiseasesForm.inspectionDate),
    [infectiousDiseasesForm.inspectionDate],
  )
  const genderText =
    infectiousDiseasesForm.gender === 'female'
      ? {
          pronoun: 'она',
          was: 'была',
          examined: 'осмотрена',
        }
      : {
          pronoun: 'он',
          was: 'был',
          examined: 'осмотрен',
        }

  return (
    <section className="references-layout">
      <div className="content-card references-nav-card">
        <div className="section-head">
          <div>
            <p className="section-kicker">Справки</p>
            <h2>Шаблоны</h2>
          </div>
        </div>

        <div className="references-nav-list">
          <button
            type="button"
            className={`references-nav-button${activeReference === 'infectious-diseases' ? ' is-active' : ''}`}
            onClick={() => setActiveReference('infectious-diseases')}
          >
            Об отсутствии заразных заболеваний
          </button>
        </div>
      </div>

      <div className="content-card references-workspace-card">
        <div className="list-head references-workspace-head">
          <div>
            <p className="section-kicker">Форма</p>
            <h3>Об отсутствии заразных заболеваний</h3>
          </div>

          <button
            type="button"
            className="primary-button"
            onClick={() => window.print()}
          >
            Печать
          </button>
        </div>

        {activeReference === 'infectious-diseases' ? (
          <div className="references-workspace-body">
            <div className="references-form-panel">
              <div className="patient-form references-form">
                <label className="field field-wide">
                  <span>ФИО</span>
                  <input
                    type="text"
                    value={infectiousDiseasesForm.fullName}
                    onChange={(event) =>
                      setInfectiousDiseasesForm((current) => ({
                        ...current,
                        fullName: event.target.value,
                      }))
                    }
                    onBlur={(event) =>
                      setInfectiousDiseasesForm((current) => ({
                        ...current,
                        fullName: capitalizeWords(event.target.value),
                      }))
                    }
                    placeholder="Введите ФИО"
                  />
                </label>

                <label className="field field-wide">
                  <span>Дата рождения</span>
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
                    placeholder="ддммгггг"
                  />
                </label>

                <label className="field field-wide">
                  <span>Адрес</span>
                  <input
                    type="text"
                    value={infectiousDiseasesForm.address}
                    onChange={(event) =>
                      setInfectiousDiseasesForm((current) => ({
                        ...current,
                        address: event.target.value,
                      }))
                    }
                    placeholder="Введите адрес"
                  />
                </label>

                <div className="field field-wide">
                  <span>Пол</span>
                  <div className="reference-gender-toggle" role="radiogroup" aria-label="Пол">
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
                      Мужской
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
                      Женский
                    </button>
                  </div>
                </div>

                <label className="field field-wide">
                  <span>Дата справки</span>
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
              </div>
            </div>

            <div className="references-preview-panel">
              <article className="reference-page">
                <div className="reference-page__title">СПРАВКА</div>

                <div className="reference-page__body">
                  <p className="reference-page__line reference-page__line-gap">
                    <span className="reference-page__label">ФИО:</span>{' '}
                    {infectiousDiseasesForm.fullName || '____________________________'}
                  </p>

                  <p className="reference-page__line">
                    <span className="reference-page__label">Дата рождения:</span>{' '}
                    {infectiousDiseasesForm.birthDate || '________________'}
                  </p>

                  <p className="reference-page__line">
                    <span className="reference-page__label">Адрес:</span>{' '}
                    {infectiousDiseasesForm.address || '____________________________'}
                  </p>

                  <p className="reference-page__line reference-page__line-address-tail">
                    Сампурский район, Тамбовская область.
                  </p>

                  <p className="reference-page__line">
                    В том, что {genderText.pronoun} {genderText.was}{' '}
                    {genderText.examined} врачом дерматовенерологом. Ped ( - ),
                    Scub ( - ).
                  </p>

                  <p className="reference-page__line">
                    <strong>Заключение:</strong> заразных кожных заболеваний не
                    выявлено.
                  </p>
                </div>

                <div className="reference-page__footer">
                  <div>Дата {printableInspectionDate || '________________'}</div>
                  <div>Подпись ____________</div>
                </div>
              </article>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}
